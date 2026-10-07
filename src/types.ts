export type SectionId = 'intro' | 'projects' | 'experience' | 'skills' | 'contact'

export type ProjectCategory = 'ai-llm' | 'rag' | 'automation' | 'backend' | 'data' | 'web'

export type DemoId = 'voice-agent' | 'clarifier' | 'hallucination'

export type PreviewKind = 'rag' | 'voice' | 'pipeline' | 'thesis' | 'flow'

export interface Metric {
  value: string
  label: string
}

export interface CaseStudy {
  problem: string
  approach: string
  architecture?: string
  implementation: string[]
  challenges?: string[]
  result?: string
  metrics?: Metric[]
}

export interface Project {
  slug: string
  name: string
  tagline: string
  /** One plain-English line for the "More of my work" list. */
  blurb?: string
  /** The industry or problem area, shown above a featured project's name. */
  domain?: string
  description: string
  year: number
  categories: ProjectCategory[]
  technologies: string[]
  features: string[]
  flow: string[]
  githubUrl: string | null
  /** A real deployed URL. Leave null when nothing is deployed; the UI then shows no Live Demo button. */
  demoUrl: string | null
  /** An interactive demo that runs inside this site. */
  demoId: DemoId | null
  preview: PreviewKind
  caseStudy: CaseStudy
}

/** One beat of a demo recording: where it starts (seconds into the video) and what it shows. */
export interface DemoChapter {
  t: number
  label: string
  /** One line on what this part of the recording shows, under the window. */
  caption?: string
}

/** A real screen from a running project (or its real output), shown instead of the drawn preview. */
export interface ProjectThumbnail {
  /** A still from the run, shown before the video plays and whenever motion is off. */
  poster: string
  /** The chapter the still comes from, so the caption describes the picture until the recording starts. */
  posterChapter?: string
  /** Length of the recording, in seconds. */
  duration?: number
  /** The story of the recording, in order; drives the chapter rail. */
  chapters?: DemoChapter[]
  /** A screen recording of a real run of the app: H.264 first (hardware-decoded almost everywhere), VP9 for browsers without it. */
  video?: { mp4: string; webm: string }
  alt: string
  /** Shown in the window bar above the image: where the screen comes from. */
  label: string
}

export interface ExperienceProject {
  name: string
  icon: 'database' | 'building' | 'file' | 'layers' | 'heart'
  description: string
  flow: string[]
  points: string[]
  tech: string[]
}

export interface Experience {
  id: string
  company: string
  monogram: string
  role: string
  type: string
  period: string
  location: string
  summary: string
  tags: string[]
  projects: ExperienceProject[]
}

/** One place a tool was used: a job, a project on this site, this portfolio, another public repo, or private company work. */
export interface SkillUse {
  kind: 'role' | 'project' | 'portfolio' | 'repo' | 'work'
  /** Experience id, project slug or GitHub repository name (not used for 'portfolio' and 'work'). */
  ref?: string
  /** Display name for a repo; jobs and projects take theirs from their own config. */
  label?: string
  how: string
}

export interface Skill {
  name: string
  /** Key into the brand icon map; falls back to a monogram. */
  icon?: string
  monogram?: string
  what: string
  uses: SkillUse[]
  /** Further public repos that use it, counted rather than listed. */
  more?: number
  aliases?: string[]
}

export interface SkillGroup {
  id: string
  title: string
  caption: string
  icon: 'brain' | 'monitor' | 'chart' | 'server' | 'database'
  skills: Skill[]
}
