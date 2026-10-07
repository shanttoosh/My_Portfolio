/**
 * Draws a "stacked-alpha" video into a canvas: each frame holds the colour in its top half and the transparency, as
 * grey, in its bottom half (one ordinary H.264 file, so it plays in every browser, Safari included). A two-line
 * fragment shader recombines them, so the character stands on the page with nothing around it.
 * After Jake Archibald, "Video with alpha transparency on the web" (2024).
 */
const VERTEX = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FRAGMENT = `
precision mediump float;
uniform sampler2D frame;
varying vec2 uv;
void main() {
  vec3 colour = texture2D(frame, vec2(uv.x, uv.y * 0.5)).rgb;
  float alpha = texture2D(frame, vec2(uv.x, 0.5 + uv.y * 0.5)).g;
  gl_FragColor = vec4(colour * alpha, alpha);
}`

export interface StackedAlphaRenderer {
  /** Uploads the video's current frame and draws it. */
  draw: () => void
  /** Matches the drawing buffer to the canvas's on-screen size. */
  resize: () => void
  dispose: () => void
}

/** Returns null where WebGL is unavailable; the caller then keeps its still. */
export function createStackedAlphaRenderer(canvas: HTMLCanvasElement, video: HTMLVideoElement): StackedAlphaRenderer | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: 'low-power' })
  if (!gl) return null

  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, source)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = shader(gl.VERTEX_SHADER, VERTEX)
  const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  // One quad covering the canvas.
  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const p = gl.getAttribLocation(program, 'p')
  gl.enableVertexAttribArray(p)
  gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.clearColor(0, 0, 0, 0)

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(canvas.clientWidth * dpr)
    const h = Math.round(canvas.clientHeight * dpr)
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()

  return {
    draw: () => {
      if (video.readyState < 2) return
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
    resize,
    dispose: () => {
      gl.deleteTexture(texture)
      gl.deleteBuffer(quad)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
