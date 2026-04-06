import { useState, useEffect, useRef } from 'react';

export function useKonamiCode() {
  const [activated, setActivated] = useState(false);
  const sequenceRef = useRef([]);
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  useEffect(() => {
    const handler = (e) => {
      sequenceRef.current.push(e.key);
      if (sequenceRef.current.length > KONAMI.length) {
        sequenceRef.current.shift();
      }
      if (sequenceRef.current.join(',') === KONAMI.join(',')) {
        setActivated(true);
        sequenceRef.current = [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const reset = () => setActivated(false);
  return { activated, reset };
}
