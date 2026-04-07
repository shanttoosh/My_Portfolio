import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, MessageSquare } from 'lucide-react';
import SectionLabel from '../ui/SectionLabel';

// ─── Shared Groq API helper ─────────────────────────────────
async function callGroq(apiKey, systemPrompt, userMessage, temperature = 0.5, maxTokens = 600) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });
  if (response.status === 429) throw new Error('Rate limited — try again shortly.');
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Simple line renderer (no dangerouslySetInnerHTML) ───────
function RenderLines({ text, accentColor = '#00FF9C' }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 8 }} />;

        let color = 'rgba(226,232,240,0.8)';
        let fontWeight = 400;

        if (trimmed.startsWith('✅')) color = '#00FF9C';
        else if (trimmed.startsWith('⚠️')) color = '#FBBF24';
        else if (trimmed.startsWith('❌')) color = '#FF6B35';
        else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          color = '#E2E8F0';
          fontWeight = 700;
        } else if (trimmed.startsWith('→') || trimmed.startsWith('-')) {
          color = accentColor;
        }

        // Strip bold markers for display
        let display = trimmed;
        if (display.startsWith('**') && display.endsWith('**')) {
          display = display.slice(2, -2);
        }

        return (
          <div key={i} style={{ color, fontWeight, marginBottom: 2 }}>
            {display}
          </div>
        );
      })}
    </div>
  );
}

// ─── System Prompts ──────────────────────────────────────────
const JD_SYSTEM_PROMPT = `You are a professional technical recruiter assistant analysing candidate fit.
You will receive job requirements and you must evaluate Shanttoosh V against them.

Here is Shanttoosh's profile summary for evaluation:
- AI Developer at Krion Consulting (production NL2SQL agent, LangGraph, LangChain, FastAPI, PostgreSQL, Redis, Docker, React, TypeScript, NestJS)
- AI/ML Intern at iOPEX Technologies (led 6-member team, RAG pipelines, FAISS, ChromaDB, sentence-transformers, LangChain, FastAPI)
- ML Intern at Velozity Global Solutions (ECG signal processing, Python, NumPy, SciPy, Scikit-learn)
- B.E. Computer Science, Meenakshi College of Engineering, GPA 7.62/10, graduated May 2025
- Skills: Python (expert), LangGraph (proficient), LangChain (proficient), FastAPI (proficient), PostgreSQL (proficient), TypeScript/JavaScript (proficient), React (proficient), Docker (proficient), NestJS (proficient), FAISS (proficient), ChromaDB (proficient), pgvector (proficient), Redis (proficient), Groq API (proficient), Claude API (proficient), Gemini API (proficient), RAG pipelines (proficient), NL2SQL (proficient), sentence-transformers (proficient), n8n (proficient), AWS (familiar), Kubernetes (not mentioned)
- Has led teams (6-member at iOPEX, small team at Krion)
- Open to remote and part-time freelance roles
- Currently employed, open to the right opportunity
- Location: Chennai, India

Response format — use EXACTLY this structure, nothing else:
**Match Analysis**

✅ [Requirement]: [1 sentence explanation of how Shanttoosh meets it]
✅ [Requirement]: [explanation]
⚠️ [Requirement]: [partial match — explain what he has and what's missing]
❌ [Requirement]: [not a match — be honest]

**Overall Match: [percentage]%**
[1-2 sentence summary]

Be honest. If a requirement is not met, say ❌. Do not pad the score.
Only evaluate requirements explicitly stated by the user.`;

const BUILD_SYSTEM_PROMPT = `You are Shanttoosh's AI assistant helping recruiters and founders understand
what he would build for their specific company or product.

Shanttoosh specialises in: NL2SQL agents, RAG pipelines, multi-agent LLM systems,
AI automation (n8n), document intelligence, FastAPI backends, and full-stack AI
applications. He has shipped all of these in production.

When given a company/product description, propose exactly 3 concrete AI systems
Shanttoosh could build for them. Each proposal must reference his actual past work.

Response format — use EXACTLY this structure:

**AI Systems Shanttoosh Would Build**

**1. [System Name]**
→ [What it does in 1 sentence]
→ [Why it's relevant to their specific use case]
→ Pattern used in: [reference to his real project]

**2. [System Name]**
→ [What it does]
→ [Why relevant]
→ Pattern used in: [real project reference]

**3. [System Name]**
→ [What it does]
→ [Why relevant]
→ Pattern used in: [real project reference]

Keep the entire response under 400 words. Be specific. No generic AI advice.`;

