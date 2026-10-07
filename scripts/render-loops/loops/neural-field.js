// neural-field (hero): a halftone neural network in cobalt and cream print. Nodes are cream halftone
// spheres (a few solid dots and hairline rings), joined by fixed cream hairlines to their nearest
// neighbours. Nodes breathe and drift on sines of the loop phase, small sky-blue signals travel along
// the links (an integer number of trips per loop) and a few tiny sun-yellow stars twinkle.
import { W, H, FRAMES, TAU, mulberry32, INK, rgba, halftoneDisc, star4, smoothstep, clamp, fract } from '../lib/core.js'

export function create() {
  const rnd = mulberry32(0xbeef1)
  // Poisson-disc-ish placement, denser toward the right
  const nodes = []
  let tries = 0
  while (nodes.length < 44 && tries++ < 20000) {
    const x = -20 + rnd() * (W + 40)
    const y = -20 + rnd() * (H + 40)
    if (rnd() > 0.3 + 0.7 * smoothstep(0.0, 0.62, x / W)) continue
    const big = rnd()
    const R = big < 0.2 ? 32 + rnd() * 20 : big < 0.5 ? 15 + rnd() * 12 : 5 + rnd() * 6
    let ok = true
    for (const n of nodes) if (Math.hypot(n.x - x, n.y - y) < n.R + R + 60) ok = false
    if (!ok) continue
    nodes.push({
      x, y, R,
      kind: R < 11 ? 'dot' : rnd() < 0.22 ? 'ring' : 'halftone',
      ax: 12 + rnd() * 14, ay: 9 + rnd() * 11, px: rnd() * TAU, py: rnd() * TAU, kx: rnd() < 0.5 ? 1 : 2, pb: rnd() * TAU,
    })
  }
  // links: each node to its 2-3 nearest neighbours (fixed topology, no popping)
  const links = []
  const seen = new Set()
  for (let a = 0; a < nodes.length; a++) {
    const near = nodes.map((n, b) => [b, Math.hypot(n.x - nodes[a].x, n.y - nodes[a].y)]).filter(([b]) => b !== a).sort((u, v) => u[1] - v[1])
    const k = rnd() < 0.5 ? 2 : 3
    for (let q = 0; q < k; q++) {
      const [b, d] = near[q]
      if (d > 330) continue
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push({ a, b, sig: rnd() < 0.55 ? { k: 1 + Math.floor(rnd() * 3), ph: rnd(), dir: rnd() < 0.5 ? 1 : -1 } : null })
    }
  }
  const stars = []
  for (let q = 0; q < 8; q++) stars.push({ x: W * (0.35 + rnd() * 0.63), y: H * (0.06 + rnd() * 0.88), r: 5 + rnd() * 4, k: 1 + Math.floor(rnd() * 2), ph: rnd() * TAU })

  function pos(n, p) {
    // halftone spheres keep a constant size (a re-scaling dot screen would be expensive to encode);
    // the solid dots and rings breathe
    const br = n.kind === 'halftone' ? 1 : 1 + 0.12 * Math.sin(p + n.pb)
    return [n.x + n.ax * Math.sin(n.kx * p + n.px), n.y + n.ay * Math.cos(p + n.py), n.R * br]
  }

  function draw(i, ctx) {
    const p = (TAU * i) / FRAMES
    const t = i / FRAMES
    ctx.fillStyle = INK.cobalt
    ctx.fillRect(0, 0, W, H)
    const P = nodes.map((n) => pos(n, p))

    // hairline links
    ctx.strokeStyle = rgba(INK.cream, 0.5)
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (const l of links) {
      ctx.moveTo(P[l.a][0], P[l.a][1])
      ctx.lineTo(P[l.b][0], P[l.b][1])
    }
    ctx.stroke()
    // signals (pass under the node discs at the ends)
    ctx.fillStyle = INK.sky
    for (const l of links) {
      if (!l.sig) continue
      let f = fract(l.sig.k * t + l.sig.ph)
      if (l.sig.dir < 0) f = 1 - f
      const x = P[l.a][0] + (P[l.b][0] - P[l.a][0]) * f
      const y = P[l.a][1] + (P[l.b][1] - P[l.a][1]) * f
      ctx.beginPath()
      ctx.arc(x, y, 3.4, 0, TAU)
      ctx.fill()
    }
    // nodes with a navy print-offset shadow
    for (let k = 0; k < nodes.length; k++) {
      const n = nodes[k]
      const [x, y, R] = P[k]
      ctx.fillStyle = INK.navy
      ctx.beginPath()
      ctx.arc(x + R * 0.16 + 2, y + R * 0.16 + 2, R, 0, TAU)
      ctx.fill()
      ctx.fillStyle = INK.cobalt
      ctx.beginPath()
      ctx.arc(x, y, R, 0, TAU)
      ctx.fill()
      if (n.kind === 'dot') {
        ctx.fillStyle = INK.cream
        ctx.beginPath()
        ctx.arc(x, y, R * 0.8, 0, TAU)
        ctx.fill()
      } else if (n.kind === 'ring') {
        ctx.strokeStyle = INK.cream
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.arc(x, y, R, 0, TAU)
        ctx.stroke()
        ctx.fillStyle = INK.cream
        ctx.beginPath()
        ctx.arc(x, y, R * 0.28, 0, TAU)
        ctx.fill()
      } else {
        // halftone sphere lit from the upper left: big dots at the highlight, tiny ones in shadow
        halftoneDisc(ctx, x, y, R, INK.cream, { pitch: clamp(n.R / 5.5, 3.6, 6.5), light: [-0.4, -0.4], shade: (d) => 1.1 - d * 1.15 })
      }
    }
    // twinkling stars
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(s.k * p + s.ph)
      const r = s.r * (0.35 + 0.65 * tw * tw)
      star4(ctx, s.x, s.y, r, INK.sun)
    }
  }

  return { draw, grain: { amount: 2.6 } }
}
