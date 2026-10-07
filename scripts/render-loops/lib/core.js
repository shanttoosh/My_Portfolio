// Shared helpers for the background loops. Runs inside the render page (see ../page.html).
//
// Rendering model: every loop accumulates light into a linear-light Float32 RGB buffer (no 8-bit
// banding for faint additive glows). Thin geometry (lines, outlines) is drawn with a 2D canvas into
// a LineLayer and added to the float buffer. makePost() then adds the dark base colour, darkens the
// left of the frame, applies a soft highlight shoulder and converts to dithered 8-bit sRGB.
//
// Everything is a pure function of the frame index: seeded randomness only, and all motion uses
// sin/cos of integer multiples of p = 2*PI*frame/216 (or noise sampled on a circle), so frame 216 == frame 0.

export const W = 1280
export const H = 720
export const FRAMES = 216
export const TAU = Math.PI * 2

export const phaseOf = (i) => (TAU * i) / FRAMES

// ---------------------------------------------------------------- math / random
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x)
export const lerp = (a, b, t) => a + (b - a) * t
export const fract = (x) => x - Math.floor(x)
export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

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
  let u = rnd()
  if (u < 1e-12) u = 1e-12
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rnd())
}

// ---------------------------------------------------------------- simplex noise (3D + 4D), seeded
const GRAD3 = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1])
const GRAD4 = new Float32Array([
  0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
  1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
  1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
  1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0,
])

export function makeNoise(seed) {
  const rnd = mulberry32(seed)
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = p[i]
    p[i] = p[j]
    p[j] = t
  }
  const perm = new Uint8Array(512)
  const perm12 = new Uint8Array(512)
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
    perm12[i] = perm[i] % 12
  }

  const F3 = 1 / 3
  const G3 = 1 / 6
  function n3(x, y, z) {
    const s = (x + y + z) * F3
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)
    const k = Math.floor(z + s)
    const t = (i + j + k) * G3
    const x0 = x - (i - t)
    const y0 = y - (j - t)
    const z0 = z - (k - t)
    let i1, j1, k1, i2, j2, k2
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0 }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1 }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1 }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1 }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1 }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0 }
    }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3
    const ii = i & 255, jj = j & 255, kk = k & 255
    let n = 0
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
    if (t0 > 0) {
      const g = perm12[ii + perm[jj + perm[kk]]] * 3
      t0 *= t0
      n += t0 * t0 * (GRAD3[g] * x0 + GRAD3[g + 1] * y0 + GRAD3[g + 2] * z0)
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
    if (t1 > 0) {
      const g = perm12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3
      t1 *= t1
      n += t1 * t1 * (GRAD3[g] * x1 + GRAD3[g + 1] * y1 + GRAD3[g + 2] * z1)
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
    if (t2 > 0) {
      const g = perm12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3
      t2 *= t2
      n += t2 * t2 * (GRAD3[g] * x2 + GRAD3[g + 1] * y2 + GRAD3[g + 2] * z2)
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
    if (t3 > 0) {
      const g = perm12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3
      t3 *= t3
      n += t3 * t3 * (GRAD3[g] * x3 + GRAD3[g + 1] * y3 + GRAD3[g + 2] * z3)
    }
    return 32 * n
  }

  const F4 = (Math.sqrt(5) - 1) / 4
  const G4 = (5 - Math.sqrt(5)) / 20
  function c4(t, gi, x, y, z, w) {
    if (t <= 0) return 0
    t *= t
    return t * t * (GRAD4[gi] * x + GRAD4[gi + 1] * y + GRAD4[gi + 2] * z + GRAD4[gi + 3] * w)
  }
  function n4(x, y, z, w) {
    const s = (x + y + z + w) * F4
    const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s), l = Math.floor(w + s)
    const t = (i + j + k + l) * G4
    const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t), w0 = w - (l - t)
    let rx = 0, ry = 0, rz = 0, rw = 0
    if (x0 > y0) rx++; else ry++
    if (x0 > z0) rx++; else rz++
    if (x0 > w0) rx++; else rw++
    if (y0 > z0) ry++; else rz++
    if (y0 > w0) ry++; else rw++
    if (z0 > w0) rz++; else rw++
    const i1 = rx >= 3 ? 1 : 0, j1 = ry >= 3 ? 1 : 0, k1 = rz >= 3 ? 1 : 0, l1 = rw >= 3 ? 1 : 0
    const i2 = rx >= 2 ? 1 : 0, j2 = ry >= 2 ? 1 : 0, k2 = rz >= 2 ? 1 : 0, l2 = rw >= 2 ? 1 : 0
    const i3 = rx >= 1 ? 1 : 0, j3 = ry >= 1 ? 1 : 0, k3 = rz >= 1 ? 1 : 0, l3 = rw >= 1 ? 1 : 0
    const x1 = x0 - i1 + G4, y1 = y0 - j1 + G4, z1 = z0 - k1 + G4, w1 = w0 - l1 + G4
    const x2 = x0 - i2 + 2 * G4, y2 = y0 - j2 + 2 * G4, z2 = z0 - k2 + 2 * G4, w2 = w0 - l2 + 2 * G4
    const x3 = x0 - i3 + 3 * G4, y3 = y0 - j3 + 3 * G4, z3 = z0 - k3 + 3 * G4, w3 = w0 - l3 + 3 * G4
    const x4 = x0 - 1 + 4 * G4, y4 = y0 - 1 + 4 * G4, z4 = z0 - 1 + 4 * G4, w4 = w0 - 1 + 4 * G4
    const ii = i & 255, jj = j & 255, kk = k & 255, ll = l & 255
    const g0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4
    const g1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4
    const g2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4
    const g3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4
    const g4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4
    const n =
      c4(0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0, g0, x0, y0, z0, w0) +
      c4(0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1, g1, x1, y1, z1, w1) +
      c4(0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2, g2, x2, y2, z2, w2) +
      c4(0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3, g3, x3, y3, z3, w3) +
      c4(0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4, g4, x4, y4, z4, w4)
    return 27 * n
  }
  return { n3, n4 }
}

