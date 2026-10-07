// Shared Canvas 2D kit for the product clips. Runs inside the render page (see ../page.html).
//
// Every clip is a pure function of the frame index: t = frame / FPS seconds, no Math.random, no clocks.
// Story clips build up, then ease every element back to its opening state before t = DUR, so frame
// FRAMES (t = 8 s) renders the same pixels as frame 0.
//
// Look: a dark "engineering console". Flat near-black backdrop with a faint static dot grid, flat
// panels with 1px hairline borders, monochrome greys, Inter for UI and JetBrains Mono for code and
// labels, and ONE accent (lime) for active / selected / success states. No gradients, glow or grain.

export const W = 1600
export const H = 900
export const FPS = 24
export const FRAMES = 192
export const DUR = FRAMES / FPS // 8 s
export const TAU = Math.PI * 2

// ---------------------------------------------------------------- palette
export const BG = '#0b0c0e'
export const PANEL = '#131416'
export const PANEL2 = '#1a1b1e'
export const T1 = '#f4f5f6' // primary text
export const T2 = '#9a9fa8' // secondary text
export const T3 = '#646a73' // tertiary text
export const CHROME = '#3a3d42' // window-chrome dots
export const LIME = '#c8ff4d' // the one accent
export const LIME_INK = '#0b0d02' // text / checks on lime chips
export const C = {
  bg: BG,
  panel: PANEL,
  panel2: PANEL2,
  solid: PANEL, // opaque fill for small markers (ports, commit rings)
  border: 'rgba(255,255,255,0.09)',
  t90: T1,
  t60: T2,
  t40: T3,
  accent: LIME,
}
export const lime = (a) => `rgba(200,255,77,${+a.toFixed(4)})`
export const UI = 'Inter, "Segoe UI", system-ui, sans-serif'
export const MONO = '"JetBrains Mono", Consolas, "Courier New", monospace'

// ---------------------------------------------------------------- math / easing
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x)
export const lerp = (a, b, t) => a + (b - a) * t
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t) => 1 - Math.pow(1 - t, 3)
export const easeIn = (t) => t * t * t
export const sine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t)
/** Quick, settled entrance (quartic ease-out): most of the move happens early, no overshoot. */
export const snap = (t) => 1 - Math.pow(1 - t, 4)
/** Eased 0..1 progress of t through [a, b]. */
export const seg = (t, a, b, fn = easeInOut) => fn(clamp((t - a) / (b - a)))
/** Rises through [a, b], falls through [c, d]. */
export const env = (t, a, b, c, d, fn = easeInOut) => seg(t, a, b, fn) * (1 - seg(t, c, d, fn))

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function gauss(rnd) {
  const u = Math.max(rnd(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rnd())
}

// ---------------------------------------------------------------- colour
const cache = new Map()
function parse(c) {
  let v = cache.get(c)
  if (v) return v
  if (c[0] === '#') {
    const n = parseInt(c.slice(1), 16)
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]
  } else {
    const m = c.match(/[\d.]+/g).map(Number)
    v = [m[0], m[1], m[2], m[3] ?? 1]
  }
  cache.set(c, v)
  return v
}
export const rgba = (c, a) => {
  const [r, g, b, a0] = parse(c)
  return `rgba(${r},${g},${b},${+(a0 * a).toFixed(4)})`
}
export const white = (a) => `rgba(255,255,255,${+a.toFixed(4)})`
export function mix(c1, c2, t) {
  const a = parse(c1)
  const b = parse(c2)
  t = clamp(t)
  return `rgba(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))},${+lerp(a[3], b[3], t).toFixed(4)})`
}

