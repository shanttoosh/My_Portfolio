import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { intro } from '../../config/intro'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { createStackedAlphaRenderer } from '../../lib/stackedAlpha'

type Phase = 'still' | 'playing' | 'paused' | 'ended'
type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number
  cancelVideoFrameCallback?: (handle: number) => void
}

/**
 * Shanttoosh and his robot, cut out and standing on the page beside the name. Shortly after the page has loaded he
 * waves and says hello. Browsers only allow sound after a visitor has interacted with a site, so it tries with
 * sound and otherwise plays silently; the speaker button replays it with sound.
 *
 * Performance: the clip is fetched only once the page has loaded, the canvas is drawn once per decoded frame and
 * never while paused, it holds when scrolled away or the tab is hidden, and there is no autoplay with reduced motion.
 */
export function HeroCharacter() {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const video = useRef<FrameVideo>(null)
  const [phase, setPhase] = useState<Phase>('still')
  const [drawn, setDrawn] = useState(false)
  const [muted, setMuted] = useState(true)

  const ensureSource = (v: HTMLVideoElement) => {
    if (!v.getAttribute('src')) v.src = intro.video
  }

  // Draw each decoded frame into the canvas.
  useEffect(() => {
    const v = video.current
    const c = canvas.current
    if (!v || !c) return
    const renderer = createStackedAlphaRenderer(c, v)
    let handle = 0
    const cancel = () => {
      if (v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(handle)
      else cancelAnimationFrame(handle)
    }
    // One chain at a time: a pause and play, or a seek, never stacks a second loop.
    const schedule = () => {
      cancel()
      handle = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(onFrame) : requestAnimationFrame(onFrame)
    }
    const onFrame = () => {
      if (renderer) {
        renderer.draw()
        setDrawn(true)
      }
      if (!v.paused && !v.ended) schedule()
    }
    const onSeeked = () => onFrame()
    v.addEventListener('play', schedule)
    v.addEventListener('seeked', onSeeked)
    const ro = renderer && new ResizeObserver(() => renderer.resize())
    ro?.observe(c)
    return () => {
      cancel()
      v.removeEventListener('play', schedule)
      v.removeEventListener('seeked', onSeeked)
      ro?.disconnect()
      renderer?.dispose()
    }
  }, [])

  // Start once the page has loaded and the name has risen in: with sound where the browser allows it, else silent.
  useEffect(() => {
    const v = video.current
    if (!v || prefersReducedMotion()) return
    let cancelled = false
    let timer = 0
    const start = () => {
      if (cancelled) return
      ensureSource(v)
      v.muted = false
      v.play()
        .then(() => setMuted(false))
        .catch(() => {
          if (cancelled) return
          v.muted = true
          setMuted(true)
          v.play().catch(() => {})
        })
    }
    const go = () => {
      timer = window.setTimeout(start, 900)
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener('load', go)
    }
  }, [])

  // Hold while scrolled away or while the tab is hidden; carry on when back.
  useEffect(() => {
    const v = video.current
    const el = stage.current
    if (!v || !el) return
    let held = false
    const hold = () => {
      if (!v.paused && !v.ended) {
        held = true
        v.pause()
      }
    }
    const resume = () => {
      if (held && !document.hidden) {
        held = false
        v.play().catch(() => {})
      }
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        if (e.isIntersecting) resume()
        else hold()
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    const onVisibility = () => (document.hidden ? hold() : resume())
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const audible = !muted && phase === 'playing'
  const toggleSound = () => {
    const v = video.current
    if (!v) return
    if (audible) {
      v.muted = true
      setMuted(true)
      return
    }
    // From the top, so the whole line is heard.
    ensureSource(v)
    v.muted = false
    setMuted(false)
    v.currentTime = 0
    v.play().catch(() => {})
  }

  return (
    <div className="hero-char in" style={{ '--d': '0.85s', '--ratio': `${intro.size.width} / ${intro.size.height}` } as CSSProperties}>
      <div className={drawn ? 'hc-stage is-drawn' : 'hc-stage'} ref={stage}>
        <img src={intro.poster} alt={intro.alt} width={intro.size.width} height={intro.size.height} decoding="async" />
        <video
          ref={video}
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPhase('playing')}
          onPause={(e) => setPhase(e.currentTarget.ended ? 'ended' : 'paused')}
          onEnded={() => setPhase('ended')}
        />
        <canvas ref={canvas} aria-hidden />
      </div>
      <div className="hc-line">
        <button type="button" className="hc-sound" onClick={toggleSound} aria-label={audible ? 'Mute my intro' : 'Play my intro with sound'} title={audible ? 'Mute' : 'Play with sound'}>
          {audible ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />}
        </button>
      </div>
    </div>
  )
}
