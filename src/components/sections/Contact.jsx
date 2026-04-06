import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Terminal } from 'lucide-react';
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
      border: '1px solid rgba(0,255,156,0.15)',
      borderRadius: 0,
      padding: '16px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 2,
      marginTop: 24,
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
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SectionLabel>CONTACT.INIT</SectionLabel>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            Let's Build{' '}
            <span style={{ color: '#FF6B35', textShadow: '0 0 30px rgba(255,107,53,0.4)' }}>Something</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(148,163,184,0.7)', marginTop: 12 }}>
            The fastest way to reach Shanttoosh:
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: 'rgba(13,20,36,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,255,156,0.15)',
            borderRadius: 0,
            padding: '32px',
            boxShadow: '0 0 40px rgba(0,255,156,0.05), 0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Contact links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
            {contactLinks.map(link => {
              const Icon = link.icon;
              const rgb = hexToRgb(link.color);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('mailto') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  data-clickable
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    border: `1px solid rgba(${rgb},0.2)`,
                    borderRadius: 0,
                    color: 'rgba(226,232,240,0.8)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    transition: 'all 0.25s ease',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `rgba(${rgb},0.5)`;
                    e.currentTarget.style.background = `rgba(${rgb},0.06)`;
                    e.currentTarget.style.color = link.color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `rgba(${rgb},0.2)`;
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(226,232,240,0.8)';
                  }}
                >
                  <Icon size={16} style={{ color: link.color, flexShrink: 0 }} />
                  {link.label}
                </a>
              );
            })}
          </div>

          <TypedStatus />


        </motion.div>
      </div>
    </section>
  );
}
