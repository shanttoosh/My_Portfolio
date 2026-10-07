import type { Project, ProjectCategory } from '../types'

/**
 * Single source of truth for projects. Replace URLs here.
 * demoUrl: a real deployed app, or null (no Live Demo button is rendered).
 * demoId: an interactive demo that runs inside this site.
 */
export const projects: Project[] = [
  {
    slug: 'agentic-ai-rag-chatbot',
    name: 'Agentic AI RAG Chatbot',
    tagline: 'Grounded answers from one document',
    domain: 'Document Q&A',
    description:
      'A document-grounded assistant that answers only from a 60-page Agentic AI eBook, verifies every claim against the retrieved chunks, and says so when the book does not cover a question.',
    year: 2026,
    categories: ['ai-llm', 'rag', 'backend'],
    technologies: ['Python', 'LangGraph', 'Pinecone', 'Groq', 'FastAPI', 'Streamlit'],
    features: [
      'Document ingestion and chunking with page tracking',
      'Vector search with a threshold that drops weak matches',
      'Agentic workflow that verifies every claim to prevent hallucination',
      'Source-grounded responses with a safe fallback',
      'Confidence score and grounded flag on every answer',
    ],
    flow: ['Question', 'Retrieve', 'Filter', 'Generate', 'Verify', 'Answer'],
    githubUrl: 'https://github.com/shanttoosh/agentic-ai-rag-chatbot',
    demoUrl: null,
    demoId: null,
    preview: 'rag',
    caseStudy: {
      problem:
        'An LLM asked about agentic AI will happily answer from its training data. The brief was the opposite: answer only from one document, and be honest when the document does not cover something.',
      approach:
        'A LangGraph workflow retrieves eBook chunks from Pinecone, drops weak matches, generates a cited answer from the remaining chunks only, then has a second LLM call verify every claim against those chunks. Anything unsupported is replaced by the safe fallback.',
      architecture:
        'Layered code: API, application, domain protocols and RAG infrastructure adapters. Business logic never imports FastAPI, Pinecone, Groq or LangGraph directly, so each can be replaced.',
      implementation: [
        'LangGraph StateGraph with typed state and conditional edges',
        'Pinecone serverless index (cosine, 1024 dimensions) with hosted llama-text-embed-v2 embeddings',
        'Groq gpt-oss-120b for generation and gpt-oss-20b for validation, with strict JSON-schema outputs; Claude supported through configuration',
        'FastAPI and Pydantic v2 API, with a Streamlit demo UI that talks to it over HTTP',
        'mypy --strict, Ruff, 135 offline pytest tests and GitHub Actions',
      ],
      challenges: [
        'Near-miss questions (LoRA fine-tuning, pricing, transformer attention) sound related and can pass the retrieval threshold, so generation and validation have to stop them.',
      ],
      result:
        'On a 17-case evaluation set, every answerable question got a grounded answer and every unanswerable one got the safe fallback, including all three near-misses. Fallbacks that skip the LLM return in under a second.',
      metrics: [
        { value: '11/11', label: 'answerable questions grounded' },
        { value: '6/6', label: 'unanswerable questions refused' },
        { value: '5.7 s', label: 'mean latency per question' },
      ],
    },
  },
  {
    slug: 'voice-controlled-ai-agent',
    name: 'Voice-Controlled AI Agent',
    tagline: 'Speak a command, get a safe action',
    blurb: 'Transcribes a spoken command, picks one of four tools and keeps file writes in a sandbox.',
    description:
      'A hands-free agent that understands voice commands, executes tasks with tools and shows every step: transcription, intent, action and output.',
    year: 2026,
    categories: ['ai-llm', 'automation'],
    technologies: ['Python', 'LangGraph', 'Whisper', 'Groq', 'Streamlit'],
    features: [
      'Microphone recording or audio upload',
      'Groq Whisper large-v3-turbo transcription',
      'Intent classification, including multi-step commands',
      'Optional confirmation before any file is written',
      'Writes confined to a sandbox folder, no shell execution',
    ],
    flow: ['Audio', 'Transcribe', 'Intent', 'Plan', 'Execute', 'Respond'],
    githubUrl: 'https://github.com/shanttoosh/voice-controlled-ai-agent',
    demoUrl: null,
    demoId: 'voice-agent',
    preview: 'voice',
    caseStudy: {
      problem:
        'A voice agent that can write files has to be useful without being dangerous. A misheard command should never reach outside a safe area.',
      approach:
        'Audio goes through Groq Whisper for transcription, a Groq LLM classifies the intent (create file, write code, summarize or chat, including compound commands) and a LangGraph graph routes to tools. The UI shows the transcription, intent, action and output for every request.',
      architecture:
        'Each step is ordinary Python on the other side of an HTTP call. Trust enters the system at the tool boundary, not inside the microphone, so that is where the safety checks live.',
      implementation: [
        'Groq whisper-large-v3-turbo for speech-to-text, overridable by environment variable',
        'Intent classifier with optional compound multi-step JSON output',
        'LangGraph tool routing with human-in-the-loop confirmation for create_file and write_code',
        'Paths resolved only inside output/, with no shell execution',
        'Session memory passes the last few turns into classification and chat',
      ],
      challenges: [
        'Running on a typical laptop without a GPU, which is why both speech-to-text and chat use Groq. Local Whisper and Ollama can replace them without changing the graph.',
      ],
      result: 'A Streamlit pipeline that turns spoken commands into safe, visible actions.',
    },
  },
  {
    slug: 'ai-agency-engagement-bot',
    name: 'AI Agency Scraper & Engagement Bot',
    tagline: 'Prospecting on autopilot with n8n',
    blurb: 'Finds leads on Instagram and X, scores them, drafts DMs and follow-ups, and emails daily reports.',
    description:
      'An n8n automation pipeline that scrapes leads from Instagram and X, scores them, follows and messages qualified leads with Groq-written DMs, runs follow-ups and reports daily.',
    year: 2026,
    categories: ['automation', 'ai-llm'],
    technologies: ['n8n', 'Apify', 'Groq', 'Google Sheets', 'Gmail', 'Docker'],
    features: [
      'Seven pipelines sharing one Google Sheets lead store',
      'Lead scoring from 0 to 100 on followers, engagement and bio signals',
      'Personalised DMs with rate-limit-safe delays',
      'Follow-ups after three days of silence',
      'Daily email report and a live HTML dashboard',
    ],
    flow: ['Scrape', 'Score', 'Follow', 'DM', 'Follow up', 'Report'],
    githubUrl: 'https://github.com/shanttoosh/n8n-engagement-pipeline',
    demoUrl: null,
    demoId: null,
    preview: 'pipeline',
    caseStudy: {
      problem: 'Finding and contacting AI-agency prospects on Instagram and X by hand is slow and inconsistent.',
      approach:
        'Seven n8n pipelines split the job: scrape and score, follow, follow-back, first DM, follow-up sequence, daily report and event detection. They share state through a Google Sheets lead store.',
      implementation: [
        'Apify actors scrape by hashtag and keyword on Instagram and X',
        'Scores combine follower count, engagement rate and bio keywords, with deduplication and a daily cap of 100 qualified leads per platform',
        'Groq writes personalised DMs; randomised delays keep the flow rate-limit safe',
        'A follow-up sequence triggers after three days without a reply, and event polling watches for bio updates and new posts',
        'Runs locally with docker compose; credentials live in n8n environment variables',
      ],
      result: 'A hands-off prospecting loop from scraping to a daily email report and a live funnel dashboard.',
    },
  },
  {
    slug: 'lead-pipeline-automation',
    name: 'Lead Pipeline Automation',
    tagline: 'Finding digitally weak local businesses',
    blurb: 'Pulls local businesses from Google Maps, checks their site speed and ad tracking, and exports leads.',
    description:
      'A Python pipeline that pulls local businesses from Google Maps through an Apify scraper, checks their websites with PageSpeed Insights and Meta Pixel detection, and exports high-intent leads to CSV or Google Sheets.',
    year: 2026,
    categories: ['automation', 'data', 'backend'],
    technologies: ['Python', 'Apify', 'PageSpeed Insights', 'Google Sheets', 'FastAPI'],
    features: [
      'Google Maps business discovery through an Apify scraper',
      'Website performance checks with PageSpeed Insights',
      'Meta Pixel detection to spot missing ad tracking',
      'Timestamped CSV output and a shared Google Sheet',
    ],
    flow: ['Discover', 'Website', 'PageSpeed', 'Meta Pixel', 'Filter', 'Export'],
    githubUrl: 'https://github.com/shanttoosh/Lead-Pipeline-Automation',
    demoUrl: null,
    demoId: null,
    preview: 'pipeline',
    caseStudy: {
      problem:
        'A freelance lead-generation brief: find local businesses in Baner and Hinjewadi, Pune, whose online presence is weak, so outreach has a clear reason.',
      approach:
        'Pull businesses from Google Maps with an Apify scraper, check each website with the PageSpeed Insights API, detect whether a Meta Pixel is installed, find social links, then export the high-intent leads.',
      implementation: [
        'Apify Google Maps scraper for discovery',
        'PageSpeed Insights API for performance signals',
        'Meta Pixel detection on each website',
        'Google Sheets API through a service account',
        'Output to timestamped CSV files, with a FastAPI wrapper to run jobs',
      ],
      result: 'A repeatable, low-cost pipeline built to a 48-hour execution plan.',
    },
  },
  {
    slug: 'thesis-ai-trading-research-assistant',
    name: 'Thesis',
    tagline: 'AI trading research assistant',
    domain: 'Fintech research',
    description:
      'Turns a vague market question into a precisely specified, testable experiment, runs it against historical data, and keeps what the data shows apart from what the system concludes.',
    year: 2026,
    categories: ['ai-llm', 'web', 'backend'],
    technologies: ['Next.js', 'React', 'TypeScript', 'Fastify', 'Zod', 'PostgreSQL', 'Drizzle', 'Claude', 'Groq', 'Playwright'],
    features: [
      'Every parameter carries provenance: stated, inferred, answered or assumed',
      'Blocks only on the gaps that change the answer',
      'Clarify, Define and Learn screens',
      'Result, description and interpretation kept apart',
      'LLM behind a port: Claude, Groq or an offline stub',
    ],
    flow: ['Question', 'Clarify', 'Define', 'Run', 'Learn'],
    githubUrl: 'https://github.com/shanttoosh/thesis',
    demoUrl: 'https://thesis-research-nu.vercel.app',
    demoId: 'clarifier',
    preview: 'thesis',
    caseStudy: {
      problem:
        '"Does buying NIFTY after a sharp fall work?" is not answerable as stated. It does not define "sharp", the entry, the exit, the holding period, the test window, the costs or what "work" means. Tools either assume silently or interrogate the user with fourteen questions.',
      approach:
        'Every parameter gets explicit provenance (stated by the user, inferred, answered after being asked, or assumed with a stated reason), and execution is blocked only on the small set of gaps that materially change the answer.',
      architecture:
        'Two separately deployable applications and one database, organised by business capability rather than technical layer. Module boundaries are enforced by eslint-plugin-boundaries, so a violation fails the build.',
      implementation: [
        'Next.js 15, React 19, TypeScript and Tailwind 4 frontend with TanStack Query',
        'Node 22 and Fastify 5 backend; app.inject() gives socket-free API tests',
        'Zod schemas shared by both apps for validation and types',
        'PostgreSQL 16 with Drizzle',
        'Pluggable LLM port: Claude, Groq gpt-oss-120b or a deterministic offline stub',
        'Vitest, Playwright and axe for tests and accessibility',
      ],
      challenges: [
        'Deciding what to leave out: no NestJS, Prisma, tRPC, Redis, job queue or charting library, because nothing needed them.',
        'Showing how often each threshold option occurred, so choosing "2%" is an informed decision rather than a blind one.',
      ],
      result: 'Clarify, Define and Learn screens that keep the result, the description and the interpretation apart.',
    },
  },
  {
    slug: 'vaultmind-obsidian-rag',
    name: 'VaultMind',
    tagline: 'RAG assistant for an Obsidian vault',
    domain: 'Knowledge management',
    description:
      'Ask questions in plain language and get answers drawn strictly from your own notes, with wikilink citations to every source, or an explicit "not found in your vault".',
    year: 2026,
    categories: ['rag', 'ai-llm', 'backend'],
    technologies: ['Python', 'FastAPI', 'Chroma', 'BM25', 'SQLite', 'Groq', 'React'],
    features: [
      'Hybrid search: vector and BM25 indexes fused with reciprocal rank fusion',
      'Answers only from retrieved notes, or an explicit abstain',
      'Note content treated as untrusted data, never instruction',
      'Write-back stages a draft that needs your approval',
    ],
    flow: ['Vault', 'Index', 'Hybrid search', 'Cited answer', 'Approve'],
    githubUrl: 'https://github.com/shanttoosh/Obsidian_vault_RAG_knowledge_assistant',
    demoUrl: 'https://vaultmind-nine.vercel.app',
    demoId: null,
    preview: 'flow',
    caseStudy: {
      problem:
        'Your notes are the one source you trust, so an assistant over them must never make things up and never quietly change them.',
      approach:
        'Four design invariants: the vault filesystem is the system of record, answers are grounded or abstain, note content is untrusted data, and nothing mutates the vault without approval.',
      implementation: [
        'Ingestion that discovers, parses, chunks and persists notes; every derived store rebuilds from the Markdown files',
        'Embeddings with vector and lexical indexes, fused with RRF',
        'AI gateway and prompt orchestration for cited answers, with a stub gateway when no key is set',
        'HTTP API and React client for chat, citations, notes and the note graph',
        'Agentic deep research across linked notes, with human-approved write-back',
      ],
      result:
        'Runs end to end on a demo vault: hybrid search, answers with wikilink citations and a grounding grade, and a graph of the notes. Evaluation, auth and Docker come next.',
    },
  },
  {
    slug: 'ai-complaint-management-copilot',
    name: 'AI Complaint Management Copilot',
    tagline: 'Conversational copilot for a pharma QMS',
    domain: 'Pharma quality',
    description:
      'A QA officer pastes an email or attaches a document, and the copilot fills a structured customer complaint record, then follows corrections given in plain language.',
    year: 2026,
    categories: ['ai-llm', 'backend', 'web'],
    technologies: ['Python', 'FastAPI', 'LangGraph', 'React', 'PostgreSQL', 'Groq', 'Playwright'],
    features: [
      'Corrections touch only the fields named',
      'Risk score, completeness check and duplicate detection',
      'Root cause and CAPA recommendations',
      'Nothing is filed until a person approves it',
    ],
    flow: ['Email or file', 'Extract', 'Assess', 'Recommend', 'Approve'],
    githubUrl: 'https://github.com/shanttoosh/ai-complaint-management-system',
    demoUrl: 'https://qms-copilot-two.vercel.app',
    demoId: null,
    preview: 'flow',
    caseStudy: {
      problem:
        'Under GMP, every complaint about a marketed batch must be recorded, assessed, investigated and closed with a CAPA. Complaints arrive as prose, and QA officers retype them into structured records before triage can start.',
      approach:
        'A conversational copilot proposes the structured record from attachments, pasted emails or descriptions; the officer corrects it in plain language, approves and commits.',
      implementation: [
        'Attachments inside the chat, and an activity trail showing which tools ran, with timings and failures',
        'AI risk classification with a 0 to 100 score, severity, priority and a regulatory-reportable flag',
        'Completeness checker with follow-up questions for the customer, and scored duplicate detection',
        'Root cause and CAPA recommendations tied to manufacturing stages',
        'gpt-oss-20b for conversation and extraction, gpt-oss-120b for root cause and CAPA, both on Groq',
      ],
      challenges: [
        'The assignment named gemma2-9b-it and llama-3.3-70b-versatile, both since decommissioned by Groq, so the small and large split was kept with current models.',
      ],
      result: 'Retyping removed: the copilot proposes, the officer approves.',
      metrics: [
        { value: '10', label: 'tools the LangGraph agent can call' },
        { value: '164', label: 'backend tests passing offline' },
        { value: '23', label: 'Playwright browser tests' },
      ],
    },
  },
  {
    slug: 'llm-evaluation-pipeline',
    name: 'LLM Evaluation Pipeline',
    tagline: 'Relevance, hallucination and cost checks',
    blurb: 'Scores chatbot replies for relevance and hallucination with an LLM judge, and estimates latency and cost.',
    description:
      'An evaluation pipeline that tests chatbot responses for relevance, hallucination, latency and cost, with LLM-as-a-judge and a heuristic fallback.',
    year: 2026,
    categories: ['ai-llm', 'data'],
    technologies: ['Python', 'OpenAI', 'Async'],
    features: [
      'Relevance and completeness scoring',
      'Hallucination detection against the provided context',
      'Latency and cost tracking',
      'Async processing for concurrent evaluations',
    ],
    flow: ['Load', 'Relevance', 'Hallucination', 'Performance', 'Report'],
    githubUrl: 'https://github.com/shanttoosh/llm-response-evaluator',
    demoUrl: null,
    demoId: 'hallucination',
    preview: 'flow',
    caseStudy: {
      problem: 'Chatbot answers need to be checked for relevance and hallucination continuously, not once by eye.',
      approach:
        'A pipeline of evaluators (relevance, hallucination, performance) orchestrated over conversation logs, using GPT-4o-mini as a judge, with heuristics when no API key is available.',
      implementation: [
        'Data loader for JSON conversation turns',
        'Relevance, hallucination and performance evaluators',
        'Async judge client with caching',
        'Command-line interface',
      ],
      result: 'Repeatable quality scores for every response, including latency and estimated cost.',
    },
  },
  {
    slug: 'shopify-ai-analytics',
    name: 'Shopify AI Analytics',
    tagline: 'Natural-language questions about a store',
    blurb: 'Turns a plain-English question about a Shopify store into a ShopifyQL query and explains the result.',
    description:
      'An analytics app that connects to a Shopify store and answers questions about sales, inventory and customers using an agentic workflow that generates ShopifyQL.',
    year: 2025,
    categories: ['ai-llm', 'backend', 'web'],
    technologies: ['Node.js', 'FastAPI', 'Gemini', 'PostgreSQL'],
    features: [
      'Shopify OAuth integration',
      'Natural language to ShopifyQL',
      'Multi-step reasoning with validation',
      'Business-friendly explanations of results',
    ],
    flow: ['Question', 'Intent', 'Plan', 'ShopifyQL', 'Explain'],
    githubUrl: 'https://github.com/shanttoosh/shopify-ai-analytics',
    demoUrl: null,
    demoId: null,
    preview: 'flow',
    caseStudy: {
      problem: 'Store owners have questions about their data but not the query language to ask them.',
      approach:
        'A Node.js API gateway handles authentication and validation; a Python FastAPI service runs an LLM agent that interprets the question, generates ShopifyQL and explains the result.',
      implementation: [
        'Node.js and Express gateway on port 3000',
        'FastAPI AI service on port 8000 with Google Gemini (OpenAI optional)',
        'SQLite in development and PostgreSQL in production',
        'Mock mode when no Shopify partner account is configured',
      ],
      result: 'Inventory projections, sales trends and customer behaviour explained in plain language.',
    },
  },
  {
    slug: 'lease-document-chat',
    name: 'Lease Document Chat',
    tagline: 'Q&A over lease PDFs with page citations',
    blurb: 'Answers questions about a lease PDF and cites the page each answer comes from.',
    description:
      'Answers questions about a lease PDF with citations to the exact page, and writes a structured lease summary to CSV.',
    year: 2026,
    categories: ['rag', 'ai-llm'],
    technologies: ['Python', 'PyMuPDF', 'sentence-transformers', 'Chroma', 'Gemini'],
    features: [
      'PDF ingestion with page tracking',
      'A structured lease summary written to CSV',
      'Answers cite sources like [Source 1 – Page 17]',
      'Semantic search with MiniLM embeddings and ChromaDB',
    ],
    flow: ['PDF', 'Extract', 'Embed', 'Retrieve', 'Cite'],
    githubUrl: 'https://github.com/shanttoosh/AI-Powered-Lease-Document-Chat-System',
    demoUrl: null,
    demoId: null,
    preview: 'flow',
    caseStudy: {
      problem: 'Lease terms are buried in long PDFs, and answers without page references cannot be trusted.',
      approach: 'Parse the PDF with page tracking, extract a structured summary, and answer questions with citations to the exact page.',
      implementation: [
        'PyMuPDF parsing with page tracking',
        'all-MiniLM-L6-v2 embeddings and ChromaDB',
        'Gemini 2.0 Flash for answers',
        'Documented edge cases: multi-page clauses, scanned PDFs, handwritten amendments and date formats',
      ],
      result: 'Extraction mode writes a lease summary CSV; chat mode answers with page citations.',
    },
  },
]

export const categoryLabel: Record<ProjectCategory, string> = {
  'ai-llm': 'AI / LLM',
  rag: 'RAG',
  automation: 'Automation',
  backend: 'Backend',
  data: 'Data',
  web: 'Web App',
}

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function projectsWithDemo(demoId: string): Project[] {
  return projects.filter((p) => p.demoId === demoId)
}

/**
 * The projects the Work chapter features, in order. Chosen from a code review of every repository for
 * engineering depth (architecture, AI guardrails, tests, a real UI), not for whether they are deployed.
 * Swap slugs here; every other project is listed under "More on GitHub".
 */
export const featuredSlugs = ['thesis-ai-trading-research-assistant', 'agentic-ai-rag-chatbot', 'ai-complaint-management-copilot', 'vaultmind-obsidian-rag']

export const featuredProjects: Project[] = featuredSlugs.map((s) => getProject(s)).filter((p): p is Project => !!p)
export const otherProjects: Project[] = projects.filter((p) => !featuredSlugs.includes(p.slug))
