import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `vite preview` serves the same security headers as production (vercel.json), so they are tested locally.
// upgrade-insecure-requests is left out locally: preview runs on plain http.
type HeaderRule = { source: string; headers: { key: string; value: string }[] }
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as { headers: HeaderRule[] }
const site = vercel.headers.find((h) => h.source === '/(.*)')?.headers ?? []
const previewHeaders = Object.fromEntries(site.map((h) => [h.key, h.value.replace(/;\s*upgrade-insecure-requests/, '')]))

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
  preview: {
    headers: previewHeaders,
  },
})
