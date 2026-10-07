export type IntentType = 'create_file' | 'write_code' | 'summarize' | 'chat'

export interface Intent {
  type: IntentType
  target?: string
  detail: string
}

export interface PlanStep {
  intent: Intent
  needsConfirmation: boolean
  blocked?: string
}

const FILE = /(?:called|named)\s+([\w\-./\\]+\.\w{1,6})|([\w\-./\\]+\.(?:py|js|ts|txt|md|json|html|css|csv))\b/i

/** Resolves a path inside the sandbox, or explains why it was rejected. Mirrors the agent's output/ rule. */
export function sandboxPath(raw: string): { ok: true; path: string } | { ok: false; reason: string } {
  const p = raw.replace(/\\/g, '/').trim()
  if (/^([a-z]:|\/|~)/i.test(p)) return { ok: false, reason: 'Absolute paths are not allowed.' }
  const parts: string[] = []
  for (const seg of p.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') return { ok: false, reason: 'Paths may not leave output/.' }
    parts.push(seg)
  }
  if (!parts.length) return { ok: false, reason: 'No file name given.' }
  return { ok: true, path: `output/${parts.join('/')}` }
}

function classifyOne(text: string): Intent {
  const t = text.toLowerCase()
  const file = FILE.exec(text)
  const target = file ? (file[1] ?? file[2]) : undefined
  if (/\b(write|generate)\b.*\b(code|function|script|program|class)\b|\bcode\b.*\b(for|that)\b/.test(t)) {
    return { type: 'write_code', target: target ?? 'solution.py', detail: text.trim() }
  }
  if (/\b(create|make|new)\b.*\b(file|folder|note|document)\b/.test(t) || (target && /\b(create|make|save)\b/.test(t))) {
    return { type: 'create_file', target: target ?? 'notes.txt', detail: text.trim() }
  }
  if (/\b(summari[sz]e|summary|tl;?dr|shorten)\b/.test(t)) {
    return { type: 'summarize', detail: text.replace(/^.*?\b(summari[sz]e|summary of)\b:?\s*/i, '').trim() }
  }
  return { type: 'chat', detail: text.trim() }
}

/** Splits compound commands ("... and then ...") into steps, like the classifier's multi-step JSON. */
export function plan(command: string): PlanStep[] {
  const parts = command
    .split(/\s*(?:,\s*)?\b(?:and then|then|after that|and also)\b\s*/i)
    .map((p) => p.trim())
    .filter(Boolean)
  return (parts.length ? parts : [command]).map((p) => {
    const intent = classifyOne(p)
    const writes = intent.type === 'create_file' || intent.type === 'write_code'
    const checked = writes && intent.target ? sandboxPath(intent.target) : null
    return {
      intent: checked?.ok ? { ...intent, target: checked.path } : intent,
      needsConfirmation: writes,
      blocked: checked && !checked.ok ? checked.reason : undefined,
    }
  })
}

export function summarize(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length <= 1) return text.length > 140 ? `${text.slice(0, 137)}…` : text
  return sentences.slice(0, 1).join(' ')
}

export const EXAMPLE_COMMANDS = [
  'Create a file called notes.txt',
  'Write code for a Python function that reverses a string and then save it as reverse.py',
  'Create a file called ../../secrets.txt',
  'Summarize: The agent records audio, transcribes it with Whisper, classifies the intent and runs tools. File writes stay inside output.',
]