// ---------------------------------------------------------------- backdrop
// One backdrop for every clip: flat #0b0c0e with a faint static dot grid (1.5 px dots every 24 px at
// white 6%). Built once and blitted each frame. `art(a)` is the colour for hairlines / labels drawn
// directly on the backdrop.
const DARK = { base: BG, art: white }
export const BACKDROPS = {
  'system-map': DARK,
  blueprint: DARK,
  'rag-retrieval': DARK,
  'drawing-takeoff': DARK,
  'terminal-ci': DARK,
  'grounded-chat': DARK,
  'commit-graph': DARK,
}
let bgCanvas = null
export function backdrop(ctx) {
  if (!bgCanvas) {
    bgCanvas = document.createElement('canvas')
    bgCanvas.width = W
    bgCanvas.height = H
    const g = bgCanvas.getContext('2d')
    g.fillStyle = BG
    g.fillRect(0, 0, W, H)
    dotGrid(g, 24, white(0.06), 0.75)
  }
  ctx.drawImage(bgCanvas, 0, 0)
}

export function dotGrid(ctx, step, color, r = 1, x0 = 0, y0 = 0, x1 = W, y1 = H) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let y = y0 + step / 2; y < y1; y += step) {
    for (let x = x0 + step / 2; x < x1; x += step) {
      ctx.moveTo(x + r, y)
      ctx.arc(x, y, r, 0, TAU)
    }
  }
  ctx.fill()
}

// ---------------------------------------------------------------- shapes
export function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}
export const rrPerimeter = (w, h, r) => 2 * (w + h) - 8 * r + TAU * r

/** A UI panel: flat #131416 rounded rect with a 1px hairline border. `lift` adds a 1px darker outline
 *  just outside (no shadow); `glow` (0..1) is the selected state: the border turns lime. */
export function panel(ctx, x, y, w, h, o = {}) {
  const { r = 12, fill = C.panel, stroke = C.border, lw = 1, alpha = 1, glow = 0, glowColor = LIME, lift = false } = o
  if (alpha <= 0.001) return
  ctx.save()
  ctx.globalAlpha *= alpha
  if (lift) {
    rr(ctx, x - 0.5, y - 0.5, w + 1, h + 1, r + 0.5)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'
    ctx.stroke()
  }
  if (fill) {
    rr(ctx, x, y, w, h, r)
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    const sel = clamp(glow)
    rr(ctx, x + lw / 2, y + lw / 2, w - lw, h - lw, Math.max(0, r - lw / 2))
    ctx.lineWidth = lw
    ctx.strokeStyle = sel > 0.001 ? mix(stroke, glowColor, sel) : stroke
    ctx.stroke()
  }
  ctx.restore()
}

/** Strokes a rounded rect outline drawn on to fraction p (starts top-left, runs clockwise). */
export function rrDraw(ctx, x, y, w, h, r, p, stroke, lw = 1.5) {
  if (p <= 0.001) return
  const L = rrPerimeter(w, h, r)
  ctx.save()
  rr(ctx, x, y, w, h, r)
  ctx.setLineDash(p >= 0.999 ? [] : [L * p, L])
  ctx.lineWidth = lw
  ctx.strokeStyle = stroke
  ctx.stroke()
  ctx.restore()
}

/** No glow in this look (kept as a no-op so call sites stay simple). */
export function glow() {}

export function dot(ctx, x, y, r, fill) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fillStyle = fill
  ctx.fill()
}

// ---------------------------------------------------------------- text
export function font(size, weight = 400, family = UI) {
  return `${weight} ${size}px ${family}`
}
export function text(ctx, s, x, y, o = {}) {
  const { size = 24, weight = 400, family = UI, color = C.t90, align = 'left', baseline = 'middle', alpha = 1, spacing = 0 } = o
  if (alpha <= 0.001 || !s) return 0
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.font = font(size, weight, family)
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  if (spacing) ctx.letterSpacing = `${spacing}px`
  ctx.fillText(s, x, y)
  const w = ctx.measureText(s).width
  ctx.restore()
  return w
}
/** Heading inside a panel: Inter 500. */
export function heading(ctx, s, x, y, o = {}) {
  return text(ctx, s, x, y, { size: 24, color: T1, ...o, weight: 500, family: UI })
}
/** Small monospace label (window titles, section labels). */
export function label(ctx, s, x, y, o = {}) {
  return text(ctx, s, x, y, { size: 20, color: T3, ...o, family: MONO })
}
export function measure(ctx, s, size, weight = 400, family = UI, spacing = 0) {
  ctx.save()
  ctx.font = font(size, weight, family)
  if (spacing) ctx.letterSpacing = `${spacing}px`
  const w = ctx.measureText(s).width
  ctx.restore()
  return w
}
/** Greedy word wrap; returns [{ words: [{ s, x }], y }] relative to (0, 0) with lineHeight steps. */
export function wrap(ctx, s, maxW, size, weight = 400, family = UI, lineHeight = size * 1.45) {
  ctx.save()
  ctx.font = font(size, weight, family)
  const space = ctx.measureText(' ').width
  const lines = []
  let cur = []
  let x = 0
  for (const word of s.split(' ')) {
    const w = ctx.measureText(word).width
    if (cur.length && x + w > maxW) {
      lines.push(cur)
      cur = []
      x = 0
    }
    cur.push({ s: word, x, w })
    x += w + space
  }
  if (cur.length) lines.push(cur)
  ctx.restore()
  return lines.map((words, i) => ({ words, y: i * lineHeight }))
}

