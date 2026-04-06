import React from 'react';

export default function AuroraGradient() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Blob 1 — Violet, top-left */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        top: -200, left: -200,
        background: 'radial-gradient(ellipse, rgba(123,97,255,0.25) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'auroraFloat1 18s ease-in-out infinite',
      }} />
      {/* Blob 2 — Mint, bottom-right */}
      <div style={{
        position: 'absolute',
        width: 700, height: 700,
        bottom: -300, right: -200,
        background: 'radial-gradient(ellipse, rgba(0,255,156,0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'auroraFloat2 22s ease-in-out infinite',
      }} />
      {/* Blob 3 — Orange, center */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        top: '40%', left: '40%',
        background: 'radial-gradient(ellipse, rgba(255,107,53,0.10) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'auroraFloat3 15s ease-in-out infinite',
      }} />
    </div>
  );
}
