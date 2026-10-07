import type { CSSProperties } from 'react'
import { Chapter } from '../chapter/Chapter'
import { TechLogo } from '../components/ui/Icons'
import { experience } from '../config/experience'
import type { Experience as Role, ExperienceProject } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

/** A project on the role's branch: a node on the graph line, then the card. Its pipeline lights up step by step as it passes. */
function Commit({ project, k }: { project: ExperienceProject; k: number }) {
  return (
    <li className="log-commit">
      <span className="log-node" aria-hidden />
      <div className="log-card">
        <p className="log-meta">
          <span>{pad(k + 1)}</span> {project.tech.slice(0, 3).join(' · ')}
        </p>
        <h5>{project.name}</h5>
        <p className="log-desc">{project.description}</p>
        <ol className="log-flow" aria-label="Pipeline">
          {project.flow.map((step, j) => (
            <li key={step} style={{ '--k': j } as CSSProperties}>
              {step}
            </li>
          ))}
        </ol>
        <ul className="log-points">
          {project.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
        <ul className="log-tech">
          {project.tech.map((t) => (
            <li key={t}>
              <TechLogo name={t} size={14} />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

/** One role: the company stays pinned on the left while its projects scroll past on the right. */
function RoleLog({ role }: { role: Role }) {
  const current = role.period.includes('Present')
  return (
    <section className="log-role" aria-labelledby={`role-${role.id}`}>
      <aside className="log-head">
        <p className="kicker">
          <i className={current ? 'is-live' : ''} aria-hidden /> {current ? 'Current role' : role.type} · {role.period}
        </p>
        <h4 id={`role-${role.id}`}>{role.company}</h4>
        <p className="log-role-title">
          {role.role} · {role.location}
        </p>
        <p className="log-sum">{role.summary}</p>
        <ul className="log-tags">
          {role.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="log-count">
          {role.projects.length} {role.projects.length === 1 ? 'project' : 'projects'}
        </p>
      </aside>
      <ol className="log-commits">
        {role.projects.map((p, k) => (
          <Commit key={p.name} project={p} k={k} />
        ))}
      </ol>
    </section>
  )
}

export function Experience() {
  return (
    <Chapter
      id="experience"
      num="02"
      title="Experience"
      sub="From AI systems for the construction industry to enterprise search and machine learning in healthcare."
      heading="Where I've worked."
      text="I'm building AI products at Krion Consulting, after internships in enterprise RAG and healthcare ML."
    >
      <div className="log">
        {experience.map((r) => (
          <RoleLog key={r.id} role={r} />
        ))}
      </div>
    </Chapter>
  )
}
