// commit-graph: shipping, quietly. A main line and two feature branches draw slowly left to right:
// they branch, gain commits and merge back; the head commit turns lime and gets a lime "deployed" chip with a
// dark check. Then the graph fades back to the opening state (the main track and its first commit).
import {
  C, UI, MONO, FPS, TAU, seg, env, clamp, lerp, easeOut, easeInOut, sine, snap, rr, panel, text, measure,
  Poly, bez, rgba, white, mix, backdrop, BACKDROPS, dot, checkMark, LIME, LIME_INK, T2, T3,
} from '../lib/kit.js'

const RET0 = 6.6
const RET1 = 7.3
const PEN0 = 0.3
const PEN1 = 4.9
const DX = 14 // centres the graph (and its status pill) inside the panel
const BOARD = { x: 226, y: 250, w: 1148, h: 430 }
const YM = 460
const YA = 330
const YB = 590

export function create(ctx) {
  const X0 = 250
  const XH = 1150 // head commit
  const curve = (x0, y0, x1, y1) => bez([x0, y0], [x0 + 46, y0], [x1 - 46, y1], [x1, y1], 40)
  const lanes = [
    { path: new Poly([[X0, YM], [XH, YM]]), color: white(0.38), w: 1.5 },
    { path: new Poly([...curve(390, YM, 470, YA), [740, YA], ...curve(740, YA, 820, YM).slice(1)]), color: T2, w: 1.5 },
    { path: new Poly([...curve(610, YM, 690, YB), [960, YB], ...curve(960, YB, 1040, YM).slice(1)]), color: T3, w: 1.5 },
  ]
  // commits: [x, y, kind]; kind m = main, a / b = feature, merge = merge commit
  const commits = [
    [X0, YM, 'm'],
    [390, YM, 'm'],
    [520, YA, 'a'],
    [610, YM, 'm'],
    [630, YA, 'a'],
    [740, YA, 'a'],
    [740, YB, 'b'],
    [820, YM, 'merge'],
    [850, YB, 'b'],
    [960, YB, 'b'],
    [1040, YM, 'merge'],
    [XH, YM, 'head'],
  ]
  const penX = (t) => lerp(X0 - 10, XH + 16, seg(t, PEN0, PEN1, sine))
  const tAt = (x) => {
    let lo = PEN0
    let hi = PEN1
    for (let k = 0; k < 40; k++) {
      const m = (lo + hi) / 2
      if (penX(m) >= x) hi = m
      else lo = m
    }
    return hi
  }
  const ct = commits.map(([x]) => (x === X0 ? -1 : tAt(x)))
  const labels = [
    ['feat/retrieval', 486, YA - 34, tAt(480)],
    ['feat/agent', 706, YB + 38, tAt(700)],
  ]
  const tHead = tAt(XH)

  function commitDot(ctx, x, y, kind, p, a, dep = 0) {
    if (p <= 0.001 || a <= 0.001) return
    const s = easeOut(p)
    ctx.save()
    ctx.globalAlpha = a * clamp(p / 0.4)
    const r = (kind === 'merge' || kind === 'head' ? 8 : 6.5) * (0.6 + 0.4 * s)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.fillStyle = C.solid
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = kind === 'a' ? T2 : kind === 'b' ? T3 : mix(white(0.72), LIME, dep)
    ctx.stroke()
    if (kind === 'merge' || kind === 'head') dot(ctx, x, y, 3 + dep, mix(white(0.72), LIME, dep)) // head turns lime once deployed
    ctx.restore()
  }

  function render(i, ctx) {
    const t = i / FPS
    backdrop(ctx, BACKDROPS['commit-graph'])
    const back = seg(t, RET0, RET1)
    const live = 1 - back
    const px = penX(t)
    panel(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { r: 14, fill: C.panel, lift: true })
    ctx.save()
    ctx.translate(DX, 0)

    // opening state: faint main track, "main" label, first commit
    ctx.save()
    ctx.setLineDash([3, 8])
    ctx.strokeStyle = white(0.14)
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(X0, YM)
    ctx.lineTo(XH, YM)
    ctx.stroke()
    ctx.restore()
    text(ctx, 'main', X0 - 4, YM - 34, { size: 20, weight: 500, family: MONO, color: C.t60 })

    // lanes, revealed up to the pen (hard edge, no gradient)
    if (live > 0.001 && t > PEN0) {
      ctx.save()
      ctx.globalAlpha = live
      ctx.beginPath()
      ctx.rect(-DX, 0, px + DX, 900)
      ctx.clip()
      for (const l of lanes) {
        ctx.beginPath()
        l.path.trace(ctx, 0, l.path.len)
        ctx.strokeStyle = l.color
        ctx.lineWidth = l.w
        ctx.lineJoin = 'round'
        ctx.stroke()
      }
      ctx.restore()
    }

    // commits
    const dep = seg(t, tHead + 0.25, tHead + 0.8) * live
    commits.forEach(([x, y, kind], k) => {
      if (ct[k] < 0) commitDot(ctx, x, y, kind, 1, 1)
      else commitDot(ctx, x, y, kind, clamp((t - ct[k]) / 0.35), live, kind === 'head' ? dep : 0)
    })
    for (const [s, x, y, t0] of labels) text(ctx, s, x, y, { size: 20, family: MONO, color: C.t40, alpha: seg(t, t0, t0 + 0.6) * live })

    // deployed status
    const da = dep
    if (da > 0.001) {
      const x = XH + 26
      const w = measure(ctx, 'deployed', 22, 500) + 50
      const dx = (1 - easeOut(clamp((t - tHead - 0.25) / 0.7))) * -10
      panel(ctx, x + dx, YM - 19, w, 38, { r: 19, fill: LIME, stroke: null, alpha: da }) // lime chip, dark check
      ctx.save()
      ctx.globalAlpha = da
      checkMark(ctx, x + dx + 21, YM, 18, clamp((t - tHead - 0.35) / 0.35), LIME_INK, 2.4)
      ctx.restore()
      text(ctx, 'deployed', x + dx + 36, YM + 1, { size: 22, weight: 500, color: LIME_INK, alpha: da })
    }
    ctx.restore()
  }

  return { render }
}
