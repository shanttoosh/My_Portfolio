import { useState } from 'react'
import { checkResponse, SAMPLE, type ResponseCheck } from '../../lib/demos/hallucination'
import { Button } from '../ui/Button'

const PILL = { supported: 'ok', partial: 'warn', unsupported: 'bad' } as const
const LABEL = { supported: 'Supported', partial: 'Partial', unsupported: 'Unsupported' } as const

export function HallucinationDemo() {
  const [context, setContext] = useState(SAMPLE.context)
  const [question, setQuestion] = useState(SAMPLE.question)
  const [response, setResponse] = useState(SAMPLE.response)
  const [result, setResult] = useState<ResponseCheck>(() => checkResponse(SAMPLE.context, SAMPLE.question, SAMPLE.response))

  return (
    <div className="demo-grid">
      <form
        className="demo-controls"
        onSubmit={(e) => {
          e.preventDefault()
          setResult(checkResponse(context, question, response))
        }}
      >
        <label className="field">
          <span className="field-label">Context</span>
          <textarea id="hc-context" rows={6} value={context} onChange={(e) => setContext(e.target.value)} data-lenis-prevent />
        </label>
        <label className="field">
          <span className="field-label">Question</span>
          <input id="hc-question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Response to check</span>
          <textarea id="hc-response" rows={5} value={response} onChange={(e) => setResponse(e.target.value)} data-lenis-prevent />
        </label>
        <Button type="submit">Check response</Button>
      </form>
      <div className="demo-output">
        <div className="verdict">
          <strong>Hallucination risk: {result.risk}</strong>
          <span className="pill pill-ok">{result.counts.supported} supported</span>
          {result.counts.partial > 0 && <span className="pill pill-warn">{result.counts.partial} partial</span>}
          <span className="pill pill-bad">{result.counts.unsupported} unsupported</span>
          <span className="pill pill-mute">relevance {result.relevance.toFixed(2)}</span>
        </div>
        <ul className="check-list">
          {result.sentences.map((s, i) => (
            <li key={i}>
              <span className={`pill pill-${PILL[s.status]}`}>{LABEL[s.status]}</span>
              <p>{s.sentence}.</p>
              <small>{s.reason}</small>
            </li>
          ))}
        </ul>
        <p className="demo-note">
          Relevance is keyword overlap with the question. Support compares each sentence's key terms and numbers with the context. The full pipeline adds an LLM
          judge that checks meaning, not just wording.
        </p>
      </div>
    </div>
  )
}
