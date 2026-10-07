import { env } from '../config/env'
import type { SectionId } from '../types'
import { scrollToId } from './scroll'

export function go(id: SectionId, e?: { preventDefault: () => void }): void {
  e?.preventDefault()
  void scrollToId(id)
  if (env.routerMode === 'hash') return
  const base = window.location.pathname + window.location.search
  history.replaceState(history.state, '', id === 'intro' ? base : `${base}#${id}`)
}

