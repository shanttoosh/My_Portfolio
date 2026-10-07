/** A button or link label that rolls up on hover, with a copy rolling in from below. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll" data-text={children}>
      <span>{children}</span>
    </span>
  )
}
