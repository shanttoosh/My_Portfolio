import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, MessageSquare, FolderOpen } from 'lucide-react';
import TypeWriter from '../ui/TypeWriter';
import { bootLines } from '../../data/bootSequence';

const techPills = ['Python', 'LangGraph', 'FastAPI', 'PostgreSQL', 'React', 'Docker'];

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
    <motion.div onViewportEnter={start}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: '#00FF9C' }}>
        {count}{target.toString().includes('+') ? '+' : ''}
      </span>
    </motion.div>
  );
}

export default function Hero({ onChatClick }) {
  const [bootDone, setBootDone] = useState(false);

  return (
    <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 24px 40px', position: 'relative', zIndex: 10 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 w-full max-w-[1200px] mx-auto">

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Boot terminal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(0,255,156,0.25)',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(0,255,156,0.05), 0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Titlebar */}
            <div style={{ height: 34, background: 'rgba(0,255,156,0.04)', borderBottom: '1px solid rgba(0,255,156,0.08)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(0,255,156,0.4)', margin: '0 auto' }}>
                shanttoosh@ai-lab: ~
              </span>
              {/* Skip button */}
              {!bootDone && (
                <button
                  onClick={() => setBootDone(true)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(148,163,184,0.4)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
                >
                  skip
                </button>
              )}
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <TypeWriter lines={bootLines} startDelay={200} onComplete={() => setBootDone(true)} />
            </div>
          </motion.div>

          {/* Name + CTA always visible, fades in */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: bootDone ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(42px, 6vw, 72px)',
                fontWeight: 800,
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #00FF9C 0%, #7B61FF 25%, #22D3EE 50%, #FF6B35 75%, #00FF9C 100%)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'holoShimmer 4s ease infinite',
                display: 'inline-block',
                marginBottom: 10,
              }}
            >
              Shanttoosh V
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#00FF9C', marginBottom: 28, opacity: 0.9 }}>
              AI Developer · Chennai, India
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={onChatClick}
                data-clickable
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 22px',
                  background: 'linear-gradient(135deg, rgba(0,255,156,0.15), rgba(123,97,255,0.12))',
                  border: '1px solid rgba(0,255,156,0.45)',
                  color: '#00FF9C', fontFamily: 'var(--font-mono)', fontSize: 13,
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: '0 0 20px rgba(0,255,156,0.08)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #00FF9C, #7B61FF)';
                  e.currentTarget.style.color = '#050810';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,156,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,156,0.15), rgba(123,97,255,0.12))';
                  e.currentTarget.style.color = '#00FF9C';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,156,0.08)';
                }}
              >
                <MessageSquare size={14} />
                Talk to My AI
              </button>

              <button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                data-clickable
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 22px',
                  background: 'transparent',
                  border: '1px solid rgba(148,163,184,0.25)',
                  color: '#94A3B8', fontFamily: 'var(--font-mono)', fontSize: 13,
                  cursor: 'pointer', transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.5)'; e.currentTarget.style.color = '#E2E8F0'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)'; e.currentTarget.style.color = '#94A3B8'; }}
              >
                <FolderOpen size={14} />
                View Projects
              </button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Orb + Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}
        >
          {/* Orb */}
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <div style={{
              position: 'absolute', inset: -20, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,255,156,0.06) 0%, transparent 70%)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }} />
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(0,255,156,0.1), rgba(123,97,255,0.07), rgba(5,8,16,0.95))',
              border: '1px solid rgba(0,255,156,0.18)',
              boxShadow: '0 0 60px rgba(0,255,156,0.08), inset 0 0 40px rgba(0,255,156,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {[[60,60,20,30],[60,60,100,30],[60,60,20,90],[60,60,100,90],[60,60,60,15],[60,60,60,105]].map(([x1,y1,x2,y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,255,156,0.2)" strokeWidth="0.8" />
                ))}
                {[[60,60,'rgba(0,255,156,0.9)',5],[20,30,'rgba(123,97,255,0.7)',3],[100,30,'rgba(0,255,156,0.6)',3],[20,90,'rgba(0,255,156,0.5)',3],[100,90,'rgba(123,97,255,0.7)',3]].map(([cx,cy,fill,r], i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill={fill} style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,156,0.5))' }} />
                ))}
              </svg>
            </div>

            {/* Orbiting tech pills */}
            {techPills.map((tech, i) => {
              const angle = (i / techPills.length) * 360;
              const rad = (angle * Math.PI) / 180;
              const radius = 148;
              return (
                <div key={tech} style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: `translate(calc(-50% + ${Math.cos(rad) * radius}px), calc(-50% + ${Math.sin(rad) * radius}px))`,
                  background: 'rgba(13,20,36,0.92)',
                  border: '1px solid rgba(0,255,156,0.18)',
                  padding: '3px 8px',
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00FF9C', whiteSpace: 'nowrap',
                  animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}>
                  {tech}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32 }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <CountUp target={stat.value} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {bootDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(148,163,184,0.3)', letterSpacing: '0.1em' }}>SCROLL</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ArrowDown size={13} style={{ color: 'rgba(148,163,184,0.25)' }} />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
