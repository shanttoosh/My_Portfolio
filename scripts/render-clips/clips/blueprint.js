// blueprint: the four-step approach (src/config/approach.ts: Understand, Design, Build, Improve) on the
// console dot grid. A problem note appears, three boxes and arrows ink themselves in as hairlines, the
// boxes become panels and fill with code, an eval card draws a rising lime line and a check, then
// everything eases back to the grid and the four step chips (the current step is the lime chip).
import {
  C, UI, MONO, FPS, W, H, LIME, LIME_INK, BG, T2, T3, seg, env, clamp, lerp, snap, rr, panel, text, heading,
  label, measure, Poly, spline, strokePath, rrDraw, lime, white, mix, backdrop, BACKDROPS, dot, pyTokens,
  codeLine, doneBadge,
} from '../lib/kit.js'

const RET0 = 6.6
const RET1 = 7.3
const BD = BACKDROPS.blueprint
const STEPS = ['Understand', 'Design', 'Build', 'Improve'] // approach.ts titles, in order
const WINDOWS = [
  [0.3, 1.5],
  [1.5, 2.9],
  [2.9, 4.4],
  [4.4, RET0],
]
const BOXES = [
  { title: 'Ingest', code: ['pages = load(pdf)', 'chunks = split(pages)', 'index.add(chunks)'] },
  { title: 'Retrieve', code: ['q = embed(question)', 'hits = index.search(q)', 'ctx = top_k(hits)'] },
  { title: 'Answer', code: ['draft = llm(q, ctx)', 'verify(draft, ctx)', 'return draft'] },
]
const INK = white(0.45) // hairline ink on the dark backdrop

