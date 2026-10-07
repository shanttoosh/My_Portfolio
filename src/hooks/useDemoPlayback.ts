import { useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/** Autoplay is opt-out: no motion for reduced-motion users, and no video download on a data saver. */
function useAutoplayAllowed(): boolean {
  const reduced = useReducedMotion()
  const saveData = typeof navigator !== 'undefined' && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
  return !reduced && !saveData
}

/**
 * Whether a demo video should run, plus the visitor's own pause. Autoplay starts paused where it is not
 * allowed, and any choice the visitor makes wins over the default.
 */
export function useDemoPlayback(active: boolean) {
  const allowed = useAutoplayAllowed()
  const [choice, setChoice] = useState<'play' | 'pause' | null>(null)
  const paused = choice ? choice === 'pause' : !allowed
  return {
    play: active && !paused,
    paused,
    toggle: () => setChoice(paused ? 'play' : 'pause'),
    /** The visitor asked for the video (a chapter, the theatre): play it even where autoplay is off. */
    resume: () => setChoice('play'),
  }
}