// ---------------------------------------------------------------- code tokens
const PY_KW = new Set(['from', 'import', 'class', 'async', 'def', 'return', 'await', 'for', 'in', 'if', 'else', 'with', 'as'])
const PY_TYPE = new Set(['str', 'int', 'list', 'dict', 'bool', 'None', 'True', 'False'])
/** Splits a line of Python-ish code into coloured tokens [{ s, color }]: keywords lime 85%, strings
 *  #9a9fa8, everything else #f4f5f6 / #9a9fa8. */
export function pyTokens(line) {
  const out = []
  const re = /(\s+)|("[^"]*"|'[^']*')|(@[\w.]+)|([A-Za-z_]\w*)|(.)/g
  let m
  while ((m = re.exec(line))) {
    const [s, ws, str, deco, word] = m
    let color
    if (ws) color = 'rgba(0,0,0,0)'
    else if (str) color = T2
    else if (deco) color = lime(0.85)
    else if (word) {
      const next = line[re.lastIndex]
      if (PY_KW.has(word)) color = lime(0.85)
      else if (PY_TYPE.has(word)) color = T2
      else if (next === '(' || /^[A-Z]/.test(word)) color = T1
      else color = T1
    } else color = T2
    out.push({ s, color })
  }
  return out
}
/** Draws tokens in a monospace font, revealing `chars` characters (fractional: the last one fades in). */
export function codeLine(ctx, tokens, x, y, { size = 20, weight = 400, chars = Infinity, alpha = 1 } = {}) {
  if (alpha <= 0.001 || chars <= 0) return
  ctx.save()
  const base = ctx.globalAlpha
  ctx.font = font(size, weight, MONO)
  ctx.textBaseline = 'middle'
  const cw = ctx.measureText('M').width
  let col = 0
  for (const tk of tokens) {
    for (let i = 0; i < tk.s.length; i++, col++) {
      const vis = clamp(chars - col)
      if (vis <= 0) {
        ctx.restore()
        return
      }
      const ch = tk.s[i]
      if (ch !== ' ') {
        ctx.globalAlpha = base * alpha * vis
        ctx.fillStyle = tk.color
        ctx.fillText(ch, x + col * cw, y)
      }
    }
  }
  ctx.restore()
}
export function monoWidth(ctx, size, weight = 400) {
  return measure(ctx, 'M', size, weight, MONO)
}

