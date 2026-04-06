import React, { useEffect, useState } from 'react';

export default function TypeWriter({ lines = [], onComplete, startDelay = 0 }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayed, setDisplayed] = useState([]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started || lineIndex >= lines.length) return;
    const line = lines[lineIndex];

    if (line.text === '') {
      // Empty line — just advance after a pause
      const t = setTimeout(() => {
        setDisplayed(prev => [...prev, { text: '', color: line.color }]);
        setLineIndex(i => i + 1);
        setCharIndex(0);
      }, 200);
      return () => clearTimeout(t);
    }

    if (charIndex < line.text.length) {
      const speed = line.speed || 30;
      const t = setTimeout(() => {
        setCharIndex(i => i + 1);
        setDisplayed(prev => {
          const next = [...prev];
          next[lineIndex] = { text: line.text.slice(0, charIndex + 1), color: line.color };
          return next;
        });
      }, speed);
      return () => clearTimeout(t);
    } else {
      // Line complete — move to next after pause
      const t = setTimeout(() => {
        setLineIndex(i => i + 1);
        setCharIndex(0);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [started, lineIndex, charIndex, lines]);

  useEffect(() => {
    if (lineIndex >= lines.length && lines.length > 0) {
      setDone(true);
      if (onComplete) onComplete();
    }
  }, [lineIndex, lines.length, onComplete]);

  const getColor = (color) => {
    if (color === 'bright') return '#00FF9C';
    if (color === 'white') return '#E2E8F0';
    return 'rgba(0,255,156,0.5)';
  };

  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
      {displayed.map((line, i) => (
        <div key={i} style={{ color: getColor(line.color) }}>
          {line.text}
        </div>
      ))}
      {!done && lineIndex < lines.length && (
        <div style={{ color: getColor(lines[lineIndex]?.color) }} className="typing-cursor">&nbsp;</div>
      )}
    </div>
  );
}