// ---------------------------------------------------------------- colour (linear light)
export const srgbToLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
export const linToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)
export function hex(h) {
  const n = parseInt(h.slice(1), 16)
  return [srgbToLin(((n >> 16) & 255) / 255), srgbToLin(((n >> 8) & 255) / 255), srgbToLin((n & 255) / 255)]
}
export const PAL = {
  blue: hex('#3B82F6'),
  violet: hex('#8B5CF6'),
  indigo: hex('#6366F1'),
  cyan: hex('#22D3EE'),
  warm: hex('#FF8A4C'),
  ice: hex('#BFDBFE'),
  white: [1, 1, 1],
  // vivid set
  magenta: hex('#FF2BD6'),
  fuchsia: hex('#D946EF'),
  pink: hex('#F472B6'),
  purple: hex('#A855F7'),
  lime: hex('#A3FF3C'),
  green: hex('#22E39A'),
  teal: hex('#14C8B8'),
  aqua: hex('#00E5FF'),
  sky: hex('#38BDF8'),
  royal: hex('#2F5BFF'),
  amber: hex('#FFB020'),
  orange: hex('#FF7A1A'),
  gold: hex('#FFD54A'),
  rose: hex('#FF3D6E'),
}
export const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
export const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k]

// ---------------------------------------------------------------- float RGB buffer
export class Buffer3 {
  constructor(w = W, h = H) {
    this.w = w
    this.h = h
    this.d = new Float32Array(w * h * 3)
  }
  clear() {
    this.d.fill(0)
  }
  copy(src) {
    this.d.set(src.d)
  }
  add(src, k = 1) {
    const a = this.d
    const b = src.d
    for (let i = 0; i < a.length; i++) a[i] += b[i] * k
  }
}

const WX = new Float32Array(4096)

