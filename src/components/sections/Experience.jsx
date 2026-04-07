import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';
import { experiences, education } from '../../data/experience';
import SectionLabel from '../ui/SectionLabel';
import { hexToRgb } from '../../utils/colors';

function ExperienceCard({ exp, index }) {
  const rgb = hexToRgb(exp.color);
  const isLeft = index % 2 === 0;

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const cardStyle = {
    background: 'rgba(13,20,36,0.7)',
    backdropFilter: 'blur(16px)',
    border: `1px solid rgba(${rgb},0.2)`,
    borderRadius: 0,
    padding: '24px',
    position: 'relative',
    boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(${rgb},0.05)`,
    transition: 'all 0.3s ease',
  };

  const handleEnter = (e) => {
    e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`;
    e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 30px rgba(${rgb},0.1)`;
  };
  const handleLeave = (e) => {
    e.currentTarget.style.borderColor = `rgba(${rgb},0.2)`;
    e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(${rgb},0.05)`;
  };

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{ marginBottom: 24 }}
      >
        <div style={cardStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <CardContent exp={exp} rgb={rgb} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 40px 1fr',
        gap: 0,
        alignItems: 'flex-start',
        marginBottom: 48,
      }}
    >
      {/* Left card or spacer */}
      {isLeft ? (
        <div style={cardStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <CardContent exp={exp} rgb={rgb} />
        </div>
      ) : <div />}

      {/* Axis dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: exp.color,
          boxShadow: `0 0 12px ${exp.color}, 0 0 24px rgba(${rgb},0.4)`,
          animation: exp.isCurrent ? 'pulseRing 2s ease-out infinite' : 'none',
          zIndex: 2,
          position: 'relative',
        }} />
      </div>

      {/* Right card or spacer */}
      {!isLeft ? (
        <div style={cardStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <CardContent exp={exp} rgb={rgb} />
        </div>
      ) : <div />}
    </motion.div>
  );
}

function CardContent({ exp, rgb }) {
  return (
    <>
      {/* Company + role */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#E2E8F0' }}>{exp.company}</span>
          {exp.isCurrent && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 6px', border: `1px solid rgba(${rgb},0.5)`, color: exp.color, background: `rgba(${rgb},0.1)` }}>
              CURRENT
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: exp.color, marginBottom: 6 }}>{exp.role}</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.6)' }}>
            <Calendar size={10} />{exp.duration}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.6)' }}>
            <MapPin size={10} />{exp.location}
          </span>
        </div>
      </div>

      {/* Highlights */}
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {exp.highlights.slice(0, 3).map((h, i) => (
          <li key={i} style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(226,232,240,0.75)', lineHeight: 1.5 }}>
            <span style={{ color: exp.color, flexShrink: 0, marginTop: 2 }}>›</span>
            {h}
          </li>
        ))}
      </ul>

      {/* Key metric */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.2)`, padding: '4px 12px', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: exp.color, textShadow: `0 0 10px rgba(${rgb},0.6)` }}>{exp.metric.value}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(148,163,184,0.6)' }}>{exp.metric.label}</span>
      </div>

      {/* Tech pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {exp.tech.slice(0, 6).map(t => (
          <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', background: 'rgba(5,8,16,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 2, color: 'rgba(148,163,184,0.6)' }}>
            {t}
          </span>
        ))}
      </div>

      {/* Link */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <a href={exp.url} target="_blank" rel="noopener noreferrer" data-clickable
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: `rgba(${rgb},0.7)` }}>
          Visit Company <ExternalLink size={10} />
        </a>
      </div>
    </>
  );
}

export default function Experience() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <section id="experience" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 60, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SectionLabel>CAREER.LOG</SectionLabel>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            Where I've{' '}
            <span style={{ color: '#7B61FF', textShadow: '0 0 30px rgba(123,97,255,0.4)' }}>Worked</span>
          </h2>
        </motion.div>

        {/* Timeline axis line */}
        <div style={{ position: 'relative' }}>
          {!isMobile && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 1,
              background: 'linear-gradient(to bottom, transparent, rgba(0,255,156,0.3) 10%, rgba(0,255,156,0.3) 90%, transparent)',
              transform: 'translateX(-50%)',
            }} />
          )}

          {/* Experience cards */}
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.id} exp={exp} index={i} />
          ))}
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: 48 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <SectionLabel>EDUCATION.LOG</SectionLabel>
          </div>
          <div style={{
            background: 'rgba(13,20,36,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(123,97,255,0.25)',
            borderRadius: 0,
            padding: '28px 32px',
            maxWidth: 600,
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(123,97,255,0.06)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>
              {education.institution}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(148,163,184,0.6)', marginBottom: 12 }}>
              {education.affiliation}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#7B61FF', marginBottom: 8 }}>
              {education.degree}
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(148,163,184,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={10} /> {education.duration}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(148,163,184,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={10} /> {education.location}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7B61FF', textShadow: '0 0 10px rgba(123,97,255,0.5)' }}>
                GPA: {education.gpa}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
