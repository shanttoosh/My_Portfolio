// Packs a folder of WebP frames (f001.webp, f002.webp, ...) into one file the site can stream.
// Usage: node scripts/pack-frames.mjs <frames-dir> <out.bin>
//
// Layout (little-endian): "SVSQ" | u32 count | count x (u32 frame, u32 offset, u32 length) | frame bytes.
// Frames are stored coarse-to-fine (every 16th, then every 8th, ...), so a partly downloaded scene can
// already be scrubbed, and offsets are relative to the start of the frame bytes.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [dir, out] = process.argv.slice(2)
if (!dir || !out) {
  console.error('Usage: node scripts/pack-frames.mjs <frames-dir> <out.bin>')
  process.exit(2)
}

const files = readdirSync(dir).filter((f) => f.endsWith('.webp')).sort()
const n = files.length
const order = []
const seen = new Set()
for (const step of [16, 8, 4, 2, 1]) {
  for (let i = 0; i < n; i += step) {
    if (!seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
}
if (!seen.has(n - 1)) order.push(n - 1)

const datas = order.map((i) => readFileSync(join(dir, files[i])))
const headerSize = 8 + n * 12
const total = headerSize + datas.reduce((a, d) => a + d.length, 0)
const buf = Buffer.alloc(total)
buf.write('SVSQ', 0, 'ascii')
buf.writeUInt32LE(n, 4)
let offset = 0
order.forEach((frame, k) => {
  const at = 8 + k * 12
  buf.writeUInt32LE(frame, at)
  buf.writeUInt32LE(offset, at + 4)
  buf.writeUInt32LE(datas[k].length, at + 8)
  datas[k].copy(buf, headerSize + offset)
  offset += datas[k].length
})
writeFileSync(out, buf)
console.log(`${out}: ${n} frames, ${Math.round(total / 1024)} KB`)