// Gaussian light blob. peak = value at the centre (linear light, per unit colour).
export function splat(buf, x, y, sigma, c, peak) {
  if (!(peak > 0)) return
  if (sigma < 0.7) {
    peak *= (sigma * sigma) / 0.49
    sigma = 0.7
  }
  const r = sigma * 3
  const w = buf.w
  const h = buf.h
  let x0 = Math.floor(x - r)
  let x1 = Math.ceil(x + r)
  let y0 = Math.floor(y - r)
  let y1 = Math.ceil(y + r)
  if (x1 < 0 || y1 < 0 || x0 >= w || y0 >= h) return
  if (x0 < 0) x0 = 0
  if (y0 < 0) y0 = 0
  if (x1 > w - 1) x1 = w - 1
  if (y1 > h - 1) y1 = h - 1
  const k = -1 / (2 * sigma * sigma)
  const nx = x1 - x0 + 1
  for (let i = 0; i < nx; i++) {
    const dx = x0 + i + 0.5 - x
    WX[i] = Math.exp(k * dx * dx)
  }
  const cr = c[0] * peak
  const cg = c[1] * peak
  const cb = c[2] * peak
  const d = buf.d
  for (let yy = y0; yy <= y1; yy++) {
    const dy = yy + 0.5 - y
    const wy = Math.exp(k * dy * dy)
    let idx = (yy * w + x0) * 3
    for (let i = 0; i < nx; i++, idx += 3) {
      const ww = WX[i] * wy
      d[idx] += cr * ww
      d[idx + 1] += cg * ww
      d[idx + 2] += cb * ww
    }
  }
}

// Motion-blurred streak from (x0,y0) (tail, intensity a0) to (x1,y1) (head, intensity a1), sampled with splats.
export function streak(buf, x0, y0, x1, y1, sigma, c, a0, a1, step = 0.9) {
  const len = Math.hypot(x1 - x0, y1 - y0)
  const n = Math.max(1, Math.ceil(len / step))
  const k = step / Math.max(step, sigma * 2.5) // keep the summed intensity roughly independent of step
  for (let q = 0; q <= n; q++) {
    const t = q / n
    const a = (a0 + (a1 - a0) * t) * k
    if (a > 1e-5) splat(buf, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, sigma, c, a)
  }
}

// Hard-edged square "pixel dust" particle snapped to the pixel grid.
export function pixel(buf, x, y, size, c, a) {
  const w = buf.w
  const h = buf.h
  const x0 = Math.round(x - size / 2)
  const y0 = Math.round(y - size / 2)
  const d = buf.d
  for (let yy = y0; yy < y0 + size; yy++) {
    if (yy < 0 || yy >= h) continue
    for (let xx = x0; xx < x0 + size; xx++) {
      if (xx < 0 || xx >= w) continue
      const o = (yy * w + xx) * 3
      d[o] += c[0] * a
      d[o + 1] += c[1] * a
      d[o + 2] += c[2] * a
    }
  }
}

// Soft-edged disc (out-of-focus bokeh). soft = edge width in px.
export function disc(buf, x, y, R, c, peak, soft = 2) {
  const w = buf.w
  const h = buf.h
  const r = R + soft
  const x0 = Math.max(0, Math.floor(x - r))
  const x1 = Math.min(w - 1, Math.ceil(x + r))
  const y0 = Math.max(0, Math.floor(y - r))
  const y1 = Math.min(h - 1, Math.ceil(y + r))
  const d = buf.d
  for (let yy = y0; yy <= y1; yy++) {
    const dy = yy + 0.5 - y
    let idx = (yy * w + x0) * 3
    for (let xx = x0; xx <= x1; xx++, idx += 3) {
      const dx = xx + 0.5 - x
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= r) continue
      const a = smoothstep(R + soft, R - soft, dist) * (0.85 + 0.15 * smoothstep(R * 0.5, R, dist)) * peak
      d[idx] += c[0] * a
      d[idx + 1] += c[1] * a
      d[idx + 2] += c[2] * a
    }
  }
}

// Bilinear upsample of a smaller buffer, added into dst.
export function addUpsampled(dst, src, gain = 1) {
  const sw = src.w
  const sh = src.h
  const dw = dst.w
  const dh = dst.h
  const s = src.d
  const d = dst.d
  const xi = new Int32Array(dw)
  const xf = new Float32Array(dw)
  for (let x = 0; x < dw; x++) {
    let fx = ((x + 0.5) * sw) / dw - 0.5
    fx = clamp(fx, 0, sw - 1.0001)
    const x0 = Math.floor(fx)
    xi[x] = x0
    xf[x] = fx - x0
  }
  for (let y = 0; y < dh; y++) {
    let fy = ((y + 0.5) * sh) / dh - 0.5
    fy = clamp(fy, 0, sh - 1.0001)
    const y0 = Math.floor(fy)
    const ty = fy - y0
    const r0 = y0 * sw * 3
    const r1 = (y0 + 1) * sw * 3
    let o = y * dw * 3
    for (let x = 0; x < dw; x++, o += 3) {
      const a = xi[x] * 3
      const tx = xf[x]
      const w00 = (1 - tx) * (1 - ty) * gain
      const w10 = tx * (1 - ty) * gain
      const w01 = (1 - tx) * ty * gain
      const w11 = tx * ty * gain
      d[o] += s[r0 + a] * w00 + s[r0 + a + 3] * w10 + s[r1 + a] * w01 + s[r1 + a + 3] * w11
      d[o + 1] += s[r0 + a + 1] * w00 + s[r0 + a + 4] * w10 + s[r1 + a + 1] * w01 + s[r1 + a + 4] * w11
      d[o + 2] += s[r0 + a + 2] * w00 + s[r0 + a + 5] * w10 + s[r1 + a + 2] * w01 + s[r1 + a + 5] * w11
    }
  }
}

