import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Menu, X, Download } from 'lucide-react';
import { Github, Linkedin } from '../ui/Icons';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'tools', label: 'Tools' },
    { id: 'chat', label: 'AI Chat' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
    setActiveSection(id);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 60,
          background: scrolled ? 'rgba(5,8,16,0.95)' : 'rgba(5,8,16,0.6)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 24,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => scrollTo('home')}
          style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginRight: 'auto' }}
          data-clickable
        >
          <span style={{ color: '#00FF9C' }}>S</span>
          <span style={{ color: 'rgba(148,163,184,0.8)' }}>.AI</span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex" style={{ gap: 28, alignItems: 'center' }}>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              data-clickable
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.05em',
                color: activeSection === link.id ? '#E2E8F0' : '#4A5568',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (activeSection !== link.id) e.currentTarget.style.color = '#E2E8F0'; }}
              onMouseLeave={e => { if (activeSection !== link.id) e.currentTarget.style.color = '#4A5568'; }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Available badge */}
        <div className="hidden md:flex" style={{
          alignItems: 'center',
          background: 'rgba(0,255,156,0.08)',
          border: '1px solid rgba(0,255,156,0.2)',
          color: '#00FF9C',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          padding: '4px 12px',
          borderRadius: 0,
          marginLeft: 8,
        }}>
          Available
        </div>

        {/* Download Resume Desktop */}
        <a
          href="/resume.pdf"
          download="ShanttooshV_Resume.pdf"
          className="hidden md:flex"
          style={{
            alignItems: 'center', gap: 8,
            padding: '8px 16px',
            background: 'rgba(0,255,156,0.1)',
            border: '1px solid rgba(0,255,156,0.3)',
            color: '#00FF9C',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,255,156,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,255,156,0.1)';
          }}
        >
          <Download size={14} />
          Resume
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(v => !v)}
          data-clickable
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E2E8F0', marginLeft: 'auto' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 60,
              right: 0,
              bottom: 0,
              width: 260,
              background: 'rgba(13,20,36,0.97)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              zIndex: 99,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Available badge mobile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="pulse-dot" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00FF9C' }}>
                Available for Hire
              </span>
            </div>

            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                data-clickable
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: '#E2E8F0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 4,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,156,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                &gt; {link.label}
              </button>
            ))}



            {/* Social icons */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <a href="https://github.com/shanttoosh" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ color: 'rgba(148,163,184,0.7)' }}>
                <Github size={18} />
              </a>
              <a href="https://www.linkedin.com/in/shanttoosh-v-470484289/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: 'rgba(148,163,184,0.7)' }}>
                <Linkedin size={18} />
              </a>
              <a href="mailto:shanttoosh@gmail.com" aria-label="Email" style={{ color: 'rgba(148,163,184,0.7)' }}>
                <Mail size={18} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
