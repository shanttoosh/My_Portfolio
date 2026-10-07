import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { onVelocity } from '../motion/velocity'

/**
 * Content that moves right to left without end: the row is rendered twice and slid by half its width with a
 * CSS animation, so it runs on the compositor. It only runs while on screen, pauses under the cursor, speeds
 * up and leans with the scroll speed, and settles back when the page stops.
 */
export function Ticker({ children, seconds = 40, className = '', label }: { children: ReactNode; seconds?: number; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // The second copy is only there to close the loop: keep it out of the tab order.
    el.querySelectorAll('.tk-copy')[1]?.setAttribute('inert', '')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-live', !!e?.isIntersecting))
    io.observe(el)
    const track = el.querySelector<HTMLElement>('.tk-track')
    // Speed and lean change in steps, not every frame: each change re-sends the animation to the compositor.
    let rate = 1
    let skew = 0
    const off = onVelocity((v) => {
      if (!el.hasAttribute('data-live') || !track) return
      const nextRate = v === 0 ? 1 : 1 + Math.round(Math.min(4, Math.abs(v) / 400) * 2) / 2
      const nextSkew = v === 0 ? 0 : Math.round(Math.max(-6, Math.min(6, -v / 300)))
      if (nextRate !== rate) {
        rate = nextRate
        for (const a of track.getAnimations()) a.playbackRate = rate
      }
      if (nextSkew !== skew) {
        skew = nextSkew
        el.style.transform = skew ? `skewX(${skew}deg)` : ''
      }
    })
    return () => {
      io.disconnect()
      off()
    }
  }, [])

  return (
    <div className={`tk ${className}`} ref={ref} aria-label={label} role={label ? 'group' : undefined}>
      <div className="tk-track" style={{ '--dur': `${seconds}s` } as CSSProperties}>
        <div className="tk-copy">{children}</div>
        <div className="tk-copy" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
