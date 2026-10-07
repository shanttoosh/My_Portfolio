/**
 * Generates one portfolio clip from a local start frame with Kling 2.6 Pro image-to-video.
 * Usage: npx tsx scripts/higgsfield/clip.ts <start-image.png|jpg> <name> "<prompt>" [aspect 1:1|16:9|9:16] [duration 5|10]
 * Writes media/raw/<name>.mp4. Billable. Needs HF_CREDENTIALS=key-id:key-secret in .env.local; never printed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname } from 'node:path'
import { APIError, AuthenticationError, config, higgsfield, NotEnoughCreditsError } from '@higgsfield/client/v2'

const MODEL = 'kling-video/v2.6/pro/image-to-video'

/**
 * Documented two-step upload: ask for a presigned URL, then PUT the file with the headers it was signed
 * with (Content-Type and x-amz-tagging). Credentials go only to the API, never to the storage URL.
 */
async function upload(file: string, contentType: string): Promise<string> {
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
  const [image, name, prompt, aspect = '1:1', duration = '5'] = process.argv.slice(2)
  if (!image || !name || !prompt) {
    console.error('Usage: clip.ts <start-image> <name> "<prompt>" [aspect] [duration]')
    return 2
  }
  if (!process.env.HF_CREDENTIALS && existsSync('.env.local')) process.loadEnvFile('.env.local')
  if (!process.env.HF_CREDENTIALS?.includes(':')) throw new Error('HF_CREDENTIALS is missing from .env.local.')
  config({ credentials: process.env.HF_CREDENTIALS })

  const type = extname(image).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
  const imageUrl = await upload(image, type)
  console.log(`Uploaded start frame. Generating "${name}" (${duration} s, ${aspect})...`)

  const result = await higgsfield.subscribe(MODEL, {
    input: { prompt, image_url: imageUrl, duration: Number(duration), aspect_ratio: aspect, sound: 'off', cfg_scale: 0.5 },
    withPolling: true,
  })
  const status: string = result.status
  if (status !== 'completed' || !result.video?.url) {
    const why = status === 'nsfw' ? 'rejected by moderation' : status === 'failed' ? 'failed (credits are refunded)' : `ended as "${status}"`
    console.error(`Request ${result.request_id} ${why}.`)
    return 1
  }

  const res = await fetch(result.video.url)
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`)
  mkdirSync('media/raw', { recursive: true })
  const out = `media/raw/${name}.mp4`
  writeFileSync(out, Buffer.from(await res.arrayBuffer()))
  console.log(`Completed. Request ${result.request_id}\nVideo URL: ${result.video.url}\nSaved ${out}`)
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
