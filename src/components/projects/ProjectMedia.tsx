import { Expand, Lock, Maximize2, Pause, Play, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useDemoPlayback } from '../../hooks/useDemoPlayback'
import type { ProjectThumbnail } from '../../types'

type Variant = 'card' | 'inline' | 'theatre'

interface Props {
  shot: ProjectThumbnail
  /** Project name, for the controls' labels. */
  name: string
  /** Where the app runs, shown in the window's address bar and linked; its repository when it is not deployed. */
  url?: string
  /** Whether `url` is a live deployment (LIVE) or the code (DEMO RECORDING). */
  isLive?: boolean
  /** Whether this recording may run now (the card on top of the stack; always true in a dialog). */
  active: boolean
  variant?: Variant
  /** Open the larger theatre view (cards only). */
  onExpand?: (at: number) => void
  /** Start the recording here, in seconds (the theatre picks up where the card was). */
  startAt?: number
  /** Theatre only: switch the whole screen over to the recording. */
  onFullscreen?: () => void
  /** Theatre only: close it. */
  onClose?: () => void
}

const chapterAt = (chapters: { t: number }[], time: number) => {
  let k = 0
  chapters.forEach((c, i) => {
    if (time + 0.05 >= c.t) k = i
  })
  return k
}

/**
 * A recorded run of the project in a plain browser window whose bar shows whether the app is live and its real
 * address; under it, one line on what the current step shows, and a step track that fills as the recording plays
 * and seeks when clicked. Flat surfaces and 1px borders only: no glow, no rounded clipping of the video.
 *
 * Performance rules (measured on an integrated GPU): the video downloads nothing until it first plays, runs
 * only once the page has been still for 0.6 s, holds while anything scrolls, and never runs in a hidden tab.
 * Chapter tracking listens to the video's own timeupdate (about 4 per second) and re-renders only when the
 * chapter changes; the rail fill is a CSS animation, so nothing runs per frame.
 */