// ---------------------------------------------------------------- polylines (arc-length paths)
export class Poly {
  constructor(pts) {
    this.pts = pts
    this.cum = new Float64Array(pts.length)
    for (let i = 1; i < pts.length; i++) this.cum[i] = this.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    this.len = this.cum[pts.length - 1]
  }
  idx(s) {
    let lo = 0
    let hi = this.pts.length - 1
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1
      if (this.cum[m] <= s) lo = m
      else hi = m
    }
    return lo
  }
  at(s) {
    s = clamp(s, 0, this.len)
    const i = this.idx(s)
    const j = Math.min(i + 1, this.pts.length - 1)
    const d = this.cum[j] - this.cum[i] || 1
    const u = (s - this.cum[i]) / d
    return [lerp(this.pts[i][0], this.pts[j][0], u), lerp(this.pts[i][1], this.pts[j][1], u)]
  }
  /** Adds the sub-path [s0, s1] to the current path. */
  trace(ctx, s0, s1) {
    s0 = clamp(s0, 0, this.len)
    s1 = clamp(s1, 0, this.len)
    if (s1 - s0 < 0.01) return false
    const a = this.at(s0)
    ctx.moveTo(a[0], a[1])
    let i = this.idx(s0) + 1
    while (i < this.pts.length && this.cum[i] < s1) {
      ctx.lineTo(this.pts[i][0], this.pts[i][1])
      i++
    }
    const b = this.at(s1)
    ctx.lineTo(b[0], b[1])
    return true
  }
  reversed() {
    return new Poly([...this.pts].reverse())
  }
}
export function bez(p0, p1, p2, p3, n = 64) {
  const out = []
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const a = (1 - u) ** 3
    const b = 3 * (1 - u) ** 2 * u
    const c = 3 * (1 - u) * u * u
    const d = u ** 3
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]])
  }
  return out
}
/** Catmull-Rom through points, sampled. */
export function spline(pts, perSeg = 24) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    for (let k = 0; k < perSeg; k++) {
      const u = k / perSeg
      const u2 = u * u
      const u3 = u2 * u
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

export function strokePath(ctx, path, s0, s1, color, lw = 1.5, dash = null) {
  ctx.save()
  ctx.beginPath()
  if (path.trace(ctx, s0, s1)) {
    if (dash) ctx.setLineDash(dash)
    ctx.lineWidth = lw
    ctx.strokeStyle = color
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
  ctx.restore()
}

/** A packet at arc length s on path: flat lime dot with a dark ring and a short flat tail. */
export function packet(ctx, path, s, { color = LIME, tail = 48, r = 5, alpha = 1, ring = BG } = {}) {
  if (alpha <= 0.001) return
  ctx.save()
  ctx.globalAlpha *= alpha
  strokePath(ctx, path, s - tail, s, color, 2.5)
  const [x, y] = path.at(s)
  dot(ctx, x, y, r + 2, ring)
  dot(ctx, x, y, r, color)
  ctx.restore()
}

/** Check mark centred on (cx, cy), size s, drawn on to fraction p. */
export function checkMark(ctx, cx, cy, s, p, color, lw = 2.5) {
  if (p <= 0.001) return
  const path = new Poly([
    [cx - 0.3 * s, cy + 0.02 * s],
    [cx - 0.08 * s, cy + 0.24 * s],
    [cx + 0.32 * s, cy - 0.2 * s],
  ])
  ctx.save()
  ctx.beginPath()
  path.trace(ctx, 0, path.len * clamp(p))
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  ctx.stroke()
  ctx.restore()
}

/** Success badge: a lime circle that scales in, then a dark check draws on. */
export function doneBadge(ctx, cx, cy, r, p, alpha = 1) {
  if (p <= 0.001 || alpha <= 0.001) return
  const s = easeOut(clamp(p / 0.6))
  ctx.save()
  ctx.globalAlpha *= alpha * clamp(p / 0.3)
  dot(ctx, cx, cy, r * (0.7 + 0.3 * s), LIME)
  checkMark(ctx, cx, cy, r * 1.25, clamp((p - 0.35) / 0.6), LIME_INK, Math.max(2, r * 0.2))
  ctx.restore()
}

/** Flat diagonal hatching inside the path that `clipPath(ctx)` builds, over bbox. */
export function hatch(ctx, clipPath, bx, by, bw, bh, color, step = 9, lw = 1) {
  ctx.save()
  clipPath(ctx)
  ctx.clip()
  ctx.beginPath()
  for (let d = -bh; d < bw + bh; d += step) {
    ctx.moveTo(bx + d, by + bh)
    ctx.lineTo(bx + d + bh, by)
  }
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.stroke()
  ctx.restore()
}
