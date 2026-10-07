// drawing-takeoff: AI reading a technical drawing. A synthetic, generic floor plan in thin grey lines on a
// dark sheet; a lime scan sweeps across and the walls it has passed turn lime, rooms get lime hatching and labels,
// doors and windows get detection boxes, and the side panel counts what has been detected so far.
// Every count is derived from the geometry below, so the panel always matches the drawing.
import {
  C, UI, MONO, FPS, W, H, TAU, seg, env, clamp, lerp, easeOut, snap, rr, panel, text, measure,
  rgba, white, lime, mix, backdrop, BACKDROPS, dot, dotGrid, heading, checkMark, hatch, LIME, LIME_INK, T3,
} from '../lib/kit.js'

const RET0 = 6.6
const RET1 = 7.3
const OX = 295
const OY = 180
const PW = 720
const PH = 600
const SCAN0 = 0.6
const SCAN1 = 2.6
const SHEET = { x: OX - 64, y: OY - 100, w: PW + 104, h: PH + 140 } // the drawing panel

// Walls: centreline a -> b (plan units = px), thickness, openings [from, to, kind] along the wall.
const WALLS = [
  { a: [0, 0], b: [720, 0], t: 12, open: [[90, 190, 'w'], [470, 590, 'w']] },
  { a: [720, 0], b: [720, 600], t: 12, open: [[110, 210, 'w'], [420, 520, 'w']] },
  { a: [0, 600], b: [720, 600], t: 12, open: [[80, 150, 'd']] },
  { a: [0, 0], b: [0, 600], t: 12, open: [[80, 180, 'w'], [380, 480, 'w']] },
  { a: [330, 0], b: [330, 600], t: 8, open: [[110, 175, 'd'], [440, 505, 'd']] },
  { a: [0, 270], b: [330, 270], t: 8, open: [] },
  { a: [330, 330], b: [720, 330], t: 8, open: [[190, 255, 'd']] },
]
// Door swing: hinge at the opening start (h = 0) or end (h = 1); side = +1 / -1 along the wall normal.
const DOOR_SWING = { '2:0': { h: 0, side: -1 }, '4:0': { h: 0, side: -1 }, '4:1': { h: 1, side: 1 }, '6:0': { h: 1, side: 1 } }
const ROOMS = [
  [6, 6, 324, 264],
  [334, 6, 714, 326],
  [6, 274, 324, 594],
  [334, 334, 714, 594],
]

