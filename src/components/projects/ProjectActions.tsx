import { ArrowUpRight, Play } from 'lucide-react'
import { Link } from '../../lib/Link'
import type { Project } from '../../types'
import { LinkButton } from '../ui/Button'
import { GithubIcon } from '../ui/Social'

/** Live Demo only renders for a real deployed URL; in-site demos are labelled as such. */
export function ProjectActions({ project, withDetails = true, size = 'md' }: { project: Project; withDetails?: boolean; size?: 'md' | 'sm' }) {
  return (
    <div className="actions">
      {project.demoUrl && (
        <LinkButton href={project.demoUrl} size={size} variant="primary" trailing={<ArrowUpRight size={16} aria-hidden />}>
          Live Demo
        </LinkButton>
      )}
      {project.demoId && !project.demoUrl && (
        <LinkButton to={`/demos/${project.demoId}`} size={size} variant="primary" icon={<Play size={15} aria-hidden />}>
          Try Demo
        </LinkButton>
      )}
      {project.githubUrl && (
        <LinkButton href={project.githubUrl} size={size} variant="secondary" icon={<GithubIcon size={16} />}>
          GitHub
        </LinkButton>
      )}
      {withDetails && (
        <Link className="text-link" to={`/projects/${project.slug}`}>
          Case study <ArrowUpRight size={14} aria-hidden />
        </Link>
      )}
    </div>
  )
}
