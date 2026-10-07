import type { Experience } from '../types'

/** Company work is described at a public-safe, high level only. */
export const experience: Experience[] = [
  {
    id: 'krion',
    company: 'Krion Consulting',
    monogram: 'K',
    role: 'AI Developer',
    type: 'Full-time',
    period: 'Dec 2025 – Present',
    location: 'Chennai, India',
    summary:
      'Working on AI-driven software products and backend systems with a focus on LLM applications, computer vision, data workflows and automation for the construction domain.',
    tags: ['AI Systems', 'LLMs', 'Computer Vision', 'Backend', 'Automation'],
    projects: [
      {
        name: 'AI-Powered SQL Assistant',
        icon: 'database',
        description:
          'Natural language analytics system using schema-aware retrieval, LLM reasoning, query validation and backend APIs.',
        flow: ['Natural language query', 'Agent reasoning', 'Validated SQL', 'Analytics results'],
        points: ['Schema-aware retrieval', 'Multi-agent query generation', 'Query validation and error handling', 'Semantic caching', 'Role-aware analytics'],
        tech: ['Python', 'LangChain', 'FastAPI', 'PostgreSQL'],
      },
      {
        name: 'Construction Intelligence System',
        icon: 'building',
        description:
          'AI system for natural-language analysis of construction-related information using multiple specialised AI workflows.',
        flow: ['User query', 'Orchestrator', 'Specialised agents', 'Response + visualisation'],
        points: ['10+ specialised agents', '8+ construction data domains', 'Dynamic data analysis and visualisation', 'Anthropic, OpenAI and Gemini models'],
        tech: ['Python', 'OpenAI', 'Anthropic', 'Gemini'],
      },
      {
        name: 'AI Quantity Take-Off System',
        icon: 'file',
        description: 'AI-assisted system for extracting and analysing information from technical drawings.',
        flow: ['Drawing', 'Scale', 'Walls & rooms', 'Symbols', 'Quantities'],
        points: ['Drawing understanding and preprocessing', 'Scale detection and calibration', 'Wall and room reconstruction', 'Symbol detection', 'Measurement extraction and MEP classification', 'BOQ generation'],
        tech: ['Python', 'FastAPI', 'Computer vision'],
      },
    ],
  },
  {
    id: 'iopex',
    company: 'iOPEX Technologies',
    monogram: 'i',
    role: 'AI/ML Intern',
    type: 'Internship',
    period: 'Jul 2025 – Oct 2025',
    location: 'Chennai, India',
    summary: 'Worked on building and optimising RAG pipelines, embedding workflows and document processing systems for enterprise applications.',
    tags: ['RAG', 'Embeddings', 'Vector Search', 'Document Processing', 'Web Applications'],
    projects: [
      {
        name: 'RAG Chunking Optimizer',
        icon: 'layers',
        description: 'A system to experiment with chunking strategies and measure their impact on retrieval.',
        flow: ['Documents', 'Chunking (5 strategies)', 'Embeddings', 'Vector DB', 'Search & evaluation'],
        points: [
          'Led a 6-member intern team',
          '5 chunking strategies and 4 execution modes',
          'Embedding pipeline on 6 parallel workers, about 100K rows in 60 seconds',
          'Vector search with FAISS and ChromaDB, cosine similarity and metadata filters',
          'OpenAI-compatible REST APIs and a React interface',
        ],
        tech: ['Python', 'LangChain', 'FAISS', 'Chroma', 'React', 'FastAPI'],
      },
    ],
  },
  {
    id: 'velozity',
    company: 'Velozity Global Solutions',
    monogram: 'V',
    role: 'ML Intern',
    type: 'Internship',
    period: 'Feb 2025 – Apr 2025',
    location: 'Chennai, India',
    summary: 'Worked on ECG signal processing and analysis using machine learning techniques for healthcare applications.',
    tags: ['Signal Processing', 'Machine Learning', 'Python', 'Data Analysis'],
    projects: [
      {
        name: 'ECG Signal Processing and Analysis',
        icon: 'heart',
        description: 'A preprocessing and analysis pipeline for ECG signals that feeds downstream machine learning models.',
        flow: ['Raw ECG', 'Filter & denoise', 'Heartbeat segmentation', 'Feature analysis'],
        points: [
          'Noise filtering and baseline correction',
          'Heartbeat segmentation and PQRST annotation',
          'Spectrogram analysis and phase space plotting',
          'Dataset collection, formatting and validation',
        ],
        tech: ['Python', 'NumPy', 'SciPy', 'Matplotlib', 'scikit-learn'],
      },
    ],
  },
]
