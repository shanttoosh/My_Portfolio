import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from '../lib/Link'
import { Ticker } from '../blocks/Ticker'
import { Chapter } from '../chapter/Chapter'
import { TechLogo } from '../components/ui/Icons'
import { experience } from '../config/experience'
import { projects } from '../config/projects'
import { site } from '../config/site'
import { allSkills, skillGroups } from '../config/skills'
import { useUi } from '../store/ui'
import type { SkillUse } from '../types'

const KIND: Record<SkillUse['kind'], string> = { role: 'Job', project: 'Project', portfolio: 'Site', repo: 'GitHub', work: 'Work' }

/** Where a use happened: a job by company name, a project linking to its case study, or a repo on GitHub. */
function UsePlace({ use }: { use: SkillUse }) {
  if (use.kind === 'role') return <strong>{experience.find((e) => e.id === use.ref)?.company ?? use.ref}</strong>
  if (use.kind === 'project') {
    const p = projects.find((x) => x.slug === use.ref)
    return (
      <Link className="u-link" to={`/projects/${use.ref}`}>
        {p?.name ?? use.ref}
      </Link>
    )
  }
  if (use.kind === 'repo') {
    return (
      <a className="u-link" href={`${site.links.github}/${use.ref}`} target="_blank" rel="noopener noreferrer">
        {use.label ?? use.ref}
      </a>
    )
  }
  return <strong>{use.kind === 'portfolio' ? 'This portfolio' : 'Company work'}</strong>
}

const groupOf = (name: string | null) => skillGroups.find((g) => g.skills.some((s) => s.name === name)) ?? skillGroups[0]

/**
 * Every tool in big type with its official logo, in two rows running right to left (the second row outlined
 * and a little slower). Hovering a row pauses it and lifts the tool under the cursor; clicking a tool opens
 * it in the explorer below.
 */
function ToolMarquee() {
  const select = useUi((s) => s.setSelectedSkill)
  const half = Math.ceil(allSkills.length / 2)
  const rows = [allSkills.slice(0, half), allSkills.slice(half)]
  const pick = (name: string) => {
    select(name)
    document.getElementById('tool-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  return (
    <div className="mq" data-reveal>
      {rows.map((row, r) => (
        <Ticker key={r} seconds={[70, 84][r]} className={r ? 'mq-row outline' : 'mq-row'} label={r === 0 ? `All ${allSkills.length} tools I use` : undefined}>
          {row.map((s) => (
            <button key={s.name} type="button" className="mq-item" onClick={() => pick(s.name)}>
              <span className="mq-logo">
                <TechLogo name={s.name} size={64} />
              </span>
              {s.name}
            </button>
          ))}
        </Ticker>
      ))}
    </div>
  )
}

/** A console-style explorer: a tab per group, its tools, and what the selected tool is used for. */
function Explorer() {
  const selected = useUi((s) => s.selectedSkill)
  const select = useUi((s) => s.setSelectedSkill)
  const group = groupOf(selected)
  const skill = group?.skills.find((s) => s.name === selected) ?? group?.skills[0]
  const tabs = useRef<HTMLDivElement>(null)
  const [ink, setInk] = useState({ x: 0, w: 0 })

  useLayoutEffect(() => {
    const on = tabs.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (on) setInk({ x: on.offsetLeft, w: on.offsetWidth })
  }, [group?.id])

  if (!group || !skill) return null
  const count = skill.uses.length + (skill.more ?? 0)

  return (
    <div className="explorer" id="tool-explorer" data-reveal>
      <div className="ex-tabs" role="tablist" aria-label="Tool groups" ref={tabs}>
        {skillGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === group.id}
            className={g.id === group.id ? 'is-on' : ''}
            onClick={() => {
              const first = g.skills[0]
              if (first) select(first.name)
            }}
          >
            {g.title}
            <small>{g.skills.length}</small>
          </button>
        ))}
        <span className="ex-ink" aria-hidden style={{ transform: `translateX(${ink.x}px)`, width: ink.w }} />
      </div>
      <div className="ex-body">
        <ul className="ex-grid" key={group.id} aria-label={group.title}>
          {group.skills.map((s, i) => (
            <li key={s.name} style={{ '--i': i } as CSSProperties}>
              <button
                type="button"
                className={`ex-tool ${s.name === skill.name ? 'is-on' : ''}`}
                aria-pressed={s.name === skill.name}
                onClick={() => select(s.name)}
                onMouseEnter={() => select(s.name)}
                onFocus={() => select(s.name)}
                data-magnetic
              >
                <TechLogo name={s.name} size={44} />
                <span>{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <article className="ex-detail" key={skill.name}>
          <div aria-live="polite">
            <p className="kicker">
              {group.title} · {group.caption}
            </p>
            <div className="ex-name">
              <span className="ex-logo">
                <TechLogo name={skill.name} size={34} />
              </span>
              <h4>{skill.name}</h4>
            </div>
            <p className="ex-what">{skill.what}</p>
            <p className="ex-uses-head">
              Where I&rsquo;ve used it <span>{count}</span>
            </p>
          </div>
          <ul className="ex-uses" data-lenis-prevent>
            {skill.uses.map((u, i) => (
              <li key={`${u.kind}-${u.ref ?? i}`}>
                <span className="ex-use-place">
                  <em>{KIND[u.kind]}</em>
                  <UsePlace use={u} />
                </span>
                <span className="ex-use-how">{u.how}</span>
              </li>
            ))}
            {skill.more ? (
              <li className="ex-use-more">
                <a className="u-link" href={site.links.github} target="_blank" rel="noopener noreferrer">
                  and {skill.more} more repos on GitHub
                </a>
              </li>
            ) : null}
          </ul>
        </article>
      </div>
    </div>
  )
}

export function Skills() {
  return (
    <Chapter
      id="skills"
      num="03"
      title="Toolkit"
      sub="Technologies I use to design, build, connect and ship AI systems."
      heading="Python first, then whatever the problem needs."
      text={`The ${allSkills.length} tools I've used in my projects and at work, from LLMs and agents to APIs, vector databases and computer vision. Pick one to see where I used it.`}
    >
      <ToolMarquee />
      <Explorer />
    </Chapter>
  )
}