const INTERVIEW_SYSTEM_PROMPT = `You are roleplaying as Shanttoosh V himself — answer interview questions in first person,
naturally and confidently. Speak like a real person, not a robot. Be direct, specific,
and use real examples from your work.

About you (Shanttoosh):
- Currently AI Developer at Krion Consulting, building a production NL2SQL agent
  for a BIM-based construction platform. 8-node LangGraph pipeline, 95-table schema,
  semantic caching, 20% latency reduction.
- Previously AI/ML Intern at iOPEX Technologies — led 6-member team, built RAG pipeline
  with FAISS/ChromaDB, ~100K rows/60s embeddings pipeline.
- Before that, ML Intern at Velozity (ECG signal processing).
- B.E. CSE from Meenakshi College of Engineering, graduated May 2025.
- Strengths: multi-agent LLM architecture, NL2SQL, RAG, FastAPI, production AI systems.
- Personality: direct, practical, prefers building over theorising, honest about tradeoffs.
- Location: Chennai, India. Open to remote.
- Primary LLMs used: Groq (Llama 3.3 70B), Anthropic Claude (Sonnet), Google Gemini.

Rules:
- Always answer in first person ("I built...", "In my experience...", "At Krion I...")
- Never say you are an AI or assistant
- Be honest — don't claim things not in your profile
- Keep answers 100-200 words — conversational, not an essay
- Use specific numbers and project names when relevant
- Sound human. Use natural transitions like "Honestly...", "The thing is...", "What I found was..."`;

