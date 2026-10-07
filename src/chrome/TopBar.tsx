import { Roll } from '../blocks/Roll'
import { LogoMark } from '../components/ui/Logo'
import { GithubIcon } from '../components/ui/Social'
import { sections, site } from '../config/site'
import { go } from '../lib/nav'
import { useUi } from '../store/ui'

/**
 * Slim bar over everything: the mark and name, the chapters (wide screens; phones use the chapter pill), GitHub and
 * the Resume button, with reading progress along its edge.
 */
export function TopBar() {
  const section = useUi((s) => s.section)
  return (
    <header className="topbar">
      <div className="topbar-left">
        <a className="brand" href="#intro" onClick={(e) => go('intro', e)} aria-label={`${site.name}, back to top`}>
          <LogoMark className="brand-mark" />
          <b>{site.name}</b>
          <span className="hide-sm">Portfolio &rsquo;26</span>
        </a>
        <nav className="top-nav" aria-label="Chapters">
          {sections
            .filter((s) => s.id !== 'intro')
            .map((s) => (
              <a key={s.id} href={`#${s.id}`} aria-current={section === s.id ? 'true' : undefined} onClick={(e) => go(s.id, e)}>
                {s.nav}
              </a>
            ))}
        </nav>
      </div>
      <div className="topbar-right">
        <a className="topbar-link hide-sm" href={site.links.github} target="_blank" rel="noopener noreferrer">
          <GithubIcon size={15} /> GitHub
        </a>
        <a className="pill-btn" href={site.links.resume} target="_blank" rel="noopener noreferrer" data-magnetic>
          <Roll>Resume</Roll>
        </a>
      </div>
      <span className="progress" aria-hidden />
    </header>
  )
}
