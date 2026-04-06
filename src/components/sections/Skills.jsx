import React from 'react';
import { motion } from 'framer-motion';
import { skillCategories } from '../../data/skills';
import SectionLabel from '../ui/SectionLabel';
import { hexToRgb } from '../../utils/colors';

export default function Skills() {
  return (
    <section id="skills" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SectionLabel>SKILLS.MAP</SectionLabel>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            Tech{' '}
            <span style={{ color: '#22D3EE', textShadow: '0 0 30px rgba(34,211,238,0.4)' }}>Stack</span>
          </h2>
        </motion.div>

        {/* Skills grouped by category */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {skillCategories.map((cat, ci) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: ci * 0.08 }}
              style={{
                background: 'rgba(13,20,36,0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 0,
                padding: '20px',
                borderTop: `2px solid ${cat.color}`,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: cat.color, letterSpacing: '0.15em', marginBottom: 14, textTransform: 'uppercase' }}>
                {cat.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cat.skills.map(skill => (
                  <SkillPill key={skill.name} skill={skill} color={cat.color} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: 40 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <SectionLabel>CERTIFICATIONS</SectionLabel>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {[
              'Google Data Analytics Professional',
              'Google Analytics — 92%',
              'SQL — HackerRank',
              'Prompt Engineering',
              'Git',
            ].map(cert => (
              <div key={cert} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                padding: '6px 14px',
                background: 'rgba(13,20,36,0.7)',
                border: '1px solid rgba(0,255,156,0.15)',
                borderRadius: 0,
                color: 'rgba(226,232,240,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ color: '#00FF9C' }}>✓</span> {cert}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SkillPill({ skill, color }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        padding: '4px 10px',
        background: hovered ? `rgba(${hexToRgb(color)},0.1)` : 'rgba(5,8,16,0.6)',
        border: `1px solid ${hovered ? color : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `2px solid ${color}`,
        borderRadius: 0,
        color: hovered ? color : 'rgba(148,163,184,0.7)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      {skill.name}
    </div>
  );
}


