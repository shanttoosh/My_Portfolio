import { useEffect, useRef } from 'react'

const GLYPHS = '01<>/[]{}#$%&*+=_~ABCDEFXYZ'
const DURATION = 700

/**
 * A short mono label that scrambles into place the first time it scrolls into view, the way Warp and other
 * developer sites set their captions. Only the label's own text node changes, for well under a second.
 */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    const node = el?.firstChild
    if (!el || !(node instanceof Text) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / DURATION)
          const settled = Math.floor(p * text.length)
          let out = text.slice(0, settled)
          for (let i = settled; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
          node.nodeValue = out
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      node.nodeValue = text
    }
  }, [text])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