export function create(ctx) {
  // ---- geometry: solid wall rects (with openings cut out) and symbols
  const rects = [] // { x, y, w, h, wall }
  const items = [] // doors + windows
  WALLS.forEach((wl, wi) => {
    const [ax, ay] = wl.a
    const [bx, by] = wl.b
    const L = Math.hypot(bx - ax, by - ay)
    const u = [(bx - ax) / L, (by - ay) / L]
    const n = [-u[1], u[0]]
    const cuts = wl.open.map(([f, to]) => [f, to]).sort((p, q) => p[0] - q[0])
    let s = -wl.t / 2
    const parts = []
    for (const [f, to] of cuts) {
      parts.push([s, f])
      s = to
    }
    parts.push([s, L + wl.t / 2])
    for (const [s0, s1] of parts) {
      const p0 = [ax + u[0] * s0 - n[0] * (wl.t / 2), ay + u[1] * s0 - n[1] * (wl.t / 2)]
      const p1 = [ax + u[0] * s1 + n[0] * (wl.t / 2), ay + u[1] * s1 + n[1] * (wl.t / 2)]
      rects.push({ x: OX + Math.min(p0[0], p1[0]), y: OY + Math.min(p0[1], p1[1]), w: Math.abs(p1[0] - p0[0]), h: Math.abs(p1[1] - p0[1]), wall: wi })
    }
    wl.open.forEach(([f, to, kind], oi) => {
      const P = (s, off) => [OX + ax + u[0] * s + n[0] * off, OY + ay + u[1] * s + n[1] * off]
      if (kind === 'w') {
        const pts = [P(f, -wl.t / 2), P(to, wl.t / 2)]
        items.push({ kind: 'window', wall: wl, u, n, f, to, P, box: bbox(pts, 9) })
      } else {
        const sw = DOOR_SWING[`${wi}:${oi}`]
        const wdt = to - f
        const hs = sw.h ? to : f
        const os = sw.h ? f : to
        const off = (sw.side * wl.t) / 2
        const hinge = P(hs, off)
        const jamb = P(os, off)
        const leaf = [hinge[0] + n[0] * sw.side * wdt, hinge[1] + n[1] * sw.side * wdt]
        const pts = [P(f, -off), P(to, -off), hinge, jamb, leaf, [leaf[0] + jamb[0] - hinge[0], leaf[1] + jamb[1] - hinge[1]]]
        items.push({ kind: 'door', hinge, jamb, leaf, r: wdt, box: bbox(pts, 8) })
      }
    })
  })
  // wall extents (for "fully scanned")
  const wallMaxX = WALLS.map((_, wi) => Math.max(...rects.filter((r) => r.wall === wi).map((r) => r.x + r.w)))
  // detection order: reading order
  items.sort((p, q) => p.box.y + p.box.x * 0.6 - (q.box.y + q.box.x * 0.6))
  items.forEach((it, k) => (it.t = 3.5 + k * 0.11))
  const rooms = ROOMS.map(([x0, y0, x1, y1], k) => ({ x: OX + x0, y: OY + y0, w: x1 - x0, h: y1 - y0, label: `Room ${k + 1}`, t: 2.75 + k * 0.18 }))

  const totals = {
    walls: WALLS.length,
    rooms: rooms.length,
    doors: items.filter((it) => it.kind === 'door').length,
    windows: items.filter((it) => it.kind === 'window').length,
  }

  function bbox(pts, pad) {
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const x0 = Math.min(...xs) - pad
    const y0 = Math.min(...ys) - pad
    return { x: x0, y: y0, w: Math.max(...xs) + pad - x0, h: Math.max(...ys) + pad - y0 }
  }

  const sweepX = (t) => lerp(OX - 30, OX + PW + 30, seg(t, SCAN0, SCAN1))

  function wallsPath(ctx, inset = 0) {
    ctx.beginPath()
    for (const r of rects) ctx.rect(r.x + inset, r.y + inset, r.w - 2 * inset, r.h - 2 * inset)
  }

  // wall outlines on their own transparent layer: stroke every rect, cut the insides out so only the
  // union outline remains, then a faint poche fill. Static, so it is built once.
  const wallLayer = document.createElement('canvas')
  wallLayer.width = W
  wallLayer.height = H
  {
    const g = wallLayer.getContext('2d')
    wallsPath(g)
    g.lineWidth = 1.3
    g.strokeStyle = white(0.55)
    g.stroke()
    g.globalCompositeOperation = 'destination-out'
    wallsPath(g, 0.9)
    g.fillStyle = '#000'
    g.fill()
    g.globalCompositeOperation = 'source-over'
    g.fillStyle = white(0.06)
    g.fill()
  }

  function drawPlan(ctx) {
    ctx.drawImage(wallLayer, 0, 0)
    // symbols
    ctx.save()
    ctx.strokeStyle = white(0.45)
    ctx.lineWidth = 1
    for (const it of items) {
      ctx.beginPath()
      if (it.kind === 'window') {
        const t = it.wall.t / 2
        for (const off of [-t, 0, t]) {
          const p0 = it.P(it.f, off)
          const p1 = it.P(it.to, off)
          ctx.moveTo(p0[0], p0[1])
          ctx.lineTo(p1[0], p1[1])
        }
      } else {
        const [hx, hy] = it.hinge
        ctx.moveTo(hx, hy)
        ctx.lineTo(it.leaf[0], it.leaf[1])
        const a0 = Math.atan2(it.leaf[1] - hy, it.leaf[0] - hx)
        const a1 = Math.atan2(it.jamb[1] - hy, it.jamb[0] - hx)
        let d = a1 - a0
        while (d > Math.PI) d -= TAU
        while (d < -Math.PI) d += TAU
        ctx.moveTo(it.leaf[0], it.leaf[1])
        ctx.arc(hx, hy, it.r, a0, a1, d < 0)
      }
      ctx.stroke()
    }
    ctx.restore()
    // dimension lines (no values)
    ctx.save()
    ctx.strokeStyle = white(0.18)
    ctx.lineWidth = 1
    ctx.beginPath()
    const dy = OY - 34
    ctx.moveTo(OX - 6, dy + 0.5)
    ctx.lineTo(OX + PW + 6, dy + 0.5)
    for (const x of [OX - 6, OX + 330, OX + PW + 6]) {
      ctx.moveTo(x + 0.5, dy - 6)
      ctx.lineTo(x + 0.5, dy + 6)
    }
    const dx = OX - 36
    ctx.moveTo(dx + 0.5, OY - 6)
    ctx.lineTo(dx + 0.5, OY + PH + 6)
    for (const y of [OY - 6, OY + 270, OY + PH + 6]) {
      ctx.moveTo(dx - 6, y + 0.5)
      ctx.lineTo(dx + 6, y + 0.5)
    }
    ctx.stroke()
    ctx.restore()
  }

  // count with a soft odometer roll between values (clipped to its slot)
  function count(ctx, x, y, nNow, nPrev, f, alpha) {
    const o = { size: 26, weight: 500, family: MONO, align: 'right' }
    if (f < 1 && nPrev !== nNow) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(x - 70, y - 17, 74, 34)
      ctx.clip()
      text(ctx, String(nPrev), x, y - 24 * f, { ...o, color: nPrev > 0 ? C.t90 : C.t40, alpha: alpha * (1 - f) })
      text(ctx, String(nNow), x, y + 24 * (1 - f), { ...o, color: C.t90, alpha: alpha * f })
      ctx.restore()
    } else text(ctx, String(nNow), x, y, { ...o, color: nNow > 0 ? C.t90 : C.t40, alpha })
  }
  // events -> (value now, previous value, fraction since last change)
  function counter(times, t) {
    let n = 0
    let last = -1
    for (const tt of times) if (t >= tt) {
      n++
      last = tt
    }
    const f = last < 0 ? 1 : clamp((t - last) / 0.3)
    return [n, Math.max(0, n - 1), easeOut(f)]
  }
  // time at which the sweep passes x
  const sweepTimes = wallMaxX.map((mx) => {
    let lo = SCAN0
    let hi = SCAN1
    for (let k = 0; k < 40; k++) {
      const m = (lo + hi) / 2
      if (sweepX(m) >= mx) hi = m
      else lo = m
    }
    return hi
  })
  const evTimes = {
    walls: sweepTimes,
    rooms: rooms.map((r) => r.t + 0.12),
    doors: items.filter((it) => it.kind === 'door').map((it) => it.t + 0.1),
    windows: items.filter((it) => it.kind === 'window').map((it) => it.t + 0.1),
  }

  const side = { x: SHEET.x + SHEET.w + 24, y: OY + 82, w: 290, h: 436 }
  const rowsDef = [
    ['walls', 'Walls'],
    ['rooms', 'Rooms'],
    ['doors', 'Doors'],
    ['windows', 'Windows'],
  ]

  function rowIcon(ctx, key, x, y, on) {
    const col = mix(T3, C.t90, on) // white once detected: lime stays for the drawing itself
    ctx.save()
    ctx.strokeStyle = col
    ctx.fillStyle = col
    ctx.lineWidth = 1.5
    if (key === 'walls') {
      ctx.fillStyle = mix(white(0.3), C.t90, on)
      ctx.fillRect(x - 10, y - 3, 20, 6)
    } else if (key === 'rooms') {
      ctx.fillStyle = mix(white(0.05), white(0.18), on)
      rr(ctx, x - 9, y - 9, 18, 18, 3)
      ctx.fill()
      ctx.stroke()
    } else if (key === 'doors') {
      ctx.beginPath()
      ctx.moveTo(x - 8, y + 8)
      ctx.lineTo(x - 8, y - 8)
      ctx.arc(x - 8, y + 8, 16, -Math.PI / 2, 0)
      ctx.stroke()
    } else {
      ctx.beginPath()
      for (const dy of [-5, 0, 5]) {
        ctx.moveTo(x - 10, y + dy)
        ctx.lineTo(x + 10, y + dy)
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  function render(i, ctx) {
    const t = i / FPS
    backdrop(ctx, BACKDROPS['drawing-takeoff'])
    const live = 1 - seg(t, RET0, RET1)
    panel(ctx, SHEET.x, SHEET.y, SHEET.w, SHEET.h, { r: 14, fill: C.panel, lift: true })
    ctx.save()
    rr(ctx, SHEET.x, SHEET.y, SHEET.w, SHEET.h, 14)
    ctx.clip()
    dotGrid(ctx, 24, white(0.05), 0.75, SHEET.x, SHEET.y, SHEET.x + SHEET.w, SHEET.y + SHEET.h)
    heading(ctx, 'Floor plan', OX - 36, OY - 64)

    // room tints (under the walls)
    for (const r of rooms) {
      const a = seg(t, r.t, r.t + 0.35, snap) * live
      if (a <= 0.001) continue
      hatch(ctx, (c) => { c.beginPath(); c.rect(r.x, r.y, r.w, r.h) }, r.x, r.y, r.w, r.h, lime(0.22 * a), 11, 1)
    }

    drawPlan(ctx)

    // detected walls: union of wall rects left of the sweep, one flat fill (single path: no double alpha)
    const sx = sweepX(t)
    if (live > 0.001 && t > SCAN0) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, sx, 900)
      ctx.clip()
      wallsPath(ctx)
      ctx.fillStyle = lime(0.75 * live) // flat lime on the walls the scan has passed
      ctx.fill()
      ctx.restore()
    }
    // scan line + trailing band
    const sa = env(t, SCAN0 - 0.15, SCAN0 + 0.15, SCAN1 - 0.25, SCAN1 + 0.05)
    if (sa > 0.001) {
      ctx.save()
      ctx.globalAlpha = sa
      ctx.fillStyle = LIME
      ctx.fillRect(sx - 1, OY - 20, 2, PH + 40)
      ctx.restore()
    }
    ctx.restore() // drawing panel clip

    // room labels
    for (const r of rooms) {
      const a = seg(t, r.t + 0.1, r.t + 0.4, snap) * live
      const dy = (1 - snap(clamp((t - r.t - 0.1) / 0.35))) * 8
      text(ctx, r.label, r.x + r.w / 2, r.y + r.h / 2 + dy, { size: 24, weight: 500, color: C.t90, align: 'center', alpha: a })
    }

    // detection boxes
    for (const it of items) {
      const p = clamp((t - it.t) / 0.32)
      const a = snap(p) * live
      if (a <= 0.001) continue
      const s = lerp(1.22, 1, snap(p))
      const { x, y, w, h } = it.box
      const cx = x + w / 2
      const cy = y + h / 2
      panel(ctx, cx - (w * s) / 2, cy - (h * s) / 2, w * s, h * s, { r: 6, fill: null, stroke: LIME, lw: 1.5, alpha: a })
    }

    // side panel
    panel(ctx, side.x, side.y, side.w, side.h, { r: 14, fill: C.panel, lift: true })
    heading(ctx, 'Detected', side.x + 28, side.y + 44)
    ctx.fillStyle = C.border
    ctx.fillRect(side.x + 1, side.y + 82, side.w - 2, 1)
    rowsDef.forEach(([key, label], k) => {
      const y = side.y + 128 + k * 66
      const [n, prev, f] = counter(evTimes[key], t)
      const on = clamp(n) * live
      rowIcon(ctx, key, side.x + 40, y, on)
      text(ctx, label, side.x + 70, y + 1, { size: 24, weight: 500, color: C.t90 })
      const xr = side.x + side.w - 28
      const back = seg(t, RET0, RET1)
      if (back > 0) {
        text(ctx, String(totals[key]), xr, y + 1, { size: 26, weight: 500, family: MONO, color: C.t90, align: 'right', alpha: 1 - back })
        text(ctx, '0', xr, y + 1, { size: 26, weight: 500, family: MONO, color: C.t40, align: 'right', alpha: back })
      } else count(ctx, xr, y + 1, n, prev, f, 1)
    })
    // status
    const sy = side.y + side.h - 46
    ctx.fillStyle = C.border
    ctx.fillRect(side.x + 1, sy - 34, side.w - 2, 1)
    const scanning = env(t, 0.45, 0.65, 4.95, 5.15)
    const done = env(t, 5.0, 5.25, RET0, RET1)
    const ready = 1 - seg(t, 0.45, 0.65) * (1 - seg(t, RET0, RET1))
    const states = [
      ['Ready', T3, Math.max(0, ready)],
      ['Scanning', LIME, scanning],
      ['Complete', 'chip', done], // lime chip with dark text
    ]
    for (const [label, col, a] of states) {
      if (a <= 0.001) continue
      ctx.save()
      ctx.globalAlpha = a
      if (col === 'chip') {
        const cw = measure(ctx, label, 22, 500) + 58
        panel(ctx, side.x + 22, sy - 17, cw, 34, { r: 17, fill: LIME, stroke: null })
        checkMark(ctx, side.x + 42, sy, 18, clamp((t - 5.05) / 0.35), LIME_INK, 2.4)
        ctx.restore()
        text(ctx, label, side.x + 58, sy + 1, { size: 22, weight: 500, color: LIME_INK, alpha: a })
        continue
      }
      dot(ctx, side.x + 36, sy, 5, col)
      ctx.restore()
      text(ctx, label, side.x + 54, sy + 1, { size: 22, weight: 500, color: C.t60, alpha: a })
    }
  }

  return { render }
}
