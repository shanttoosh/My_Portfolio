import { useCallback, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getProject } from '../../config/projects'
import { thumbnails } from '../../config/thumbnails'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { Modal } from '../ui/Modal'
import { ProjectMedia } from './ProjectMedia'

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

/** The transform that puts an element at `to` back where `from` was (FLIP). */
const flip = (from: DOMRect, to: DOMRect) =>
  `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`

/**
 * A project's recorded run in a cinema view: as large as the screen allows, with a full-screen switch for the
 * whole monitor. The window flies out of its card and back into it (FLIP: one element, transform only, so it
 * stays smooth on weak GPUs; a View Transition snapshots the whole page and took over a second here).
 * Rendered into <body>: the stacked cards are transformed, and a fixed overlay inside them would be positioned
 * against the card instead of the screen.
 */
export function DemoTheatre({ slug, at, from, onClose }: { slug: string; at: number; from: DOMRect | null; onClose: () => void }) {
  const project = getProject(slug)
  const shot = thumbnails[slug]
  const root = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const motion = !!from && !prefersReducedMotion()

  useLayoutEffect(() => {
    const win = root.current?.querySelector<HTMLElement>('.media-window')
    if (!motion || !from || !win) return
    const to = win.getBoundingClientRect()
    win.animate([{ transform: flip(from, to), transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }], { duration: 460, easing: EASE })
  }, [motion, from])

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void root.current?.requestFullscreen?.().catch(() => {})
  }, [])

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    const win = root.current?.querySelector<HTMLElement>('.media-window')
    const modal = root.current?.closest('.modal-root')
    if (!motion || !from || !win) return onClose()
    modal?.classList.add('is-out')
    const anim = win.animate([{ transform: 'none', transformOrigin: '0 0' }, { transform: flip(from, win.getBoundingClientRect()), transformOrigin: '0 0' }], {
      duration: 380,
      easing: EASE,
      fill: 'forwards',
    })
    anim.onfinish = onClose
  }, [motion, from, onClose])

  if (!project || !shot) return null
  return createPortal(
    <Modal label={`${project.name}: recorded demo`} onClose={close} className="modal-theatre">
      <div ref={root} className="theatre">
        <ProjectMedia shot={shot} name={project.name} url={project.demoUrl ?? project.githubUrl ?? undefined} isLive={!!project.demoUrl} active variant="theatre" startAt={at} onFullscreen={fullscreen} onClose={close} />
        <p className="sr-only">{shot.alt}</p>
      </div>
    </Modal>,
    document.body,
  )
}
