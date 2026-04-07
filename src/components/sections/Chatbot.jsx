import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw } from 'lucide-react';
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
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(226,232,240,0.85)', lineHeight: 1.75 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 8 }} />;

        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} style={{ color: '#ffffff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        // Bullet line
        const isBullet = line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ');
        if (isBullet) {
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
            <div key={i} style={{ color: '#00FF9C', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 2 }}>
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

        return <div key={i} style={{ marginBottom: 4 }}>{parts}</div>;
      })}
    </div>
  );
}

// Simple Animated dots
function ThinkingIndicator() {
  const [dots, setDots] = useState('·');
  useEffect(() => {
    const i = setInterval(() => {
      setDots(d => d.length >= 5 ? '·' : d + ' ·');
    }, 400);
    return () => clearInterval(i);
  }, []);
  return (
    <div style={{ color: 'rgba(0,255,156,0.4)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
      {dots}
    </div>
  );
}

export default function Chatbot() {
  const { messages, isLoading, isStreaming, error, sendMessage, clearHistory } = useGroqChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll when messages change or streaming updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (q) => {
    if (isLoading) return;
    sendMessage(q);
  };

  return (
    <section id="chat" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 60,
          alignItems: 'start'
        }}>
          {/* LEFT: INTRO PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ marginBottom: 16 }}>
              <SectionLabel>SHANTTOOSH.AI</SectionLabel>
            </div>
            
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 800,
              color: '#E2E8F0',
              lineHeight: 1.1,
              marginBottom: 4
            }}>
              Ask Me<br />
              <span style={{ color: '#00FF9C' }}>Anything</span>
            </h2>

            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'rgba(226,232,240,0.55)',
              lineHeight: 1.7,
              marginTop: 12,
              marginBottom: 32
            }}>
              I'm Shanttoosh's AI assistant.<br />
              Ask about his projects, stack, experience, or availability.
            </div>

            {/* Suggested questions */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {SUGGESTED.map((s, i) => (
                <div
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.text)}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    color: 'rgba(226,232,240,0.6)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#E2E8F0';
                    e.currentTarget.querySelector('span:last-child').style.color = 'rgba(0,255,156,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(226,232,240,0.6)';
                    e.currentTarget.querySelector('span:last-child').style.color = 'rgba(0,255,156,0)';
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.3)', width: 24, flexShrink: 0 }}>
                    {s.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>
                    {s.text}
                  </span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(0,255,156,0)', transition: 'color 0.2s', fontFamily: 'var(--font-body)' }}>
                    →
                  </span>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.3)', marginTop: 24 }}>
              Powered by Groq · llama-3.3-70b-versatile
            </div>
          </motion.div>


          {/* RIGHT: CHAT WINDOW */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 0,
              height: 'max(420px, 520px)', /* Note: simple mobile responsive via min-height approach */
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              
              {/* Titlebar */}
              <div style={{
                height: 34,
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px'
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FEBC2E' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.35)' }}>
                  shanttoosh.ai · assistant
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,255,156,0.4)' }}>
                  llama-3.3-70b
                </div>
              </div>

              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: 16,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, color: 'rgba(0,255,156,0.1)', marginBottom: 12 }}>
                      {'>'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(148,163,184,0.35)', textAlign: 'center' }}>
                      Start by asking a question or clicking a suggestion
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    msg.role === 'user' ? (
                      <div key={idx} style={{ maxWidth: '85%', marginLeft: 'auto', marginBottom: 12 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,255,156,0.4)', marginBottom: 4 }}>
                          you
                        </div>
                        <div style={{
                          background: 'rgba(0,255,156,0.08)',
                          border: '1px solid rgba(0,255,156,0.12)',
                          borderRadius: 0,
                          padding: '10px 14px',
                          fontFamily: 'var(--font-body)',
                          fontSize: 13,
                          color: '#E2E8F0'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div key={idx} style={{ maxWidth: '95%', marginBottom: 16 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,255,156,0.5)', marginBottom: 4 }}>
                          shanttoosh.ai
                        </div>
                        <div style={{
                          borderLeft: '2px solid rgba(0,255,156,0.2)',
                          padding: '2px 0 2px 14px',
                        }}>
                          <SafeMarkdown text={msg.content} />
                        </div>
                      </div>
                    )
                  ))
                )}

                {/* Loading/Streaming indicators */}
                {isLoading && !isStreaming && (
                  <div style={{ maxWidth: '95%', marginBottom: 16 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,255,156,0.5)', marginBottom: 4 }}>
                      shanttoosh.ai
                    </div>
                    <div style={{ borderLeft: '2px solid rgba(0,255,156,0.2)', padding: '2px 0 2px 14px' }}>
                      <ThinkingIndicator />
                    </div>
                  </div>
                )}
                {error && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF5F57', textAlign: 'center', marginTop: 12 }}>
                    API Error: Unable to fetch response. Check console or API key.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Row */}
              <form onSubmit={handleSubmit} style={{
                height: 54,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.3)',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(123,97,255,0.6)', flexShrink: 0 }}>
                  [you]$
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
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
                  }}
                  className="placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: (isLoading || !input.trim()) ? 'rgba(0,255,156,0.3)' : 'rgba(0,255,156,0.5)',
                    cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => {
                    if (!isLoading && input.trim()) e.currentTarget.style.color = '#00FF9C';
                  }}
                  onMouseLeave={e => {
                    if (!isLoading && input.trim()) e.currentTarget.style.color = 'rgba(0,255,156,0.5)';
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Clear history */}
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  alignSelf: 'flex-end',
                  marginTop: 8,
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'rgba(148,163,184,0.3)',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(148,163,184,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.3)'}
              >
                ↺ Clear conversation
              </button>
            )}

          </motion.div>
        </div>
      </div>
    </section>
  );
}
