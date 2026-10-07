/**
 * The site's mark: an S drawn as one path between two nodes, like a step-by-step AI workflow. This is the small-size
 * cut (heavier strokes, larger nodes) for the top bar and favicon; public/apple-touch-icon.png uses the lighter one.
 */
export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <rect width="64" height="64" rx="15" fill="#08090a" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" />
      <path
        d="M43.5 17H24a6 6 0 0 0-6 6v3a6 6 0 0 0 6 6h16a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6H20.5"
        fill="none"
        stroke="#f4f5f6"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="17" r="6.75" fill="#c8ff4d" />
      <circle cx="18" cy="47" r="6.75" fill="#c8ff4d" />
    </svg>
  )
}