// ─── Tool Card Wrapper ───────────────────────────────────────
function ToolCard({ color, icon: Icon, title, subtitle, children, index }) {
  const rgb = hexToRgb(color);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        background: 'rgba(13,20,36,0.72)',
        backdropFilter: 'blur(16px)',
        border: `1px solid rgba(${rgb},0.2)`,
        borderRadius: 0,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.25)`,
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: '#E2E8F0' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(148,163,184,0.6)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function hexToRgb(hex) {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res ? `${parseInt(res[1],16)},${parseInt(res[2],16)},${parseInt(res[3],16)}` : '0,255,156';
}

// ─── Card 1: JD Match Analyser ───────────────────────────────
function JDMatchCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const analyse = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      if (!apiKey) throw new Error('no-key');
      const result = await callGroq(apiKey, JD_SYSTEM_PROMPT, `Job requirements:\n${input}`, 0.4, 600);
      setOutput(result);
    } catch (err) {
      if (err.message === 'no-key') {
        setError('> API unavailable — reach out directly at shanttoosh@gmail.com');
      } else {
        setError(`> ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolCard color="#00FF9C" icon={Target} title="JD Match Analyser" subtitle="Paste job requirements and see how Shanttoosh matches" index={0}>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="e.g. We need someone with LangGraph, FastAPI, RAG experience, team lead background, and Python expertise..."
        rows={5}
        disabled={loading}
        style={{
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,156,0.15)',
          fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E2E8F0',
          padding: 12, resize: 'vertical', width: '100%', outline: 'none',
          borderRadius: 0,
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(0,255,156,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(0,255,156,0.15)'}
      />
      <button
        onClick={analyse}
        disabled={loading || !input.trim()}
        style={{
          width: '100%', background: 'rgba(0,255,156,0.1)', border: '1px solid rgba(0,255,156,0.3)',
          color: '#00FF9C', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em',
          padding: 10, cursor: loading ? 'wait' : 'pointer', borderRadius: 0,
          opacity: loading || !input.trim() ? 0.6 : 1, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(0,255,156,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,156,0.1)'; }}
      >
        {loading ? 'ANALYSING...' : 'ANALYSE MATCH'}
      </button>
      {error && (
        <div style={{ color: '#FF6B35', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{error}</div>
      )}
      {output && (
        <div style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,156,0.1)',
          padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, borderRadius: 0,
        }}>
          <RenderLines text={output} accentColor="#00FF9C" />
        </div>
      )}
      {loading && !output && (
        <div style={{ color: '#00FF9C', fontFamily: 'var(--font-mono)', fontSize: 12, animation: 'blink 1s step-end infinite' }}>
          █
        </div>
      )}
    </ToolCard>
  );
}

// ─── Card 2: What Would I Build ──────────────────────────────
function BuildCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const generate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      if (!apiKey) throw new Error('no-key');
      const result = await callGroq(apiKey, BUILD_SYSTEM_PROMPT, `Company/product description:\n${input}`, 0.7, 500);
      setOutput(result);
    } catch (err) {
      if (err.message === 'no-key') {
        setError('> API unavailable — reach out directly at shanttoosh@gmail.com');
      } else {
        setError(`> ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolCard color="#7B61FF" icon={Lightbulb} title="What Would I Build?" subtitle="Describe your product — get a tailored AI architecture proposal" index={1}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="e.g. We're a healthcare startup with patient records and doctors..."
        disabled={loading}
        onKeyDown={e => e.key === 'Enter' && generate()}
        style={{
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(123,97,255,0.15)',
          fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E2E8F0',
          padding: 12, width: '100%', outline: 'none', height: 44, borderRadius: 0,
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(123,97,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(123,97,255,0.15)'}
      />
      <button
        onClick={generate}
        disabled={loading || !input.trim()}
        style={{
          width: '100%', background: 'rgba(123,97,255,0.1)', border: '1px solid rgba(123,97,255,0.3)',
          color: '#7B61FF', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em',
          padding: 10, cursor: loading ? 'wait' : 'pointer', borderRadius: 0,
          opacity: loading || !input.trim() ? 0.6 : 1, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(123,97,255,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(123,97,255,0.1)'; }}
      >
        {loading ? 'GENERATING...' : 'GENERATE PROPOSAL'}
      </button>
      {error && (
        <div style={{ color: '#FF6B35', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{error}</div>
      )}
      {output && (
        <div style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(123,97,255,0.1)',
          padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, borderRadius: 0,
        }}>
          <RenderLines text={output} accentColor="#7B61FF" />
        </div>
      )}
      {loading && !output && (
        <div style={{ color: '#7B61FF', fontFamily: 'var(--font-mono)', fontSize: 12, animation: 'blink 1s step-end infinite' }}>
          █
        </div>
      )}
    </ToolCard>
  );
}

// ─── Card 3: Interview Mode ─────────────────────────────────
const interviewChips = [
  'Tell me your biggest technical challenge',
  'How do you approach a new AI system?',
  "What's your preferred stack and why?",
  "Walk me through a project you're proud of",
  'Where do you see yourself in 2 years?',
];

function InterviewCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const ask = async (question) => {
    const q = question || input;
    if (!q.trim() || loading) return;
    setInput(q);
    setLoading(true);
    setError('');
    setOutput('');
    try {
      if (!apiKey) throw new Error('no-key');
      const result = await callGroq(apiKey, INTERVIEW_SYSTEM_PROMPT, q, 0.75, 600);
      setOutput(result);
    } catch (err) {
      if (err.message === 'no-key') {
        setError('> API unavailable — reach out directly at shanttoosh@gmail.com');
      } else {
        setError(`> ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolCard color="#FF6B35" icon={MessageSquare} title="Interview Shanttoosh" subtitle="Ask interview questions — get answers in first person" index={2}>
      {/* Preset chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {interviewChips.map(chip => (
          <button
            key={chip}
            onClick={() => ask(chip)}
            disabled={loading}
            style={{
              background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)',
              color: 'rgba(255,107,53,0.8)', fontFamily: 'var(--font-mono)', fontSize: 10,
              padding: '4px 10px', cursor: loading ? 'wait' : 'pointer', borderRadius: 0,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.4)'; e.currentTarget.style.color = '#FF6B35'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.2)'; e.currentTarget.style.color = 'rgba(255,107,53,0.8)'; }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input + button */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask any interview question..."
          disabled={loading}
          onKeyDown={e => e.key === 'Enter' && ask()}
          style={{
            flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,107,53,0.15)',
            fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E2E8F0',
            padding: 12, outline: 'none', height: 44, borderRadius: 0,
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(255,107,53,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,107,53,0.15)'}
        />
        <button
          onClick={() => ask()}
          disabled={loading || !input.trim()}
          style={{
            background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)',
            color: '#FF6B35', fontFamily: 'var(--font-mono)', fontSize: 12,
            padding: '10px 16px', cursor: loading ? 'wait' : 'pointer', borderRadius: 0,
            opacity: loading || !input.trim() ? 0.6 : 1, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,107,53,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,53,0.1)'; }}
        >
          {loading ? '...' : 'ASK'}
        </button>
      </div>

      {/* Output */}
      {error && (
        <div style={{ color: '#FF6B35', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{error}</div>
      )}
      {(output || loading) && (
        <div ref={scrollRef} style={{
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,107,53,0.1)',
          padding: 16, fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.75,
          color: 'rgba(226,232,240,0.88)', maxHeight: 200, overflowY: 'auto', borderRadius: 0,
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,107,53,0.12) transparent',
        }}>
          {output ? output : (
            <span style={{ color: '#FF6B35', animation: 'blink 1s step-end infinite' }}>█</span>
          )}
        </div>
      )}
    </ToolCard>
  );
}

// ─── Main Section ────────────────────────────────────────────
export default function InteractiveTools() {
  return (
    <section id="tools" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 40, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SectionLabel>TOOLS.EXEC</SectionLabel>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            Try These{' '}
            <span style={{ color: '#00FF9C', textShadow: '0 0 30px rgba(0,255,156,0.4)' }}>Tools</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(148,163,184,0.6)', marginTop: 10 }}>
            Interactive AI tools built on Shanttoosh's profile
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}>
          <JDMatchCard />
          <BuildCard />
          <InterviewCard />
        </div>
      </div>
    </section>
  );
}
