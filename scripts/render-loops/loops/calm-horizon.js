// calm-horizon (Contact): the quietest loop. A large cream planet arc rests at the bottom of a cobalt sky,
// with halftone limb shading and a navy print offset; thin hairline arcs emerge from its surface and drift
// slowly outward (one spacing per loop, so the loop is seamless), the planet rises and settles very
// gently, and a few tiny sun-yellow stars twinkle.
import { W, H, FRAMES, TAU, mulberry32, INK, rgba, star4, smoothstep, clamp } from '../lib/core.js'

export function create() {
  const rnd = mulberry32(0xca11)
  const PX = 0.62 * W
  const R = 1150
  const BASE_Y = H - 210 + R // planet centre y; top of the arc at y = H - 210
  const GAP = 92
  const stars = []
  for (let q = 0; q < 11; q++) stars.push({ x: W * (0.08 + rnd() * 0.9), y: H * (0.06 + rnd() * 0.5), r: 4 + rnd() * 4, k: 1 + Math.floor(rnd() * 2), ph: rnd() * TAU })
  const dots = []
  for (let q = 0; q < 40; q++) dots.push({ x: rnd() * W, y: rnd() * H * 0.62, r: 0.8 + rnd() * 0.9 })

  function draw(i, ctx) {
    const t = i / FRAMES
    const p = TAU * t
    const cy = BASE_Y - 16 * (0.5 - 0.5 * Math.cos(p))
    ctx.fillStyle = INK.cobalt
    ctx.fillRect(0, 0, W, H)
    // distant cream specks
    ctx.fillStyle = rgba(INK.cream, 0.7)
    ctx.beginPath()
    for (const d of dots) {
      ctx.moveTo(d.x + d.r, d.y)
      ctx.arc(d.x, d.y, d.r, 0, TAU)
    }
    ctx.fill()
    // hairline arcs drifting outward from the planet
    ctx.lineWidth = 1.2
    for (let k = 0; k < 4; k++) {
      const f = (k + t) / 4
      const a = smoothstep(0, 0.18, f) * (1 - smoothstep(0.62, 1, f)) * 0.55
      if (a < 0.005) continue
      ctx.strokeStyle = rgba(INK.cream, a)
      ctx.beginPath()
      ctx.arc(PX, cy, R + 26 + GAP * (k + t), Math.PI * 1.02, Math.PI * 1.98)
      ctx.stroke()
    }
    // planet: navy offset, cream body, halftone limb shading
    ctx.fillStyle = INK.navy
    ctx.beginPath()
    ctx.arc(PX + 10, cy - 8, R, 0, TAU)
    ctx.fill()
    ctx.fillStyle = INK.cream
    ctx.beginPath()
    ctx.arc(PX, cy, R, 0, TAU)
    ctx.fill()
    const pitch = 8
    ctx.fillStyle = INK.cobalt
    ctx.beginPath()
    const yTop = Math.max(0, cy - R)
    for (let gy = Math.floor((yTop - cy) / pitch); gy * pitch + cy < H + pitch; gy++) {
      for (let gx = Math.floor(-PX / pitch) - 1; gx * pitch + PX < W + pitch; gx++) {
        const ox = gx * pitch + (gy % 2 ? pitch / 2 : 0)
        const x = PX + ox
        const y = cy + gy * pitch
        const d = Math.hypot(ox, gy * pitch) / R
        if (d > 0.995) continue
        // ink grows toward the limb, more on the right (shadow side)
        const lim = 0.75 * smoothstep(0.945, 0.995, d) * (0.45 + 0.55 * clamp(ox / (0.5 * R) + 0.35, 0, 1))
        const r = 0.5 * pitch * Math.sqrt(lim) * 1.05
        if (r < 0.4) continue
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, TAU)
      }
    }
    ctx.fill()
    // twinkling stars
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(s.k * p + s.ph)
      star4(ctx, s.x, s.y, s.r * (0.3 + 0.7 * tw * tw), INK.sun)
    }
  }

  return { draw, grain: { amount: 2.6 } }
}
