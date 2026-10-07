import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { lockScroll } from '../../lib/scroll'

interface ModalProps {
  label: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  /** Extra class on the dialog, for layouts such as the video theatre. */
  className?: string
}

export function Modal({ label, onClose, children, wide, className }: ModalProps) {
  const dialog = useRef<HTMLDivElement>(null)

  useEffect(() => {
    lockScroll(true)
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && dialog.current) {
        const nodes = dialog.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
      previous?.focus?.()
    }
  }, [onClose])

  return (
    <div className="modal-root">
      <div className="modal-scrim" onClick={onClose} aria-hidden />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`modal ${wide ? 'modal-wide' : ''} ${className ?? ''}`}
        data-lenis-prevent
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
