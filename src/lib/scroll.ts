import type Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null): void {
  lenis = instance
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Scrolls to a chapter; its header leaves room for the top bar, so it lands with the title at the top. */
export function scrollToId(id: string, duration = 1.25): Promise<void> {
  const el = document.getElementById(id)
  if (!el) return Promise.resolve()
  const top = id === 'intro' ? 0 : el.getBoundingClientRect().top + window.scrollY
  if (lenis) {
    return new Promise((resolve) => {
      lenis?.scrollTo(top, { duration, onComplete: () => resolve() })
    })
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  return new Promise((resolve) => setTimeout(resolve, reduced ? 0 : 700))
}

export function lockScroll(locked: boolean): void {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.classList.toggle('scroll-locked', locked)
}
