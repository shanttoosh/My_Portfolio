import { FileCode2, Mic, MicOff, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { EXAMPLE_COMMANDS, plan, summarize, type PlanStep } from '../../lib/demos/voiceAgent'
import { Button } from '../ui/Button'

interface RecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start: () => void
  stop: () => void
}

type RecognitionCtor = new () => RecognitionLike

function getRecognition(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface Output {
  kind: 'file' | 'text' | 'blocked' | 'skipped'
  title: string
  body: string
}

export function VoiceAgentDemo() {
  const Recognition = getRecognition()
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState(EXAMPLE_COMMANDS[1] ?? '')
  const [steps, setSteps] = useState<PlanStep[]>(() => plan(EXAMPLE_COMMANDS[1] ?? ''))
  const [cursor, setCursor] = useState(0)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [files, setFiles] = useState<Record<string, string>>({})
  const [micError, setMicError] = useState<string | null>(null)
  const rec = useRef<RecognitionLike | null>(null)

  useEffect(() => () => rec.current?.stop(), [])

  const load = (command: string) => {
    setTranscript(command)
    setSteps(plan(command))
    setCursor(0)
    setOutputs([])
  }

  const listen = () => {
    if (!Recognition) return
    if (listening) {
      rec.current?.stop()
      return
    }
    setMicError(null)
    const r = new Recognition()
    r.lang = 'en-US'
    r.interimResults = true
    r.continuous = false
    r.onresult = (e) => {
      const text = Array.from(e.results)
        .map((res) => res[0]?.transcript ?? '')
        .join(' ')
      setTranscript(text)
      const last = e.results[e.results.length - 1]
      if (last?.isFinal) load(text)
    }
    r.onerror = (e) => setMicError(e.error === 'not-allowed' ? 'Microphone permission was denied. You can type a command instead.' : `Speech recognition error: ${e.error}`)
    r.onend = () => setListening(false)
    rec.current = r
    r.start()
    setListening(true)
  }

  const execute = (approve: boolean) => {
    const step = steps[cursor]
    if (!step) return
    let out: Output
    if (step.blocked) out = { kind: 'blocked', title: 'Blocked by the sandbox', body: step.blocked }
    else if (!approve) out = { kind: 'skipped', title: 'Skipped', body: `You declined ${step.intent.type}.` }
    else if (step.intent.type === 'create_file' || step.intent.type === 'write_code') {
      const path = step.intent.target ?? 'output/untitled.txt'
      const body =
        step.intent.type === 'write_code'
          ? `# Request: ${step.intent.detail}\n# In the real agent, a Groq model writes this code.\n# This browser demo only shows routing and the sandbox check.\n`
          : `Created by the voice agent demo.\nRequest: ${step.intent.detail}\n`
      setFiles((f) => ({ ...f, [path]: body }))
      out = { kind: 'file', title: `Wrote ${path}`, body }
    } else if (step.intent.type === 'summarize') out = { kind: 'text', title: 'Summary', body: summarize(step.intent.detail) }
    else out = { kind: 'text', title: 'Chat', body: 'The real agent sends general chat to a Groq LLM with session memory. This demo only routes it.' }
    setOutputs((o) => [...o, out])
    setCursor((c) => c + 1)
  }

  const current = steps[cursor]

  return (
    <div className="demo-grid">
      <div className="demo-controls">
        <div className="voice-box">
          <button type="button" className={`mic-btn ${listening ? 'is-live pulse' : ''}`} onClick={listen} disabled={!Recognition} aria-pressed={listening}>
            {listening ? <MicOff size={26} /> : <Mic size={26} />}
          </button>
          <div>
            <strong>{listening ? 'Listening…' : Recognition ? 'Tap to speak a command' : 'Speech recognition is not available in this browser'}</strong>
            <small>{Recognition ? "Uses your browser's speech recognition. You can also type below." : 'Type a command below instead.'}</small>
          </div>
        </div>
        {micError && <p className="form-error">{micError}</p>}
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault()
            if (transcript.trim()) load(transcript.trim())
          }}
        >
          <label className="field-label" htmlFor="va-cmd">
            Transcript
          </label>
          <textarea id="va-cmd" rows={3} value={transcript} onChange={(e) => setTranscript(e.target.value)} data-lenis-prevent />
          <Button type="submit" variant="secondary">
            Classify intent
          </Button>
        </form>
        <div className="field">
          <span className="field-label">Try</span>
          <div className="chip-row">
            {EXAMPLE_COMMANDS.map((c) => (
              <button key={c} type="button" className="chip" onClick={() => load(c)}>
                {c.length > 48 ? `${c.slice(0, 46)}…` : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="demo-output">
        <p className="mini-label">Plan</p>
        <ol className="plan">
          {steps.map((s, i) => (
            <li key={i} className={`${i < cursor ? 'is-done' : ''} ${i === cursor ? 'is-current' : ''}`}>
              <span className="pill pill-info">{s.intent.type}</span>
              <span>
                {s.intent.target ?? s.intent.detail.slice(0, 80)}
                {s.blocked && <em className="blocked"> · {s.blocked}</em>}
              </span>
            </li>
          ))}
        </ol>

        {current ? (
          <div className="confirm">
            <ShieldCheck size={18} aria-hidden />
            <p>
              {current.blocked
                ? `This step is blocked: ${current.blocked}`
                : current.needsConfirmation
                  ? `Confirm before writing ${current.intent.target}?`
                  : `Run ${current.intent.type}?`}
            </p>
            <div className="actions">
              <Button size="sm" onClick={() => execute(true)}>
                {current.blocked ? 'Continue' : current.needsConfirmation ? 'Approve' : 'Run'}
              </Button>
              {current.needsConfirmation && !current.blocked && (
                <Button size="sm" variant="secondary" onClick={() => execute(false)}>
                  Decline
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="demo-note">All steps handled. Speak or type another command.</p>
        )}

        {outputs.length > 0 && (
          <ul className="outputs">
            {outputs.map((o, i) => (
              <li key={i} className={`out-${o.kind}`}>
                <strong>{o.title}</strong>
                <pre>{o.body}</pre>
              </li>
            ))}
          </ul>
        )}

        <div className="sandbox">
          <p className="mini-label">
            <FileCode2 size={14} aria-hidden /> output/ sandbox
          </p>
          {Object.keys(files).length ? (
            <ul>
              {Object.keys(files).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : (
            <p className="demo-note">No files yet.</p>
          )}
        </div>
        <p className="demo-note">Runs in your browser. Rules stand in for the Groq intent classifier; the sandbox check mirrors the real agent's output/ rule.</p>
      </div>
    </div>
  )
}
