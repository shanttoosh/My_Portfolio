/** Resolves a file in public/ against the configured base path. */
export function asset(path: string): string {
  const base = import.meta.env?.BASE_URL ?? '/'
  return `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\/+/, '')}`
}
