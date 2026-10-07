import { near, terms, unique } from '../text'

export type Support = 'supported' | 'partial' | 'unsupported'

export interface SentenceCheck {
  sentence: string
  status: Support
  reason: string
}

export interface ResponseCheck {
  sentences: SentenceCheck[]
  relevance: number
  risk: 'None' | 'Low' | 'Medium' | 'High'
  counts: Record<Support, number>
}

const NUM = /\d+(?:\.\d+)?/g

/** Heuristic mode of the evaluation pipeline: term and number overlap with the context, sentence by sentence. */
export function checkResponse(context: string, question: string, response: string): ResponseCheck {
  const ctxTerms = unique(terms(context))
  const ctxNums: string[] = context.match(NUM) ?? []
  const sentences = response
    .split(/[.!?]\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim().replace(/[.!?]+$/, ''))
    .filter(Boolean)

  const checks: SentenceCheck[] = sentences.map((sentence) => {
    const ts = unique(terms(sentence)).filter((t) => !/^\d/.test(t))
    const nums = sentence.match(NUM) ?? []
    const missing = ts.filter((t) => !ctxTerms.some((c) => near(t, c)))
    const support = ts.length ? (ts.length - missing.length) / ts.length : 1
    const badNums = nums.filter((n) => !ctxNums.includes(n))
    const status: Support = badNums.length ? 'unsupported' : support >= 0.7 ? 'supported' : support >= 0.4 ? 'partial' : 'unsupported'
    const reason = badNums.length
      ? `Number not in the context: ${badNums.join(', ')}`
      : status === 'supported'
        ? `Key terms appear in the context (${Math.round(support * 100)}%)`
        : `Not in the context: ${missing.slice(0, 5).join(', ')}`
    return { sentence, status, reason }
  })

  const qTerms = unique(terms(question))
  const rTerms = unique(terms(response))
  const relevance = qTerms.length ? qTerms.filter((t) => rTerms.some((r) => near(t, r))).length / qTerms.length : 0
  const counts: Record<Support, number> = { supported: 0, partial: 0, unsupported: 0 }
  for (const c of checks) counts[c.status]++
  const risk = !checks.length ? 'None' : counts.unsupported === 0 && counts.partial <= 1 ? 'Low' : counts.unsupported / checks.length >= 0.34 ? 'High' : 'Medium'

  return { sentences: checks, relevance, risk, counts }
}

export const SAMPLE = {
  context:
    'The Agentic AI RAG chatbot answers questions only from a 60-page eBook. It uses a LangGraph workflow, Pinecone for vector search and Groq-hosted gpt-oss models. On an evaluation set of 17 questions, it gave grounded answers to all 11 answerable questions and a safe fallback for all 6 unanswerable ones. Mean latency was 5.7 seconds per question.',
  question: 'What does the chatbot use and how was it evaluated?',
  response:
    'The chatbot answers from a 60-page eBook using LangGraph and Pinecone. It gave grounded answers to all 11 answerable questions. It was evaluated on 40 questions. It is deployed on AWS Lambda for low latency.',
}
