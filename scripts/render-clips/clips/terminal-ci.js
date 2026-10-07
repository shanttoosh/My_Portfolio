// terminal-ci: software engineering. An editor with a small FastAPI endpoint next to a terminal:
// `pytest -q` prints one dot per test and "N passed" (same N), `docker build` prints its layers,
// then a CI row ticks lint / types / tests / build. Tool names only.
import {
  C, UI, MONO, FPS, TAU, seg, env, clamp, lerp, easeOut, easeInOut, snap, rr, panel, text, measure,
  rgba, white, mix, backdrop, BACKDROPS, dot, pyTokens, codeLine, monoWidth, doneBadge, LIME, CHROME, T2, T3,
} from '../lib/kit.js'

const RET0 = 6.6
const RET1 = 7.3
const TESTS = 12 // dots printed == "N passed"

const CODE = [
  'from fastapi import FastAPI',
  'from pydantic import BaseModel',
  'from .rag import retrieve, generate',
  '',
  'app = FastAPI()',
  '',
  'class Question(BaseModel):',
  '    text: str',
  '',
  '@app.post("/ask")',
  'async def ask(q: Question):',
  '    chunks = retrieve(q.text)',
  '    answer = generate(q.text, chunks)',
  '    return {"answer": answer}',
]
const LAYERS = [
  ' => [1/4] FROM python:3.12-slim',
  ' => [2/4] COPY pyproject.toml .',
  ' => [3/4] RUN pip install .',
  ' => [4/4] COPY app/ ./app',
  ' => exporting to image',
]
const CI = [
  ['lint', 'ruff'],
  ['types', 'mypy'],
  ['tests', 'pytest'],
  ['build', 'docker'],
]

