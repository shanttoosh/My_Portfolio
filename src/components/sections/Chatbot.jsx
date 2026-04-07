import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, Zap } from 'lucide-react';
import { useGroqChat } from '../../hooks/useGroqChat';
import SectionLabel from '../ui/SectionLabel';

const SUGGESTED = [
  { label: '01', text: 'Tell me about the NL2SQL agent' },
  { label: '02', text: 'What RAG projects has he built?' },
  { label: '03', text: "What's his tech stack?" },
  { label: '04', text: 'Is he open to remote work?' },
  { label: '05', text: 'Why should I hire him?' },
  { label: '06', text: "Summarise Shanttoosh's profile" },
];

/** Safe markdown renderer — no dangerouslySetInnerHTML */
function SafeMarkdown({ text }) {
  const lines = text.split('\n');
  return (
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(226,232,240,0.88)', lineHeight: 1.75 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 8 }} />;

        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} style={{ color: '#00FF9C', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        // Bullet line
        const isBullet = line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ');
        if (isBullet) {
          const content = line.replace(/^[\s\-•]+/, '');
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 2, paddingLeft: 4 }}>
              <span style={{ color: '#00FF9C', flexShrink: 0, marginTop: 1 }}>›</span>
              <span>{parts}</span>
            </div>
          );
        }

        // Numbered heading (e.g. "1. Something:")
        const isNumbered = /^\d+\./.test(line.trim());
        if (isNumbered) {
          return (
            <div key={i} style={{ color: '#7B61FF', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 2 }}>
              {parts}
            </div>
          );
        }

        // Category header (ends with colon, short line)
        if (line.trim().endsWith(':') && line.trim().length < 30) {
          return (
            <div key={i} style={{ color: 'rgba(148,163,184,0.8)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', marginTop: 10, marginBottom: 4 }}>
              {line.trim().toUpperCase()}
            </div>
          );
        }

        return <div key={i}>{parts}</div>;
      })}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ marginBottom: 16 }}
    >
      {isUser ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          <span style={{ color: '#7B61FF' }}>[you@portfolio ~]$</span>{' '}
          <span style={{ color: '#E2E8F0' }}>{msg.content}</span>
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(0,255,156,0.55)', marginBottom: 6 }}>
            [shanttoosh.ai]
          </div>
          <div style={{ paddingLeft: 12, borderLeft: '2px solid rgba(0,255,156,0.15)' }}>
            {msg.content ? <SafeMarkdown text={msg.content} /> : (
              <span style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>...</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Chatbot({ onThinkingChange }) {
  const { messages, sendMessage, isLoading, clearChat } = useGroqChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { onThinkingChange?.(isLoading); }, [isLoading, onThinkingChange]);
  useEffect(() => { 
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const submit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <section id="chat" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 40, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SectionLabel>SHANTTOOSH.AI</SectionLabel>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            Ask Me{' '}
            <span style={{ color: '#00FF9C', textShadow: '0 0 30px rgba(0,255,156,0.4)' }}>Anything</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(148,163,184,0.6)', marginTop: 10 }}>
            Powered by Groq · Llama 3.1 Instant · Streaming
          </p>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-5">

          {/* LEFT — Suggested */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'rgba(13,20,36,0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Zap size={12} style={{ color: '#00FF9C' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.7)', letterSpacing: '0.1em' }}>
                QUICK QUERIES
              </span>
            </div>

            {SUGGESTED.map((s) => (
              <button
                key={s.text}
                onClick={() => { sendMessage(s.text); inputRef.current?.focus(); }}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(226,232,240,0.7)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textAlign: 'left',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isLoading ? 0.4 : 1,
                }}
                onMouseEnter={e => {
                  if (!isLoading) {
                    e.currentTarget.style.borderColor = 'rgba(0,255,156,0.3)';
                    e.currentTarget.style.color = '#00FF9C';
                    e.currentTarget.style.background = 'rgba(0,255,156,0.04)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(226,232,240,0.7)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: 'rgba(0,255,156,0.4)', flexShrink: 0, fontSize: 9 }}>{s.label}</span>
                {s.text}
              </button>
            ))}

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(148,163,184,0.35)', lineHeight: 1.6 }}>
              {import.meta.env.VITE_GROQ_API_KEY
                ? '> Connected to Groq API'
                : '> Demo mode — add VITE_GROQ_API_KEY'}
            </div>
          </motion.div>

          {/* RIGHT — Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,255,156,0.2)',
              display: 'flex',
              flexDirection: 'column',
              height: 540,
              boxShadow: '0 0 40px rgba(0,255,156,0.04), 0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Titlebar */}
            <div style={{ height: 36, borderBottom: '1px solid rgba(0,255,156,0.08)', background: 'rgba(0,255,156,0.03)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
              <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(0,255,156,0.4)' }}>
                shanttoosh.ai — AI Assistant · Groq Llama 3.1 Instant
              </span>
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.35)', padding: 4, display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.35)'}
                aria-label="Clear chat"
              >
                <RotateCcw size={11} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,156,0.12) transparent' }}>
              {messages.length === 0 && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(0,255,156,0.4)', lineHeight: 2 }}>
                  <div>[shanttoosh.ai initialized]</div>
                  <div style={{ color: 'rgba(148,163,184,0.45)', marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6 }}>
                    I'm Shanttoosh's AI assistant. Ask me about his projects, experience, or availability — I'll give you straight answers.
                  </div>
                </div>
              )}
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {isLoading && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(0,255,156,0.4)' }}>
                  <span className="typing-cursor" />
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ flexShrink: 0, borderTop: '1px solid rgba(0,255,156,0.08)', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#7B61FF', flexShrink: 0 }}>[you]$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Ask anything about Shanttoosh..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: '#E2E8F0',
                  caretColor: '#00FF9C',
                }}
              />
              <button
                onClick={submit}
                disabled={isLoading || !input.trim()}
                style={{
                  background: input.trim() && !isLoading ? 'rgba(0,255,156,0.12)' : 'transparent',
                  border: '1px solid rgba(0,255,156,0.25)',
                  padding: '5px 10px',
                  color: '#00FF9C',
                  cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                  opacity: (!input.trim() || isLoading) ? 0.3 : 1,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Send"
              >
                <Send size={12} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
