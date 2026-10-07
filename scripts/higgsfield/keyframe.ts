/**
 * Makes one storyboard frame: the character (from reference images) in a new scene, 16:9 at 2K.
 * Usage: npx tsx scripts/higgsfield/keyframe.ts <name> "<prompt>" <reference.png> [more references...]
 * Writes media/storyboard/<name>.png. Billable. Needs HF_CREDENTIALS=key-id:key-secret in .env.local; never printed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname } from 'node:path'
import { APIError, AuthenticationError, config, higgsfield, NotEnoughCreditsError } from '@higgsfield/client/v2'

const MODEL = 'marketing-studio/image'

/** Documented two-step upload; the presigned PUT must carry the headers it was signed with. */
async function upload(file: string): Promise<string> {
  const contentType = extname(file).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
  const res = await fetch('https://api.higgsfield.ai/files/generate-upload-url', {
    method: 'POST',
    headers: { Authorization: `Key ${process.env.HF_CREDENTIALS}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_type: contentType }),
  })
  if (!res.ok) throw new Error(`Upload URL request failed: HTTP ${res.status} ${await res.text()}`)
  const { upload_url, public_url, upload_headers } = (await res.json()) as { upload_url: string; public_url: string; upload_headers?: Record<string, string> }
  const put = await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': contentType, ...upload_headers }, body: readFileSync(file) })
  if (!put.ok) throw new Error(`Upload failed: HTTP ${put.status}`)
  return public_url
}

async function main(): Promise<number> {
  const [name, prompt, ...refs] = process.argv.slice(2)
  if (!name || !prompt || refs.length === 0) {
    console.error('Usage: keyframe.ts <name> "<prompt>" <reference> [...]')
    return 2
  }
  if (!process.env.HF_CREDENTIALS && existsSync('.env.local')) process.loadEnvFile('.env.local')
  if (!process.env.HF_CREDENTIALS?.includes(':')) throw new Error('HF_CREDENTIALS is missing from .env.local.')
  config({ credentials: process.env.HF_CREDENTIALS })

  const image_urls = await Promise.all(refs.map(upload))
  console.log(`Uploaded ${image_urls.length} reference(s). Generating storyboard frame "${name}"...`)
  const result = await higgsfield.subscribe(MODEL, {
    input: { prompt, image_urls, aspect_ratio: '16:9', resolution: '2k', quality: 'high' },
    withPolling: true,
  })
  const status: string = result.status
  const url = result.images?.[0]?.url
  if (status !== 'completed' || !url) {
    const why = status === 'nsfw' ? 'rejected by moderation' : status === 'failed' ? 'failed (credits are refunded)' : `ended as "${status}"`
    console.error(`Request ${result.request_id} ${why}.`)
    return 1
  }
  const img = await fetch(url)
  if (!img.ok) throw new Error(`Download failed: HTTP ${img.status}`)
  mkdirSync('media/storyboard', { recursive: true })
  const out = `media/storyboard/${name}.png`
  writeFileSync(out, Buffer.from(await img.arrayBuffer()))
  console.log(`Completed. Request ${result.request_id}\nSaved ${out}`)
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    if (err instanceof AuthenticationError) console.error('Authentication failed: check the key in .env.local.')
    else if (err instanceof NotEnoughCreditsError) console.error('Not enough credits on the Higgsfield account.')
    else if (err instanceof APIError) console.error(`Higgsfield API error: ${err.message}`)
    else console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