function downsample(src, dst, f) {
  const S = src.d
  const D = dst.d
  const sw = src.w
  const dw = dst.w
  const dh = dst.h
  D.fill(0)
  for (let y = 0; y < dh; y++) {
    for (let yy = 0; yy < f; yy++) {
      let si = (y * f + yy) * sw * 3
      let di = y * dw * 3
      for (let x = 0; x < dw; x++, di += 3) {
        let r = 0, g = 0, b = 0
        for (let xx = 0; xx < f; xx++, si += 3) {
          r += S[si]
          g += S[si + 1]
          b += S[si + 2]
        }
        D[di] += r
        D[di + 1] += g
        D[di + 2] += b
      }
    }
  }
  const inv = 1 / (f * f)
  for (let i = 0; i < D.length; i++) D[i] *= inv
}

export function blur(b, sigma, tmp = new Float32Array(b.d.length)) {
  const r = Math.ceil(sigma * 3)
  const k = new Float32Array(2 * r + 1)
  let sum = 0
  for (let i = -r; i <= r; i++) {
    k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma))
    sum += k[i + r]
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum
  const w = b.w
  const h = b.h
  const d = b.d
  for (let y = 0; y < h; y++) {
    const row = y * w
    for (let x = 0; x < w; x++) {
      let rr = 0, gg = 0, bb = 0
      for (let i = -r; i <= r; i++) {
        let xx = x + i
        if (xx < 0) xx = 0
        else if (xx >= w) xx = w - 1
        const q = (row + xx) * 3
        const kk = k[i + r]
        rr += d[q] * kk
        gg += d[q + 1] * kk
        bb += d[q + 2] * kk
      }
      const o = (row + x) * 3
      tmp[o] = rr
      tmp[o + 1] = gg
      tmp[o + 2] = bb
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rr = 0, gg = 0, bb = 0
      for (let i = -r; i <= r; i++) {
        let yy = y + i
        if (yy < 0) yy = 0
        else if (yy >= h) yy = h - 1
        const q = (yy * w + x) * 3
        const kk = k[i + r]
        rr += tmp[q] * kk
        gg += tmp[q + 1] * kk
        bb += tmp[q + 2] * kk
      }
      const o = (y * w + x) * 3
      d[o] = rr
      d[o + 1] = gg
      d[o + 2] = bb
    }
  }
}

// Multi-level soft bloom: levels = [{ scale: 4, sigma: 2, gain: 0.3 }, ...]
export function makeBloom(levels) {
  const L = levels.map((l) => {
    const b = new Buffer3(W / l.scale, H / l.scale)
    return { ...l, b, tmp: new Float32Array(b.d.length) }
  })
  return function bloom(buf) {
    for (const l of L) {
      downsample(buf, l.b, l.scale)
      blur(l.b, l.sigma, l.tmp)
    }
    for (const l of L) addUpsampled(buf, l.b, l.gain)
  }
}

