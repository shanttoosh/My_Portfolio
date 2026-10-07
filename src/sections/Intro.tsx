import { ArrowRight } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Roll } from '../blocks/Roll'
import { SplitText } from '../blocks/SplitText'
import { ChapterIntro } from '../chapter/Chapter'
import { HeroCharacter } from '../components/intro/HeroCharacter'
import { site } from '../config/site'
import { go } from '../lib/nav'

export function Intro() {
  // Once the letters have risen in, they are free to react to the cursor.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), 1700)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="intro" aria-labelledby="intro-title">
      <div className="cx-hero">
        <div className="cx-spot" aria-hidden />
        <div className="wrap cx-hero-grid">
          <div className="cx-hero-copy">
            <p className="status in" style={{ '--d': '0.05s' } as CSSProperties}>
              <i aria-hidden /> Open to opportunities · {site.locationShort}
            </p>
            <h1 id="intro-title" className={`cx-name ${settled ? 'is-done' : ''}`}>
              <SplitText text="Shanttoosh V." mask />
            </h1>
            <p className="cx-lead in" style={{ '--d': '0.55s' } as CSSProperties}>
              AI engineer building LLM applications, agents and the backends that keep them running.
            </p>
            <div className="cx-actions in" style={{ '--d': '0.7s' } as CSSProperties}>
              <a className="btn-solid" href="#projects" onClick={(e) => go('projects', e)} data-magnetic>
                <Roll>See my projects</Roll> <ArrowRight size={16} aria-hidden />
              </a>
              <a className="btn-line" href="#contact" onClick={(e) => go('contact', e)} data-magnetic>
                <Roll>Get in touch</Roll>
              </a>
            </div>
          </div>
          <HeroCharacter />
        </div>
      </div>

      <div className="wrap">
        <ChapterIntro
          heading={site.statement}
          text={site.intro}
          links={
            <>
              <a className="u-link" href="#projects" onClick={(e) => go('projects', e)}>
                See my projects
              </a>
              <a className="u-link" href={site.links.resume} target="_blank" rel="noopener noreferrer">
                Resume
              </a>
            </>
          }
        />
      </div>
    </section>
  )
}
