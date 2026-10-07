// latent-space (Assistant): an organic cow-print pattern of cream blobs on cobalt that slowly morph,
// merge and split like clusters in a latent space (metaballs on sine paths with integer frequencies),
// over a smaller set of sky blobs. Blobs carry a navy print-offset shadow, and a static halftone screen
// shades their rims. Edges are anti-aliased from the field gradient. Seamless: everything is periodic.
import { W, H, FRAMES, TAU, mulberry32, makeNoise, clamp } from '../lib/core.js'

const hexRGB = (h) => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function create() {
  const rnd = mulberry32(0x1a81)
  const { n3 } = makeNoise(8181)
  const COB = hexRGB('#15207E')
  const NAV = hexRGB('#010D6E')
  const SKY = hexRGB('#4E90F6')
  const CRE = hexRGB('#FEF1D0')

  function makeBalls(n, xr, yr, rmin, rmax) {
    const b = []
    for (let k = 0; k < n; k++) {
      b.push({
        x: W * (xr[0] + rnd() * (xr[1] - xr[0])), y: H * (yr[0] + rnd() * (yr[1] - yr[0])), r: rmin + rnd() * (rmax - rmin),
        ax: 35 + rnd() * 70, ay: 25 + rnd() * 50, kx: rnd() < 0.25 ? 2 : 1, ky: rnd() < 0.25 ? 2 : 1, px: rnd() * TAU, py: rnd() * TAU, pr: rnd() * TAU,
      })
    }
    return b
  }
  const cream = makeBalls(13, [0.1, 1.02], [0.06, 0.96], 34, 80)
  const sky = makeBalls(5, [0.25, 1.0], [0.1, 0.9], 22, 40)

  // static low-frequency noise that roughens the blob edges as they drift through it
  const S = 2
  const NW = W / S
  const NH = H / S
  const noise = new Float32Array(NW * NH)
  for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) noise[y * NW + x] = 0.28 * n3(x * S * 0.008, y * S * 0.008, 3.3) + 0.035 * n3(x * S * 0.022, y * S * 0.022, 9.1)

  // static halftone screen (45 degrees, 7 px): distance of each pixel to its cell centre
  const PITCH = 7
  const screen = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = (x + y) / Math.SQRT2 / PITCH
      const v = (x - y) / Math.SQRT2 / PITCH
      const du = u - Math.round(u)
      const dv = v - Math.round(v)
      screen[y * W + x] = Math.hypot(du, dv) * PITCH
    }
  }

  const fC = new Float32Array(W * H)
  const fS = new Float32Array(W * H)
  function field(out, balls, p) {
    const P = balls.map((b) => [b.x + b.ax * Math.sin(b.kx * p + b.px), b.y + b.ay * Math.cos(b.ky * p + b.py), (b.r * (1 + 0.12 * Math.sin(p + b.pr))) ** 2])
    for (let y = 0; y < H; y++) {
      const nrow = (y >> 1) * NW
      for (let x = 0; x < W; x++) {
        let f = 0
        for (let k = 0; k < P.length; k++) {
          const dx = x - P[k][0]
          const dy = y - P[k][1]
          f += P[k][2] / (dx * dx + dy * dy + 1)
        }
        out[y * W + x] = f + noise[nrow + (x >> 1)]
      }
    }
  }
  // anti-aliased coverage of {f > 1} at pixel i using the local gradient
  function cov(f, x, y) {
    const i = y * W + x
    const v = f[i] - 1
    const gx = x > 0 && x < W - 1 ? (f[i + 1] - f[i - 1]) * 0.5 : 0
    const gy = y > 0 && y < H - 1 ? (f[i + W] - f[i - W]) * 0.5 : 0
    const g = Math.hypot(gx, gy) + 1e-4
    return clamp(v / g + 0.5, 0, 1)
  }

  let img = null
  function draw(i, ctx) {
    const p = (TAU * i) / FRAMES
    field(fC, cream, p)
    field(fS, sky, p + 0.0)
    if (!img) img = ctx.createImageData(W, H)
    const d = img.data
    const OFF = 7
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const q = (y * W + x) * 4
        let r = COB[0]
        let g = COB[1]
        let b = COB[2]
        // sky blobs (behind)
        const cs = cov(fS, x, y)
        if (cs > 0) {
          r += (SKY[0] - r) * cs
          g += (SKY[1] - g) * cs
          b += (SKY[2] - b) * cs
        }
        // navy offset shadow of the cream blobs
        if (x >= OFF && y >= OFF) {
          const sh = cov(fC, x - OFF, y - OFF)
          if (sh > 0) {
            r += (NAV[0] - r) * sh
            g += (NAV[1] - g) * sh
            b += (NAV[2] - b) * sh
          }
        }
        const cc = cov(fC, x, y)
        if (cc > 0) {
          // light halftone crescent toward the lower right (where the blob shifted up-left would end),
          // kept off the outline so edges stay crisp
          const fv = fC[y * W + x]
          const inner = x + 12 < W && y + 12 < H ? cov(fC, x + 12, y + 12) : 0
          const ink = fv > 1.06 ? 0.3 * (1 - inner) : 0
          const rad = 0.5 * PITCH * Math.sqrt(ink)
          const dot = clamp(rad - screen[y * W + x] + 0.5, 0, 1)
          const cr = CRE[0] + (COB[0] - CRE[0]) * dot
          const cg = CRE[1] + (COB[1] - CRE[1]) * dot
          const cb = CRE[2] + (COB[2] - CRE[2]) * dot
          r += (cr - r) * cc
          g += (cg - g) * cc
          b += (cb - b) * cc
        }
        d[q] = r
        d[q + 1] = g
        d[q + 2] = b
        d[q + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  }

  return { draw, grain: { amount: 2.6 } }
}
