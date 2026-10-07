import { useSyncExternalStore } from 'react'
import { env } from '../config/env'

/**
 * A minimal router for the site's three views: the page, a case study over it, or a demo over it. It replaces
 * react-router (about 18 KB gzipped) with the little the components need: navigate and the current route (Link is in
 * Link.tsx). Browser mode uses the History API; hash mode ("#/projects/x", for static hosts that cannot rewrite
 * routes) is chosen with VITE_ROUTER=hash, as before.
 */
export const hashMode = env.routerMode === 'hash'

export type Route = { name: 'home' } | { name: 'project'; slug: string } | { name: 'demo'; demoId: string }

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
let bound = false

function subscribe(listener: () => void): () => void {
  if (!bound) {
    window.addEventListener('popstate', emit)
    window.addEventListener('hashchange', emit)
    bound = true
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function currentPath(): string {
  if (hashMode) {
    const h = window.location.hash
    return h.startsWith('#/') ? h.slice(1) : '/'
  }
  return window.location.pathname || '/'
}

export function matchRoute(path: string): Route {
  const project = /^\/projects\/([^/]+)\/?$/.exec(path)?.[1]
  if (project) return { name: 'project', slug: decodeURIComponent(project) }
  const demo = /^\/demos\/([^/]+)\/?$/.exec(path)?.[1]
  if (demo) return { name: 'demo', demoId: decodeURIComponent(demo) }
  return { name: 'home' }
}

export function useRoute(): Route {
  return matchRoute(useSyncExternalStore(subscribe, currentPath, () => '/'))
}

/** How many entries this visit has pushed, so closing a modal can tell "back" from "home". */
let depth = 0

export function navigate(to: string, { replace = false }: { replace?: boolean } = {}): void {
  const url = hashMode ? `${window.location.pathname}${window.location.search}#${to}` : to
  if (replace) history.replaceState(history.state, '', url)
  else history.pushState({ idx: ++depth }, '', url)
  emit()
}

/** Leaves a modal view: back if the visitor opened it from the page, otherwise to the page itself. */
export function closeView(): void {
  const idx = (history.state as { idx?: number } | null)?.idx ?? 0
  if (idx > 0) history.back()
  else navigate('/', { replace: true })
}
