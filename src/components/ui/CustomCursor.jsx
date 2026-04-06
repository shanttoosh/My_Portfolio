import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const outerPosRef = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e) => {
      const el = e.target;
      const clickable = el.closest('a, button, [role="button"], input, textarea, [data-clickable]');
      setIsHovering(!!clickable);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    const animate = () => {
      const inner = innerRef.current;
      const outer = outerRef.current;
      if (!inner || !outer) { rafRef.current = requestAnimationFrame(animate); return; }

      // Inner follows exactly
      inner.style.left = posRef.current.x + 'px';
      inner.style.top = posRef.current.y + 'px';

      // Outer lags (lerp factor 0.12)
      outerPosRef.current.x += (posRef.current.x - outerPosRef.current.x) * 0.12;
      outerPosRef.current.y += (posRef.current.y - outerPosRef.current.y) * 0.12;
      outer.style.left = outerPosRef.current.x + 'px';
      outer.style.top = outerPosRef.current.y + 'px';

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={outerRef} className={`custom-cursor-outer ${isHovering ? 'hovering' : ''}`} aria-hidden="true" />
      <div ref={innerRef} className={`custom-cursor-inner ${isHovering ? 'hovering' : ''}`} aria-hidden="true" />
    </>
  );
}