export function ProjectMedia({ shot, name, url, isLive = false, active, variant = 'card', onExpand, startAt = 0, onFullscreen, onClose }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const demo = useDemoPlayback(active)
  const chapters = shot.chapters ?? []
  const duration = shot.duration ?? 0
  const [live, setLive] = useState(false)
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(() => chapterAt(chapters, startAt))
  // Bumps on every chapter change or seek, so the rail fill restarts from the right point.
  const [fill, setFill] = useState({ key: 0, offset: Math.max(0, startAt - (chapters[chapterAt(chapters, startAt)]?.t ?? 0)) })

  useEffect(() => {
    img.current?.decode().catch(() => {})
  }, [shot.poster])

  useEffect(() => {
    const v = video.current
    if (v && startAt > 0) v.currentTime = startAt
  }, [startAt])

  // Play / hold rules.
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (!demo.play) {
      v.pause()
      return
    }
    v.muted = true
    let t = 0
    const resume = () => {
      t = 0
      if (!document.hidden) v.play().catch(() => {})
    }
    const onScroll = () => {
      if (!t) v.pause()
      clearTimeout(t)
      t = window.setTimeout(resume, 600)
    }
    const onVisibility = () => (document.hidden ? v.pause() : resume())
    // A card usually becomes the active one mid-scroll, so even the first start waits for the page to settle.
    t = window.setTimeout(resume, variant === 'card' ? 600 : 80)
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(t)
      v.pause()
    }
  }, [demo.play, variant])

  // Chapter tracking from the video's own clock.
  useEffect(() => {
    const v = video.current
    if (!v || !chapters.length) return
    let current = step
    const sync = () => {
      const k = chapterAt(chapters, v.currentTime)
      if (k !== current) {
        current = k
        setStep(k)
        setFill((f) => ({ key: f.key + 1, offset: Math.max(0, v.currentTime - (chapters[k]?.t ?? 0)) }))
      }
    }
    const onSeeked = () => {
      current = chapterAt(chapters, v.currentTime)
      setStep(current)
      setFill((f) => ({ key: f.key + 1, offset: Math.max(0, v.currentTime - (chapters[current]?.t ?? 0)) }))
    }
    const on = () => setRunning(true)
    const off = () => setRunning(false)
    v.addEventListener('timeupdate', sync)
    v.addEventListener('seeked', onSeeked)
    v.addEventListener('playing', on)
    v.addEventListener('pause', off)
    v.addEventListener('waiting', off)
    return () => {
      v.removeEventListener('timeupdate', sync)
      v.removeEventListener('seeked', onSeeked)
      v.removeEventListener('playing', on)
      v.removeEventListener('pause', off)
      v.removeEventListener('waiting', off)
    }
    // The chapter list is static per recording; `step` only seeds the local copy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot.poster])

  const seek = (i: number) => {
    const v = video.current
    const c = chapters[i]
    if (!v || !c) return
    v.currentTime = c.t + 0.02
    demo.resume()
  }

  const lengthOf = (i: number) => (chapters[i + 1]?.t ?? duration) - (chapters[i]?.t ?? 0)
  // Until the recording's first frame shows, the caption and track describe the poster still instead. The
  // theatre picks up where the card was, so it starts on that step.
  const posterStep = Math.max(0, chapters.findIndex((c) => c.label === shot.posterChapter))
  const shown = live || startAt > 0 ? step : posterStep
  const chapter = chapters[shown]
  const host = url?.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div className={`media media-${variant}`} data-running={running || undefined}>
      <figure className="media-window">
        <figcaption className="media-bar">
          <span className={isLive ? 'media-live' : 'media-live is-rec'}>
            <i aria-hidden />
            {isLive ? 'Live' : 'Demo recording'}
          </span>
          {url && host && (
            <a className="media-url" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${isLive ? 'Open' : 'Code for'} ${name}: ${host}`}>
              <Lock size={11} aria-hidden />
              <span>{host}</span>
            </a>
          )}
          {shot.video && (
            <span className="media-ctl">
              <button type="button" className="media-btn" onClick={demo.toggle} aria-label={`${demo.paused ? 'Play' : 'Pause'} the ${name} demo`}>
                {demo.paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
              </button>
              {onExpand && (
                <button type="button" className="media-btn" onClick={() => onExpand(video.current?.currentTime ?? 0)} aria-label={`Watch the ${name} demo larger`}>
                  <Maximize2 size={12} aria-hidden />
                </button>
              )}
              {onFullscreen && (
                <button type="button" className="media-btn" onClick={onFullscreen} aria-label="Full screen">
                  <Expand size={12} aria-hidden />
                </button>
              )}
              {onClose && (
                <button type="button" className="media-btn" onClick={onClose} aria-label="Close">
                  <X size={13} aria-hidden />
                </button>
              )}
            </span>
          )}
        </figcaption>
        <div className="media-screen">
          <img ref={img} src={shot.poster} alt={shot.alt} width={960} height={666} fetchPriority={variant === 'card' ? 'low' : 'high'} decoding="async" />
          {shot.video && (
            <video
              ref={video}
              className={live ? 'is-live' : undefined}
              muted
              loop
              playsInline
              preload="none"
              disablePictureInPicture
              disableRemotePlayback
              aria-hidden
              onPlaying={() => setLive(true)}
            >
              <source src={shot.video.mp4} type="video/mp4" />
              <source src={shot.video.webm} type="video/webm" />
            </video>
          )}
          {onExpand && shot.video && (
            <button type="button" className="media-open" onClick={() => onExpand(video.current?.currentTime ?? 0)} tabIndex={-1} aria-hidden>
              <Maximize2 size={14} /> Watch larger
            </button>
          )}
        </div>
      </figure>
      {chapter && (
        <div className="media-caption">
          <p className="media-step">
            <b>{String(shown + 1).padStart(2, '0')}</b>
            {chapter.label}
          </p>
          {chapter.caption && (
            <p className="media-say" key={shown}>
              {chapter.caption}
            </p>
          )}
        </div>
      )}
      {chapters.length > 0 && (
        <ol className="media-rail" aria-label={`${name} demo chapters`}>
          {chapters.map((c, i) => (
            <li key={c.label} className={i === shown ? 'is-on' : i < shown ? 'is-done' : undefined}>
              <button type="button" onClick={() => seek(i)} aria-label={`Jump to ${c.label}`} aria-current={i === shown ? 'step' : undefined}>
                <span className="rail-track" aria-hidden>
                  <span
                    className="rail-fill"
                    key={i === shown ? `on-${fill.key}` : 'off'}
                    style={i === shown ? ({ animationDuration: `${Math.max(0.1, lengthOf(i))}s`, animationDelay: `-${(shown === step ? fill.offset : 0).toFixed(2)}s` } as CSSProperties) : undefined}
                  />
                </span>
                <span className="rail-label">{c.label}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
