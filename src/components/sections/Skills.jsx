import React from 'react';
import { motion } from 'framer-motion';
import { skillCategories } from '../../data/skills';
import SectionLabel from '../ui/SectionLabel';

export default function Skills() {
  const getProficiencyColor = (level) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return '#00FF9C';
      case 'proficient':
      case 'strong':
        return 'rgba(0,255,156,0.5)';
      case 'familiar':
        return 'rgba(148,163,184,0.4)';
      case 'certified':
        return '#FBBF24';
      default:
        return 'rgba(148,163,184,0.4)';
    }
  };

  return (
    <section id="skills" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SectionLabel>SKILLS.LOG</SectionLabel>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            Technical Foundation
          </h2>
        </motion.div>

        {/* 2-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {skillCategories.map((cat, catIndex) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              className="card"
              style={{
                borderTop: `2px solid ${cat.color}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: cat.color,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 16
              }}>
                {cat.label}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {cat.skills.map((skill, i) => (
                  <div
                    key={skill.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: i < cat.skills.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'rgba(226,232,240,0.8)'
                    }}>
                      {skill.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: getProficiencyColor(skill.level),
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}>
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