// ---------------------------------------------------------------- 2D-canvas line layer
// Draw anti-aliased geometry with canvas 2D ('lighter'), using the R, G and B channels as weights
// for three palette colours; addTo() folds it into the float buffer.
export class LineLayer {
  constructor(basis = [PAL.blue, PAL.violet, PAL.cyan]) {
    this.basis = basis
    this.canvas = document.createElement('canvas')
    this.canvas.width = W
    this.canvas.height = H
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })
  }
  begin() {
    const c = this.ctx
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.globalAlpha = 1
    c.globalCompositeOperation = 'source-over'
    c.fillStyle = '#000'
    c.fillRect(0, 0, W, H)
    c.globalCompositeOperation = 'lighter'
    c.lineCap = 'round'
    c.lineJoin = 'round'
    return c
  }
  static rgb(a, b, c) {
    return `rgb(${Math.round(clamp(a, 0, 1) * 255)},${Math.round(clamp(b, 0, 1) * 255)},${Math.round(clamp(c, 0, 1) * 255)})`
  }
  addTo(buf, gain = 1, mask = null) {
    const src = this.ctx.getImageData(0, 0, W, H).data
    const d = buf.d
    const [A, B, C] = this.basis
    const k = gain / 255
    const ar = A[0] * k, ag = A[1] * k, ab = A[2] * k
    const br = B[0] * k, bg = B[1] * k, bb = B[2] * k
    const cr = C[0] * k, cg = C[1] * k, cb = C[2] * k
    for (let i = 0, j = 0, q = 0; i < W * H; i++, j += 3, q += 4) {
      const r = src[q]
      const g = src[q + 1]
      const b = src[q + 2]
      if ((r | g | b) === 0) continue
      const m = mask ? mask[i] : 1
      d[j] += (r * ar + g * br + b * cr) * m
      d[j + 1] += (r * ag + g * bg + b * cg) * m
      d[j + 2] += (r * ab + g * bb + b * cb) * m
    }
  }
}

// ---------------------------------------------------------------- aurora curtains
// Adds layered curtains to a (usually half-resolution) buffer. Coordinates are normalised (u = x/W, v = y/H).
// Each curtain: centre line from 1D noise sampled on a circle in time, sharp lower edge, long ray-textured fade upward.
export function addCurtains(fb, curtains, p, n3) {
  const w = fb.w
  const h = fb.h
  const d = fb.d
  const cp = Math.cos(p)
  const sp = Math.sin(p)
  const cy = new Float32Array(w)
  const ci = new Float32Array(w)
  const cr = new Float32Array(w)
  for (const c of curtains) {
    const R = c.R
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w
      let yc = c.y0 + c.tilt * (u - 0.6) + (c.bow || 0) * (u - 0.6) * (u - 0.6)
      yc += c.amp * (n3(u * c.freq + c.seed, R * cp, R * sp) + 0.4 * n3(u * c.freq * 2.7 + c.seed + 7.3, R * cp * 1.4 + 3.1, R * sp * 1.4 - 2.2))
      // optional travelling folds: [amplitude, cycles across the frame, integer cycles per loop]
      if (c.waves) for (const [wa, wf, wk] of c.waves) yc += wa * Math.sin(TAU * u * wf - wk * p + c.seed)
      cy[x] = yc
      const patch = 0.5 + 0.5 * n3(u * c.pfreq + c.seed + 13.7, R * cp - 5.3, R * sp + 2.9)
      const win = smoothstep(c.win[0], c.win[1], u) * (1 - smoothstep(c.win[2], c.win[3], u))
      ci[x] = c.intensity * win * (0.15 + 0.85 * patch * patch)
      const rs = c.raySlide ? c.raySlide * Math.sin(p) : 0
      const ray = n3((u + rs) * c.rayFreq + c.seed + 29.1, c.rayR * cp + 1.7, c.rayR * sp - 4.4) + 0.5 * n3((u + rs) * c.rayFreq * 2.3 + c.seed + 3.3, c.rayR * cp - 8.1, c.rayR * sp + 6.2)
      cr[x] = 1 - c.rayAmt + c.rayAmt * clamp(0.5 + 0.55 * ray, 0, 1.4)
    }
    const e = c.colEdge
    const t = c.colTop
    for (let y = 0; y < h; y++) {
      const v = (y + 0.5) / h
      let o = y * w * 3
      for (let x = 0; x < w; x++, o += 3) {
        const I = ci[x]
        if (I <= 0) continue
        const dv = v - cy[x]
        let prof
        let m
        const qe = dv / c.hDown
        const edge = (c.edgeGlow ?? 0.5) * Math.exp(-qe * qe)
        if (dv > 0) {
          if (qe > 4) continue
          prof = Math.exp(-qe * qe) + edge
          m = 0
        } else {
          const q = -dv / c.hUp
          if (q > 6) continue
          const r = smoothstep(0, 2 * c.hDown, -dv)
          prof = Math.exp(-q) * (1 + (cr[x] - 1) * r) + edge
          m = q < 1.5 ? q / 1.5 : 1
        }
        const a = I * prof
        d[o] += a * (e[0] + (t[0] - e[0]) * m)
        d[o + 1] += a * (e[1] + (t[1] - e[1]) * m)
        d[o + 2] += a * (e[2] + (t[2] - e[2]) * m)
      }
    }
  }
}

