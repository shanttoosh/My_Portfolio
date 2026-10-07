// rag-retrieval: a document ("eBook.pdf") splits into chunks, the chunks become points in an
// embedding space, a query lands, its nearest neighbours light up and an answer card composes with
// citation chips. Page numbers are illustrative labels on the neighbour points and match the chips.
import {
  C, UI, MONO, FPS, TAU, LIME, BG, PANEL, PANEL2, seg, env, clamp, lerp, easeOut, easeInOut, snap,
  rr, panel, text, heading, label, measure, wrap, Poly, bez, strokePath, rgba, lime, white, mix, backdrop, BACKDROPS,
  dot, dotGrid, mulberry32, gauss,
} from '../lib/kit.js'

const RET0 = 6.6
const RET1 = 7.3
const BD = BACKDROPS['rag-retrieval']
const QUERY = 'What is an agent?'
const ANSWER = 'An agent is an LLM that plans, calls tools and acts toward a goal.'
const CHIPS = ['p. 12', 'p. 31'] // illustrative page labels; they match the neighbour tags below

export function create(ctx) {
  const rnd = mulberry32(20260412)
  const doc = { x: 250, y: 236, w: 172, h: 224 }
  const space = { x: 520, y: 108, w: 840, h: 452 }
  const card = { x: 520, y: 584, w: 840, h: 216 }

  // top page text lines
  const lines = []
  for (let j = 0; j < 9; j++) lines.push({ y: doc.y + 62 + j * 17, w: (j === 8 ? 0.5 : 0.62 + 0.33 * rnd()) * (doc.w - 40) })
  // 6 chunks of the top page (bands of text lines)
  const chunks = []
  for (let k = 0; k < 6; k++) chunks.push({ x: doc.x + 14, y: doc.y + 52 + k * 26.5, w: doc.w - 28, h: 22 })

  // embedding points: the "agent" cluster is placed by hand (so the query's 3 nearest neighbours sit
  // apart with room for their tags); three more clusters are seeded random with a minimum spacing.
  const Q = { x: 1000, y: 352 }
  const pts = [
    { x: 1066, y: 306, tag: 'p. 12', tagAt: [0, -32] },
    { x: 962, y: 428, tag: 'p. 31', tagAt: [0, 34] },
    { x: 1082, y: 398, tag: 'p. 12', tagAt: [60, 0] },
    { x: 1150, y: 318 },
    { x: 1132, y: 248 },
    { x: 1190, y: 362 },
    { x: 1218, y: 294 },
    { x: 1152, y: 452 },
    { x: 1086, y: 218 },
  ]
  const centers = [
    [720, 282],
    [790, 476],
    [1250, 492],
  ]
  const minD = 22
  for (let c = 0; c < centers.length; c++) {
    let n = 0
    let guard = 0
    while (n < 9 && guard++ < 2000) {
      const x = centers[c][0] + gauss(rnd) * 40
      const y = centers[c][1] + gauss(rnd) * 30
      if (x < space.x + 40 || x > space.x + space.w - 40 || y < space.y + 120 || y > space.y + space.h - 30) continue
      if (pts.some((p) => Math.hypot(p.x - x, p.y - y) < minD) || Math.hypot(Q.x - x, Q.y - y) < 130) continue
      pts.push({ x, y })
      n++
    }
  }
  // shuffle so flights interleave clusters
  for (let k = pts.length - 1; k > 0; k--) {
    const j = Math.floor(rnd() * (k + 1))
    ;[pts[k], pts[j]] = [pts[j], pts[k]]
  }
  // first 6 points are the visible page chunks; the rest stream out of the stack
  pts.forEach((p, k) => {
    if (k < 6) {
      const ch = chunks[k]
      p.t0 = 0.75 + k * 0.1
      p.dur = 0.75
      p.from = [ch.x + ch.w / 2, ch.y + ch.h / 2]
      p.chunk = ch
    } else {
      p.t0 = 1.0 + (k - 6) * 0.035
      p.dur = 0.7
      p.from = [doc.x + doc.w + 4, doc.y + 40 + rnd() * (doc.h - 80)]
    }
    const f = p.from
    p.path = new Poly(bez(f, [f[0] + 150, f[1] - 30 + rnd() * 60], [p.x - 160, p.y + (rnd() - 0.5) * 80], [p.x, p.y], 48))
  })

  const nn = pts
    .map((p, k) => ({ k, d: Math.hypot(p.x - Q.x, p.y - Q.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((o) => ({ ...o, p: pts[o.k], tag: pts[o.k].tag }))
  if (nn.some((o) => !o.tag)) throw new Error('rag-retrieval: the 3 nearest neighbours must be the tagged points')
  const qw = 26 + 22 + 12 + measure(ctx, QUERY, 24, 500) + 26
  const pill = { x: space.x + space.w - 28 - qw, y: space.y + 24, w: qw, h: 52 }
  const dropPath = new Poly(bez([pill.x + pill.w / 2, pill.y + pill.h], [pill.x + pill.w / 2, pill.y + 140], [Q.x + 60, Q.y - 90], [Q.x, Q.y], 48))
  const answer = wrap(ctx, ANSWER, 600, 28, 500, UI, 40) // narrow wrap: two balanced lines
  const nWords = answer.reduce((a, l) => a + l.words.length, 0)

  function page(ctx, x, y, fill, lift = false) {
    panel(ctx, x, y, doc.w, doc.h, { r: 10, fill, stroke: white(0.12), lift })
  }

  function render(i, ctx) {
    const t = i / FPS
    backdrop(ctx, BD)
    const live = 1 - seg(t, RET0, RET1)

    // ---- embedding space panel
    panel(ctx, space.x, space.y, space.w, space.h, { r: 14, fill: C.panel, lift: true })
    ctx.save()
    rr(ctx, space.x, space.y, space.w, space.h, 14)
    ctx.clip()
    dotGrid(ctx, 32, white(0.06), 0.75, space.x, space.y, space.x + space.w, space.y + space.h)
    ctx.restore()
    label(ctx, 'embedding space', space.x + 28, space.y + 48)

    // ---- document stack
    page(ctx, doc.x + 16, doc.y + 16, PANEL, true)
    page(ctx, doc.x + 8, doc.y + 8, PANEL)
    page(ctx, doc.x, doc.y, PANEL2)
    const split = seg(t, 0.35, 0.65) * live // page text hands over to chunk cards
    ctx.save()
    ctx.fillStyle = white(0.32)
    rr(ctx, doc.x + 20, doc.y + 26, 76, 8, 4)
    ctx.fill()
    ctx.globalAlpha = 1 - 0.75 * split
    ctx.fillStyle = white(0.13)
    for (const l of lines) {
      rr(ctx, doc.x + 20, l.y - 3, l.w, 6, 3)
      ctx.fill()
    }
    ctx.restore()
    text(ctx, 'eBook.pdf', doc.x + doc.w / 2 + 8, doc.y + doc.h + 58, { size: 22, weight: 500, color: C.t90, align: 'center' })

    // ---- chunks: cards on the page, then flights into the space as points
    const nbr = new Map(nn.map((o, r) => [o.k, r]))
    pts.forEach((p, k) => {
      const u = (t - p.t0) / p.dur
      const lit = nbr.has(k) ? seg(t, 3.55 + nbr.get(k) * 0.1, 3.85 + nbr.get(k) * 0.1, snap) : 0
      const a = live
      if (a <= 0.001) return
      if (p.chunk && u < 1) {
        // chunk card: appears on the page, separates, morphs into a point along the flight
        const ch = p.chunk
        const show = seg(t, 0.3 + k * 0.04, 0.55 + k * 0.04, snap)
        if (show <= 0.001) return
        const sep = seg(t, 0.45, 0.7) * (k - 2.5) * 5
        const m = easeInOut(clamp(u / 0.55))
        const s = easeInOut(clamp(u)) * p.path.len
        let [x, y] = u > 0 ? p.path.at(s) : [ch.x + ch.w / 2, ch.y + ch.h / 2 + sep]
        if (u > 0) y += sep * (1 - easeInOut(clamp(u / 0.3)))
        const w = lerp(ch.w, 10, m)
        const h = lerp(ch.h, 10, m)
        ctx.save()
        ctx.globalAlpha = a * show
        rr(ctx, x - w / 2, y - h / 2, w, h, lerp(5, 5, m))
        ctx.fillStyle = mix(PANEL2, white(0.6), m)
        ctx.fill()
        ctx.strokeStyle = mix(white(0.4), white(0), m)
        ctx.lineWidth = 1.2
        ctx.stroke()
        if (m < 0.6) {
          ctx.globalAlpha = a * show * (1 - m / 0.6)
          ctx.fillStyle = white(0.3)
          rr(ctx, x - w / 2 + 8, y - 3, (w - 16) * (0.55 + 0.4 * ((k * 0.37) % 1)), 6, 3)
          ctx.fill()
        }
        ctx.restore()
        return
      }
      if (u <= 0) return
      const s = easeInOut(clamp(u)) * p.path.len
      const [x, y] = p.path.at(s)
      const born = clamp(u / 0.2)
      const r = lerp(p.chunk ? 5 : 2.5, 5, easeOut(clamp(u))) + 1.5 * lit
      ctx.save()
      ctx.globalAlpha = a * born
      dot(ctx, x, y, r + 1.4 * lit, mix(white(0.55), LIME, lit))
      ctx.restore()
    })

    // ---- query pill, drop, neighbour lines
    const qIn = seg(t, 2.5, 2.8, snap)
    const qa = qIn * live
    if (qa > 0.001) {
      const dy = (1 - qIn) * 14
      const { x, y, w, h } = pill
      panel(ctx, x, y + dy, w, h, { r: h / 2, fill: C.panel2, glow: seg(t, 2.65, 2.95), alpha: qa })
      ctx.save()
      ctx.globalAlpha = qa
      // search glyph
      ctx.strokeStyle = C.t60
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.arc(x + 34, y + dy + h / 2 - 2, 7, 0, TAU)
      ctx.moveTo(x + 39, y + dy + h / 2 + 3)
      ctx.lineTo(x + 44, y + dy + h / 2 + 8)
      ctx.stroke()
      const chars = clamp((t - 2.62) / 0.45) * QUERY.length
      text(ctx, QUERY.slice(0, Math.floor(chars)), x + 58, y + dy + h / 2 + 1, { size: 24, weight: 500 })
      ctx.restore()
    }
    const drop = (t - 3.1) / 0.45
    if (drop > 0 && live > 0.001) {
      const s = easeInOut(clamp(drop)) * dropPath.len
      const [x, y] = dropPath.at(s)
      ctx.save()
      ctx.globalAlpha = live * clamp(drop / 0.15)
      // landing ripple (once, soft)
      const rp = clamp((t - 3.55) / 0.6)
      if (rp > 0 && rp < 1) {
        ctx.beginPath()
        ctx.arc(Q.x, Q.y, lerp(10, 54, easeOut(rp)), 0, TAU)
        ctx.strokeStyle = lime(0.8 * (1 - rp))
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      // neighbour lines
      nn.forEach((o, r) => {
        const p = seg(t, 3.55 + r * 0.1, 3.85 + r * 0.1, snap)
        if (p <= 0.001) return
        const path = new Poly([[Q.x, Q.y], [o.p.x, o.p.y]])
        strokePath(ctx, path, 0, path.len * p, LIME, 1.6)
      })
      dot(ctx, x, y, 10, BG)
      dot(ctx, x, y, 7.5, LIME) // the query point
      ctx.restore()
    }
    // neighbour tags
    nn.forEach((o, r) => {
      const a = seg(t, 3.75 + r * 0.1, 4.05 + r * 0.1, snap) * live
      if (a <= 0.001) return
      const tw = measure(ctx, o.tag, 20, 500, MONO) + 20
      const cx = o.p.x + o.p.tagAt[0]
      const cy = o.p.y + o.p.tagAt[1]
      panel(ctx, cx - tw / 2, cy - 15, tw, 30, { r: 8, fill: C.panel2, stroke: white(0.14), alpha: a })
      text(ctx, o.tag, cx, cy + 1, { size: 20, weight: 500, family: MONO, color: C.t90, align: 'center', alpha: a })
    })

    // ---- answer card
    const cIn = seg(t, 4.15, 4.5, snap)
    const ca = cIn * live
    if (ca > 0.001) {
      const dy = (1 - cIn) * 16
      const { x, y, w, h } = card
      ctx.save()
      ctx.globalAlpha = ca
      ctx.translate(0, dy)
      panel(ctx, x, y, w, h, { r: 14, fill: C.panel, lift: true })
      heading(ctx, 'Answer', x + 32, y + 38)
      ctx.font = `500 28px ${UI}`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = C.t90
      let wi = 0
      for (const l of answer) {
        for (const wd of l.words) {
          const wa = seg(t, 4.3 + wi * 0.05, 4.48 + wi * 0.05)
          if (wa > 0.001) {
            ctx.globalAlpha = ca * wa
            ctx.fillText(wd.s, x + 32 + wd.x, y + 82 + l.y + (1 - wa) * 4)
          }
          wi++
        }
      }
      ctx.globalAlpha = ca
      let chipX = x + 32
      const chipY = y + h - 58
      CHIPS.forEach((c, k) => {
        const a = seg(t, 4.4 + nWords * 0.05 + k * 0.12, 4.7 + nWords * 0.05 + k * 0.12, snap)
        const cw = measure(ctx, c, 20, 500, MONO) + 26
        panel(ctx, chipX, chipY, cw, 34, { r: 9, fill: C.panel2, stroke: white(0.14), alpha: a })
        text(ctx, c, chipX + cw / 2, chipY + 18, { size: 20, weight: 500, family: MONO, color: C.t90, align: 'center', alpha: a })
        chipX += cw + 12
      })
      ctx.restore()
    }
  }

  return { render }
}
