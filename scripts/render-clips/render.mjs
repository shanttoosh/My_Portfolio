// Renders the code-generated product clips (1600x900, 24 fps, 192 frames = 8 s, seamless loop).
//
// Each clip (clips/<name>.js) draws UI / diagrams with plain Canvas 2D and is a pure function of the
// frame index (seeded randomness only). Story clips ease every element back to their opening state,
// so frame 192 renders the same pixels as frame 0. Clips run in headless Chromium (page.html +
// lib/kit.js, Inter + JetBrains Mono from Google Fonts); frames come back as PNG via canvas.toDataURL
// and are encoded with ffmpeg-static.
//
//   All clips:          node scripts/render-clips/render.mjs
//   One (or several):   node scripts/render-clips/render.mjs system-map rag-retrieval
//   Quick preview:      node scripts/render-clips/render.mjs --preview system-map
//                       (renders frames 0,32,...,160 + 192 -> seam value + contact sheet, no encode;
//                        add --frames=40,100 for extra frames, --guides to draw the 4:3 phone crop)
//   Other flags:        --no-encode        render all frames + checks, skip the video encode
//                       --encode-only      reuse the frames already in media/clips-frames/<name>
//                       --mp4-crf=N        starting x264 CRF (default 20; raised in steps of 2 until <= 1.5 MB)
//                       --webm-crf=N       starting VP9 CRF (default 28; same)
//                       --formats=webm     encode only these outputs (any of mp4,webm,poster; default all)
//
// Writes:  media/clips-frames/<name>/f0000.png ... f0192.png   (192 = seam check only, not encoded)
//          media/clips-frames/<name>-preview/                  (preview frames)
//          media/clips-check/<name>-sheet.png                  (frames 0, 32, 64, 96, 128, 160)
//          public/media/clips/<name>.mp4 | <name>.webm | <name>-poster.webp
import { chromium } from 'playwright'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..')
const FFMPEG = path.join(ROOT, 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg')
const FRAMES_DIR = path.join(ROOT, 'media', 'clips-frames')
const CHECK_DIR = path.join(ROOT, 'media', 'clips-check')
const OUT_DIR = path.join(ROOT, 'public', 'media', 'clips')

const ALL = ['system-map', 'blueprint', 'rag-retrieval', 'drawing-takeoff', 'terminal-ci', 'grounded-chat', 'commit-graph']
const W = 1600
const H = 900
const FRAMES = 192
const FPS = 24
const SHEET = [0, 32, 64, 96, 128, 160]
const BUDGET = 1_500_000 // bytes, per MP4 and per WebM
const POSTER_BUDGET = 80_000
// UI text and hairlines need a fairly low CRF to stay crisp; the clips are mostly static so they still
// land far under budget. The budget loop raises the CRF if a clip does not fit.
const CRF_DEFAULT = { mp4: 20, webm: 28 }
const CRF = {}

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => {
  const a = args.find((x) => x.startsWith(`--${n}=`))
  return a ? a.split('=')[1] : d
}
const names = args.filter((a) => !a.startsWith('--'))
const todo = names.length ? names : ALL
for (const n of todo) {
  if (!ALL.includes(n)) {
    console.error(`Unknown clip "${n}". Known: ${ALL.join(', ')}`)
    process.exit(2)
  }
}
if (!existsSync(FFMPEG)) {
  console.error('ffmpeg not found at', FFMPEG)
  process.exit(2)
}
const PREVIEW = flag('preview')
const ENCODE_ONLY = flag('encode-only')
const ENCODE = !PREVIEW && !flag('no-encode')
const GUIDES = flag('guides')
const FORMATS = String(opt('formats', 'mp4,webm,poster')).split(',')
const EXTRA = String(opt('frames', ''))
  .split(',')
  .filter(Boolean)
  .map(Number)

const fmtEnc = (e) =>
  [e.mp4 && `mp4 ${kb(e.mp4.size)} (crf ${e.mp4.crf})`, e.webm && `webm ${kb(e.webm.size)} (crf ${e.webm.crf})`, e.poster && `poster ${kb(e.poster.size)} (q ${e.poster.q})`]
    .filter(Boolean)
    .join(' | ')
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
function maxDiff(a, b) {
  let m = 0
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i])
    if (d > m) m = d
  }
  return m
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
async function renderFrames(page, port, name, list, dir, resume = false) {
  if (!resume) await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  await page.goto(`http://127.0.0.1:${port}/page.html?clip=${name}${GUIDES ? '&guides' : ''}`)
  await page.waitForFunction(() => window.clipReady || window.clipError, null, { timeout: 120000 })
  const { error, fonts } = await page.evaluate(() => ({ error: window.clipError, fonts: window.fontStatus }))
  if (error) throw new Error(`${name}: ${error}`)
  const missing = (fonts || []).filter((f) => !f.ok).map((f) => f.face)
  const fontNote = missing.length ? `FALLBACK (missing: ${missing.join(', ')})` : 'Inter + JetBrains Mono loaded'
  console.log(`  ${name}: fonts ${fontNote}`)
  const t0 = Date.now()
  for (let k = 0; k < list.length; k++) {
    const i = list[k]
    if (resume && existsSync(path.join(dir, pad(i)))) continue // frames are deterministic: keep what we have
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
  return fontNote
}

async function contactSheet(dir, name) {
  await mkdir(CHECK_DIR, { recursive: true })
  const out = path.join(CHECK_DIR, `${name}-sheet.png`)
  const inputs = SHEET.flatMap((f) => ['-i', path.join(dir, pad(f))])
  const tiles = SHEET.map((_, k) => `[${k}:v]scale=800:450:flags=area,pad=808:458:4:4:color=0x3a3a3a[t${k}]`).join(';')
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
    if (size <= BUDGET || crf >= maxCrf) return { crf, size }
    console.log(`  ${label} crf ${crf} -> ${kb(size)} over budget, retrying`)
    crf += 2
  }
}

