import { Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sections } from '../config/site'
import { go } from '../lib/nav'
import { useUi } from '../store/ui'

/** Floating white pill at the bottom: the chapter you are in, and a menu to jump to any other. */
export function ChapterPill() {
  const section = useUi((s) => s.section)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = sections.find((s) => s.id === section) ?? sections[0]

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <nav className="chapter-pill" ref={ref} aria-label="Chapters">
      {open && (
        <div className="menu up" role="menu">
          {sections.map((s, i) => (
            <a
              key={s.id}
              role="menuitem"
              href={`#${s.id}`}
              aria-current={section === s.id ? 'true' : undefined}
              onClick={(e) => {
                setOpen(false)
                go(s.id, e)
              }}
            >
              {s.nav}
              <small>{String(i).padStart(2, '0')}</small>
            </a>
          ))}
        </div>
      )}
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <span>{current?.nav}</span>
        <span className="dots" aria-hidden>
          <Menu size={14} />
        </span>
      </button>
    </nav>
  )
}
