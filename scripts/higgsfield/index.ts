/**
 * Higgsfield example: one Seedance 2.5 text-to-video generation.
 * Run: npm run hf:example   (billable; needs HF_CREDENTIALS=key-id:key-secret in .env.local)
 * Server-side only. The key is read from the environment and never printed.
 */
import { existsSync } from 'node:fs'
import { APIError, AuthenticationError, config, higgsfield, NotEnoughCreditsError } from '@higgsfield/client/v2'

const MODEL = 'bytedance/seedance-2.5/text-to-video'

function loadCredentials(): string {
  if (!process.env.HF_CREDENTIALS && existsSync('.env.local')) process.loadEnvFile('.env.local')
  const credentials = process.env.HF_CREDENTIALS
  if (!credentials || !credentials.includes(':')) {
    throw new Error('HF_CREDENTIALS is missing or not in key-id:key-secret format. Add it to .env.local.')
  }
  return credentials
}

async function main(): Promise<number> {
  config({ credentials: loadCredentials() })
  console.log(`Submitting to ${MODEL} (5 s, 720p, 16:9)...`)
  const result = await higgsfield.subscribe(MODEL, {
    input: {
      prompt: 'A cinematic scene at sunset',
      duration: 5,
      resolution: '720p',
      aspect_ratio: '16:9',
    },
    withPolling: true,
  })

  const status: string = result.status
  if (status === 'completed' && result.video?.url) {
    console.log(`Completed. Request ${result.request_id}`)
    console.log(`Video URL: ${result.video.url}`)
    return 0
  }
  if (status === 'completed') console.error(`Request ${result.request_id} completed but returned no video URL.`)
  else if (status === 'nsfw') console.error(`Request ${result.request_id} was rejected by moderation.`)
  else if (status === 'failed') console.error(`Request ${result.request_id} failed (Higgsfield refunds credits for failed jobs).`)
  else if (status === 'canceled' || status === 'cancelled') console.error(`Request ${result.request_id} was canceled.`)
  else console.error(`Request ${result.request_id} ended with unexpected status "${status}".`)
  return 1
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
