// system-map: the shape of a typical system. The layout opens as a ghosted plan (dashed hairlines on
// the dark console), the boxes wipe in and the edges draw left to right, a lime request packet travels
// User -> API -> Agent -> tools, the grounded answer travels back, then it eases back to the plan.
import {
  C, MONO, FPS, TAU, LIME, PANEL, T3, seg, env, clamp, easeInOut, snap, rr, panel, text, Poly, bez,
  strokePath, packet, white, mix, backdrop, BACKDROPS, doneBadge,
} from '../lib/kit.js'

const RET0 = 6.6
const RET1 = 7.3
const BD = BACKDROPS['system-map']
const art = BD.art // white hairlines on the dark backdrop

export function create() {
  const N = {
    user: { cx: 300, cy: 450, w: 150, h: 88, title: 'User', t: 0.25 },
    api: { cx: 565, cy: 450, w: 204, h: 112, title: 'API', sub: 'FastAPI', t: 0.55 },
    agent: { cx: 858, cy: 450, w: 224, h: 112, title: 'Agent', sub: 'LangGraph', t: 0.85 },
    vec: { cx: 1230, cy: 262, w: 240, h: 86, title: 'Vector DB', icon: 'db', t: 1.2 },
    pg: { cx: 1230, cy: 450, w: 240, h: 86, title: 'PostgreSQL', icon: 'db', t: 1.28 },
    llm: { cx: 1230, cy: 638, w: 240, h: 86, title: 'LLM', icon: 'spark', t: 1.36 },
  }
  for (const n of Object.values(N)) {
    n.x = n.cx - n.w / 2
    n.y = n.cy - n.h / 2
  }
  const R = (n) => [n.x + n.w, n.cy]
  const L = (n) => [n.x, n.cy]
  const toTool = (n) => {
    const a = R(N.agent)
    const b = L(n)
    return new Poly(bez(a, [a[0] + 80, a[1]], [b[0] - 80, b[1]], b))
  }
  const E = {
    e1: { path: new Poly([R(N.user), L(N.api)]), t: 0.42 },
    e2: { path: new Poly([R(N.api), L(N.agent)]), t: 0.72 },
    ev: { path: toTool(N.vec), t: 1.05 },
    ep: { path: new Poly([R(N.agent), L(N.pg)]), t: 1.1 },
    el: { path: toTool(N.llm), t: 1.15 },
  }
  for (const e of Object.values(E)) e.rev = e.path.reversed()

  const A = LIME
  const G = LIME // the grounded answer on its way back
  // [edge, start, end, colour, reverse]
  const P = [
    ['e1', 2.0, 2.3, A],
    ['e2', 2.36, 2.66, A],
    ['ev', 2.76, 3.1, A], ['ep', 2.76, 3.1, A],
    ['ev', 3.2, 3.54, A, true], ['ep', 3.2, 3.54, A, true],
    ['el', 3.66, 4.0, A], ['el', 4.1, 4.44, A, true],
    ['e2', 4.6, 4.9, G, true], ['e1', 4.96, 5.26, G, true],
  ]
  const act = {
    user: (t) => env(t, 1.85, 1.95, 2.0, 2.25),
    api: (t) => Math.max(env(t, 2.22, 2.3, 2.36, 2.6), env(t, 4.82, 4.9, 4.96, 5.2)),
    agent: (t) => env(t, 2.58, 2.68, 4.6, 4.85),
    vec: (t) => env(t, 3.0, 3.1, 3.2, 3.42),
    pg: (t) => env(t, 3.0, 3.1, 3.2, 3.42),
    llm: (t) => env(t, 3.9, 4.0, 4.1, 4.32),
  }
  const answered = (t) => env(t, 5.18, 5.4, RET0, RET1)

  function icon(ctx, kind, x, y, color) {
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.6
    if (kind === 'db') {
      const rx = 10
      const ry = 4
      ctx.beginPath()
      ctx.ellipse(x, y - 8, rx, ry, 0, 0, TAU)
      ctx.moveTo(x - rx, y - 8)
      ctx.lineTo(x - rx, y + 8)
      ctx.ellipse(x, y + 8, rx, ry, 0, Math.PI, 0, true)
      ctx.lineTo(x + rx, y - 8)
      ctx.moveTo(x - rx, y)
      ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0, true)
      ctx.stroke()
    } else {
      ctx.beginPath()
      const s = 11
      ctx.moveTo(x, y - s)
      ctx.quadraticCurveTo(x + 1.5, y - 1.5, x + s, y)
      ctx.quadraticCurveTo(x + 1.5, y + 1.5, x, y + s)
      ctx.quadraticCurveTo(x - 1.5, y + 1.5, x - s, y)
      ctx.quadraticCurveTo(x - 1.5, y - 1.5, x, y - s)
      ctx.closePath()
      ctx.stroke()
    }
    ctx.restore()
  }

  // pal: { title, sub, icon } colours (cobalt inside panels, cream for the ghost plan)
  function labels(ctx, n, dy, pal) {
    if (n.icon) {
      icon(ctx, n.icon, n.x + 34, n.cy + dy, pal.icon)
      text(ctx, n.title, n.x + 62, n.cy + dy + 1, { size: 24, weight: 500, color: pal.title })
    } else if (n.sub) {
      text(ctx, n.title, n.cx, n.cy - 15 + dy, { size: 26, weight: 600, align: 'center', color: pal.title })
      text(ctx, n.sub, n.cx, n.cy + 19 + dy, { size: 20, family: MONO, color: pal.sub, align: 'center' })
    } else {
      text(ctx, n.title, n.cx, n.cy + 1 + dy, { size: 26, weight: 600, align: 'center', color: pal.title })
    }
  }
  const GHOST = { title: art(0.5), sub: art(0.36), icon: art(0.4) }

  function render(i, ctx) {
    const t = i / FPS
    backdrop(ctx, BD)
    const back = seg(t, RET0, RET1) // 0 -> 1 while everything eases back to the ghost plan

    // edges: ghost dashes, solid line drawn on, sky overlay while a packet travels
    for (const [k, e] of Object.entries(E)) {
      strokePath(ctx, e.path, 0, e.path.len, art(0.16), 1.2, [4, 7])
      const p = seg(t, e.t, e.t + 0.3, snap)
      const a = 1 - back
      if (p > 0 && a > 0) strokePath(ctx, e.path, 0, e.path.len * p, art(0.32 * a), 1.5)
      let hot = 0
      for (const [ek, t0, t1] of P) {
        if (ek !== k) continue
        hot = Math.max(hot, env(t, t0 - 0.04, t0 + 0.08, t1, t1 + 0.28))
      }
      if (hot > 0.001) strokePath(ctx, e.path, 0, e.path.len, mix(art(0.32), LIME, hot), 2)
    }

    // nodes
    for (const [k, n] of Object.entries(N)) {
      // ghost: dashed cream hairline + faint labels (the opaque solid box wipes over it)
      ctx.save()
      rr(ctx, n.x + 0.5, n.y + 0.5, n.w - 1, n.h - 1, 12)
      ctx.setLineDash([6, 6])
      ctx.strokeStyle = art(0.2)
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])
      labels(ctx, n, 0, GHOST)
      ctx.restore()

      // solid: an opaque cream box wipes in left to right (and back out on the return): no translucency,
      // so the ghost label never shows through or doubles up
      const wipe = seg(t, n.t, n.t + 0.35, snap) * (1 - back)
      if (wipe <= 0.001) continue
      const h = act[k](t)
      const g = k === 'user' ? answered(t) : 0
      ctx.save()
      ctx.beginPath()
      ctx.rect(n.x - 3, n.y - 3, (n.w + 6) * wipe, n.h + 14)
      ctx.clip()
      panel(ctx, n.x, n.y, n.w, n.h, { r: 12, fill: C.panel, lift: true, glow: Math.max(h, g) })
      labels(ctx, n, 0, { title: C.t90, sub: C.t60, icon: mix(T3, LIME, h) })
      ctx.restore()
      if (k === 'user') doneBadge(ctx, n.x + n.w - 2, n.y + 2, 11, seg(t, 5.2, 5.6), 1 - seg(t, RET0, RET0 + 0.2)) // gone before the wipe-out reaches it
    }

    // ports at edge ends (over the box borders)
    for (const e of Object.values(E)) {
      const p = seg(t, e.t, e.t + 0.3) * (1 - back)
      for (const [x, y] of [e.path.pts[0], e.path.pts[e.path.pts.length - 1]]) {
        ctx.beginPath()
        ctx.arc(x, y, 3.5, 0, TAU)
        ctx.fillStyle = PANEL
        ctx.fill()
        ctx.strokeStyle = white(0.22 + 0.28 * p)
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
    }

    // packets
    for (const [ek, t0, t1, col, rev] of P) {
      const u = (t - t0) / (t1 - t0)
      if (u <= 0 || u >= 1.25) continue
      const path = rev ? E[ek].rev : E[ek].path
      const s = easeInOut(clamp(u)) * path.len
      const alpha = clamp(u / 0.12) * (1 - clamp((u - 0.88) / 0.3))
      packet(ctx, path, s, { color: col, alpha, tail: 46, r: 6 })
    }
  }

  return { render }
}
