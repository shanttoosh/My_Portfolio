import { lazy, startTransition, Suspense, useEffect, useState, type ComponentType } from 'react'
import { ChapterPill } from './chrome/ChapterPill'
import { Footer } from './chrome/Footer'
import { TopBar } from './chrome/TopBar'
import { env } from './config/env'
import { sections } from './config/site'
import { useReducedMotion } from './hooks/useReducedMotion'
import { probeFrames } from './lib/device'
import { useRoute } from './lib/router'
import { scrollToId } from './lib/scroll'
import { useEditionsMotion } from './motion/useEditionsMotion'
import { usePointerFx } from './motion/usePointerFx'
import { Intro } from './sections/Intro'
import { useUi } from './store/ui'

type Chapter = ComponentType<{ reduced: boolean }>

/**
 * The chapters after the hero, in page order. Each is its own chunk: the hero ships alone, and the rest
 * download in parallel once it has painted.
 */
const loaders: (() => Promise<{ default: Chapter }>)[] = [
  () => import('./sections/Projects').then((m) => ({ default: m.Projects })),
  () => import('./sections/Experience').then((m) => ({ default: m.Experience })),
  () => import('./sections/Skills').then((m) => ({ default: m.Skills })),
  () => import('./sections/Contact').then((m) => ({ default: m.Contact })),
]
const CHAPTERS = loaders.map((load) => lazy(load))

const CaseStudyModal = lazy(() => import('./components/projects/CaseStudyModal').then((m) => ({ default: m.CaseStudyModal })))
const DemoModal = lazy(() => import('./components/demos/DemoModal').then((m) => ({ default: m.DemoModal })))

export default function App() {
  const reduced = useReducedMotion()
  const route = useRoute()
  const smooth = useUi((s) => s.smooth)
  // The hero paints first; then the other chapters download together and are built one per idle moment,
  // inside transitions, so React can yield between slices. Scrolling or a key press hurries it along.
  const [built, setBuilt] = useState(0)
  const full = built >= CHAPTERS.length
  useEffect(() => {
    let alive = true
    let timer = 0
    let idleId = 0
    let started = false
    const next = () => {
      if (!alive) return
      startTransition(() => {
        setBuilt((n) => {
          const m = n + 1
          if (m < CHAPTERS.length) schedule()
          return m
        })
      })
    }
    const schedule = () => {
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(next, { timeout: 300 })
      else timer = setTimeout(next, 16) as unknown as number
    }
    const start = () => {
      if (started) return
      started = true
      clearTimeout(timer)
      for (const load of loaders) void load()
      schedule()
    }
    // Start right after the hero's first paint: its intro runs on the compositor, so building the chapters
    // now does not hold it back, and the work is done before the visitor is likely to scroll.
    const first = requestAnimationFrame(() => requestAnimationFrame(start))
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    for (const e of events) window.addEventListener(e, start, { once: true, passive: true })
    return () => {
      alive = false
      cancelAnimationFrame(first)
      clearTimeout(timer)
      if (idleId) window.cancelIdleCallback(idleId)
      for (const e of events) window.removeEventListener(e, start)
    }
  }, [])
  useEditionsMotion(reduced, smooth, full)
  usePointerFx(reduced)

  // Confirm the hardware guess with real frame times once the page has settled.
  useEffect(() => {
    document.documentElement.dataset.tier = useUi.getState().tier
    let alive = true
    const run = () =>
      window.setTimeout(async () => {
        let { avg, p90 } = await probeFrames()
        // One busy moment (other tabs loading, the chapters still building) can make a probe look slow, and
        // what it decides lasts the whole visit; so a slow reading only counts if a second one, a few seconds
        // later, agrees. The better of the two is used.
        if (alive && (avg > 21 || p90 > 30)) {
          await new Promise((done) => window.setTimeout(done, 4000))
          if (!alive) return
          const again = await probeFrames()
          if (again.avg < avg) ({ avg, p90 } = again)
        }
        if (!alive) return
        const { tier: now, setTier, setSmooth } = useUi.getState()
        // Smooth scrolling stays unless the device cannot even hold ~30fps with the page idle.
        if (avg > 33 || p90 > 50) setSmooth(false)
        if (now === 'low' || (avg < 21 && p90 < 30)) return
        setTier(now === 'high' ? 'mid' : 'low')
      }, 1200)
    if (document.readyState === 'complete') run()
    else window.addEventListener('load', run, { once: true })
    return () => {
      alive = false
      window.removeEventListener('load', run)
    }
  }, [])

  // A chapter link in the address bar (#experience): land on it once it has been built.
  useEffect(() => {
    if (env.routerMode === 'hash' || !full) return
    const id = window.location.hash.slice(1)
    if (!sections.some((s) => s.id === id)) return
    let tries = 0
    const t = window.setInterval(() => {
      if (document.getElementById(id) || ++tries > 20) {
        clearInterval(t)
        void scrollToId(id, 0.01)
      }
    }, 120)
    return () => clearInterval(t)
  }, [full])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopBar />
      <main id="main" tabIndex={-1}>
        <Intro />
        {CHAPTERS.slice(0, built).map((C, i) => (
          <Suspense key={i} fallback={null}>
            <C reduced={reduced} />
          </Suspense>
        ))}
      </main>
      <Footer />
      <ChapterPill />
      {route.name !== 'home' && (
        <Suspense fallback={null}>{route.name === 'project' ? <CaseStudyModal key={route.slug} slug={route.slug} /> : <DemoModal key={route.demoId} demoId={route.demoId} />}</Suspense>
      )}
    </>
  )
}
