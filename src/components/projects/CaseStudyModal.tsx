import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from '../../lib/Link'
import { closeView } from '../../lib/router'
import { categoryLabel, getProject, projects } from '../../config/projects'
import { Flow, Tags } from '../ui/Flow'
import { Modal } from '../ui/Modal'
import { ProjectActions } from './ProjectActions'
import { ProjectPreview } from './ProjectPreview'
import { ProjectMedia } from './ProjectMedia'
import { thumbnails } from '../../config/thumbnails'

export function CaseStudyModal({ slug }: { slug: string }) {
  const close = closeView
  const project = getProject(slug)

  if (!project) {
    return (
      <Modal label="Project not found" onClose={close}>
        <div className="case">
          <h2 className="case-title">Project not found</h2>
          <p className="lead">That project isn't in this portfolio. It may have been renamed.</p>
          <Link className="btn btn-primary" to="/">
            <span>Back to projects</span>
          </Link>
        </div>
      </Modal>
    )
  }

  const i = projects.findIndex((p) => p.slug === project.slug)
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]
  const cs = project.caseStudy
  const shot = thumbnails[project.slug]

  return (
    <Modal label={`${project.name} case study`} onClose={close} wide>
      <article className="case">
        <header className="case-head">
          <p className="eyebrow">
            Case study · {project.year} · {project.categories.map((c) => categoryLabel[c]).join(' · ')}
          </p>
          <h2 className="case-title">{project.name}</h2>
          <p className="lead">{project.tagline}</p>
          <ProjectActions project={project} withDetails={false} />
        </header>

        {cs.metrics && (
          <ul className="case-metrics">
            {cs.metrics.map((m) => (
              <li key={m.label}>
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="case-grid">
          <section>
            <h3>Problem</h3>
            <p>{cs.problem}</p>
          </section>
          <section>
            <h3>Approach</h3>
            <p>{cs.approach}</p>
          </section>
        </div>

        <section className="case-arch">
          <h3>Architecture</h3>
          <Flow steps={project.flow} />
          {cs.architecture && <p>{cs.architecture}</p>}
          <div className="case-preview">
            {shot ? <ProjectMedia shot={shot} name={project.name} url={project.demoUrl ?? project.githubUrl ?? undefined} isLive={!!project.demoUrl} active variant="inline" /> : <ProjectPreview project={project} />}
          </div>
        </section>

        <div className="case-grid">
          <section>
            <h3>Implementation</h3>
            <ul className="ticks">
              {cs.implementation.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <section>
            {cs.challenges && (
              <>
                <h3>Challenges</h3>
                <ul className="ticks">
                  {cs.challenges.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </>
            )}
            {cs.result && (
              <>
                <h3>Result</h3>
                <p>{cs.result}</p>
              </>
            )}
          </section>
        </div>

        <section>
          <h3>Technologies</h3>
          <Tags items={project.technologies} />
        </section>

        <nav className="case-nav" aria-label="More projects">
          {prev && (
            <Link to={`/projects/${prev.slug}`} replace>
              <ArrowLeft size={16} aria-hidden /> {prev.name}
            </Link>
          )}
          {next && (
            <Link to={`/projects/${next.slug}`} replace>
              {next.name} <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </nav>
      </article>
    </Modal>
  )
}
