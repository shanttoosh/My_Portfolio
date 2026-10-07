import { useMemo, useState } from 'react'
import { clarify, EXAMPLES, experimentSpec, type Provenance } from '../../lib/demos/clarifier'
import { Button } from '../ui/Button'

const PROV: Record<Provenance, { cls: string; label: string }> = {
  stated: { cls: 'pill-accent', label: 'Stated' },
  inferred: { cls: 'pill-info', label: 'Inferred' },
  answered: { cls: 'pill-ok', label: 'Answered' },
  assumed: { cls: 'pill-mute', label: 'Assumed' },
  needed: { cls: 'pill-warn', label: 'Needs an answer' },
}

export function ClarifierDemo() {
  const [draft, setDraft] = useState(EXAMPLES[0] ?? '')
  const [question, setQuestion] = useState(EXAMPLES[0] ?? '')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const params = useMemo(() => clarify(question, answers), [question, answers])
  const spec = experimentSpec(params)
  const needed = params.filter((p) => p.provenance === 'needed').length

  const run = (q: string) => {
    setDraft(q)
    setQuestion(q)
    setAnswers({})
  }

  return (
    <div className="demo-grid">
      <div className="demo-controls">
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim()) run(draft.trim())
          }}
        >
          <label className="field-label" htmlFor="cl-q">
            Market question
          </label>
          <input id="cl-q" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <Button type="submit">Clarify</Button>
        </form>
        <div className="field">
          <span className="field-label">Examples</span>
          <div className="chip-row">
            {EXAMPLES.map((q) => (
              <button key={q} type="button" className="chip" onClick={() => run(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field-label">Where each value came from</span>
          <div className="chip-row">
            {Object.values(PROV).map((p) => (
              <span key={p.label} className={`pill ${p.cls}`}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="demo-output">
        <div className={`banner ${spec ? 'banner-ok' : 'banner-warn'}`}>
          <strong>{spec ? 'Ready to run' : `${needed} ${needed === 1 ? 'question' : 'questions'} before this can run`}</strong>
          <p>{spec ?? 'Only the gaps that change the result block the run. Everything else is shown with its source.'}</p>
        </div>
        <ul className="params">
          {params.map((p) => (
            <li key={p.key}>
              <span className="param-name">{p.name}</span>
              {p.provenance === 'needed' ? (
                <span className="chip-row">
                  {p.options?.map((o) => (
                    <button key={o} type="button" className="chip" onClick={() => setAnswers((a) => ({ ...a, [p.key]: o }))}>
                      {o}
                    </button>
                  ))}
                </span>
              ) : (
                <span className="param-value">{p.value}</span>
              )}
              <span className={`pill ${PROV[p.provenance].cls}`}>{PROV[p.provenance].label}</span>
              <small>{p.reason}</small>
            </li>
          ))}
        </ul>
        <p className="demo-note">A simplified, rule-based take on the Clarify step. The real app detects ambiguity with an LLM behind a port and runs the experiment on historical data.</p>
      </div>
    </div>
  )
}
