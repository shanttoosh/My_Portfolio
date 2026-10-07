// orbit-field (Toolkit): thin cream hairline orbits around a cream core, with small planets filled with
// print patterns (halftone dots, stripes, cow-print blobs, a ringed planet, plain dots) in cream and sky.
// Identical planets are evenly spaced on each orbit and each orbit turns by exactly one spacing per loop
// (1 to 1/6 revolution), so speeds differ but the loop is seamless. One small sun planet is the highlight.
import { W, H, FRAMES, TAU, mulberry32, makeNoise, INK, rgba, halftoneDisc, blobPath, star4 } from '../lib/core.js'

export function create() {
  const rnd = mulberry32(0x0b21)
  const { n3 } = makeNoise(2121)
  const C = { x: 0.64 * W, y: 0.56 * H }
  const orbits = [
    { R: 96, n: 1, type: 'sun', r: 7, dir: 1 },
    { R: 166, n: 2, type: 'halftone', r: 17, dir: 1 },
    { R: 246, n: 3, type: 'stripes', r: 20, dir: -1 },
    { R: 336, n: 3, type: 'cow', r: 25, dir: 1 },
    { R: 436, n: 4, type: 'ringed', r: 17, dir: -1 },
    { R: 548, n: 6, type: 'dot', r: 6, dir: 1 },
  ]
  for (const o of orbits) o.th0 = rnd() * TAU
  const stars = [
    { x: 0.2 * W, y: 0.16 * H, r: 8, k: 1, ph: 0.3 },
    { x: 0.93 * W, y: 0.1 * H, r: 7, k: 2, ph: 2.1 },
    { x: 0.37 * W, y: 0.88 * H, r: 7.5, k: 1, ph: 4.0 },
  ]

  function shadow(ctx, x, y, r) {
    ctx.fillStyle = INK.navy
    ctx.beginPath()
    ctx.arc(x + 3, y + 3, r, 0, TAU)
    ctx.fill()
  }
  function planet(ctx, type, x, y, r) {
    shadow(ctx, x, y, r)
    if (type === 'sun') {
      ctx.fillStyle = INK.sun
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.fill()
    } else if (type === 'dot') {
      ctx.fillStyle = INK.cream
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.fill()
    } else if (type === 'halftone') {
      ctx.fillStyle = INK.cobalt
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.fill()
      halftoneDisc(ctx, x, y, r, INK.cream, { pitch: 3.8, light: [-0.4, -0.4], shade: (d) => 1.1 - d * 1.1 })
      ctx.strokeStyle = INK.cream
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.stroke()
    } else if (type === 'stripes') {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.clip()
      ctx.fillStyle = INK.sky
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r)
      ctx.strokeStyle = INK.cream
      ctx.lineWidth = 3.2
      ctx.beginPath()
      for (let k = -4; k <= 4; k++) {
        ctx.moveTo(x - r * 1.5, y + k * 7.5 - r * 0.6)
        ctx.lineTo(x + r * 1.5, y + k * 7.5 + r * 0.6)
      }
      ctx.stroke()
      ctx.restore()
    } else if (type === 'cow') {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.clip()
      ctx.fillStyle = INK.cream
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r)
      ctx.fillStyle = INK.cobalt
      ctx.beginPath()
      blobPath(ctx, x - r * 0.35, y - r * 0.3, r * 0.42, n3, 1.3, { wobble: 0.45 })
      blobPath(ctx, x + r * 0.5, y + r * 0.35, r * 0.36, n3, 4.7, { wobble: 0.5 })
      blobPath(ctx, x + r * 0.42, y - r * 0.62, r * 0.2, n3, 8.1, { wobble: 0.4 })
      blobPath(ctx, x - r * 0.55, y + r * 0.62, r * 0.22, n3, 2.9, { wobble: 0.4 })
      ctx.fill()
      ctx.restore()
    } else if (type === 'ringed') {
      ctx.strokeStyle = INK.cream
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.ellipse(x, y, r * 1.85, r * 0.55, -0.35, Math.PI, TAU)
      ctx.stroke()
      ctx.fillStyle = INK.sky
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x, y, r * 1.85, r * 0.55, -0.35, 0, Math.PI)
      ctx.stroke()
    }
  }

  function draw(i, ctx) {
    const t = i / FRAMES
    const p = TAU * t
    ctx.fillStyle = INK.cobalt
    ctx.fillRect(0, 0, W, H)
    // hairline orbits
    ctx.strokeStyle = rgba(INK.cream, 0.32)
    ctx.lineWidth = 1.1
    for (const o of orbits) {
      ctx.beginPath()
      ctx.arc(C.x, C.y, o.R, 0, TAU)
      ctx.stroke()
    }
    // core: cream disc with a navy crescent and a halftone rim
    ctx.fillStyle = INK.navy
    ctx.beginPath()
    ctx.arc(C.x + 6, C.y + 6, 46, 0, TAU)
    ctx.fill()
    ctx.fillStyle = INK.cream
    ctx.beginPath()
    ctx.arc(C.x, C.y, 46, 0, TAU)
    ctx.fill()
    halftoneDisc(ctx, C.x, C.y, 46, INK.cobalt, { pitch: 4.2, light: [0.55, 0.55], shade: (d) => 0.9 - d * 1.6 })
    // planets
    for (const o of orbits) {
      const spin = (o.dir * TAU * t) / o.n
      for (let k = 0; k < o.n; k++) {
        const th = o.th0 + (TAU * k) / o.n + spin
        planet(ctx, o.type, C.x + o.R * Math.cos(th), C.y + o.R * Math.sin(th), o.r)
      }
    }
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(s.k * p + s.ph)
      star4(ctx, s.x, s.y, s.r * (0.35 + 0.65 * tw * tw), INK.sun)
    }
  }

  return { draw, grain: { amount: 2.6 } }
}
