import React from 'react';
import { Mail } from 'lucide-react';
import { Github, Linkedin } from '../ui/Icons';

export default function Footer() {
  return (
    <footer style={{ 
      borderTop: '1px solid rgba(255,255,255,0.05)', 
      background: 'rgba(5,8,16,0.8)', 
      width: '100%' 
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Left */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.35)' }}>
          Shanttoosh V · AI Developer · Chennai
        </div>

        {/* Center */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.25)' }}>
          Built with React · Powered by Groq
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a
            href="https://github.com/shanttoosh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            style={{ color: 'rgba(148,163,184,0.4)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(226,232,240,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
          >
            <Github size={15} />
          </a>
          <a
            href="https://www.linkedin.com/in/shanttoosh-v-470484289/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={{ color: 'rgba(148,163,184,0.4)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(226,232,240,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
          >
            <Linkedin size={15} />
          </a>
          <a
            href="mailto:shanttoosh@gmail.com"
            aria-label="Email"
            style={{ color: 'rgba(148,163,184,0.4)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(226,232,240,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
          >
            <Mail size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
