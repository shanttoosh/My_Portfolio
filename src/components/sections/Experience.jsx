import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';
import { experiences, education } from '../../data/experience';
import SectionLabel from '../ui/SectionLabel';
import { hexToRgb } from '../../utils/colors';

function ExperienceCard({ exp, index }) {
  const isLeft = index % 2 === 0;

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{ marginBottom: 24 }}
      >
        <div className="card" style={{ padding: 24, borderLeft: `3px solid ${exp.color}` }}>
          <CardContent exp={exp} />
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
        <div className="card" style={{ padding: 24, borderLeft: `3px solid ${exp.color}` }}>
          <CardContent exp={exp} />
        </div>
      ) : <div />}

      {/* Axis dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
        <div style={{
          width: exp.isCurrent ? 14 : 10,
          height: exp.isCurrent ? 14 : 10,
          borderRadius: '50%',
          background: exp.color,
          zIndex: 2,
          position: 'relative',
        }} />
      </div>

      {/* Right card or spacer */}
      {!isLeft ? (
        <div className="card" style={{ padding: 24, borderLeft: `3px solid ${exp.color}` }}>
          <CardContent exp={exp} />
        </div>
      ) : <div />}
    </motion.div>
  );
}

function CardContent({ exp }) {
  const rgb = hexToRgb(exp.color);
  return (
    <>
      {/* Company + role */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>{exp.company}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.6)', background: 'rgba(255,255,255,0.04)', borderRadius: 0 }}>
            {exp.isCurrent ? 'FULL-TIME' : 'INTERN/CONTRACT'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: exp.color, marginBottom: 6 }}>{exp.role}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(226,232,240,0.45)', fontStyle: 'italic', marginTop: 10 }}>
          An AI and software engineering company...
        </div>
      </div>

      {/* Highlights */}
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {exp.highlights.slice(0, 3).map((h, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(226,232,240,0.7)', lineHeight: 1.6 }}>
            <span style={{ color: exp.color, flexShrink: 0 }}>›</span>
            {h}
          </li>
        ))}
      </ul>

      {/* Tech pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {exp.tech.slice(0, 6).map(t => (
          <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 0, color: 'rgba(148,163,184,0.7)' }}>
            {t}
          </span>
        ))}
      </div>

      {/* Key metric */}
      <div style={{ 
        display: 'inline-block', 
        background: `rgba(${rgb},0.06)`, 
        borderLeft: `2px solid ${exp.color}`, 
        padding: '8px 12px',
        marginTop: 'auto'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: exp.color }}>{exp.metric.value}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>{exp.metric.label}</div>
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
            Where I've Worked
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
              background: 'rgba(255,255,255,0.08)',
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
          <div className="card" style={{
            borderLeft: '3px solid #6366F1',
            padding: '24px',
            maxWidth: 600,
            margin: '0 auto',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>
              {education.institution}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(148,163,184,0.6)', marginBottom: 12 }}>
              {education.affiliation}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#6366F1', marginBottom: 16 }}>
              {education.degree}
            </div>
            
            <div style={{ 
              display: 'inline-block', 
              background: 'rgba(99,102,241,0.06)', 
              borderLeft: '2px solid #6366F1', 
              padding: '8px 12px',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#6366F1' }}>{education.gpa}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>CUMULATIVE GPA</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
