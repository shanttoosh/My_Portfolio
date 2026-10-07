/** Small text helpers for the in-browser demos: tokens, light stemming and fuzzy term matching. */

const STOP_WORDS = new Set(
  'a an the and or of to in on for with by is are was were be been being it its this that these those what whats which who whom how does do did done has have had he his him she her they them their you your i me my we our as at from about into over after before than then so if not no can could should would will just also any all some more most other such only own same very there here when where why each much many up down out off per via vs am let get got use used using tell show give shanttoosh built made make know knows worked done please anything something thing things list explain describe summarize summarise overview detail details strongest best good kind type ever really try'.split(
    ' ',
  ),
)

function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+(?:[.\-+#][a-z0-9]+)*/g) ?? []
}

function stem(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/** The content words of a text: lower-cased, stop words and single letters dropped, lightly stemmed. */
export function terms(text: string): string[] {
  return tokens(text)
    .filter((t) => !STOP_WORDS.has(t) && t.length > 1)
    .map(stem)
}

/** Same term, or two long terms that share their first five letters ("retrieval" and "retrieve"). */
export function near(a: string, b: string): boolean {
  return a === b || (a.length >= 6 && b.length >= 6 && a.slice(0, 5) === b.slice(0, 5))
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}
