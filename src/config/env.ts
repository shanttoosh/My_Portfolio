// Read by name, so Vite inlines only this value into the public bundle.
export const env = {
  routerMode: import.meta.env.VITE_ROUTER === 'hash' ? 'hash' : 'browser',
} as const
