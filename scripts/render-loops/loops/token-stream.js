// token-stream (Work): a code minimap in print. Rows of rounded token pills (cream and sky on cobalt,
// with an occasional sun-yellow highlight) slide sideways at different speeds for a parallax feel:
// small sky rows are far and slow, big cream rows are near and faster. Each row is a repeating "line of
// code" pattern of length L that moves exactly L per loop, so the loop is seamless.
import { W, H, FRAMES, mulberry32, INK } from '../lib/core.js'

export function create() {
  const rnd = mulberry32(0x70c7)
  const rows = []
  const ROWS = 15
  const pitch = H / ROWS
  for (let r = 0; r < ROWS; r++) {
    const depth = rnd() // 0 far .. 1 near
    const h = Math.round(7 + depth * 9)
    const L = [720, 960, 1280][Math.min(2, Math.floor(depth * 3))]
    const toks = []
    let x = 0
    while (x < L - 40) {
      // a line: indent, a few tokens, then a line break gap
      x += [0, 18, 36, 54][Math.floor(rnd() * 4)] * (h / 12)
      const n = 2 + Math.floor(rnd() * 5)
      for (let q = 0; q < n && x < L - 30; q++) {
        const len = Math.round((rnd() < 0.18 ? 6 + rnd() * 8 : 18 + rnd() * 58) * (h / 12))
        const c = rnd()
        const col = c < 0.014 ? INK.sun : depth < 0.4 ? INK.sky : c < 0.24 ? INK.sky : INK.cream
        toks.push({ x, len: Math.max(h, len), col })
        x += Math.max(h, len) + Math.round(5 * (h / 12)) + Math.floor(rnd() * 5)
      }
      x += Math.round(70 + rnd() * 170)
    }
    rows.push({ y: (r + 0.5) * pitch, h, L, toks, dir: rnd() < 0.7 ? -1 : 1 })
  }

  function draw(i, ctx) {
    const t = i / FRAMES
    ctx.fillStyle = INK.cobalt
    ctx.fillRect(0, 0, W, H)
    for (const row of rows) {
      const off = row.dir * row.L * t
      const y = row.y - row.h / 2
      for (const tk of row.toks) {
        let x0 = (((tk.x + off) % row.L) + row.L) % row.L - row.L
        for (; x0 < W + 10; x0 += row.L) {
          if (x0 + tk.len < -10) continue
          ctx.fillStyle = tk.col
          ctx.beginPath()
          ctx.roundRect(x0, y, tk.len, row.h, row.h / 2)
          ctx.fill()
        }
      }
    }
  }

  return { draw, grain: { amount: 2.6 } }
}
