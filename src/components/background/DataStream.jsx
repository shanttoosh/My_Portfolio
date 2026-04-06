import React, { useEffect, useRef } from 'react';

export default function DataStream() {
  const innerRef = useRef(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const lines = Array.from({ length: 80 }, () =>
      Math.random().toString(16).slice(2, 4).toUpperCase()
    );
    el.textContent = [...lines, ...lines].join('\n');
  }, []);

  return (
    <div className="data-stream hidden md:block" aria-hidden="true">
      <div className="data-stream-inner" ref={innerRef} />
    </div>
  );
}
