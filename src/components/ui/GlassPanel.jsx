import React from 'react';

export default function GlassPanel({ children, variant = 'default', hover = true, className = '', style = {} }) {
  const variantClass = variant !== 'default' ? `glass-panel--${variant}` : '';
  const hoverClass = hover ? 'glass-panel--hover' : '';
  return (
    <div className={`glass-panel ${variantClass} ${hoverClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
