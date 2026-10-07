import type { ReactNode } from 'react'
import { Scramble } from '../blocks/Scramble'
import { SplitText } from '../blocks/SplitText'
import { sections } from '../config/site'
import type { SectionId } from '../types'

interface ChapterProps {
  id: SectionId
  /** "01", "02"... shown above the title. */
  num: string
  title: string
  sub: ReactNode
  heading: string
  text: ReactNode
  links?: ReactNode
  children?: ReactNode
}

/** Chapter count after the hero, for the "02 / 04" index. */
const CHAPTERS = sections.length - 1

/**
 * One chapter, set like an engineering console (Linear, Warp): a compact header (index, title and a
 * one-line summary over a hairline grid), the chapter's statement with its notes, then its content. Title
 * letters rise and the statement fills in with the scroll, and both rewind when you scroll back.
 */
export function Chapter({ id, num, title, sub, heading, text, links, children }: ChapterProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <header className="ch">
        <div className="wrap ch-grid">
          <div>
            <span className="ch-index">
              <Scramble text={num} /> <em>/ {String(CHAPTERS).padStart(2, '0')}</em>
            </span>
            <h2 id={`${id}-title`} className="ch-title">
              <SplitText text={title} mask />
            </h2>
          </div>
          <p className="ch-sub" data-reveal>
            {sub}
          </p>
        </div>
      </header>
      <div className="wrap">
        <ChapterIntro heading={heading} text={text} links={links} />
        {children}
      </div>
    </section>
  )
}

export function ChapterIntro({ heading, text, links }: { heading: string; text: ReactNode; links?: ReactNode }) {
  return (
    <div className="intro">
      <h3>
        <SplitText text={heading} by="word" className="fill" />
      </h3>
      <div className="intro-side" data-reveal>
        <p>{text}</p>
        {links && <div className="links">{links}</div>}
      </div>
    </div>
  )
}
