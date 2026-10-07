// Renders the code-generated background loops (1280x720, 24 fps, 216 frames = 9 s, seamless).
//
// Each loop (loops/<name>.js) is a pure function of the frame index: seeded randomness only and all
// motion periodic in 216 frames, so frame 216 equals frame 0. It runs in headless Chromium
// (page.html + lib/core.js); frames come back as PNG via canvas.toDataURL and are encoded with ffmpeg.
//
//   All loops:          node scripts/render-loops/render.mjs
//   One (or several):   node scripts/render-loops/render.mjs orbit-field latent-space
//   Quick art preview:  node scripts/render-loops/render.mjs --preview orbit-field
//                       (renders only frames 0,36,...,216 -> seam value + contact sheet, no encode)
//   Other flags:        --no-encode        render all frames + checks, skip the video encode
//                       --encode-only      reuse the frames already in media/loops-frames/<name>
//                       --test[=CRF]       render frames 0-47 only, encode a 2 s MP4 + WebM at CRF (default 23 / 32)
//                                          into media/loops-check/ and print the projected 9 s sizes
//                       --mp4-crf=N        starting x264 CRF (default per loop in CRF below; raised by 1
//                                          until the file fits the 1.5 MB budget)
//                       --webm-crf=N       starting VP9 CRF (default per loop; same)
//
// Writes:  media/loops-frames/<name>/f0000.png ... f0216.png   (216 = seam check only, not encoded)
//          media/loops-check/<name>-sheet.png                   (frames 0, 36, 72, 108, 144, 180)
//          public/media/loops/<name>.mp4 | <name>.webm | <name>-poster.webp
import { chromium } from 'playwright'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..')
const FFMPEG = path.join(ROOT, 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg')
const FRAMES_DIR = path.join(ROOT, 'media', 'loops-frames')
const CHECK_DIR = path.join(ROOT, 'media', 'loops-check')
const OUT_DIR = path.join(ROOT, 'public', 'media', 'loops')

const ALL = ['neural-field', 'signal-flow', 'token-stream', 'timeline-lattice', 'orbit-field', 'latent-space', 'calm-horizon']
const W = 1280
const H = 720
const FRAMES = 216
const FPS = 24
const SHEET = [0, 36, 72, 108, 144, 180]
const BUDGET = 1_500_000 // bytes, per MP4 and per WebM
const POSTER_BUDGET = 60_000
// Starting CRFs (from --test measurements); the budget loop raises a CRF by 1 until the file fits BUDGET.
const CRF_DEFAULT = { mp4: 23, webm: 34 }
const CRF = {
  'neural-field': { mp4: 26, webm: 38 },
  'signal-flow': { mp4: 24, webm: 37 },
  'token-stream': { mp4: 23, webm: 32 },
  'timeline-lattice': { mp4: 21, webm: 30 },
  'orbit-field': { mp4: 22, webm: 32 },
  'latent-space': { mp4: 25, webm: 37 },
}

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => {
  const a = args.find((x) => x.startsWith(`--${n}=`))
  return a ? Number(a.split('=')[1]) : d
}
const names = args.filter((a) => !a.startsWith('--'))
const todo = names.length ? names : ALL
for (const n of todo) {
  if (!ALL.includes(n)) {
    console.error(`Unknown loop "${n}". Known: ${ALL.join(', ')}`)
    process.exit(2)
  }
}
if (!existsSync(FFMPEG)) {
  console.error('ffmpeg not found at', FFMPEG)
  process.exit(2)
}
const PREVIEW = flag('preview')
const ENCODE_ONLY = flag('encode-only')
const TEST = args.some((a) => a === '--test' || a.startsWith('--test='))
const ENCODE = !PREVIEW && !flag('no-encode')

const pad = (i) => `f${String(i).padStart(4, '0')}.png`
const kb = (b) => `${(b / 1024).toFixed(0)} KB`

// ------------------------------------------------------------------ helpers
function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' }
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost')
        const file = path.join(HERE, decodeURIComponent(url.pathname))
        if (!file.startsWith(HERE)) throw new Error('outside')
        const data = await readFile(file)
        res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
        res.end(data)
      } catch {
        res.writeHead(404)
        res.end()
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

function ffmpeg(argv, capture = false) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, argv, { stdio: ['ignore', capture ? 'pipe' : 'ignore', 'pipe'] })
    const out = []
    let err = ''
    if (capture) p.stdout.on('data', (b) => out.push(b))
    p.stderr.on('data', (b) => (err += b))
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve(Buffer.concat(out)) : reject(new Error(`ffmpeg exit ${code}\n${err.slice(-3000)}`))))
  })
}

