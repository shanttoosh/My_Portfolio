import { create } from 'zustand'
import { detectTier, type Tier } from '../lib/device'
import type { SectionId } from '../types'

export type Theme = 'dark' | 'light'

function initialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

interface UiState {
  section: SectionId
  setSection: (section: SectionId) => void
  theme: Theme
  toggleTheme: () => void
  touring: boolean
  setTouring: (touring: boolean) => void
  finale: boolean
  setFinale: (finale: boolean) => void
  videoOpen: boolean
  setVideoOpen: (open: boolean) => void
  selectedSkill: string
  setSelectedSkill: (name: string) => void
  /** What this device can afford; see lib/device.ts. */
  tier: Tier
  setTier: (tier: Tier) => void
  /** Smooth (inertial) wheel scrolling; switched off only if the frame probe finds the device cannot keep up. */
  smooth: boolean
  setSmooth: (smooth: boolean) => void
}

export const useUi = create<UiState>((set, get) => ({
  section: 'intro',
  setSection: (section) => {
    if (get().section !== section) set({ section })
  },
  theme: initialTheme(),
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('sv-theme', theme)
    } catch {
      /* storage unavailable */
    }
    set({ theme })
  },
  touring: false,
  setTouring: (touring) => set({ touring }),
  finale: false,
  setFinale: (finale) => set({ finale }),
  videoOpen: false,
  setVideoOpen: (videoOpen) => set({ videoOpen }),
  selectedSkill: 'LangGraph',
  setSelectedSkill: (selectedSkill) => set({ selectedSkill }),
  tier: detectTier(),
  setTier: (tier) => {
    document.documentElement.dataset.tier = tier
    set({ tier })
  },
  smooth: true,
  setSmooth: (smooth) => set({ smooth }),
}))
