import type { ReactNode } from 'react'
import { Link } from '../../lib/Link'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'sm'

interface Common {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  trailing?: ReactNode
  children: ReactNode
  className?: string
}

const cls = (variant: Variant, size: Size, className?: string) =>
  ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : '', className ?? ''].filter(Boolean).join(' ')

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  children,
  className,
  ...rest
}: Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  return (
    <button type="button" className={cls(variant, size, className)} {...rest}>
      {icon}
      <span>{children}</span>
      {trailing}
    </button>
  )
}

/** External links always open in a new tab with noopener. */
export function LinkButton({
  href,
  to,
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  children,
  className,
  download,
  onClick,
}: Common & { href?: string; to?: string; download?: string | boolean; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {trailing}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={cls(variant, size, className)} onClick={onClick}>
        {content}
      </Link>
    )
  }
  const external = !!href && /^https?:\/\//.test(href)
  return (
    <a
      href={href}
      className={cls(variant, size, className)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      download={download}
      onClick={onClick}
    >
      {content}
    </a>
  )
}
