import { Activity, Bot, Braces, DatabaseSearch, ScanEye, type LucideIcon } from 'lucide-react'
import {
  siAngular,
  siClaude,
  siCss,
  siDocker,
  siFastapi,
  siFastify,
  siGit,
  siGooglegemini,
  siHtml5,
  siJavascript,
  siLangchain,
  siLanggraph,
  siMeta,
  siModelcontextprotocol,
  siN8n,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siNumpy,
  siOpencv,
  siPandas,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siScikitlearn,
  siScipy,
  siSqlite,
  siStreamlit,
  siSupabase,
  siTensorflow,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons'
import aws from '../../assets/logos/aws.svg?raw'
import chroma from '../../assets/logos/chroma.svg?raw'
import groq from '../../assets/logos/groq.svg?raw'
import matplotlib from '../../assets/logos/matplotlib.svg?raw'
import openai from '../../assets/logos/openai.svg?raw'
import pinecone from '../../assets/logos/pinecone.svg?raw'
import { allSkills } from '../../config/skills'

const BRANDS: Record<string, SimpleIcon> = {
  angular: siAngular,
  claude: siClaude,
  css: siCss,
  docker: siDocker,
  fastapi: siFastapi,
  fastify: siFastify,
  git: siGit,
  googlegemini: siGooglegemini,
  html5: siHtml5,
  javascript: siJavascript,
  langchain: siLangchain,
  langgraph: siLanggraph,
  // FAISS is Meta AI Research's library and has no logo of its own, so it carries Meta's mark.
  meta: siMeta,
  modelcontextprotocol: siModelcontextprotocol,
  n8n: siN8n,
  nestjs: siNestjs,
  // Not a Toolkit entry, so it is looked up by its plain name (the Thesis card lists it).
  nextjs: siNextdotjs,
  nodedotjs: siNodedotjs,
  numpy: siNumpy,
  opencv: siOpencv,
  pandas: siPandas,
  postgresql: siPostgresql,
  python: siPython,
  react: siReact,
  redis: siRedis,
  scikitlearn: siScikitlearn,
  scipy: siScipy,
  sqlite: siSqlite,
  streamlit: siStreamlit,
  supabase: siSupabase,
  tensorflow: siTensorflow,
  typescript: siTypescript,
}

/**
 * Official marks that simple-icons does not carry, as their makers publish them (Iconify's logos set, and
 * groq.com's own icon). Near-black fills were switched to currentColor so they show on the dark page.
 */
const MARKS: Record<string, { viewBox: string; body: string }> = Object.fromEntries(
  Object.entries({ aws, chroma, groq, matplotlib, openai, pinecone }).map(([key, raw]) => {
    const m = /viewBox="([^"]+)">([\s\S]*)<\/svg>/.exec(raw)
    return [key, { viewBox: m?.[1] ?? '0 0 24 24', body: m?.[2] ?? '' }]
  }),
)

/** Techniques rather than products: no official logo exists, so each gets a plain line icon. */
const CONCEPTS: Record<string, LucideIcon> = {
  rag: DatabaseSearch,
  agents: Bot,
  signal: Activity,
  api: Braces,
  computervision: ScanEye,
}

function isDark(hex: string): boolean {
  const n = parseInt(hex, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 60
}

export function BrandIcon({ name, size = 20, title }: { name: string; size?: number; title?: string }) {
  const icon = BRANDS[name]
  if (!icon) return null
  const fill = isDark(icon.hex) ? 'currentColor' : `#${icon.hex}`
  return (
    <svg className="si" width={size} height={size} viewBox="0 0 24 24" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={icon.path} fill={fill} />
    </svg>
  )
}

/** The skill a tool name refers to; an exact name wins over an alias ("MCP" is a skill and an alias of "AI Agents"). */
function lookup(name: string) {
  const n = name.toLowerCase()
  const skill = allSkills.find((s) => s.name.toLowerCase() === n) ?? allSkills.find((s) => s.aliases?.some((a) => a.toLowerCase() === n))
  return { skill, key: skill?.icon ?? n.replace(/[^a-z0-9]/g, '') }
}

/** Whether a tool has a real logo or icon (rather than a letter tile). */
// eslint-disable-next-line react-refresh/only-export-components
export function hasLogo(name: string): boolean {
  const { key } = lookup(name)
  return !!(BRANDS[key] || MARKS[key] || CONCEPTS[key])
}

/** The tool's official logo; a line icon for techniques that have none; a monogram only as a last resort. */
export function TechLogo({ name, size = 22 }: { name: string; size?: number }) {
  const { skill, key } = lookup(name)
  if (BRANDS[key]) return <BrandIcon name={key} size={size} />
  const mark = MARKS[key]
  if (mark) return <svg className="logo-mark" width={size} height={size} viewBox={mark.viewBox} aria-hidden dangerouslySetInnerHTML={{ __html: mark.body }} />
  const Concept = CONCEPTS[key]
  if (Concept) return <Concept className="logo-concept" size={size} strokeWidth={1.6} aria-hidden />
  const mono = skill?.monogram ?? name.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()
  return (
    <span className="mono-logo" style={{ width: size + 6, height: size + 6, fontSize: Math.max(8, size * 0.42) }} aria-hidden>
      {mono}
    </span>
  )
}
