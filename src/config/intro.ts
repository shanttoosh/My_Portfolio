import introPoster from '../assets/intro/intro-poster.webp'
import introVideo from '../assets/intro/intro-stacked.mp4'

/**
 * The hero's hello: a 3D cartoon of Shanttoosh with his robot, animated from an approved still with its own voice
 * (Kling 3.0 through Higgsfield), then cut out frame by frame. The video is "stacked alpha": colour in the top half,
 * transparency in the bottom half (see lib/stackedAlpha.ts). `size` is one half, in pixels.
 */
export const intro = {
  poster: introPoster,
  video: introVideo,
  size: { width: 672, height: 960 },
  alt: 'A 3D cartoon of Shanttoosh in a black hoodie, joggers and white sneakers, waving, with a small white robot with lime-green eyes floating beside him.',
} as const
