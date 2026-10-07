import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { hashMode, navigate } from './router'

type LinkProps = { to: string; replace?: boolean; children?: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

/** An in-site link: a real <a href> (so it opens in a new tab with a modifier key), navigating in place otherwise. */
export function Link({ to, replace, children, onClick, ...rest }: LinkProps) {
  return (
    <a
      href={hashMode ? `#${to}` : to}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return
        e.preventDefault()
        navigate(to, { replace })
      }}
    >
      {children}
    </a>
  )
}
