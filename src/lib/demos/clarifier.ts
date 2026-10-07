export type Provenance = 'stated' | 'inferred' | 'answered' | 'assumed' | 'needed'

export interface Param {
  key: string
  name: string
  value: string | null
  provenance: Provenance
  reason: string
  options?: string[]
}

const INSTRUMENTS: Record<string, string> = {
  'bank nifty': 'BANK NIFTY',
  banknifty: 'BANK NIFTY',
  'nifty 50': 'NIFTY 50',
  nifty50: 'NIFTY 50',
  nifty: 'NIFTY 50',
  sensex: 'SENSEX',
  's&p 500': 'S&P 500',
  's&p500': 'S&P 500',
  nasdaq: 'NASDAQ',
  gold: 'Gold',
  bitcoin: 'Bitcoin',
  btc: 'Bitcoin',
}

/** Simplified, rule-based Clarify step: nine parameters, each with provenance. */
export function clarify(question: string, answers: Record<string, string>): Param[] {
  const s = question.toLowerCase()
  const gap = (key: string, name: string, reason: string, options: string[]): Param =>
    answers[key]
      ? { key, name, value: answers[key] ?? null, provenance: 'answered', reason: 'You chose it.' }
      : { key, name, value: null, provenance: 'needed', reason, options }
  const params: Param[] = []

  const inst = /bank ?nifty|nifty ?50|nifty|sensex|s&p ?500|nasdaq|gold|bitcoin|btc/.exec(s)
  params.push(
    inst
      ? { key: 'inst', name: 'Instrument', value: INSTRUMENTS[inst[0]] ?? inst[0], provenance: 'stated', reason: 'You named it.' }
      : gap('inst', 'Instrument', 'Which market should be tested?', ['NIFTY 50', 'BANK NIFTY', 'SENSEX']),
  )

  const dir = /\b(buy\w*|long|sell\w*|short\w*)\b/.exec(s)
  const isShort = !!dir && /^(sell|short)/.test(dir[1] ?? '')
  params.push({
    key: 'entry',
    name: 'Entry',
    value: `${isShort ? 'Short' : 'Long'} at the next day's open`,
    provenance: dir ? 'inferred' : 'assumed',
    reason: dir ? `Read from "${dir[1]}".` : 'No direction given, so long is the default.',
  })

  const fall = /\b(fall\w*|drop\w*|declin\w*|crash\w*|dip\w*|sell-?off)\b/.exec(s)
  const rise = /\b(rise|rises|rising|rally|rallies|gains?|jumps?|surges?)\b/.exec(s)
  const trig = fall ?? rise
  params.push(
    trig
      ? { key: 'trig', name: 'Trigger', value: `One-day ${fall ? 'fall' : 'rise'}`, provenance: 'inferred', reason: `Read "${trig[1]}" as a single-day close-to-close move.` }
      : gap('trig', 'Trigger', 'What event starts a trade?', ['One-day fall', 'One-day rise']),
  )

  const pct = /(\d+(?:\.\d+)?)\s?%/.exec(s)
  const vague = /\b(sharp|big|large|steep|small|dip)\b/.exec(s)
  params.push(
    pct
      ? { key: 'thr', name: 'Threshold', value: `At least ${pct[1]}%`, provenance: 'stated', reason: 'You gave the size.' }
      : gap('thr', 'Threshold', `${vague ? `"${vague[1]}" isn't defined` : 'No size given'}, and the result changes with it.`, ['At least 1%', 'At least 2%', 'At least 3%']),
  )

  const hold = /(\d+)\s?(?:trading\s)?(day|days|week|weeks|month|months)\b/.exec(s)
  params.push(
    hold
      ? { key: 'hold', name: 'Holding period', value: `${hold[1]} ${hold[2]}`, provenance: 'stated', reason: 'You gave it.' }
      : gap('hold', 'Holding period', 'How long a trade lasts changes the answer.', ['1 day', '5 days', '20 days']),
  )

  params.push({ key: 'exit', name: 'Exit rule', value: 'Close of the last holding day', provenance: 'assumed', reason: 'The simplest exit that fits a fixed holding period.' })

  const since = /\b(?:since|from)\s((?:19|20)\d{2})\b/.exec(s)
  const lastN = /\blast\s(\d+)\s?years?\b/.exec(s)
  params.push(
    since
      ? { key: 'win', name: 'Test window', value: `${since[1]} through 2025`, provenance: 'stated', reason: 'You gave the start year.' }
      : lastN
        ? { key: 'win', name: 'Test window', value: `The last ${lastN[1]} years`, provenance: 'stated', reason: 'You gave the length.' }
        : { key: 'win', name: 'Test window', value: '2015 through 2025', provenance: 'assumed', reason: 'Eleven years that include the 2020 crash.' },
  )

  params.push({ key: 'cost', name: 'Costs', value: '0.05% per side', provenance: 'assumed', reason: 'A typical index trading cost, shown so it can be changed.' })

  const goal = /\b(work\w*|profit\w*|worth|beat\w*|outperform\w*|edge)\b/.exec(s)
  params.push({
    key: 'metric',
    name: 'Success metric',
    value: 'Average forward return vs. the usual average',
    provenance: goal ? 'inferred' : 'assumed',
    reason: goal ? `Read "${goal[1]}" as beating the usual return over the same period.` : 'No goal given, so it is compared with the usual return.',
  })
  return params
}

export function experimentSpec(params: Param[]): string | null {
  if (params.some((p) => p.provenance === 'needed')) return null
  const v = (k: string) => params.find((p) => p.key === k)?.value ?? ''
  const verb = v('entry').startsWith('Short') ? 'Short' : 'Buy'
  const move = v('trig').includes('rise') ? 'rise' : 'fall'
  return `${verb} ${v('inst')} at the next open after a one-day ${move} of ${v('thr').toLowerCase()}, hold ${v('hold')} and exit at the close. Test ${v('win').replace(/^The /, 'the ')} with ${v('cost')} costs, against the average ${v('hold')} return.`
}

export const EXAMPLES = [
  'Does buying NIFTY after a sharp fall work?',
  'Is it worth shorting BANK NIFTY after a 3% rally, holding 5 days?',
  'Does buying gold after a dip work since 2018?',
]
