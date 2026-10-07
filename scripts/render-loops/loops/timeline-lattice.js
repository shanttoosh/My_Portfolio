// timeline-lattice (Experience): a blueprint. A static cream hairline grid on cobalt with a faint dashed
// route; a single cream line draws itself node to node along the route (a small sun-yellow pen dot leads
// it), each milestone node pops in as a circle with a halftone fill, then the drawn path fades back to the
// empty blueprint, so frame 216 equals frame 0.
import { W, H, FRAMES, mulberry32, INK, rgba, halftoneDisc, smoothstep, clamp } from '../lib/core.js'

export function create() {
  const rnd = mulberry32(0x7117)
  const GRID = 40
  // milestone nodes on grid intersections, left to right
  const xs = [3, 6, 9, 12, 16, 19, 23, 26, 29]
  const ys = [11, 8, 9, 5, 7, 4, 6, 3, 5]
  const nodes = xs.map((gx, k) => ({ x: gx * GRID, y: ys[k] * GRID + 100, R: k === xs.length - 1 ? 17 : 11 + rnd() * 4 }))
  // orthogonal route: horizontal run then vertical step into each node (blueprint style)
  const pts = [nodes[0]]
  for (let k = 1; k < nodes.length; k++) {
    const a = nodes[k - 1]
    const b = nodes[k]
    pts.push({ x: b.x, y: a.y })
    pts.push(b)
  }
  const seg = []
  let L = 0
  for (let k = 1; k < pts.length; k++) {
    const len = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y)
    seg.push({ a: pts[k - 1], b: pts[k], s0: L, len })
    L += len
  }
  for (const n of nodes) {
    let s = 0
    for (const g of seg) if (g.b === n) s = g.s0 + g.len
    n.s = s
  }

  const ease = (x) => {
    x = clamp(x, 0, 1)
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  }
  function pointAt(s) {
    for (const g of seg) {
      if (s <= g.s0 + g.len) {
        const f = g.len > 0 ? (s - g.s0) / g.len : 0
        return [g.a.x + (g.b.x - g.a.x) * f, g.a.y + (g.b.y - g.a.y) * f]
      }
    }
    const e = seg[seg.length - 1].b
    return [e.x, e.y]
  }

  function draw(i, ctx) {
    const t = i / FRAMES
    ctx.fillStyle = INK.cobalt
    ctx.fillRect(0, 0, W, H)
    // blueprint grid
    ctx.lineWidth = 1
    ctx.strokeStyle = rgba(INK.cream, 0.1)
    ctx.beginPath()
    for (let x = GRID; x < W; x += GRID) {
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, H)
    }
    for (let y = 20 + GRID; y < H; y += GRID) {
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(W, y + 0.5)
    }
    ctx.stroke()
    ctx.strokeStyle = rgba(INK.cream, 0.22)
    ctx.beginPath()
    for (let x = GRID * 4; x < W; x += GRID * 4) {
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, H)
    }
    for (let y = 20 + GRID * 4; y < H; y += GRID * 4) {
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(W, y + 0.5)
    }
    ctx.stroke()
    // faint dashed plan of the route
    ctx.setLineDash([4, 6])
    ctx.strokeStyle = rgba(INK.cream, 0.3)
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (const q of pts) ctx.lineTo(q.x, q.y)
    ctx.stroke()
    ctx.setLineDash([])
    for (const n of nodes) {
      ctx.strokeStyle = rgba(INK.cream, 0.3)
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.R, 0, Math.PI * 2)
      ctx.stroke()
    }

    // draw-on, hold, fade back
    const head = L * ease(t / 0.64)
    // keeps growing after the line is complete so the last node's pop-in can finish
    const headV = head + Math.max(0, t - 0.64) * L
    const alpha = 1 - smoothstep(0.76, 0.97, t)
    if (alpha > 0.002 && head > 0.5) {
      ctx.globalAlpha = alpha
      ctx.strokeStyle = INK.cream
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (const g of seg) {
        if (g.s0 >= head) break
        const e = Math.min(head, g.s0 + g.len)
        const [x, y] = pointAt(e)
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k]
        const since = headV - n.s + 0.001
        if (since < 0) continue
        const pop = clamp(since / 60, 0, 1)
        const sc = pop < 1 ? 1 + 0.25 * Math.sin(pop * Math.PI) : 1
        const R = n.R * sc * smoothstep(0, 0.35, pop)
        ctx.fillStyle = INK.cobalt
        ctx.beginPath()
        ctx.arc(n.x, n.y, R, 0, Math.PI * 2)
        ctx.fill()
        halftoneDisc(ctx, n.x, n.y, R * 0.86, INK.cream, { pitch: 3.6, light: [-0.35, -0.35], shade: (d) => 1.05 - d })
        ctx.strokeStyle = INK.cream
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(n.x, n.y, R, 0, Math.PI * 2)
        ctx.stroke()
      }
      // pen dot leading the line while drawing
      if (t < 0.66) {
        const [x, y] = pointAt(head)
        ctx.fillStyle = INK.sun
        ctx.beginPath()
        ctx.arc(x, y, 4.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  }

  return { draw, grain: { amount: 2.6 } }
}