async function encode(dir, name) {
  await mkdir(OUT_DIR, { recursive: true })
  const input = ['-framerate', String(FPS), '-start_number', '0', '-i', path.join(dir, 'f%04d.png'), '-frames:v', String(FRAMES)]
  const mp4 = path.join(OUT_DIR, `${name}.mp4`)
  const webm = path.join(OUT_DIR, `${name}.webm`)
  const poster = path.join(OUT_DIR, `${name}-poster.webp`)
  const c = CRF[name] || CRF_DEFAULT
  const res = {}
  if (FORMATS.includes('mp4')) res.mp4 = await encodeWithBudget('mp4', (crf) => [
    '-y', '-v', 'error', ...input, '-vf', VF,
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', String(crf), '-g', '48',
    ...COLOR_TAGS, '-movflags', '+faststart', '-an', '-r', String(FPS), mp4,
  ], Number(opt('mp4-crf', c.mp4)), 40, mp4)
  if (FORMATS.includes('webm')) res.webm = await encodeWithBudget('webm', (crf) => [
    '-y', '-v', 'error', ...input, '-vf', VF,
    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf), '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-g', '48', '-pix_fmt', 'yuv420p',
    ...COLOR_TAGS, '-an', '-r', String(FPS), webm,
  ], Number(opt('webm-crf', c.webm)), 50, webm)
  if (!FORMATS.includes('poster')) return res
  let q = 82
  let ps
  for (;;) {
    await ffmpeg(['-y', '-v', 'error', '-i', path.join(dir, pad(0)), '-c:v', 'libwebp', '-quality', String(q), '-compression_level', '6', poster])
    ps = await sizeOf(poster)
    if (ps <= POSTER_BUDGET || q <= 30) break
    q -= 8
  }
  res.poster = { q, size: ps }
  return res
}