export function create(ctx) {
  const chipH = 46
  const chips = STEPS.map((s, k) => ({ s, n: String(k + 1), w: 28 + measure(ctx, String(k + 1), 20, 500, MONO) + 12 + measure(ctx, s, 22, 500, UI) + 26 }))
  const gap = 14
  let cx = W / 2 - (chips.reduce((a, c) => a + c.w, 0) + gap * (chips.length - 1)) / 2
  for (const c of chips) {
    c.x = cx
    cx += c.w + gap
  }
  const chipY = 82
  const note = { x: 470, y: 166, w: 660, h: 116 }
  const box = { y: 344, w: 330, h: 212, xs: [245, 635, 1025] }
  const evalCard = { x: 560, y: 608, w: 480, h: 204 }
  const tokens = BOXES.map((b) => b.code.map(pyTokens))

  // eval line: normalised points rising with small dips (illustrative, no axis values)
  const ex0 = evalCard.x + 36
  const ex1 = evalCard.x + evalCard.w - 36
  const ey0 = evalCard.y + evalCard.h - 34
  const ey1 = evalCard.y + 78
  const evPts = [[0, 0.08], [0.16, 0.2], [0.32, 0.17], [0.5, 0.42], [0.66, 0.55], [0.83, 0.76], [1, 0.9]].map(([u, v]) => [lerp(ex0, ex1, u), lerp(ey0, ey1, v)])
  const evPath = new Poly(spline(evPts, 20))

  function arrow(ctx, x0, y0, x1, y1, p, color) {
    if (p <= 0.001) return
    const path = new Poly([[x0, y0], [x1, y1]])
    strokePath(ctx, path, 0, path.len * p, color, 1.8)
    const hp = clamp((p - 0.75) / 0.25)
    if (hp > 0) {
      ctx.save()
      ctx.globalAlpha *= hp
      ctx.translate(x1, y1)
      ctx.rotate(Math.atan2(y1 - y0, x1 - x0))
      ctx.beginPath()
      ctx.moveTo(-9, -5.5)
      ctx.lineTo(0, 0)
      ctx.lineTo(-9, 5.5)
      ctx.strokeStyle = color
      ctx.lineWidth = 1.8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()
    }
  }

  function render(i, ctx) {
    const t = i / FPS
    backdrop(ctx, BD)
    const live = 1 - seg(t, RET0, RET1)

    // ---- step chips (dark pills; the current step is a lime chip)
    chips.forEach((c, k) => {
      const [s0, s1] = WINDOWS[k]
      const on = k === 3 ? env(t, s0, s0 + 0.25, RET0, RET1) : env(t, s0, s0 + 0.25, s1, s1 + 0.25)
      const done = k === 3 ? 0 : seg(t, s1, s1 + 0.25) * live
      panel(ctx, c.x, chipY, c.w, chipH, { r: chipH / 2, fill: mix(C.panel, LIME, on), stroke: mix(C.border, LIME, on), lift: true })
      const nx = c.x + 28
      text(ctx, c.n, nx, chipY + chipH / 2 + 1, { size: 20, weight: 500, family: MONO, color: mix(mix(T3, T2, done), LIME_INK, on) })
      text(ctx, c.s, nx + measure(ctx, c.n, 20, 500, MONO) + 12, chipY + chipH / 2 + 1, { size: 22, weight: 500, color: mix(mix(T3, T2, done), LIME_INK, on) })
    })

    // ---- 1. Understand: problem note
    const nIn = seg(t, 0.4, 0.75, snap)
    const na = nIn * live
    if (na > 0.001) {
      const dy = (1 - nIn) * 16
      const { x, y, w, h } = note
      panel(ctx, x, y + dy, w, h, { r: 12, fill: C.panel, alpha: na, lift: true })
      ctx.save()
      ctx.globalAlpha = na
      rr(ctx, x + 22, y + dy + 26, 3, h - 52, 1.5)
      ctx.fillStyle = white(0.22)
      ctx.fill()
      label(ctx, 'PROBLEM', x + 46, y + dy + 40, { spacing: 1.5 })
      text(ctx, 'Answers are buried in long documents.', x + 46, y + dy + 80, { size: 28, weight: 500, color: C.t90 })
      ctx.restore()
    }

    // ---- 2. Design: connector, boxes and arrows ink in / 3. Build: cream panels with code
    ctx.save()
    ctx.globalAlpha = live
    arrow(ctx, W / 2, note.y + note.h + 10, W / 2, box.y - 12, seg(t, 1.5, 1.75, snap), INK)
    BOXES.forEach((b, k) => {
      const x = box.xs[k]
      const d0 = 1.6 + k * 0.3
      const p = seg(t, d0, d0 + 0.45, snap)
      const fill = seg(t, 3.0 + k * 0.3, 3.3 + k * 0.3, snap)
      if (p > 0.001) panel(ctx, x, box.y, box.w, box.h, { r: 12, fill: white(0.025), stroke: null, alpha: p * (1 - fill) })
      if (fill > 0.001) panel(ctx, x, box.y, box.w, box.h, { r: 12, fill: C.panel, stroke: null, alpha: fill, lift: true })
      rrDraw(ctx, x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, 12, p, mix(INK, C.border, fill), p >= 0.999 ? lerp(1.5, 1, fill) : 1.6)
      const ta = seg(t, d0 + 0.25, d0 + 0.5)
      text(ctx, b.title, x + 26, box.y + 40, { size: 24, weight: 600, color: C.t90, alpha: ta })
      if (ta > 0.001) {
        ctx.save()
        ctx.globalAlpha *= ta
        ctx.fillStyle = mix(white(0.2), C.border, fill)
        ctx.fillRect(x + 26, box.y + 66, (box.w - 52) * ta, 1)
        ctx.restore()
      }
      tokens[k].forEach((tk, j) => {
        const s0 = 3.05 + k * 0.3 + j * 0.15
        const chars = clamp((t - s0) / 0.32) * (b.code[j].length + 1)
        codeLine(ctx, tk, x + 26, box.y + 104 + j * 36, { size: 20, chars })
      })
      if (k < 2) {
        const a0 = 1.9 + k * 0.3
        arrow(ctx, x + box.w + 10, box.y + box.h / 2, box.xs[k + 1] - 10, box.y + box.h / 2, seg(t, a0, a0 + 0.3, snap), INK)
      }
    })
    ctx.restore()

    // ---- 4. Improve: eval card with a rising line and a check
    const eIn = seg(t, 4.45, 4.8, snap)
    const ea = eIn * live
    if (ea > 0.001) {
      const dy = (1 - eIn) * 16
      const { x, y, w, h } = evalCard
      ctx.save()
      ctx.globalAlpha = ea
      ctx.translate(0, dy)
      panel(ctx, x, y, w, h, { r: 12, fill: C.panel, lift: true })
      heading(ctx, 'Eval', x + 28, y + 40)
      ctx.fillStyle = white(0.18)
      ctx.fillRect(ex0, ey1 - 12, 1, ey0 - ey1 + 12)
      ctx.fillRect(ex0, ey0, ex1 - ex0, 1)
      ctx.fillStyle = white(0.05)
      for (let k = 1; k <= 2; k++) ctx.fillRect(ex0 + 1, lerp(ey0, ey1, k / 2.2), ex1 - ex0 - 1, 1)
      const p = seg(t, 4.65, 5.35)
      if (p > 0.001) {
        const s = evPath.len * p
        const tip = evPath.at(s)
        const area = (c) => {
          c.beginPath()
          evPath.trace(c, 0, s)
          c.lineTo(tip[0], ey0)
          c.lineTo(evPts[0][0], ey0)
          c.closePath()
        }
        ctx.save()
        area(ctx)
        ctx.fillStyle = lime(0.1) // flat fill under the line
        ctx.fill()
        ctx.restore()
        strokePath(ctx, evPath, 0, s, LIME, 2.2)
        dot(ctx, tip[0], tip[1], 6.5, BG)
        dot(ctx, tip[0], tip[1], 4.5, LIME)
      }
      doneBadge(ctx, x + w - 42, y + 40, 15, seg(t, 5.3, 5.7))
      ctx.restore()
    }
  }

  return { render }
}
