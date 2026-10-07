import type Lenis from 'lenis'
import { useEffect } from 'react'
import { sections } from '../config/site'
import { setLenis } from '../lib/scroll'
import { useUi } from '../store/ui'
import type { SectionId } from '../types'

/**
 * The page's motion, kept deliberately light: the page always scrolls freely (nothing pins or holds).
 * - Smooth, inertial wheel scrolling (Lenis) on every device that can keep up, weak GPUs included now that the
 *   page leaves the main thread almost idle while scrolling. Touch keeps native scrolling.
 * - Reveals: scroll-driven CSS animations (see design/editions.css); browsers without them get a one-shot fade.
 * - The current chapter, for the chapter pill and the menus.
 */
export function useEditionsMotion(reduced: boolean, smooth: boolean, ready = true): void {
  // Lenis is only downloaded where it is used: reduced motion and devices that cannot keep up never fetch it.
  useEffect(() => {
    if (reduced || !smooth) return
    let alive = true
    let lenis: Lenis | null = null
    let raf = 0
    let running = false
    // The loop only runs while Lenis is moving the page; it wakes on a wheel or a programmatic scroll.
    const loop = (t: number) => {
      if (!lenis) return
      lenis.raf(t)
      if (lenis.isScrolling) raf = requestAnimationFrame(loop)
      else running = false
    }
    const wake = () => {
      if (running || !lenis) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    void import('lenis').then(({ default: Smooth }) => {
      if (!alive) return
      const instance = new Smooth({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true })
      const scrollTo = instance.scrollTo.bind(instance)
      instance.scrollTo = (...args: Parameters<typeof scrollTo>) => {
        scrollTo(...args)
        wake()
      }
      lenis = instance
      setLenis(instance)
    })
    window.addEventListener('wheel', wake, { passive: true })
    return () => {
      alive = false
      window.removeEventListener('wheel', wake)
      cancelAnimationFrame(raf)
      lenis?.destroy()
      setLenis(null)
    }
  }, [reduced, smooth])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) useUi.getState().setSection(e.target.id as SectionId)
      },
      { rootMargin: '-45% 0px -54% 0px' },
    )
    // Chapters arrive one by one after the hero; watch for them.
    const scan = () => {
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el) io.observe(el)
      }
    }
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.getElementById('main') ?? document.body, { childList: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [ready])

  // While the page scrolls, content slides under a still cursor and every element it crosses would run its
  // hover styles (colour transitions are not composited). A transparent shield covers the page until
  // scrolling stops, so the cursor is over the shield instead. Showing it touches one element only.
  useEffect(() => {
    const shield = document.createElement('div')
    shield.className = 'scroll-shield'
    shield.setAttribute('aria-hidden', 'true')
    document.body.appendChild(shield)
    let t = 0
    const onScroll = () => {
      if (!t) shield.style.display = 'block'
      clearTimeout(t)
      t = window.setTimeout(() => {
        t = 0
        shield.style.display = ''
      }, 150)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(t)
      shield.remove()
    }
  }, [])

  // The browser re-checks every scroll-driven animation on every frame, so only blocks within about a screen
  // of the viewport keep theirs: the rest are marked .far, which switches their animations off. A block is
  // switched back on well before it scrolls into view, so the change is never seen. The hero is left alone,
  // because its intro would replay.
  useEffect(() => {
    if (!CSS.supports('animation-timeline: view()')) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle('far', !e.isIntersecting)
      },
      { rootMargin: '120% 0px' },
    )
    let queued = 0
    const scan = () => {
      queued = 0
      document.querySelectorAll('main > section > .ch, main > section > .wrap > *').forEach((el) => io.observe(el))
    }
    scan()
    const mo = new MutationObserver(() => {
      if (!queued) queued = requestAnimationFrame(scan)
    })
    mo.observe(document.getElementById('main') ?? document.body, { childList: true })
    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(queued)
    }
  }, [])

  // Reveals are scroll-driven CSS animations where the browser has them; elsewhere they fade in once here.
  useEffect(() => {
    if (CSS.supports('animation-timeline: view()')) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    let queued = 0
    const scan = () => {
      queued = 0
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))
    }
    scan()
    // Cards added later (a project filter, a route change) are picked up on the next frame.
    const mo = new MutationObserver(() => {
      if (!queued) queued = requestAnimationFrame(scan)
    })
    mo.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(queued)
    }
  }, [])
}
