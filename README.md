# Shanttoosh V — Portfolio

An interactive portfolio for an AI engineer: one continuous page with my projects, experience, toolkit and contact, plus small demos that run in the browser and links to the live apps.

**Stack:** React 18, TypeScript (strict), Vite, Lenis, Zustand, lucide-react and simple-icons. The site is fully static.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-checks and builds to dist/
npm run preview      # serves dist/ on http://localhost:4173
npm run lint
```

| Variable | Purpose |
| --- | --- |
| `VITE_ROUTER` | `hash` for static hosts that cannot rewrite routes. Vercel uses the default. |

## Where to edit content

Everything visitors read comes from `src/config/`.

| File | Contents |
| --- | --- |
| `src/config/projects.ts` | Projects, case studies, GitHub URLs and **live app URLs** |
| `src/config/thumbnails.ts` | Demo videos, posters and chapter marks for the featured projects |
| `src/config/experience.ts` | Roles and public-safe project summaries |
| `src/config/skills.ts` | Toolkit groups and where each tool was used |
| `src/config/site.ts` | Name, statement, links, sections, education, certifications |

**Live apps.** `demoUrl` must be a real deployed URL; when it is `null` no "Open live" button renders. Deployed today: Thesis (https://thesis-research-nu.vercel.app), the AI Complaint Management Copilot (https://qms-copilot-two.vercel.app) and VaultMind (https://vaultmind-nine.vercel.app).

**In-page demos.** `demoId` links a project to a demo that runs inside the site (`/demos/:id`): voice agent (browser speech recognition), question clarifier and hallucination check.

## How it fits together

```
src/
  config/        content (single source of truth)
  sections/      Intro, Projects, Experience, Skills, Contact
  chrome/        top bar, chapter pill, footer
  chapter/       shared chapter layout
  components/
    projects/    demo video player, demo theatre, case study modal, previews
    demos/       in-page demos and the demo modal
    ui/          buttons, icons, modal, flow
  blocks/        small animated pieces (rolling text, split text, ticker)
  motion/        scroll-driven motion and pointer effects
  lib/           router, scroll, device tier, demo logic
  store/         UI state (Zustand)
  hooks/         demo playback, reduced motion
  design/, styles/  CSS
```

Routes: `/` (the page), `/projects/:slug` (case study), `/demos/:demoId` (in-page demo). Both open as overlays over the page, so closing one returns you to where you were.

**Motion.** Scroll-driven CSS animations (`animation-timeline`), with Lenis smoothing the wheel. A frame-time probe lowers the effects on weak GPUs, and `prefers-reduced-motion` turns animation off. A featured project's demo video plays only on the card in view, once scrolling stops.

## Deploy

**Vercel.** Import the repo; `vercel.json` sets the build, output, SPA rewrites and security headers (CSP included).
