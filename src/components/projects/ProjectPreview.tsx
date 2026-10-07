import { Bot, FileText, Mic, Sheet, User } from 'lucide-react'
import type { Project } from '../../types'
import { Flow } from '../ui/Flow'

function RagPreview() {
  return (
    <div className="pv pv-rag">
      <div className="pv-rag-side">
        <p className="pv-label">Knowledge</p>
        <span className="pv-doc">
          <FileText size={13} aria-hidden /> Agentic AI eBook.pdf
        </span>
        <span className="pv-meta">60 pages · 1024-d index</span>
        <p className="pv-label">Pipeline</p>
        {['Retrieve', 'Drop weak matches', 'Generate', 'Verify claims'].map((s) => (
          <span key={s} className="pv-step">
            {s}
          </span>
        ))}
      </div>
      <div className="pv-rag-chat">
        <div className="pv-msg pv-user">
          <User size={12} aria-hidden /> What is LoRA fine-tuning?
        </div>
        <div className="pv-msg pv-bot">
          <Bot size={13} aria-hidden />
          <span>I couldn't find enough information about this in the provided Agentic AI eBook.</span>
        </div>
        <div className="pv-flags">
          <span className="pv-flag">grounded: false</span>
          <span className="pv-flag">safe fallback</span>
          <span className="pv-flag">LLM skipped</span>
        </div>
        <p className="pv-caption">A near-miss question from the evaluation set, refused instead of guessed.</p>
      </div>
    </div>
  )
}

function VoicePreview() {
  return (
    <div className="pv pv-voice">
      <div className="pv-mic">
        <span className="pv-mic-ring pulse">
          <Mic size={22} aria-hidden />
        </span>
        <span>Listening...</span>
        <span className="wave" aria-hidden>
          {Array.from({ length: 22 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 7) * 0.09}s` }} />
          ))}
        </span>
      </div>
      <ol className="pv-list">
        {['Transcribe (Whisper)', 'Understand intent', 'Plan with LangGraph', 'Execute tools', 'Respond'].map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  )
}

function PipelinePreview({ project }: { project: Project }) {
  const sheets = project.technologies.includes('Google Sheets')
  return (
    <div className="pv pv-pipe">
      <ol className="pv-nodes">
        {project.flow.map((s, i) => (
          <li key={s}>
            <span className="pv-node">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {sheets && (
        <div className="pv-store">
          <Sheet size={14} aria-hidden /> Shared lead store: Google Sheets
        </div>
      )}
    </div>
  )
}

function ThesisPreview() {
  const rows = [
    ['Threshold', '"sharp"', 'Needs an answer', 'warn'],
    ['Holding period', 'not given', 'Needs an answer', 'warn'],
    ['Entry', 'Long, next open', 'Inferred', 'info'],
    ['Costs', '0.05% per side', 'Assumed', 'mute'],
  ] as const
  return (
    <div className="pv pv-thesis">
      <p className="pv-label">Clarify</p>
      <p className="pv-q">"Does buying NIFTY after a sharp fall work?"</p>
      <ul>
        {rows.map(([k, v, p, tone]) => (
          <li key={k}>
            <span>{k}</span>
            <span className="pv-v">{v}</span>
            <span className={`pill pill-${tone}`}>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProjectPreview({ project }: { project: Project }) {
  switch (project.preview) {
    case 'rag':
      return <RagPreview />
    case 'voice':
      return <VoicePreview />
    case 'pipeline':
      return <PipelinePreview project={project} />
    case 'thesis':
      return <ThesisPreview />
    default:
      return (
        <div className="pv pv-flow">
          <Flow steps={project.flow} />
        </div>
      )
  }
}
