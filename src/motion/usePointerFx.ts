import { useEffect } from 'react'

/**
 * Cursor effects, all from one passive pointer listener and at most one style write per frame:
 * - [data-magnetic]: buttons lean toward the cursor (after Dennis Snellenberg) and spring back when it leaves.
 * - .cx-spot: lime dots light up under the cursor across the hero grid.
 * Only on devices with a fine pointer that can hover, and never with reduced motion.
 */
export function usePointerFx(reduced: boolean): void {
  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let raf = 0
    let x = 0
    let y = 0
    let target: Element | null = null
    let mag: HTMLElement | null = null
    let nameLive = false

    const release = () => {
      if (mag) mag.style.transform = ''
      mag = null
    }

    const apply = () => {
      raf = 0
      const m = target?.closest<HTMLElement>('[data-magnetic]') ?? null
      if (mag && mag !== m) mag.style.transform = ''
      mag = m
      if (m) {
        const r = m.getBoundingClientRect()
        const pull = m.dataset.magnetic === 'strong' ? 0.45 : 0.28
        m.style.transform = `translate(${((x - r.left - r.width / 2) * pull).toFixed(1)}px, ${((y - r.top - r.height / 2) * pull * 1.3).toFixed(1)}px)`
      }

      const hero = target?.closest<HTMLElement>('.cx-hero') ?? null
      const spot = document.querySelector<HTMLElement>('.cx-spot')
      if (spot) {
        const owner = spot.parentElement
        if (hero && owner) {
          const r = owner.getBoundingClientRect()
          const sx = x - r.left - 180
          const sy = y - r.top - 180
          spot.style.transform = `translate3d(${sx.toFixed(0)}px, ${sy.toFixed(0)}px, 0)`
          spot.style.backgroundPosition = `${(-sx).toFixed(0)}px ${(-sy).toFixed(0)}px`
          owner.classList.add('is-spot')
        } else owner?.classList.remove('is-spot')
      }

      // The hero name: letters near the cursor lift and turn lime, like iron filings under a magnet.
      const name = document.querySelector<HTMLElement>('.cx-name.is-done')
      if (name) {
        const nr = name.getBoundingClientRect()
        const near = x > nr.left - 160 && x < nr.right + 160 && y > nr.top - 160 && y < nr.bottom + 160
        if (near || nameLive) {
          const cy = nr.top + nr.height / 2
          for (const el of name.querySelectorAll<HTMLElement>('.split-u')) {
            const lr = el.getBoundingClientRect()
            const k = near ? Math.max(0, 1 - Math.hypot(x - (lr.left + lr.width / 2), (y - cy) * 1.4) / 230) : 0
            el.style.setProperty('--k', k.toFixed(3))
          }
          nameLive = near
        }
      }
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      target = e.target as Element
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      target = null
      release()
      document.querySelector('.cx-hero')?.classList.remove('is-spot')
    }
    // Content moves under a still cursor while scrolling; let go of whatever it was over.
    const onScroll = () => {
      if (mag) release()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      release()
    }
  }, [reduced])
}
