import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Github, Linkedin } from '../ui/Icons';
import SectionLabel from '../ui/SectionLabel';
import { hexToRgb } from '../../utils/colors';

function TypedStatus() {
  const lines = [
    { text: '> Status: Online and building', color: '#00FF9C' },
    { text: '> Response time: Usually within 24 hours', color: 'rgba(226,232,240,0.7)' },
    { text: '> Location: Chennai, India (IST/UTC+5:30)', color: 'rgba(226,232,240,0.7)' },
    { text: '> Open to: Remote, Part-time Freelance', color: 'rgba(226,232,240,0.7)' },
  ];

  return (
    <div style={{
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 0,
      padding: '16px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 2,
      marginTop: 32,
      textAlign: 'left'
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.color }}>{l.text}</div>
      ))}
    </div>
  );
}

const contactLinks = [
  {
    icon: Mail,
    label: 'shanttoosh@gmail.com',
    href: 'mailto:shanttoosh@gmail.com',
    color: '#00FF9C',
  },
  {
    icon: Linkedin,
    label: 'linkedin.com/in/shanttoosh-v',
    href: 'https://www.linkedin.com/in/shanttoosh-v-470484289/',
    color: '#7B61FF',
  },
  {
    icon: Github,
    label: 'github.com/shanttoosh',
    href: 'https://github.com/shanttoosh',
    color: '#22D3EE',
  },
];

export default function Contact() {
  return (
    <section id="contact" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 32 }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#E2E8F0' }}>
            Let's build something.
          </h2>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(226,232,240,0.5)', lineHeight: 1.7, marginTop: 12 }}>
            Open to remote AI roles and part-time freelance.<br />
            Usually reply within 24 hours.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {/* Contact links */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {contactLinks.map(link => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('mailto') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(11,17,32,0.6)',
                    borderRadius: 0,
                    marginTop: 8,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.background = 'rgba(11,17,32,0.9)';
                    e.currentTarget.querySelector('.lbl').style.color = '#E2E8F0';
                    e.currentTarget.querySelector('.arr').style.color = 'rgba(226,232,240,0.6)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.background = 'rgba(11,17,32,0.6)';
                    e.currentTarget.querySelector('.lbl').style.color = 'rgba(226,232,240,0.7)';
                    e.currentTarget.querySelector('.arr').style.color = 'rgba(148,163,184,0.3)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon size={16} style={{ color: link.color }} />
                    <span 
                      className="lbl" 
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(226,232,240,0.7)', transition: 'color 0.2s' }}
                    >
                      {link.label}
                    </span>
                  </div>
                  <span 
                    className="arr" 
                    style={{ fontFamily: 'var(--font-mono)', color: 'rgba(148,163,184,0.3)', transition: 'color 0.2s' }}
                  >
                    →
                  </span>
                </a>
              );
            })}
          </div>

          <TypedStatus />

          {/* Resume link */}
          <div style={{ marginTop: 24, paddingBottom: 40 }}>
            <a
              href="/resume.pdf"
              download="ShanttooshV_Resume.pdf"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'rgba(148,163,184,0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(226,232,240,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
            >
              Download Resume (PDF) ↓
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