// ------------------------------------------------------------------ main
const server = await serve()
const port = server.address().port
// The browser is (re)launched on demand: if headless Chromium dies mid-clip (a weak PC, or something
// else closing it), a fresh browser resumes that clip from the frames already written (up to 6 tries).
let browser = null
let page = null
async function openPage() {
  if (browser) await browser.close().catch(() => {})
  browser = await chromium.launch({ headless: true })
  page = await browser.newPage({ viewport: { width: W, height: H } })
  page.on('pageerror', (e) => console.error('  page error:', e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') console.error('  page:', m.text())
  })
}
async function renderWithRetry(name, list, dir) {
  for (let attempt = 1; ; attempt++) {
    try {
      if (!page || page.isClosed()) await openPage()
      return await renderFrames(page, port, name, list, dir, attempt > 1)
    } catch (e) {
      const closed = /closed|crash|disconnected/i.test(String(e && e.message))
      if (!closed || attempt >= 6) throw e
      const reason = String(e.message).split(/\r?\n/)[0]
      console.log(`\n  ${name}: browser went away (${reason}), relaunching and resuming (attempt ${attempt + 1})`)
      page = null
      await new Promise((r) => setTimeout(r, 3000))
    }
  }
}

const summary = []
try {
  for (const name of todo) {
    const list = PREVIEW
      ? [...new Set([...SHEET, ...EXTRA, FRAMES])].sort((a, b) => a - b)
      : Array.from({ length: FRAMES + 1 }, (_, i) => i)
    const dir = path.join(FRAMES_DIR, PREVIEW ? `${name}-preview` : name)
    let fontNote = 'n/a (encode-only)'
    if (ENCODE_ONLY) {
      const have = existsSync(dir) ? (await readdir(dir)).filter((f) => /^f\d{4}\.png$/.test(f)).length : 0
      if (have < FRAMES + 1) throw new Error(`${name}: expected ${FRAMES + 1} frames in ${dir}, found ${have}`)
      console.log(`  ${name}: using existing frames`)
    } else fontNote = await renderWithRetry(name, list, dir)
    const f0 = await rawFrame(path.join(dir, pad(0)))
    const fN = await rawFrame(path.join(dir, pad(FRAMES)))
    const seam = mad(f0, fN)
    const seamMax = maxDiff(f0, fN)
    let motion = null
    if (!PREVIEW) {
      const d = await consecutiveDiffs(dir, FRAMES + 1)
      const steps = d.slice(0, FRAMES) // 0->1 ... 191->192 (192 == 0, so the last one is the wrap step)
      motion = { mean: steps.reduce((a, b) => a + b, 0) / steps.length, max: Math.max(...steps), wrap: steps[FRAMES - 1] }
    }
    const sheet = await contactSheet(dir, name)
    const row = { name, seam, seamMax, motion, sheet, fontNote }
    console.log(`  seam |f0 - f192| mean abs diff: ${seam.toFixed(4)} (max channel diff ${seamMax})`)
    if (motion) console.log(`  frame-to-frame diff: mean ${motion.mean.toFixed(3)}, max ${motion.max.toFixed(3)}, wrap step 191->192 ${motion.wrap.toFixed(3)}`)
    console.log(`  sheet: ${path.relative(ROOT, sheet)}`)
    if (ENCODE) {
      const e = await encode(dir, name)
      row.enc = e
      console.log('  ' + fmtEnc(e))
    }
    summary.push(row)
  }
} finally {
  if (browser) await browser.close().catch(() => {})
  server.close()
}

console.log('\nSummary')
for (const r of summary) {
  const e = r.enc
  const sizes = e ? ' ' + fmtEnc(e) : ''
  const mo = r.motion ? `, wrap ${r.motion.wrap.toFixed(3)} / mean ${r.motion.mean.toFixed(3)} / max ${r.motion.max.toFixed(3)}` : ''
  console.log(`  ${r.name.padEnd(16)} seam ${r.seam.toFixed(4)} (max ${r.seamMax})${mo}${sizes} | fonts: ${r.fontNote}`)
}
