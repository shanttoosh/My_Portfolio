/**
 * How much motion and GPU work this device can afford.
 * - low: old or software GPUs, little memory, data saver. Native scrolling, no WebGL, CSS-only effects.
 * - mid: most laptops and phones. Smooth scrolling and scroll-scrubbed builds, no real-time 3D.
 * - high: strong desktop GPUs. May add the live 3D stage.
 */
export type Tier = 'low' | 'mid' | 'high'

/** GPUs that cannot hold 60fps with a full-screen WebGL layer (2011-2014 Intel, early mobile, software). */
const WEAK_GPU =
  /swiftshader|llvmpipe|softpipe|software|microsoft basic|intel\(r\) (hd graphics( [2-5]\d{3})?|gma)(?![\d ]*(5[2-9]\d|6\d\d))\b|mali-(4\d\d|t[678]\d\d)|adreno \(tm\) [2-5]\d\d|powervr sgx/i

const STRONG_GPU = /nvidia|geforce|quadro|rtx|radeon (rx|pro)|apple (m\d|gpu)|iris\(r\) xe|intel\(r\) arc|adreno \(tm\) [67]\d\d|mali-g(7\d|[1-9]\d\d)/i

function gpuRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) return 'none'
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return name
  } catch {
    return 'none'
  }
}

interface NavigatorHints {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

/** A first guess from the hardware. The frame probe below can lower it. */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'mid'
  const nav = navigator as Navigator & NavigatorHints
  const gpu = gpuRenderer()
  const cores = nav.hardwareConcurrency || 4
  const memory = nav.deviceMemory ?? 8
  if (gpu === 'none' || WEAK_GPU.test(gpu) || cores <= 2 || memory <= 2 || nav.connection?.saveData) return 'low'
  const touch = window.matchMedia('(pointer: coarse)').matches
  if (!touch && STRONG_GPU.test(gpu) && cores >= 6 && memory >= 8) return 'high'
  return 'mid'
}

/**
 * Watches real frame times for a moment after load. If the device cannot hold a steady frame rate even
 * with the page idle, anything heavier than the base experience would stutter, so the tier drops.
 */
export function probeFrames(durationMs = 1500): Promise<{ avg: number; p90: number }> {
  return new Promise((resolve) => {
    const frames: number[] = []
    let last = performance.now()
    const start = last
    const step = (t: number) => {
      frames.push(t - last)
      last = t
      if (t - start < durationMs) requestAnimationFrame(step)
      else {
        const sorted = frames.slice(3).sort((a, b) => a - b)
        const avg = sorted.reduce((a, b) => a + b, 0) / Math.max(1, sorted.length)
        resolve({ avg, p90: sorted[Math.floor(sorted.length * 0.9)] ?? avg })
      }
    }
    requestAnimationFrame(step)
  })
}
