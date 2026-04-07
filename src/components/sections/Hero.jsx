import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { bootLines } from '../../data/bootSequence';
import TypeWriter from '../ui/TypeWriter';

const stats = [
  { value: '7', label: 'Projects Built' },
  { value: '3', label: 'Roles' },
  { value: '2+', label: 'Years Building AI' },
];

function CountUp({ target }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const start = () => {
    if (started) return;
    setStarted(true);
    const num = parseInt(target);
    if (isNaN(num)) { setCount(target); return; }
    let current = 0;
    const step = Math.ceil(num / 30);
    const interval = setInterval(() => {
      current = Math.min(current + step, num);
      setCount(current);
      if (current >= num) clearInterval(interval);
    }, 50);
  };

  return (
    <motion.div onViewportEnter={start} style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#00FF9C' }}>
        {count}{target.toString().includes('+') ? '+' : ''}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.6)', letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase' }}>
        {target.toString().includes('+') ? 'YRS AI EXPERIENCE' : labelForStat(target)}
      </span>
    </motion.div>
  );
}

function labelForStat(target) {
  if (target === '7') return 'Projects Built';
  if (target === '3') return 'Roles';
  return 'Years Building AI';
}

export default function Hero({ onChatClick }) {
  const [bootDone, setBootDone] = useState(false);

  const scrollToProjects = () => {
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '80px 24px 40px', 
      maxWidth: 1100, 
      margin: '0 auto',
      position: 'relative', 
      zIndex: 10 
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 64,
        width: '100%',
        alignItems: 'center'
      }}>
        
        {/* LEFT COLUMN: IDENT & INTRO */}
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '20px' }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Status Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,255,156,0.06)',
              border: '1px solid rgba(0,255,156,0.15)',
              borderRadius: 0,
              padding: '5px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'rgba(0,255,156,0.7)',
              marginBottom: 20
            }}>
              <div style={{ width: 6, height: 6, backgroundColor: '#00FF9C', borderRadius: '50%' }} />
              AI Developer · Available
            </div>

            {/* Name */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 5.5vw, 68px)',
              fontWeight: 800,
              color: '#E2E8F0',
              lineHeight: 1.1,
              margin: '16px 0 0 0'
            }}>
              Shanttoosh V
            </h1>

            {/* Role line */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 16,
              color: 'rgba(0,255,156,0.75)',
              marginTop: 12,
              letterSpacing: '0.02em'
            }}>
              AI Developer · Chennai, India
            </div>

            {/* Bio */}
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'rgba(226,232,240,0.65)',
              lineHeight: 1.7,
              marginTop: 16,
              maxWidth: 420
            }}>
              I build production-grade AI systems — NL2SQL agents, RAG pipelines, and multi-agent LLMs that actually ship.
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <button 
                onClick={onChatClick}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,156,0.85)'}
                onMouseLeave={e => e.currentTarget.style.background = '#00FF9C'}
                style={{
                  background: '#00FF9C',
                  color: '#050810',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'background 200ms ease'
                }}
              >
                Talk to My AI
              </button>
              <button 
                onClick={scrollToProjects}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#E2E8F0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  padding: '12px 24px',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'border-color 200ms ease'
                }}
              >
                View Projects
              </button>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex',
              gap: 32,
              marginTop: 40,
              alignItems: 'center'
            }}>
              {stats.map((stat, i) => (
                <React.Fragment key={stat.label}>
                  <CountUp target={stat.value} />
                  {i < stats.length - 1 && (
                    <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.08)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>

          </motion.div>
        </div>

        {/* RIGHT COLUMN: BOOT TERMINAL */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(0,255,156,0.15)',
            borderRadius: 0,
            width: '100%',
            maxWidth: 480,
            overflow: 'hidden'
          }}>
            {/* Titlebar */}
            <div style={{
              height: 32,
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px'
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FEBC2E' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840' }} />
              </div>
              <div style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'rgba(148,163,184,0.4)',
                marginRight: 42 /* rough offset for dot width to keep text centered */
              }}>
                shanttoosh@portfolio:~
              </div>
            </div>

            {/* Terminal Body */}
            <div style={{ padding: 16 }}>
              <TypeWriter 
                lines={bootLines} 
                speed={15} 
                className="font-mono text-[11px] leading-[1.6]"
                onComplete={() => setBootDone(true)}
              />

              {bootDone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <div style={{ color: 'rgba(0,255,156,0.5)', fontSize: 12, marginTop: 12, fontFamily: 'var(--font-mono)' }}>
                    {'>'} Ask my AI anything about me ↓ <span className="animate-pulse">█</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {bootDone && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 1 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'rgba(148,163,184,0.3)',
                marginTop: 16,
                width: '100%',
                maxWidth: 480,
                textAlign: 'center'
              }}
            >
              ↓ scroll to explore
            </motion.div>
          )}

        </motion.div>

      </div>
    </section>
  );
}