export function create(ctx) {
  const ed = { x: 220, y: 104, w: 602, h: 566 }
  const tm = { x: 840, y: 104, w: 540, h: 566 }
  const LH = 32
  const cw = monoWidth(ctx, 20)
  const codeTokens = CODE.map(pyTokens)

  // CI pills, centred
  const pills = CI.map(([a, b]) => ({ a, b, w: 54 + measure(ctx, a, 24, 500) + 12 + measure(ctx, b, 20, 400, MONO) + 26 }))
  const ciLabelW = measure(ctx, 'CI', 20, 500, MONO) + 24
  const gap = 14
  let px = 800 - (ciLabelW + pills.reduce((s, p) => s + p.w, 0) + gap * (pills.length - 1)) / 2
  const ciLabelX = px
  px += ciLabelW
  for (const p of pills) {
    p.x = px
    px += p.w + gap
  }
  const ciY = 718
  const ciH = 60

  function chrome(ctx, box, title, mono) {
    panel(ctx, box.x, box.y, box.w, box.h, { r: 14, fill: C.panel, lift: true })
    ctx.fillStyle = C.border
    ctx.fillRect(box.x + 1, box.y + 54, box.w - 2, 1)
    for (let k = 0; k < 3; k++) dot(ctx, box.x + 26 + k * 20, box.y + 27, 5.5, CHROME)
    text(ctx, title, box.x + 102, box.y + 28, { size: 20, family: MONO, color: T2 })
  }

  function prompt(ctx, x, y, cmd, chars, alpha = 1) {
    text(ctx, '$', x, y, { size: 20, weight: 500, family: MONO, color: T3, alpha })
    codeLine(ctx, [{ s: cmd, color: C.t90 }], x + 2 * cw, y, { size: 20, chars, alpha })
  }

  function caret(ctx, x, y, a) {
    if (a <= 0.001) return
    ctx.fillStyle = white(0.75 * a)
    ctx.fillRect(x, y - 12, cw * 0.62, 24)
  }

  function render(i, ctx) {
    const t = i / FPS
    backdrop(ctx, BACKDROPS['terminal-ci'])
    const back = seg(t, RET0, RET1)
    const live = 1 - back

    // ---- editor
    chrome(ctx, ed, 'main.py', true)
    const cx0 = ed.x + 80
    const cy0 = ed.y + 96
    ctx.fillStyle = C.panel2 // current line
    ctx.fillRect(ed.x + 1, cy0 + 12 * LH - LH / 2, ed.w - 2, LH)
    ctx.fillStyle = LIME // the edited line's gutter mark
    ctx.fillRect(ed.x + 1, cy0 + 12 * LH - LH / 2, 4, LH)
    CODE.forEach((_, j) => {
      text(ctx, String(j + 1), ed.x + 52, cy0 + j * LH, { size: 20, family: MONO, color: C.t40, align: 'right', alpha: j === 12 ? 1 : 0.8 })
      codeLine(ctx, codeTokens[j], cx0, cy0 + j * LH, { size: 20 })
    })

    // ---- terminal
    chrome(ctx, tm, 'Terminal', false)
    const tx = tm.x + 30
    const ty = tm.y + 96
    // line 0: "$ pytest -q" — the "$" stays; the typed command fades back out at the end
    const c1 = clamp((t - 0.35) / 0.38) * 9
    text(ctx, '$', tx, ty, { size: 20, weight: 500, family: MONO, color: T3 })
    codeLine(ctx, [{ s: 'pytest -q', color: C.t90 }], tx + 2 * cw, ty, { size: 20, chars: c1, alpha: live })
    // dots
    for (let k = 0; k < TESTS; k++) {
      const a = seg(t, 0.85 + k * 0.05, 0.92 + k * 0.05, easeOut) * live
      if (a > 0.001) text(ctx, '.', tx + k * cw, ty + LH, { size: 20, weight: 500, family: MONO, color: LIME, alpha: a })
    }
    text(ctx, `${TESTS} passed`, tx, ty + 2 * LH, { size: 20, weight: 500, family: MONO, color: LIME, alpha: seg(t, 1.5, 1.68, snap) * live })
    // docker build
    const pa = seg(t, 1.75, 1.88) * live
    const c2 = clamp((t - 1.9) / 0.5) * 22
    if (pa > 0.001) prompt(ctx, tx, ty + 4 * LH, 'docker build -t api .', c2, pa)
    LAYERS.forEach((l, k) => {
      const a = seg(t, 2.52 + k * 0.17, 2.66 + k * 0.17, snap) * live
      if (a <= 0.001) return
      const parts = l.startsWith(' => [') ? [{ s: l.slice(0, 9), color: C.t40 }, { s: l.slice(9), color: C.t60 }] : [{ s: l, color: C.t60 }]
      codeLine(ctx, parts, tx, ty + (5 + k) * LH, { size: 20, alpha: a })
    })
    // final prompt after the build
    const fa = seg(t, 3.42, 3.56) * live
    if (fa > 0.001) text(ctx, '$', tx, ty + 10 * LH + 8, { size: 20, weight: 500, family: MONO, color: T3, alpha: fa })
    // caret: idle on line 0, follows typing, then sits on the last prompt
    if (t < 0.85) caret(ctx, tx + (2 + Math.floor(c1)) * cw + 2, ty, 1 - seg(t, 0.75, 0.85))
    caret(ctx, tx + 2 * cw + 2, ty, back)
    if (t >= 1.88 && t < 2.5) caret(ctx, tx + (2 + Math.floor(c2)) * cw + 2, ty + 4 * LH, pa)
    caret(ctx, tx + 2 * cw + 2, ty + 10 * LH + 8, fa)

    // ---- CI row
    text(ctx, 'CI', ciLabelX, ciY + ciH / 2 + 1, { size: 20, weight: 500, family: MONO, color: T3 })
    pills.forEach((p, k) => {
      const r0 = 3.65 + k * 0.34
      const run = env(t, r0, r0 + 0.08, r0 + 0.26, r0 + 0.36) * live
      const done = seg(t, r0 + 0.24, r0 + 0.5, snap) * live
      panel(ctx, p.x, ciY, p.w, ciH, { r: 12, fill: C.panel, glow: done, lift: true })
      const ix = p.x + 32
      const iy = ciY + ciH / 2
      // pending ring
      ctx.beginPath()
      ctx.arc(ix, iy, 11, 0, TAU)
      ctx.strokeStyle = white(0.22 * (1 - done))
      ctx.lineWidth = 1.6
      ctx.stroke()
      // running arc
      if (run > 0.001) {
        const a0 = (t - r0) * 9
        ctx.beginPath()
        ctx.arc(ix, iy, 11, a0, a0 + 1.9)
        ctx.strokeStyle = rgba(LIME, run)
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.lineCap = 'butt'
      }
      doneBadge(ctx, ix, iy, 12, done)
      const lx = p.x + 54
      const wA = text(ctx, p.a, lx, iy + 1, { size: 24, weight: 500, color: C.t90 })
      text(ctx, p.b, lx + wA + 12, iy + 1, { size: 20, family: MONO, color: C.t40 })
    })
  }

  return { render }
}
