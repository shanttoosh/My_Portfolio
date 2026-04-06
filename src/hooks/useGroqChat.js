import { useState, useEffect, useRef } from 'react';
import { SYSTEM_PROMPT } from '../data/systemPrompt';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

export function useGroqChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const sendMessage = async (userText) => {
    if (!userText.trim() || isLoading) return;

    const userMsg = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    // Streaming placeholder
    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    if (!apiKey) {
      const mockResponse = getMockResponse(userText);
      let displayed = '';
      for (let i = 0; i < mockResponse.length; i++) {
        await new Promise(r => setTimeout(r, 12));
        displayed += mockResponse[i];
        setMessages([...newMessages, { role: 'assistant', content: displayed }]);
      }
      setIsLoading(false);
      return;
    }

    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages,
          ],
          stream: true,
          max_tokens: 800,
          temperature: 0.65,
        }),
        signal: abortRef.current.signal,
      });

      if (response.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment and try again.');
      }
      if (!response.ok) {
        throw new Error(`API error ${response.status}. Please try again.`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            accumulated += delta;
            setMessages([...newMessages, { role: 'assistant', content: accumulated }]);
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const msg = err.message || 'Connection error. Please try again.';
        setError(msg);
        setMessages([...newMessages, {
          role: 'assistant',
          content: `${msg}\n\nReach out directly at shanttoosh@gmail.com`,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => { setMessages([]); setError(null); };

  useEffect(() => {
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  return { messages, sendMessage, isLoading, error, clearChat };
}

function getMockResponse(input) {
  const q = input.toLowerCase();

  if (q.includes('nl2sql') || q.includes('sql agent')) {
    return `The NL2SQL agent is Shanttoosh's flagship production project, live at Krion Consulting.

Architecture:
- 8-node LangGraph pipeline — Decomposition → Retrieval → Generation → Correction
- Works against a 95-table multi-tenant PostgreSQL schema (11 functional domains)
- Semantic caching via Redis reduces repeated query latency by 20%
- Auto-correction loop validates SQL and re-generates if execution fails
- Role-aware routing — users only see their authorised data

Evaluation: ~67-70% pass rate on 65 validated ground-truth questions.

Want me to walk through the architecture in more detail?`;
  }

  if (q.includes('rag') || q.includes('langchain') || q.includes('vector')) {
    return `Shanttoosh has built RAG systems across multiple projects:

- Lease Document Chat — PyMuPDF + ChromaDB + Gemini 2.0 Flash. Every answer cites the exact page number.
- Context-Aware Chunk Optimizer (iOPEX) — 5 chunking strategies, FAISS + ChromaDB, ~100K rows in 60 seconds
- Legal Document Analyzer — FAISS-backed compliance verification with React frontend
- NL2SQL Agent — pgvector (FLOAT[] workaround) for schema context retrieval

He's used LangChain as an orchestration layer across 4+ projects.

Want me to go deeper on any specific RAG project?`;
  }

  if (q.includes('langgraph') || q.includes('multi-agent')) {
    return `LangGraph is Shanttoosh's primary framework for multi-agent AI systems, used in production at Krion.

His NL2SQL pipeline is an 8-node LangGraph graph:
1. Decompose — breaks complex queries into sub-questions
2. Retrieve — fetches relevant schema context via vector similarity
3. Generate — Groq Llama 3.3 70B writes the SQL
4. Validate — checks if the query executes correctly
5. Correct — auto-fixes failed queries and retries
6. Cache — stores successful queries for semantic matching

A hybrid routing layer sits before the pipeline — deterministic queries bypass the LLM entirely for speed.

Happy to walk through the full flow?`;
  }

  if (q.includes('remote') || q.includes('hire') || q.includes('available') || q.includes('opportunity')) {
    return `Shanttoosh is currently employed full-time at Krion Consulting (since December 2025), but is selectively open to the right opportunity.

He's particularly interested in:
- Multi-agent AI systems (LangGraph, LangChain)
- NL2SQL or text-to-query systems
- RAG pipeline engineering
- Backend AI engineering (FastAPI, Python)

Open to remote and hybrid roles.

Fastest way to reach him: shanttoosh@gmail.com`;
  }

  if (q.includes('stack') || q.includes('tech') || q.includes('skill')) {
    return `Core stack:

AI/LLM:
- LangGraph, LangChain (4+ production projects)
- Groq API — Llama 3.3 70B (production primary)
- Anthropic Claude Sonnet (fallback)
- Google Gemini 2.0 Flash

Backend:
- Python + FastAPI (primary)
- NestJS (at Krion)
- PostgreSQL, Redis

Vector DB / RAG:
- FAISS, ChromaDB, pgvector (FLOAT[] workaround)

Frontend:
- React + TypeScript

DevOps:
- Docker, Docker Compose, LangSmith, n8n

Want to go deeper on any layer?`;
  }

  if (q.includes('different') || q.includes('why')) {
    return `Most AI developers can call an LLM API. Shanttoosh builds production systems.

What distinguishes him:
- NL2SQL agent runs against a 95-table real-world schema with a ground-truth eval suite he built himself
- Implements semantic caching, validation loops, and auto-correction — not just prompt + response
- Led teams — 6-member intern team at iOPEX, managing developers at Krion
- Full stack: LLM integration → FastAPI backend → React frontend → Docker deployment
- Production experience — his NL2SQL agent is used daily by actual construction project managers

Want me to summarise his full profile?`;
  }

  if (q.includes('summarise') || q.includes('summary') || q.includes('profile')) {
    return `Shanttoosh V — AI Developer, Chennai, India.

Background:
- B.E. Computer Science, Meenakshi College of Engineering (2025)
- Currently: AI Developer at Krion Consulting (Dec 2025 – Present)
- Previously: AI/ML Intern at iOPEX Technologies, ML Intern at Velozity Global Solutions

Flagship project:
- NL2SQL agent in production — 8-node LangGraph pipeline, 95-table PostgreSQL schema, 67-70% eval accuracy

Core skills:
- Python, FastAPI, LangGraph, LangChain, Groq, React, PostgreSQL, Docker

Open to: Remote AI Developer / ML Engineer / Backend AI Engineering roles

Contact: shanttoosh@gmail.com`;
  }

  // Guardrail — off-topic question
  const onTopicKeywords = ['shanttoosh', 'project', 'skill', 'experience', 'work', 'job', 'hire', 'remote', 'tech', 'stack', 'sql', 'python', 'rag', 'ai', 'llm', 'langgraph', 'langchain', 'groq', 'chat', 'available', 'contact', 'email', 'linkedin', 'github', 'summary', 'profile', 'background', 'education', 'degree', 'certification', 'analytic', 'tableau', 'postgresql', 'fastapi', 'docker', 'react', 'nlp', 'vector', 'chunker', 'lease', 'legal', 'evaluator', 'n8n', 'shopify'];
  const isOffTopic = !onTopicKeywords.some(kw => q.includes(kw));

  if (isOffTopic) {
    return `I'm Shanttoosh's personal AI assistant, so I'm only set up to answer questions about him and his work.

Is there something specific about Shanttoosh you'd like to know? I'm happy to cover his projects, skills, SQL experience, analytics tools, or availability.`;
  }

  return `I'm Shanttoosh's AI assistant — here to answer questions about him and his work.

Here's what I know about:
- NL2SQL Agent — his flagship production system
- RAG pipelines — lease docs, chunk optimizer, legal analysis
- SQL experience — PostgreSQL (iOPEX), SQL Server (Krion), BigQuery and MySQL (learning)
- Analytics — Google Analytics (certified, 92%), Tableau, Excel
- Full tech stack — LangGraph, FastAPI, Groq, React, Docker
- Availability and what he's open to

What would you like to know?`;
}
