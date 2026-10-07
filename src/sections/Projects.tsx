import { ArrowUpRight, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from '../lib/Link'
import { Roll } from '../blocks/Roll'
import { Chapter } from '../chapter/Chapter'
import { ProjectPreview } from '../components/projects/ProjectPreview'
import { DemoTheatre } from '../components/projects/DemoTheatre'
import { ProjectMedia } from '../components/projects/ProjectMedia'
import { TechLogo, hasLogo } from '../components/ui/Icons'
import { GithubIcon } from '../components/ui/Social'
import { featuredProjects, otherProjects } from '../config/projects'
import { site } from '../config/site'
import { thumbnails } from '../config/thumbnails'
import type { Project } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One featured project as a full-width case card. The cards stick one after another: each new card slides
 * up over the last, which sinks back and dims, and scrolling up plays it in reverse (see .cases in CSS).
 */
function Case({ p, i, n, active, onExpand }: { p: Project; i: number; n: number; active: boolean; onExpand: (slug: string, at: number) => void }) {
  const metrics = p.caseStudy.metrics
  const shot = thumbnails[p.slug]
  return (
    <article className="wc" aria-labelledby={`case-${p.slug}`} style={{ '--i': i, '--vt': `--c${i}`, '--next': `--c${i + 1}` } as CSSProperties}>
      <div className="wc-in">
        <div className="wc-grid">
          <div className="wc-copy">
            <p className="wc-kicker">
              <span>
                {pad(i + 1)} / {pad(n)}
              </span>
              {p.domain && <em>{p.domain}</em>}
            </p>
            <h3 id={`case-${p.slug}`}>{p.name}</h3>
            <p className="wc-tag">{p.tagline}</p>
            <p className="wc-desc">{p.description}</p>
            {metrics ? (
              <dl className="wc-metrics">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.value}</dt>
                    <dd>{m.label}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              p.caseStudy.result && (
                <p className="wc-result">
                  <span>Result</span>
                  {p.caseStudy.result}
                </p>
              )
            )}
            <ol className="wc-flow" aria-label="How it works">
              {p.flow.map((step, k) => (
                <li key={step} style={{ '--k': k } as CSSProperties}>
                  {step}
                </li>
              ))}
            </ol>
            <ul className="wc-stack" aria-label="Built with">
              {p.technologies.slice(0, 6).map((t) => (
                <li key={t}>
                  {hasLogo(t) && <TechLogo name={t} size={13} />}
                  {t}
                </li>
              ))}
            </ul>
            <div className="wc-actions">
              {p.demoUrl && (
                <a className="btn-solid" href={p.demoUrl} target="_blank" rel="noopener noreferrer" data-magnetic>
                  <Roll>Open live</Roll> <ArrowUpRight size={16} aria-hidden />
                </a>
              )}
              {p.demoId && !p.demoUrl && (
                <Link className="btn-solid" to={`/demos/${p.demoId}`} data-magnetic>
                  <Play size={14} aria-hidden /> <Roll>Try the demo</Roll>
                </Link>
              )}
              {p.githubUrl && (
                <a className="u-link" href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                  Code
                </a>
              )}
              <Link className="u-link" to={`/projects/${p.slug}`}>
                Case study
              </Link>
            </div>
          </div>
          <div className="wc-frame" data-slug={p.slug}>
            {shot ? <ProjectMedia shot={shot} name={p.name} url={p.demoUrl ?? p.githubUrl ?? undefined} isLive={!!p.demoUrl} active={active} onExpand={(at) => onExpand(p.slug, at)} /> : <ProjectPreview project={p} />}
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Which case card is on top: the last one that has slid up past the middle of the screen while still in
 * view. Only that card's demo plays, so stacked cards underneath never decode video. An observer with fine
 * thresholds re-checks whenever a card moves, so there is no scroll listener.
 */
function useActiveCase() {
  const list = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  useEffect(() => {
    const cards = Array.from(list.current?.querySelectorAll<HTMLElement>(':scope > .wc') ?? [])
    if (!cards.length) return
    const pick = () => {
      const h = window.innerHeight
      let on = -1
      cards.forEach((c, k) => {
        const r = c.getBoundingClientRect()
        if (r.top < h * 0.6 && r.bottom > h * 0.25) on = k
      })
      setActive(on)
    }
    const io = new IntersectionObserver(pick, { threshold: Array.from({ length: 21 }, (_, k) => k / 20) })
    cards.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])
  return { list, active }
}

/** The theatre: which card's recording is open large, from where in it, and where its window was on screen. */
function useTheatre() {
  const [theatre, setTheatre] = useState<{ slug: string; at: number; from: DOMRect | null } | null>(null)
  const open = useCallback((slug: string, at: number) => {
    const win = document.querySelector<HTMLElement>(`.wc-frame[data-slug="${slug}"] .media-window`)
    setTheatre({ slug, at, from: win?.getBoundingClientRect() ?? null })
  }, [])
  const close = useCallback(() => setTheatre(null), [])
  return { theatre, open, close }
}

export function Projects() {
  const n = featuredProjects.length
  const { list, active } = useActiveCase()
  const { theatre, open, close } = useTheatre()
  return (
    <Chapter
      id="projects"
      num="01"
      title="Projects"
      sub="Personal projects, experiments and systems I've taken from idea to working application."
      heading="The projects I'd show you first."
      text="These are the ones I went deepest on: architecture, guardrails that keep the AI honest, tests and a proper interface."
      links={
        <a className="u-link" href={site.links.github} target="_blank" rel="noopener noreferrer">
          All my repositories on GitHub
        </a>
      }
    >
      <div className="cases" ref={list}>
        {featuredProjects.map((p, i) => (
          <Case key={p.slug} p={p} i={i} n={n} active={i === active && !theatre} onExpand={open} />
        ))}
      </div>

      <div className="more">
        <div className="more-head" data-reveal>
          <p className="kicker">More of my work</p>
          <h4>Other things I've built.</h4>
          <p className="more-text">Smaller projects, each built for one specific job.</p>
          <a className="btn-line" href={site.links.github} target="_blank" rel="noopener noreferrer" data-magnetic>
            <GithubIcon size={16} /> <Roll>Browse my GitHub</Roll>
          </a>
        </div>
        <ul className="more-grid">
          {otherProjects.map((p) => (
            <li key={p.slug} data-reveal>
              <a className="more-card" href={p.githubUrl ?? site.links.github} target="_blank" rel="noopener noreferrer">
                <span className="more-head-row">
                  <span className="more-name">{p.name}</span>
                  <ArrowUpRight size={16} aria-hidden />
                </span>
                <span className="more-line">{p.blurb ?? p.tagline}</span>
                <span className="more-stack">
                  {p.technologies
                    .filter((t) => hasLogo(t))
                    .slice(0, 3)
                    .map((t) => (
                      <span key={t} className="more-chip">
                        <TechLogo name={t} size={14} />
                        {t}
                      </span>
                    ))}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      {theatre && <DemoTheatre slug={theatre.slug} at={theatre.at} from={theatre.from} onClose={close} />}
    </Chapter>
  )
}