const rawFrame = (file) => ffmpeg(['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], true)

function mad(a, b) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i])
  return s / a.length
}

// Streams frames 0..count-1 through ffmpeg and returns consecutive-frame mean abs differences.
function consecutiveDiffs(dir, count) {
  return new Promise((resolve, reject) => {
    const size = W * H * 3
    const p = spawn(FFMPEG, ['-v', 'error', '-framerate', String(FPS), '-start_number', '0', '-i', path.join(dir, 'f%04d.png'), '-frames:v', String(count), '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { stdio: ['ignore', 'pipe', 'pipe'] })
    let cur = Buffer.alloc(size)
    let prev = null
    let fill = 0
    const diffs = []
    let err = ''
    p.stderr.on('data', (b) => (err += b))
    p.stdout.on('data', (chunk) => {
      let off = 0
      while (off < chunk.length) {
        const n = Math.min(size - fill, chunk.length - off)
        chunk.copy(cur, fill, off, off + n)
        fill += n
        off += n
        if (fill === size) {
          if (prev) diffs.push(mad(prev, cur))
          const t = prev || Buffer.alloc(size)
          prev = cur
          cur = t
          fill = 0
        }
      }
    })
    p.on('error', reject)
    p.on('close', (code) => (code === 0 ? resolve(diffs) : reject(new Error(err))))
  })
}

async function sizeOf(f) {
  return (await stat(f)).size
}

// ------------------------------------------------------------------ steps
async function renderFrames(page, port, name, list) {
  const dir = path.join(FRAMES_DIR, name)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  await page.goto(`http://127.0.0.1:${port}/page.html?loop=${name}`)
  await page.waitForFunction(() => window.loopReady || window.loopError, null, { timeout: 120000 })
  const error = await page.evaluate(() => window.loopError)
  if (error) throw new Error(`${name}: ${error}`)
  const t0 = Date.now()
  for (let k = 0; k < list.length; k++) {
    const i = list[k]
    const url = await page.evaluate((f) => {
      window.renderFrame(f)
      return document.getElementById('out').toDataURL('image/png')
    }, i)
    await writeFile(path.join(dir, pad(i)), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'))
    if (k % 24 === 0 || k === list.length - 1) {
      const el = (Date.now() - t0) / 1000
      process.stdout.write(`\r  ${name}: frame ${i} (${k + 1}/${list.length}) ${el.toFixed(0)}s   `)
    }
  }
  process.stdout.write('\n')
  return dir
}

async function contactSheet(dir, name) {
  await mkdir(CHECK_DIR, { recursive: true })
  const out = path.join(CHECK_DIR, `${name}-sheet.png`)
  const inputs = SHEET.flatMap((f) => ['-i', path.join(dir, pad(f))])
  const tiles = SHEET.map((_, k) => `[${k}:v]scale=640:360:flags=area,pad=648:368:4:4:color=0x3a3a3a[t${k}]`).join(';')
  const fc = `${tiles};[t0][t1][t2]hstack=inputs=3[r0];[t3][t4][t5]hstack=inputs=3[r1];[r0][r1]vstack=inputs=2`
  await ffmpeg(['-y', '-v', 'error', ...inputs, '-filter_complex', fc, '-frames:v', '1', out])
  return out
}

const COLOR_TAGS = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv']
const VF = 'scale=out_color_matrix=bt709:out_range=tv:flags=bicubic+accurate_rnd+full_chroma_int,format=yuv420p'

async function encodeWithBudget(label, build, startCrf, maxCrf, out) {
  let crf = startCrf
  for (;;) {
    await ffmpeg(build(crf))
    const size = await sizeOf(out)
    if (size <= BUDGET || crf >= maxCrf) {
      return { crf, size }
    }
    console.log(`  ${label} crf ${crf} -> ${kb(size)} over budget, retrying`)
    crf += 1
  }
}

async function encode(dir, name) {
  await mkdir(OUT_DIR, { recursive: true })
  const input = ['-framerate', String(FPS), '-start_number', '0', '-i', path.join(dir, 'f%04d.png'), '-frames:v', String(FRAMES)]
  const mp4 = path.join(OUT_DIR, `${name}.mp4`)
  const webm = path.join(OUT_DIR, `${name}.webm`)
  const poster = path.join(OUT_DIR, `${name}-poster.webp`)
  const m = await encodeWithBudget('mp4', (crf) => [
    '-y', '-v', 'error', ...input, '-vf', VF,
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', String(crf), '-g', '48',
    ...COLOR_TAGS, '-movflags', '+faststart', '-an', '-r', String(FPS), mp4,
  ], opt('mp4-crf', (CRF[name] || CRF_DEFAULT).mp4), 40, mp4)
  const v = await encodeWithBudget('webm', (crf) => [
    '-y', '-v', 'error', ...input, '-vf', VF,
    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf), '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p',
    ...COLOR_TAGS, '-an', '-r', String(FPS), webm,
  ], opt('webm-crf', (CRF[name] || CRF_DEFAULT).webm), 50, webm)
  let q = 70
  let ps
  for (;;) {
    await ffmpeg(['-y', '-v', 'error', '-i', path.join(dir, pad(0)), '-c:v', 'libwebp', '-quality', String(q), '-compression_level', '6', poster])
    ps = await sizeOf(poster)
    if (ps <= POSTER_BUDGET || q <= 30) break
    q -= 8
  }
  return { mp4: m, webm: v, poster: { q, size: ps } }
}

// ------------------------------------------------------------------ main
const server = await serve()
const port = server.address().port
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: W, height: H } })
page.on('pageerror', (e) => console.error('  page error:', e.message))
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') console.error('  page:', m.text())
})

