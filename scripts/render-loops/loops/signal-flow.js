// signal-flow (Approach): an op-art tunnel of nested rounded rectangles (like windows inside windows),
// alternating cream and cobalt stripes with one sky stripe every eight, zooming steadily inward forever.
// Rectangle k has scale g^(k + 8t), so after one loop every rectangle has moved exactly eight places in
// and the colour pattern (period 8) lines up again: seamless. The tunnel bends gently because inner
// rectangles sway more than outer ones; a fixed navy core hides the vanishing point.
import { W, H, FRAMES, TAU, INK } from '../lib/core.js'

export function create() {
  const CX = 0.6 * W
  const CY = 0.5 * H
  const G = 0.885
  const N = 8
  const pattern = [INK.cream, INK.cobalt, INK.cream, INK.cobalt, INK.cream, INK.cobalt, INK.sky, INK.cobalt]
  const BW = 0.62 * W
  const BH = 0.62 * H

  function draw(i, ctx) {
    const t = i / FRAMES
    const p = TAU * t
    const swx = 46 * Math.sin(p)
    const swy = 24 * Math.sin(p + 1.1)
    ctx.fillStyle = INK.cobalt
    ctx.fillRect(0, 0, W, H)
    for (let k = -40; k < 80; k++) {
      const s = Math.pow(G, k + N * t)
      const w = BW * s
      const h = BH * s
      if (w > 4.2 * W) continue
      const bend = 1 - Math.min(1, s)
      const x = CX + swx * bend * bend
      const y = CY + swy * bend * bend
      if (h < 40) {
        // fixed-size navy core covering the endless thin stripes
        ctx.fillStyle = INK.navy
        ctx.beginPath()
        ctx.roundRect(CX + swx - 36, CY + swy - 21, 72, 42, 9)
        ctx.fill()
        break
      }
      ctx.fillStyle = pattern[((k % N) + N) % N]
      ctx.beginPath()
      ctx.roundRect(x - w / 2, y - h / 2, w, h, Math.min(w, h) * 0.16)
      ctx.fill()
    }
  }

  return { draw, grain: { amount: 2.6 } }
}
