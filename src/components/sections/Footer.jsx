import React from 'react';
import { Mail } from 'lucide-react';
import { Github, Linkedin } from '../ui/Icons';

export default function Footer() {
  return (
    <footer style={{
      height: 64,
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'relative',
      zIndex: 10,
      background: 'rgba(5,8,16,0.5)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(74,85,104,0.8)' }}>
        Built by Shanttoosh V
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(74,85,104,0.6)' }}>
        Shanttoosh.AI v1.0
      </span>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(74,85,104,0.6)' }}>© 2025</span>
        {[
          { Icon: Github, href: 'https://github.com/shanttoosh', label: 'GitHub' },
          { Icon: Linkedin, href: 'https://www.linkedin.com/in/shanttoosh-v-470484289/', label: 'LinkedIn' },
          { Icon: Mail, href: 'mailto:shanttoosh@gmail.com', label: 'Email' },
        ].map(({ Icon, href, label }) => (
          <a key={label} href={href} target={href.startsWith('mailto') ? '_self' : '_blank'} rel="noopener noreferrer" aria-label={label}
            style={{ color: 'rgba(74,85,104,0.7)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00FF9C'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,85,104,0.7)'}
          >
            <Icon size={15} />
          </a>
        ))}
      </div>
    </footer>
  );
}
