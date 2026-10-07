/**
 * Scroll speed in px per second, smoothed and decaying back to zero once scrolling stops. Tickers use it to
 * run faster and lean while the page moves. The loop only runs while there is speed left to report.
 */
type Listener = (v: number) => void

const listeners = new Set<Listener>()
let v = 0
let lastY = 0
let lastT = 0
let raf = 0
let bound = false

function frame(now: number) {
  const y = window.scrollY
  const dt = Math.max(1, now - lastT)
  const instant = ((y - lastY) / dt) * 1000
  lastY = y
  lastT = now
  v += (instant - v) * 0.25
  if (Math.abs(v) < 4 && instant === 0) v = 0
  for (const l of listeners) l(v)
  raf = v === 0 ? 0 : requestAnimationFrame(frame)
}

function onScroll() {
  if (!raf) {
    lastT = performance.now()
    raf = requestAnimationFrame(frame)
  }
}

export function onVelocity(listener: Listener): () => void {
  if (!bound) {
    lastY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    bound = true
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
