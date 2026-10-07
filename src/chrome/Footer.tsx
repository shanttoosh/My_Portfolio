import { Roll } from '../blocks/Roll'
import { Ticker } from '../blocks/Ticker'
import { site } from '../config/site'

/** The sign-off: the name running past, and the links. */
export function Footer() {
  return (
    <footer className="foot">
      <Ticker seconds={28} className="foot-ticker">
        {['Shanttoosh V.', 'AI engineer', 'LLM applications', 'Agents', 'Backend systems', 'Chennai, India'].map((w) => (
          <span key={w} className="foot-word">
            {w}
          </span>
        ))}
      </Ticker>
      <div className="wrap foot-row">
        <span>&copy; 2026 {site.name} · AI engineer · Chennai, India</span>
        <nav aria-label="Elsewhere">
          <a className="u-link" href={`mailto:${site.email}`}>
            <Roll>Email</Roll>
          </a>
          <a className="u-link" href={site.links.github} target="_blank" rel="noopener noreferrer">
            <Roll>GitHub</Roll>
          </a>
          <a className="u-link" href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
            <Roll>LinkedIn</Roll>
          </a>
          <a className="u-link" href={site.links.resume} target="_blank" rel="noopener noreferrer">
            <Roll>Resume</Roll>
          </a>
        </nav>
      </div>
    </footer>
  )
}
