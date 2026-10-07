import type { CSSProperties } from 'react'

/**
 * Text split into words (and optionally letters) so CSS can animate each piece: letters rising out of a mask,
 * or words filling in as you scroll. Screen readers get the plain text once; the split copy is hidden from them.
 */
export function SplitText({ text, by = 'char', mask = false, className = '' }: { text: string; by?: 'char' | 'word'; mask?: boolean; className?: string }) {
  let i = 0
  const words = text.split(' ')
  return (
    <span className={`split ${mask ? 'mask' : ''} ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, wi) => (
          <span key={wi}>
            {wi > 0 && ' '}
            <span className="split-w">
              {by === 'word' ? (
                <span className="split-u" style={{ '--i': i++ } as CSSProperties}>
                  {w}
                </span>
              ) : (
                [...w].map((c, ci) => (
                  <span key={ci} className="split-u" style={{ '--i': i++ } as CSSProperties}>
                    {c}
                  </span>
                ))
              )}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
