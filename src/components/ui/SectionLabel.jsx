import React from 'react';

export default function SectionLabel({ children }) {
  return (
    <div className="section-label">
      <span style={{ color: 'rgba(0,255,156,0.5)' }}>&gt;</span>
      {children}
    </div>
  );
}