// ---------------------------------------------------------------- final pass
// Adds the near-black base, darkens toward the left edge, vignettes, soft-shoulders highlights,
// converts linear -> sRGB with a static dither and writes into an ImageData.
export function makePost(opt = {}) {
  const o = {
    leftFloor: 0.1, // content multiplier at the left edge
    leftStart: 0.0,
    leftEnd: 0.6, // fully bright from here (fraction of width)
    vignette: 0.35,
    vx: 0.66,
    vy: 0.5,
    base0: '#05070D',
    base1: '#0A0E18',
    exposure: 1,
    knee: 0.6,
    dither: 1, // amplitude of the static dither in 8-bit steps
    ...opt,
  }
  const b0 = hex(o.base0)
  const b1 = hex(o.base1)
  const mask = new Float32Array(W * H)
  const base = new Float32Array(W * H * 3)
  for (let y = 0; y < H; y++) {
    const v = (y + 0.5) / H
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W
      const ml = lerp(o.leftFloor, 1, smoothstep(o.leftStart, o.leftEnd, u))
      const dx = (u - o.vx) / 0.8
      const dy = (v - o.vy) / 0.62
      const vig = 1 - o.vignette * smoothstep(0.25, 1.2, dx * dx + dy * dy)
      const i = y * W + x
      mask[i] = ml * vig
      const tb = smoothstep(0.15, 0.95, u) * (1 - 0.35 * smoothstep(0.2, 0.5, Math.abs(v - 0.5)))
      const bv = 1 - 0.25 * smoothstep(0.3, 1.2, dx * dx + dy * dy)
      base[i * 3] = lerp(b0[0], b1[0], tb) * bv
      base[i * 3 + 1] = lerp(b0[1], b1[1], tb) * bv
      base[i * 3 + 2] = lerp(b0[2], b1[2], tb) * bv
    }
  }
  const N = 4096
  const lut = new Float32Array(N + 2)
  for (let i = 0; i <= N + 1; i++) lut[i] = linToSrgb(Math.min(1, i / N)) * 255
  const dither = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // interleaved gradient noise, static so it never adds motion
      dither[y * W + x] = (fract(52.9829189 * fract(0.06711056 * x + 0.00583715 * y)) - 0.5) * o.dither
    }
  }
  const knee = o.knee
  const span = 1 - knee
  const exposure = o.exposure
  const shoulder = (c) => (c <= knee ? c : knee + span * (1 - Math.exp(-(c - knee) / span)))
  return function post(buf, img) {
    const d = buf.d
    const out = img.data
    for (let i = 0, j = 0, q = 0; i < W * H; i++, j += 3, q += 4) {
      const m = mask[i] * exposure
      const dt = dither[i]
      for (let c = 0; c < 3; c++) {
        let v = shoulder(base[j + c] + d[j + c] * m)
        if (v < 0) v = 0
        const f = v * N
        const k = f | 0
        const s = lut[k] + (lut[k + 1] - lut[k]) * (f - k) + dt
        out[q + c] = s // Uint8ClampedArray rounds and clamps
      }
      out[q + 3] = 255
    }
  }
}

