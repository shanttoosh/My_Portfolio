import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Github } from '../ui/Icons';
import { projects } from '../../data/projects';
import { hexToRgb } from '../../utils/colors';

function MetricBar({ metrics, color }) {
  if (!metrics || metrics.length === 0) return null;
  const rgb = hexToRgb(color);
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
      {metrics.map(m => (
        <div key={m.label} style={{ background: `rgba(${rgb},0.07)`, border: `1px solid rgba(${rgb},0.18)`, padding: '4px 10px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color }}>{m.value}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(148,163,184,0.6)', marginLeft: 5 }}>{m.label}</span>
        </div>
      ))}
    </div>
  );
}


function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isHero = project.id === 'nl2sql';
  const rgb = hexToRgb(project.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      style={{ gridColumn: isHero ? 'span 2' : 'span 1' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: 'relative',
        background: 'rgba(13,20,36,0.72)',
        backdropFilter: 'blur(16px)',
        border: `1px solid rgba(${rgb},${hovered ? 0.4 : 0.15})`,
        padding: isHero ? '24px' : '18px',
        height: '100%',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(${rgb},0.12)`
          : `0 8px 24px rgba(0,0,0,0.25)`,
        overflow: 'hidden',
      }}>
        {/* Corner accents on hover */}
        {hovered && (
          <>
            <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: `2px solid ${project.color}`, borderLeft: `2px solid ${project.color}` }} />
            <div style={{ position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderTop: `2px solid ${project.color}`, borderRight: `2px solid ${project.color}` }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 10, height: 10, borderBottom: `2px solid ${project.color}`, borderLeft: `2px solid ${project.color}` }} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: `2px solid ${project.color}`, borderRight: `2px solid ${project.color}` }} />
          </>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          {/* Tag badge */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
            padding: '3px 7px',
            background: `rgba(${rgb},0.1)`,
            border: `1px solid rgba(${rgb},0.3)`,
            color: project.color,
            letterSpacing: '0.12em',
            alignSelf: 'flex-start',
            marginTop: 2,
          }}>
            {project.tag}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: isHero ? 17 : 14, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.25 }}>
              {project.name}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(148,163,184,0.45)', marginTop: 2 }}>
              {project.type}
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            padding: '2px 8px',
            border: `1px solid rgba(${rgb},0.35)`,
            color: project.color,
            background: `rgba(${rgb},0.06)`,
            whiteSpace: 'nowrap',
          }}>
            {project.status}
          </div>
        </div>

        {/* Description */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: isHero ? 14 : 13, color: 'rgba(226,232,240,0.65)', lineHeight: 1.65, marginBottom: 12 }}>
          {isHero ? project.fullDescription : project.description}
        </p>

        {/* Metrics */}
        {isHero && <MetricBar metrics={project.metrics} color={project.color} />}


        {/* Tech stack */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 }}>
          {project.techStack.slice(0, isHero ? 8 : 5).map(tech => (
            <span key={tech} style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              padding: '2px 7px',
              background: 'rgba(5,8,16,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(148,163,184,0.6)',
            }}>
              {tech}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: project.color, cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
            aria-label={`View ${project.name} on GitHub`}
          >
            <Github size={12} />
            View on GitHub
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ marginBottom: 16 }}>
            <div className="section-label">PROJECTS.DIR</div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            What I've{' '}
            <span style={{ color: '#00FF9C', textShadow: '0 0 30px rgba(0,255,156,0.4)' }}>Built</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: 40 }}
        >
          <a
            href="https://github.com/shanttoosh"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px',
              border: '1px solid rgba(148,163,184,0.18)',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'rgba(148,163,184,0.6)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,156,0.35)'; e.currentTarget.style.color = '#00FF9C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)'; e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; }}
          >
            <Github size={14} />
            View all on GitHub
            <ExternalLink size={12} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
