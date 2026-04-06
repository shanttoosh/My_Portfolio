/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#050810',
        'bg-surface': '#0D1424',
        'bg-elevated': '#111827',
        'primary': '#00FF9C',
        'secondary': '#7B61FF',
        'tertiary': '#FF6B35',
        'accent-cyan': '#22D3EE',
        'accent-yellow': '#FBBF24',
        'text-primary': '#E2E8F0',
        'text-secondary': '#94A3B8',
        'text-muted': '#4A5568',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'holo-shimmer': 'holoShimmer 4s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'spin-slow': 'spin 8s linear infinite',
        'orbit': 'orbit 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        holoShimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 255, 156, 0.3)',
        'neon-violet': '0 0 20px rgba(123, 97, 255, 0.3)',
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.3)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
      },
    },
  },
  plugins: [],
}