// ================================================================ flat print toolkit (canvas 2D)
// Strict palette for the print-style loops: flat fills only, no gradients or glow.
export const INK = {
  cobalt: '#15207E', // main ground
  navy: '#010D6E', // shadow / depth
  sky: '#4E90F6',
  cream: '#FEF1D0',
  sun: '#F7C548', // sparingly
}
export const rgba = (hexStr, a) => {
  const n = parseInt(hexStr.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

// Static film grain: the same pattern every frame (so it costs almost nothing where the picture is still),
// monochrome, added in 8-bit steps. amount = standard deviation in 8-bit steps (3 gives roughly 5%
// peak-to-peak contrast). cell = grain size in px: the noise is generated at 1/cell resolution and
// bilinearly upsampled, which looks like print grain but is far cheaper to encode than per-pixel noise.
export function makeGrain({ amount = 3, seed = 4242, cell = 2 } = {}) {
  const rnd = mulberry32(seed)
  const gw = Math.ceil(W / cell) + 2
  const gh = Math.ceil(H / cell) + 2
  const n = new Float32Array(gw * gh)
  for (let i = 0; i < n.length; i++) n[i] = gauss(rnd)
  const g = new Float32Array(W * H)
  let ss = 0
  for (let y = 0; y < H; y++) {
    const fy = y / cell
    const y0 = Math.floor(fy)
    const ty = fy - y0
    for (let x = 0; x < W; x++) {
      const fx = x / cell
      const x0 = Math.floor(fx)
      const tx = fx - x0
      const i = y0 * gw + x0
      const v = (n[i] * (1 - tx) + n[i + 1] * tx) * (1 - ty) + (n[i + gw] * (1 - tx) + n[i + gw + 1] * tx) * ty
      g[y * W + x] = v
      ss += v * v
    }
  }
  const k = amount / Math.sqrt(ss / (W * H) || 1)
  for (let i = 0; i < g.length; i++) g[i] *= k
  return function apply(ctx) {
    if (!amount) return
    const img = ctx.getImageData(0, 0, W, H)
    const d = img.data
    for (let i = 0, q = 0; i < W * H; i++, q += 4) {
      const v = g[i]
      d[q] += v
      d[q + 1] += v
      d[q + 2] += v
    }
    ctx.putImageData(img, 0, 0)
  }
}

// Halftone disc: dots on a grid rotated by `angle` and anchored to the disc centre (so the screen moves
// with the disc). shade(d) in [0,1] gives the ink coverage at normalised distance d (0 .. 1). With
// light = [lx, ly] (in units of R), d is measured from that highlight point instead of the centre.
export function halftoneDisc(ctx, cx, cy, R, color, { pitch = 6, angle = Math.PI / 4, shade = (d) => 1 - d * d, scale = 1, light = null } = {}) {
  const hx = light ? cx + light[0] * R : cx
  const hy = light ? cy + light[1] * R : cy
  const hr = light ? R * (1 + Math.hypot(light[0], light[1])) : R
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const n = Math.ceil(R / pitch) + 1
  ctx.fillStyle = color
  ctx.beginPath()
  for (let j = -n; j <= n; j++) {
    for (let i = -n; i <= n; i++) {
      const lx = i * pitch
      const ly = j * pitch
      const x = cx + lx * ca - ly * sa
      const y = cy + lx * sa + ly * ca
      if (Math.hypot(x - cx, y - cy) > R) continue
      const cov = clamp(shade(Math.hypot(x - hx, y - hy) / hr), 0, 1)
      const r = 0.5 * pitch * Math.sqrt(cov) * 1.1 * scale
      if (r < 0.35) continue
      ctx.moveTo(x + r, y)
      ctx.arc(x, y, r, 0, TAU)
    }
  }
  ctx.fill()
}

// Four-point sparkle star (flat).
export function star4(ctx, x, y, r, color, inner = 0.26) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 - Math.PI / 2
    const rr = k % 2 === 0 ? r : r * inner
    const px = x + rr * Math.cos(a)
    const py = y + rr * Math.sin(a)
    if (k === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

// Smooth organic blob outline (cow-print spot) as a closed path through radial noise samples.
export function blobPath(ctx, cx, cy, r, n3, seed, { wobble = 0.35, rot = 0, pts = 18, ox = 0, oy = 0 } = {}) {
  const P = []
  for (let k = 0; k < pts; k++) {
    const a = (k / pts) * TAU
    const rr = r * (1 + wobble * n3(Math.cos(a) * 0.9 + ox, Math.sin(a) * 0.9 + oy, seed))
    P.push([cx + rr * Math.cos(a + rot), cy + rr * Math.sin(a + rot)])
  }
  ctx.moveTo((P[0][0] + P[pts - 1][0]) / 2, (P[0][1] + P[pts - 1][1]) / 2)
  for (let k = 0; k < pts; k++) {
    const a = P[k]
    const b = P[(k + 1) % pts]
    ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
  }
  ctx.closePath()
}
