import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'

/** A left-to-right pipeline of steps. Used for project and experience architecture previews. */
export function Flow({ steps, active, compact }: { steps: string[]; active?: number; compact?: boolean }) {
  return (
    <ol className={`flow ${compact ? 'flow-compact' : ''}`} aria-label="Pipeline">
      {steps.map((s, i) => (
        <Fragment key={s}>
          <li className={`flow-step ${active !== undefined && i <= active ? 'is-on' : ''}`}>{s}</li>
          {i < steps.length - 1 && (
            <li className="flow-arrow" aria-hidden>
              <ArrowRight size={12} />
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  )
}

export function Tags({ items, max }: { items: string[]; max?: number }) {
  const shown = max ? items.slice(0, max) : items
  return (
    <ul className="tags">
      {shown.map((t) => (
        <li key={t}>{t}</li>
      ))}
      {max && items.length > max && <li className="tags-more">+{items.length - max}</li>}
    </ul>
  )
}
