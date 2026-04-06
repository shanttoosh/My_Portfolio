import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKonamiCode } from '../../hooks/useKonamiCode';

export default function KonamiEasterEgg() {
  const { activated, reset } = useKonamiCode();

  return (
    <AnimatePresence>
      {activated && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, cursor: 'none' }}
          />

          {/* Terminal modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(520px, 92vw)',
              background: 'rgba(0,0,0,0.95)',
              border: '1px solid rgba(0,255,156,0.4)',
              borderBottom: 'none',
              zIndex: 1000,
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 0 60px rgba(0,255,156,0.15)',
            }}
          >
            {/* Title bar */}
            <div style={{ height: 36, background: 'rgba(0,255,156,0.06)', borderBottom: '1px solid rgba(0,255,156,0.1)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
              <span style={{ margin: '0 auto', fontSize: 11, color: 'rgba(0,255,156,0.5)' }}>secret_access.sh</span>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', lineHeight: 2, fontSize: 13 }}>
              <div style={{ color: '#00FF9C' }}>&gt; ACCESS GRANTED — clearance level: RECRUITER</div>
              <div style={{ color: 'rgba(226,232,240,0.6)' }}>&gt; Decrypting secret file...</div>
              <div style={{ color: 'rgba(74,85,104,0.5)', marginTop: 4 }}>...</div>
              <div style={{ color: '#E2E8F0', marginTop: 8 }}>
                &gt; You found the easter egg.{' '}
                <span style={{ color: '#FF6B35' }}>Respect.</span>
              </div>
              <div style={{ color: '#E2E8F0' }}>
                &gt; Direct line:{' '}
                <a href="mailto:shanttoosh@gmail.com" style={{ color: '#00FF9C', textDecoration: 'underline' }}>
                  shanttoosh@gmail.com
                </a>
              </div>
              <div style={{ color: '#E2E8F0' }}>
                &gt; Tell me you found this and I'll reply in 1 hour.
              </div>
              <div style={{ color: 'rgba(74,85,104,0.5)', fontSize: 11, marginTop: 8 }}>
                // ↑↑↓↓←→←→BA — classic.
              </div>

              <button
                onClick={reset}
                data-clickable
                style={{
                  marginTop: 20,
                  padding: '8px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(0,255,156,0.3)',
                  color: '#00FF9C',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  cursor: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,156,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                [ Close terminal ]
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