const summary = []
try {
  for (const name of todo) {
    if (TEST) {
      const dir = await renderFrames(page, port, name, Array.from({ length: 48 }, (_, i) => i))
      const crf = opt('test', 23)
      const vcrf = opt('webm-crf', crf + 9)
      const input = ['-framerate', String(FPS), '-start_number', '0', '-i', path.join(dir, 'f%04d.png'), '-frames:v', '48']
      const m = path.join(CHECK_DIR, `${name}-test.mp4`)
      const v = path.join(CHECK_DIR, `${name}-test.webm`)
      await mkdir(CHECK_DIR, { recursive: true })
      await ffmpeg(['-y', '-v', 'error', ...input, '-vf', VF, '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', String(crf), '-g', '48', '-an', m])
      await ffmpeg(['-y', '-v', 'error', ...input, '-vf', VF, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(vcrf), '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', v])
      console.log(`  test ${name}: mp4 crf ${crf} -> ~${kb((await sizeOf(m)) * 4.5)} / 9 s, webm crf ${vcrf} -> ~${kb((await sizeOf(v)) * 4.5)} / 9 s`)
      continue
    }
    const list = PREVIEW ? [...SHEET, FRAMES] : Array.from({ length: FRAMES + 1 }, (_, i) => i)
    let dir = path.join(FRAMES_DIR, name)
    if (ENCODE_ONLY) {
      if (!existsSync(path.join(dir, pad(FRAMES)))) throw new Error(`${name}: no rendered frames in ${dir}`)
      console.log(`  ${name}: using existing frames`)
    } else dir = await renderFrames(page, port, name, list)
    const seam = mad(await rawFrame(path.join(dir, pad(0))), await rawFrame(path.join(dir, pad(FRAMES))))
    let motion = null
    if (!PREVIEW) {
      const d = await consecutiveDiffs(dir, FRAMES + 1)
      const steps = d.slice(0, FRAMES) // 0->1 ... 215->216 (216 == 0, so the last one is the wrap step)
      motion = { mean: steps.reduce((a, b) => a + b, 0) / steps.length, max: Math.max(...steps), wrap: steps[FRAMES - 1] }
    }
    const sheet = await contactSheet(dir, name)
    const row = { name, seam, motion, sheet }
    console.log(`  seam |f0 - f216| mean abs diff: ${seam.toFixed(4)}`)
    if (motion) console.log(`  frame-to-frame diff: mean ${motion.mean.toFixed(3)}, max ${motion.max.toFixed(3)}, wrap step 215->0 ${motion.wrap.toFixed(3)}`)
    console.log(`  sheet: ${path.relative(ROOT, sheet)}`)
    if (ENCODE) {
      const e = await encode(dir, name)
      row.enc = e
      console.log(`  mp4 ${kb(e.mp4.size)} (crf ${e.mp4.crf}) | webm ${kb(e.webm.size)} (crf ${e.webm.crf}) | poster ${kb(e.poster.size)} (q ${e.poster.q})`)
    }
    summary.push(row)
  }
} finally {
  await browser.close()
  server.close()
}

console.log('\nSummary')
for (const r of summary) {
  const e = r.enc
  const sizes = e ? ` mp4 ${kb(e.mp4.size)}, webm ${kb(e.webm.size)}, poster ${kb(e.poster.size)}` : ''
  console.log(`  ${r.name.padEnd(17)} seam ${r.seam.toFixed(4)}${sizes}`)
}
