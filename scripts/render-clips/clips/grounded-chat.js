// grounded-chat: the portfolio's own assistant. The question is typed and sent, three source cards
// slide in, the answer (site.ts statement, third person) streams in word by word, citation chips
// link back to the sources, and a small "grounded" badge settles in. Then it eases back to empty.
import {
  C, UI, MONO, FPS, TAU, seg, env, clamp, lerp, easeOut, easeInOut, snap, rr, panel, text, measure, wrap,
  rgba, white, mix, backdrop, BACKDROPS, dot, heading, label, checkMark, LIME, LIME_INK, T2,
} from '../lib/kit.js'

const RET0 = 6.6
const RET1 = 7.3
const QUESTION = 'What does he build?'
const ANSWER = 'He builds AI systems, automates workflows and turns ideas into real world applications.'
const SOURCES = [
  ['Profile', 'site profile'],
  ['Agentic AI RAG Chatbot', 'project'],
  ['Voice-Controlled AI Agent', 'project'],
]

export function create(ctx) {
  const win = { x: 228, y: 166, w: 1144, h: 568 }
  const colL = { x: win.x + 34, w: 660 }
  const divX = win.x + 712
  const colR = { x: divX + 30, w: win.x + win.w - divX - 60 }
  const input = { x: colL.x, y: win.y + win.h - 92, w: divX - 34 - colL.x, h: 60 }
  const qW = measure(ctx, QUESTION, 26, 500) + 48
  const bubble = { x: divX - 34 - qW, y: win.y + 104, w: qW, h: 58 }
  const ans = { x: colL.x, y: win.y + 214 }
  const lines = wrap(ctx, ANSWER, divX - 34 - colL.x, 28, 400, UI, 42)
  const words = lines.flatMap((l) => l.words.map((w) => ({ ...w, y: l.y })))
  const W0 = 2.3
  const WSTEP = 0.1
  const streamEnd = W0 + words.length * WSTEP
  const chipsY = ans.y + 56 + lines.length * 42 + 6
  const cards = SOURCES.map(([title, sub], k) => ({ title, sub, y: win.y + 150 + k * 100, t: 1.6 + k * 0.13 }))
  const chipT = (k) => streamEnd + 0.05 + k * 0.12

  function render(i, ctx) {
    const t = i / FPS
    backdrop(ctx, BACKDROPS['grounded-chat'])
    const back = seg(t, RET0, RET1)
    const live = 1 - back

    // ---- window chrome
    panel(ctx, win.x, win.y, win.w, win.h, { r: 14, fill: C.panel, lift: true })
    ctx.fillStyle = C.border
    ctx.fillRect(win.x + 1, win.y + 64, win.w - 2, 1)
    ctx.fillRect(divX, win.y + 65, 1, win.h - 66)
    dot(ctx, win.x + 36, win.y + 32, 4.5, LIME)
    heading(ctx, 'Ask my AI', win.x + 54, win.y + 33)
    label(ctx, 'sources', colR.x, win.y + 104)

    // ---- input bar
    const sendGlow = env(t, 1.02, 1.12, 1.2, 1.45)
    panel(ctx, input.x, input.y, input.w, input.h, { r: 14, fill: C.panel2, glow: env(t, 0.22, 0.32, 1.1, 1.35) })
    const typed = clamp((t - 0.3) / 0.7) * QUESTION.length
    const inText = 1 - seg(t, 1.12, 1.3) // typed text leaves the input on send
    const ph = t < 0.3 ? 1 : seg(t, 1.3, 1.55) // placeholder returns after sending
    text(ctx, 'Ask about his work…', input.x + 24, input.y + input.h / 2 + 1, { size: 24, color: C.t40, alpha: ph * (t < 0.3 ? 1 - seg(t, 0.22, 0.3) : 1) })
    if (t >= 0.3 && inText > 0.001) {
      const s = QUESTION.slice(0, Math.floor(typed))
      const w = text(ctx, s, input.x + 24, input.y + input.h / 2 + 1, { size: 24, weight: 500, alpha: inText })
      ctx.fillStyle = white(0.85 * inText * (1 - seg(t, 1.02, 1.12)))
      ctx.fillRect(input.x + 26 + w, input.y + input.h / 2 - 13, 2, 26)
    }
    const bx = input.x + input.w - 36
    const by = input.y + input.h / 2
    const ready = Math.max(seg(t, 0.3, 0.45) * (1 - seg(t, 1.2, 1.45)), sendGlow) // lime while there is text to send
    dot(ctx, bx, by, 19, mix(white(0.1), LIME, ready))
    ctx.save()
    ctx.strokeStyle = mix(T2, LIME_INK, ready)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(bx, by + 8)
    ctx.lineTo(bx, by - 8)
    ctx.moveTo(bx - 6.5, by - 1.5)
    ctx.lineTo(bx, by - 8)
    ctx.lineTo(bx + 6.5, by - 1.5)
    ctx.stroke()
    ctx.restore()

    // ---- user bubble (rises from the input)
    const ba = seg(t, 1.15, 1.35, snap) * live
    if (ba > 0.001) {
      const u = snap(clamp((t - 1.15) / 0.4))
      const y = lerp(input.y - 30, bubble.y, u)
      panel(ctx, bubble.x, y, bubble.w, bubble.h, { r: 14, fill: C.panel2, stroke: white(0.12), alpha: ba })
      text(ctx, QUESTION, bubble.x + 24, y + bubble.h / 2 + 1, { size: 26, weight: 500, alpha: ba })
    }

    // ---- assistant: label, thinking dots, streamed answer
    const la = seg(t, 1.45, 1.65, snap) * live
    if (la > 0.001) {
      ctx.save()
      ctx.globalAlpha = la
      // small sparkle
      const sx = ans.x + 9
      const sy = ans.y + 2
      ctx.beginPath()
      ctx.moveTo(sx, sy - 9)
      ctx.quadraticCurveTo(sx + 1.2, sy - 1.2, sx + 9, sy)
      ctx.quadraticCurveTo(sx + 1.2, sy + 1.2, sx, sy + 9)
      ctx.quadraticCurveTo(sx - 1.2, sy + 1.2, sx - 9, sy)
      ctx.quadraticCurveTo(sx - 1.2, sy - 1.2, sx, sy - 9)
      ctx.fillStyle = T2
      ctx.fill()
      ctx.restore()
      text(ctx, 'Assistant', ans.x + 28, ans.y + 2, { size: 22, weight: 500, color: C.t40, alpha: la })
    }
    const think = env(t, 1.5, 1.65, W0 - 0.12, W0 + 0.04) * live
    if (think > 0.001) {
      for (let k = 0; k < 3; k++) {
        const ph = 0.5 + 0.5 * Math.sin((t - 1.5) * TAU * 1.6 - k * 0.9)
        dot(ctx, ans.x + 8 + k * 20, ans.y + 56, 5, white((0.15 + 0.45 * ph) * think))
      }
    }
    if (live > 0.001) {
      ctx.save()
      ctx.font = `400 28px ${UI}`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = C.t90
      words.forEach((w, k) => {
        const a = seg(t, W0 + k * WSTEP, W0 + k * WSTEP + 0.18) * live
        if (a <= 0.001) return
        ctx.globalAlpha = a
        ctx.fillText(w.s, ans.x + w.x, ans.y + 56 + w.y + (1 - a) * 3)
      })
      ctx.restore()
    }
    // chips + grounded badge
    let cx = ans.x
    SOURCES.forEach((_, k) => {
      const a = seg(t, chipT(k), chipT(k) + 0.25, snap) * live
      const w = 38
      if (a > 0.001) {
        panel(ctx, cx, chipsY, w, 34, { r: 9, fill: C.panel2, stroke: white(0.14), alpha: a })
        text(ctx, String(k + 1), cx + w / 2, chipsY + 18, { size: 20, weight: 500, family: MONO, color: C.t90, align: 'center', alpha: a })
      }
      cx += w + 10
    })
    const ga = seg(t, chipT(2) + 0.3, chipT(2) + 0.6, snap) * live
    if (ga > 0.001) {
      const gx = cx + 14
      const gw = measure(ctx, 'grounded', 22, 500) + 52
      panel(ctx, gx, chipsY, gw, 34, { r: 17, fill: LIME, stroke: null, alpha: ga }) // lime chip, dark text
      ctx.save()
      ctx.globalAlpha = ga
      checkMark(ctx, gx + 20, chipsY + 17, 18, clamp((t - chipT(2) - 0.4) / 0.3), LIME_INK, 2.4)
      ctx.restore()
      text(ctx, 'grounded', gx + 34, chipsY + 18, { size: 22, weight: 500, color: LIME_INK, alpha: ga })
    }

    // ---- source cards slide in from the right edge of the window
    ctx.save()
    ctx.beginPath()
    ctx.rect(divX + 1, win.y + 65, win.x + win.w - divX - 2, win.h - 66)
    ctx.clip()
    cards.forEach((c, k) => {
      const p = clamp((t - c.t) / 0.45)
      const a = snap(p) * live
      if (a <= 0.001) return
      const x = colR.x + (1 - snap(p)) * 80
      const hl = env(t, chipT(k), chipT(k) + 0.15, chipT(k) + 0.5, chipT(k) + 0.9)
      panel(ctx, x, c.y, colR.w, 84, { r: 12, fill: C.panel2, alpha: a, glow: hl })
      panel(ctx, x + 16, c.y + 26, 32, 32, { r: 8, fill: white(0.07), stroke: null, alpha: a })
      text(ctx, String(k + 1), x + 32, c.y + 43, { size: 20, weight: 500, family: MONO, color: T2, align: 'center', alpha: a })
      text(ctx, c.title, x + 62, c.y + 30, { size: 22, weight: 500, color: C.t90, alpha: a })
      text(ctx, c.sub, x + 62, c.y + 58, { size: 22, color: C.t40, alpha: a })
    })
    ctx.restore()
  }

  return { render }
}
