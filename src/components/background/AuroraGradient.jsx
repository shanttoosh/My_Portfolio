import React from 'react';

export default function AuroraGradient() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 20% 0%,
            rgba(0,255,156,0.04) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 100%,
            rgba(123,97,255,0.03) 0%, transparent 60%)
        `,
      }}
    />
  );
}
