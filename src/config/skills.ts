import type { SkillGroup } from '../types'

/**
 * Every tool on the Toolkit, with every place it was really used: jobs (as the resume describes them), projects on
 * this site, this portfolio, other public repos, or private company work. Checked file by file against the public
 * repos; `more` counts further repos instead of listing them.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'ai',
    title: 'AI & LLM',
    caption: 'Build with LLMs and agentic systems',
    icon: 'brain',
    skills: [
      {
        name: 'Python',
        icon: 'python',
        what: 'The core language across almost all of my work.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'LLM applications, RAG/NL2SQL, computer vision and multi-agent systems across three AI products.' },
          { kind: 'role', ref: 'iopex', how: 'Chunking optimizer and a sentence-transformers embeddings pipeline with 6-worker parallelism.' },
          { kind: 'role', ref: 'velozity', how: 'ECG signal processing and analysis with machine learning for healthcare applications.' },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'Wrote the API, ingestion pipeline, custom chunker and evaluation scripts in typed Python.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Built the FastAPI backend, LangGraph agent, PDF/DOCX/EML parsers and the pytest suite.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Vault parsing, heading-aware chunking, hybrid retrieval, cited answering and the research agent.' },
          { kind: 'project', ref: 'voice-controlled-ai-agent', how: 'Coded the agent, Groq clients with exponential backoff, and file tools confined to output/.' },
          { kind: 'project', ref: 'lead-pipeline-automation', how: 'Pipeline that flags local businesses with slow websites or no Meta Pixel, then exports leads.' },
          { kind: 'project', ref: 'llm-evaluation-pipeline', how: 'Async CLI scoring chatbot replies for relevance, hallucination, latency and estimated cost.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: "Implemented the AI service's six pipeline steps and its sales, inventory and repeat-customer metrics." },
          { kind: 'project', ref: 'lease-document-chat', how: 'Regex field extraction to CSV, page-aware chunking and a terminal Q&A loop for a lease PDF.' },
        ],
        more: 12,
      },
      {
        name: 'LangChain',
        icon: 'langchain',
        what: 'A framework for composing LLM calls, retrieval and tools.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'LangChain-based multi-agent reasoning with validation loops in a natural-language SQL assistant.' },
          { kind: 'role', ref: 'iopex', how: 'LangChain-orchestrated pipelines at the core of the chunking optimizer.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: "Defined the agent's tools as LangChain StructuredTools with Pydantic input schemas, bound to ChatGroq." },
        ],
      },
      {
        name: 'LangGraph',
        icon: 'langgraph',
        what: 'Stateful, multi-step LLM workflows with typed state and conditional edges.',
        uses: [
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'Ran retrieve, check, generate and validate as StateGraph nodes, with conditional edges to a fallback.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Typed StateGraph looping the agent and a ToolNode, with a cap on tool iterations.' },
          { kind: 'project', ref: 'voice-controlled-ai-agent', how: 'Routed each command through transcription and classification, then to approval, the tools or exit.' },
        ],
      },
      {
        name: 'OpenAI',
        icon: 'openai',
        what: 'Hosted GPT models and embeddings APIs.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'OpenAI APIs, with Anthropic and Gemini, for analysis and responses in a multi-agent construction system.' },
          { kind: 'role', ref: 'iopex', how: "LLM-agnostic integration with OpenAI behind the chunking optimizer's REST APIs." },
          { kind: 'project', ref: 'llm-evaluation-pipeline', how: 'Called GPT-4o-mini via AsyncOpenAI in JSON mode as an opt-in relevance and hallucination judge.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'Added GPT-4 through the OpenAI SDK as a switchable provider behind one LLM client.' },
        ],
      },
      {
        name: 'Claude',
        icon: 'claude',
        what: "Anthropic's Claude models.",
        uses: [
          { kind: 'role', ref: 'krion', how: 'Anthropic APIs, with OpenAI and Gemini, for analysis and responses in a multi-agent construction system.' },
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Turns market questions into experiment specs and narrates backtest results, parsed against Zod schemas.' },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'Added an alternative Claude adapter using structured outputs, switched on with LLM_PROVIDER=anthropic.' },
        ],
        aliases: ['Anthropic'],
      },
      {
        name: 'Gemini',
        icon: 'googlegemini',
        what: "Google's Gemini models.",
        uses: [
          { kind: 'role', ref: 'krion', how: 'Gemini APIs, with Anthropic and OpenAI, for analysis and responses in a multi-agent construction system.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'Called Gemini Pro for intent classification, query planning and the final plain-English answer.' },
          { kind: 'project', ref: 'lease-document-chat', how: 'Answers about the lease come from Gemini 2.0 Flash, with raw excerpts if the call fails.' },
          { kind: 'repo', ref: 'Context-Aware-Chunk-Optimizer', label: 'Context-Aware Chunk Optimizer', how: 'gemini-2.0-flash-lite writes answers, summaries or insights from retrieved chunks, picked by query type.' },
        ],
      },
      {
        name: 'Groq',
        icon: 'groq',
        what: 'Low-latency hosted inference for open models, including Whisper.',
        uses: [
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'The deployed API runs gpt-oss-120b, forced into Zod-derived schemas, retrying once after a 429.' },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'gpt-oss-120b for answers and gpt-oss-20b for claim checks, both with strict JSON-schema output.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'gpt-oss-20b runs the agent and gpt-oss-120b recommends CAPA, paced by a per-minute token budget.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'GPT-OSS models through the Groq SDK, with retries that wait for the stated rate-limit reset.' },
          { kind: 'project', ref: 'voice-controlled-ai-agent', how: 'Transcribed speech with Whisper, then Llama 3.3 handled intent, code, summaries and chat.' },
          { kind: 'project', ref: 'ai-agency-engagement-bot', how: "Drafted outreach DMs with Llama 3.1 8B from a prospect's profile and recent post." },
          { kind: 'repo', ref: 'MCP-File-Assistant', label: 'MCP File Assistant', how: 'Called llama-3.1-8b-instant to judge resume fit and draft an invitation.' },
        ],
        aliases: ['Whisper'],
      },
      {
        name: 'RAG',
        icon: 'rag',
        what: 'Retrieval-augmented generation: answers grounded in retrieved documents.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'Vector-based context retrieval feeding schema-aware NL2SQL in an AI SQL assistant.' },
          { kind: 'role', ref: 'iopex', how: 'Chunking optimizer with five strategies and four execution modes, improving retrieval accuracy and context relevance.' },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'Retrieved eBook chunks above a similarity threshold and answered only from them, citing pages.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Hybrid retrieval over note chunks, abstaining when nothing matches; citations checked against the passages sent.' },
          { kind: 'project', ref: 'lease-document-chat', how: 'Fed the top three page-tagged chunks into each prompt and printed their pages as sources.' },
        ],
        aliases: ['BM25', 'Pinecone', 'Chroma', 'FAISS'],
      },
      {
        name: 'AI Agents',
        icon: 'agents',
        what: 'LLM systems that plan and call tools to complete tasks.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'Orchestrator routing queries to 10+ specialised agents, and multi-agent reasoning for NL2SQL.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Let the model pick tools each turn: extract fields, patch corrections, assess risk, search the register.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Custom tool-calling loop over six read-only vault tools and one approval-gated draft tool.' },
          { kind: 'project', ref: 'voice-controlled-ai-agent', how: 'LLM maps each command to file, code, summary or chat tools, chaining steps for compound requests.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'Chained LLM steps that classify intent, choose which Shopify resources to fetch, then explain results.' },
        ],
        aliases: ['LangGraph', 'MCP'],
      },
      {
        name: 'MCP',
        icon: 'modelcontextprotocol',
        what: 'Model Context Protocol for exposing tools to models safely.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'MCP-based Playwright browser automation within the AI automation infrastructure.' },
          { kind: 'repo', ref: 'MCP-File-Assistant', label: 'MCP File Assistant', how: 'Exposed read_file, list_files and write_file via FastMCP; the CLI calls read_file and write_file over stdio.' },
          { kind: 'repo', ref: 'mcp-server-', label: 'MCP sentiment server', how: 'Hand-coded MCP initialize, tools/list and tools/call JSON-RPC handlers for a sentiment tool.' },
        ],
      },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend & Web',
    caption: 'Clean and responsive user interfaces',
    icon: 'monitor',
    skills: [
      {
        name: 'React',
        icon: 'react',
        what: 'Component-based UI library.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'React and Angular interfaces for the AI products, alongside FastAPI services.' },
          { kind: 'role', ref: 'iopex', how: 'Uploads, search and results visualisation in a React UI.' },
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Ask, clarify, experiment, results and history screens, plus a custom SVG return histogram.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Built the copilot chat, schema-driven complaint form and register with React 18 and Redux Toolkit.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Three tabs (Ask, Notes, Graph), with the link graph drawn as a hand-rolled canvas force layout.' },
          { kind: 'portfolio', how: 'Sections, case-study and demo modals, lazy-loaded chapters and a small custom router.' },
        ],
      },
      {
        name: 'Angular',
        icon: 'angular',
        what: 'A full framework for large web applications.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'Angular and React interfaces for the AI products, alongside FastAPI services.' },
        ],
      },
      {
        name: 'TypeScript',
        icon: 'typescript',
        what: 'Typed JavaScript.',
        uses: [
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Strict TypeScript across backend, frontend and tests, with shared Zod contracts typing both apps.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Typed API client whose interfaces mirror the FastAPI response models; tsc runs before builds.' },
          { kind: 'portfolio', how: 'The whole site in TypeScript, from typed content config to rule-based demo logic.' },
        ],
      },
      {
        name: 'JavaScript',
        icon: 'javascript',
        what: 'The language of the web.',
        uses: [
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Wrote Redux slices, a fetch client with timeouts and one retry, and Playwright specs.' },
          { kind: 'project', ref: 'ai-agency-engagement-bot', how: 'n8n Code nodes for lead scoring, deduplication, rate limiting and event detection.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: "Gateway Express routes and SQLite models, plus the dashboard's fetch-and-render script." },
          { kind: 'portfolio', how: 'Scripts that drew looping product clips and backgrounds on canvas, for an earlier design.' },
          { kind: 'repo', ref: 'Property-poster-maker', label: 'Property poster maker', how: 'Canvas 2D post rendering with text wrapping and shrink-to-fit, exported as PNG via toBlob.' },
        ],
      },
      {
        name: 'HTML',
        icon: 'html5',
        what: 'Page structure and semantics.',
        uses: [
          { kind: 'project', ref: 'ai-agency-engagement-bot', how: 'Built a one-page dashboard with KPI cards, a funnel, an SVG donut and a top-leads table.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'Dashboard for asking questions and viewing recent queries and active conversations.' },
          { kind: 'portfolio', how: 'Entry page meta tags, Open Graph preview and a JSON-LD profile.' },
          { kind: 'repo', ref: 'Property-poster-maker', label: 'Property poster maker', how: 'Four-field form, photo picker, theme and format toggles, and a preview canvas.' },
        ],
      },
      {
        name: 'CSS',
        icon: 'css',
        what: 'Styling and layout.',
        uses: [
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Tailwind 4 theme tokens with contrast-checked colours, tabular figures and reduced-motion rules.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Hand-wrote a token-based design system: colour, type, spacing and radius variables plus component styles.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'One plain stylesheet whose colours follow prefers-color-scheme, overridable by a data-theme attribute.' },
          { kind: 'project', ref: 'ai-agency-engagement-bot', how: "Styled the dashboard's dark theme with CSS variables, grid layouts and keyframe animations." },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'Auto-fit grid of stat cards, badges and a question panel for the dashboard.' },
          { kind: 'portfolio', how: 'Scroll-driven animation-timeline effects for the console-style design, with reduced-motion fallbacks.' },
          { kind: 'repo', ref: 'Property-poster-maker', label: 'Property poster maker', how: 'Editor layout plus an #export mode that shows only the full-size canvas.' },
        ],
      },
      {
        name: 'Streamlit',
        icon: 'streamlit',
        what: 'Python apps for data and AI demos.',
        uses: [
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'Built a demo UI over the API showing answers, confidence and chunks; tested with AppTest.' },
          { kind: 'project', ref: 'voice-controlled-ai-agent', how: 'Mic recording or upload, approve and cancel buttons, output panels and session history.' },
          { kind: 'repo', ref: 'Context-Aware-Chunk-Optimizer', label: 'Context-Aware Chunk Optimizer', how: "UI for four processing modes, with a Gemini 'LLM Enhanced' answer toggle." },
          { kind: 'repo', ref: 'euprime-lead-scoring', label: 'Lead scoring dashboard', how: 'Ranked lead table with sidebar filters, KPI metrics and CSV download.' },
        ],
      },
    ],
  },
  {
    id: 'ml',
    title: 'ML / Computer Vision',
    caption: 'Machine learning and signal processing',
    icon: 'chart',
    skills: [
      {
        name: 'OpenCV',
        icon: 'opencv',
        what: 'Computer vision library.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'Computer-vision pipelines for scale detection, wall and room reconstruction, and symbol recognition in drawings.' },
        ],
      },
      {
        name: 'NumPy',
        icon: 'numpy',
        what: 'Numerical arrays and maths.',
        uses: [
          { kind: 'role', ref: 'velozity', how: 'ECG signal processing, from noise filtering and baseline correction to heartbeat segmentation.' },
          { kind: 'repo', ref: 'PDF-TABLE-EXTRACTOR', label: 'PDF table extractor', how: 'Built word-coordinate arrays, averaged column positions and scored column consistency for table confidence.' },
          { kind: 'repo', ref: 'Context-Aware-Chunk-Optimizer', label: 'Context-Aware Chunk Optimizer', how: 'Embeddings kept as float32 arrays for FAISS and exported as .npy files.' },
          { kind: 'repo', ref: 'customer_churn_prediction', label: 'Customer churn prediction', how: 'Sorted feature importances and masked the correlation matrix to drop highly correlated columns.' },
          { kind: 'repo', ref: 'Predicting-Fraudlent-Transactions', label: 'Fraudulent transaction prediction', how: 'Created log1p features for transaction amounts and origin and destination balances.' },
          { kind: 'repo', ref: 'Customer_Segmentation_using_Kmeans', label: 'Customer segmentation with K-Means', how: 'Computed z-scores to remove Quantity and UnitPrice outliers.' },
        ],
        more: 2,
      },
      {
        name: 'SciPy',
        icon: 'scipy',
        what: 'Scientific computing and signal processing.',
        uses: [
          { kind: 'role', ref: 'velozity', how: 'ECG noise filtering and baseline correction before downstream ML models.' },
          { kind: 'repo', ref: 'Predicting-Fraudlent-Transactions', label: 'Fraudulent transaction prediction', how: 'Winsorized amount and balance columns at the 1% tails with scipy.stats.mstats.' },
        ],
        more: 1,
      },
      {
        name: 'Pandas',
        icon: 'pandas',
        what: 'Tabular data analysis.',
        uses: [
          { kind: 'repo', ref: 'Context-Aware-Chunk-Optimizer', label: 'Context-Aware Chunk Optimizer', how: 'Chunked reads of large CSVs, plus type conversion, null handling and de-duplication before chunking.' },
          { kind: 'repo', ref: 'customer_churn_prediction', label: 'Customer churn prediction', how: 'Engineered services-count, senior-without-tech-support and tenure-group features; broke churn rate down per attribute.' },
          { kind: 'repo', ref: 'Customer_Segmentation_using_Kmeans', label: 'Customer segmentation with K-Means', how: 'Built per-customer Recency, Frequency and Monetary tables from retail transactions with groupby and merge.' },
          { kind: 'repo', ref: 'PDF-TABLE-EXTRACTOR', label: 'PDF table extractor', how: 'Cleaned extracted tables: dropped duplicate rows, stripped currency symbols, converted numbers and dates.' },
          { kind: 'repo', ref: 'Data-Science-Projects', label: 'Data science projects', how: 'Resampled retail sales by month and cleaned Airbnb listings, replacing outliers with medians.' },
          { kind: 'repo', ref: 'Sentiment_analysis_for_marketing', label: 'Sentiment analysis for marketing', how: 'Label encoding, neutral-tweet filtering and tweet hour and weekday features.' },
          { kind: 'repo', ref: 'euprime-lead-scoring', label: 'Lead scoring dashboard', how: 'Filtered scored leads by text, score, priority and location, then exported CSV.' },
          { kind: 'repo', ref: 'AI-ML-Projects', label: 'Loan approval and Titanic notebooks', how: "Dropped Titanic's Cabin column and incomplete rows; mapped loan applicants' '3+' dependents to 3." },
        ],
        more: 2,
      },
      {
        name: 'scikit-learn',
        icon: 'scikitlearn',
        what: 'Classical machine learning.',
        uses: [
          { kind: 'role', ref: 'velozity', how: 'Machine learning techniques for ECG analysis in healthcare applications.' },
          { kind: 'repo', ref: 'customer_churn_prediction', label: 'Customer churn prediction', how: 'ColumnTransformer pipelines with scaling and one-hot and ordinal encoding, feeding four classifiers.' },
          { kind: 'repo', ref: 'Predicting-Fraudlent-Transactions', label: 'Fraudulent transaction prediction', how: 'Tuned random forests with RandomizedSearchCV, computed precision-recall by threshold, and applied a 0.3 cutoff.' },
          { kind: 'repo', ref: 'Customer_Segmentation_using_Kmeans', label: 'Customer segmentation with K-Means', how: 'Clustered scaled RFM features with K-Means, compared k by elbow and silhouette, used PCA for plotting.' },
          { kind: 'repo', ref: 'Sentiment_analysis_for_marketing', label: 'Sentiment analysis for marketing', how: 'TF-IDF tweet vectors fed a GridSearchCV-tuned SVM, compared against a random forest.' },
          { kind: 'repo', ref: 'PDF-TABLE-EXTRACTOR', label: 'PDF table extractor', how: 'DBSCAN on word x- and y-positions to find table columns and rows; KMeans optional for columns.' },
          { kind: 'repo', ref: 'Context-Aware-Chunk-Optimizer', label: 'Context-Aware Chunk Optimizer', how: 'Semantic chunking that groups rows by running KMeans on their sentence embeddings.' },
          { kind: 'repo', ref: 'AI-ML-Projects', label: 'Loan approval and Titanic notebooks', how: 'Loan-approval classifiers: logistic regression, decision tree and random forest, with the tree models grid-searched.' },
        ],
        more: 1,
      },
      {
        name: 'Matplotlib',
        icon: 'matplotlib',
        what: 'Plotting library.',
        uses: [
          { kind: 'role', ref: 'velozity', how: 'Spectrograms and phase space plots for ECG analysis.' },
          { kind: 'repo', ref: 'Customer_Segmentation_using_Kmeans', label: 'Customer segmentation with K-Means', how: 'Plotted the elbow curve, PCA cluster scatter and per-cluster Amount, Frequency and Recency bars.' },
          { kind: 'repo', ref: 'Predicting-Fraudlent-Transactions', label: 'Fraudulent transaction prediction', how: 'Charted precision and recall against the decision threshold.' },
          { kind: 'repo', ref: 'Sentiment_analysis_for_marketing', label: 'Sentiment analysis for marketing', how: 'Airline donut chart, timezone bars, a retweet lollipop chart and word-cloud figures.' },
          { kind: 'repo', ref: 'Data-Science-Projects', label: 'Data science projects', how: 'Monthly sales trend lines and outlier boxplots for the retail and Airbnb datasets.' },
          { kind: 'repo', ref: 'customer_churn_prediction', label: 'Customer churn prediction', how: 'Ranked random-forest feature importances in a horizontal bar chart.' },
        ],
        more: 3,
      },
      {
        name: 'TensorFlow',
        icon: 'tensorflow',
        what: 'Deep learning framework.',
        uses: [
          { kind: 'work', how: 'Deep learning work in company projects; the code is private.' },
        ],
      },
      {
        name: 'Signal Processing',
        icon: 'signal',
        what: 'Filtering and analysing time-series signals.',
        uses: [
          { kind: 'role', ref: 'velozity', how: 'ECG noise filtering, baseline correction, heartbeat segmentation and PQRST annotation.' },
        ],
        aliases: ['SciPy'],
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & APIs',
    caption: 'Scalable and production-ready services',
    icon: 'server',
    skills: [
      {
        name: 'FastAPI',
        icon: 'fastapi',
        what: 'Async Python web framework.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'Asynchronous Python/FastAPI services and AI integrations across three AI products.' },
          { kind: 'role', ref: 'iopex', how: "FastAPI services behind the chunking optimizer's uploads, search and results." },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'Built the chat API with Pydantic request validation and provider errors mapped to 502/503.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Per-module routers, multipart document uploads, and one exception handler turning domain errors into HTTP codes.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Ask, search, notes, graph, research and draft-approval routes with dependency-injected services.' },
          { kind: 'project', ref: 'lead-pipeline-automation', how: 'Pipeline jobs run as FastAPI background tasks; Pydantic models define requests and job status.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'AI service exposing the six-step agent pipeline at POST /analyze, plus a health check.' },
          { kind: 'repo', ref: 'mcp-server-', label: 'MCP sentiment server', how: 'JSON-RPC /mcp route, an SSE keep-alive stream and a GET /analyze route.' },
        ],
      },
      {
        name: 'NestJS',
        icon: 'nestjs',
        what: 'Structured Node.js framework.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'Backend services in full-stack work on three AI products, alongside FastAPI.' },
        ],
      },
      {
        name: 'Node.js',
        icon: 'nodedotjs',
        what: 'JavaScript runtime for servers.',
        uses: [
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Fastify API on Node 22, plus seed, migration and LLM smoke-test scripts.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'Built an Express gateway that validates questions, runs Shopify OAuth and calls the AI service.' },
          { kind: 'portfolio', how: 'Node scripts that rendered canvas animations to video with Playwright and ffmpeg, for an earlier design.' },
        ],
      },
      {
        name: 'Fastify',
        icon: 'fastify',
        what: 'Fast, plugin-based Node.js framework.',
        uses: [
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: '/v1 API with helmet, CORS, signed cookies and rate limiting, tested through app.inject().' },
        ],
      },
      {
        name: 'PostgreSQL',
        icon: 'postgresql',
        what: 'Relational database.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'PostgreSQL services for the AI products, including the natural-language SQL assistant.' },
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Sessions, versioned specs, runs, trades and NIFTY bars via Drizzle, with SQL CHECK constraints.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Stored conversations, draft forms, attachment text and the complaint register, migrated with Alembic.' },
          { kind: 'repo', ref: 'Context-Aware-Chunk-Optimizer', label: 'Context-Aware Chunk Optimizer', how: 'psycopg2 connector that lists public tables and imports one into the pipeline.' },
        ],
      },
      {
        name: 'Redis',
        icon: 'redis',
        what: 'In-memory data store.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'PostgreSQL and Redis services behind the AI products.' },
        ],
      },
      {
        name: 'REST APIs',
        icon: 'api',
        what: 'HTTP APIs with clear contracts.',
        uses: [
          { kind: 'role', ref: 'iopex', how: 'OpenAI-compatible REST APIs over the chunking and embedding pipelines.' },
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Session, run, trade and insight endpoints with idempotency keys and cursor pagination.' },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'POST /api/chat returning the answer, grounded flag, confidence and scored chunks, plus GET /health.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Designed /api/v1 resources for conversations and complaints, with paged search and one error envelope.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Eleven JSON endpoints whose responses and errors carry a request id bound to the logs.' },
          { kind: 'project', ref: 'lead-pipeline-automation', how: "202 trigger returning a job ID, and a status route reporting each job's state and results." },
          { kind: 'project', ref: 'shopify-ai-analytics', how: "Exposed POST /api/v1/questions, Shopify OAuth routes and metrics endpoints alongside FastAPI's /analyze." },
          { kind: 'repo', ref: 'mcp-server-', label: 'MCP sentiment server', how: 'Polarity, subjectivity and a sentiment label served as JSON from GET /analyze.' },
        ],
        aliases: ['FastAPI', 'Fastify', 'OpenAI-compatible APIs'],
      },
      {
        name: 'SQLite',
        icon: 'sqlite',
        what: 'Embedded SQL database.',
        uses: [
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Ran the pytest suite against a throwaway SQLite file, with foreign keys switched on.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Notes, chunks, tags, links and write-back drafts in SQLite through SQLAlchemy.' },
          { kind: 'project', ref: 'shopify-ai-analytics', how: 'Stored AES-encrypted Shopify access tokens and optional query logs with better-sqlite3.' },
        ],
      },
    ],
  },
  {
    id: 'infra',
    title: 'Data & AI Infrastructure',
    caption: 'Data storage, vector search and automation',
    icon: 'database',
    skills: [
      {
        name: 'Pinecone',
        icon: 'pinecone',
        what: 'Managed vector database.',
        uses: [
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'Embedded chunks with Pinecone Inference and stored them in a serverless index, skipping unchanged re-ingests.' },
        ],
      },
      {
        name: 'Chroma',
        icon: 'chroma',
        what: 'Open-source vector store.',
        uses: [
          { kind: 'role', ref: 'iopex', how: 'RAG-ready semantic search over Chroma, alongside FAISS, with metadata filters.' },
          { kind: 'project', ref: 'vaultmind-obsidian-rag', how: 'Persistent Chroma collection of BGE chunk embeddings with note metadata for vector search.' },
          { kind: 'project', ref: 'lease-document-chat', how: 'Page-numbered chunks held in memory by an ephemeral Chroma client for similarity queries.' },
        ],
        aliases: ['ChromaDB'],
      },
      {
        name: 'FAISS',
        icon: 'meta',
        what: 'Fast similarity search library.',
        uses: [
          { kind: 'role', ref: 'iopex', how: 'RAG-ready semantic search over FAISS, with cosine similarity and metadata filters.' },
        ],
      },
      {
        name: 'Docker',
        icon: 'docker',
        what: 'Containers for repeatable environments.',
        uses: [
          { kind: 'role', ref: 'krion', how: "Docker-based environments for the AI products' services." },
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Multi-stage, non-root API image that Render builds and deploys.' },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'One image for the API and UI; compose starts the UI once the API is healthy.' },
          { kind: 'project', ref: 'ai-complaint-management-copilot', how: 'Ran the Postgres 16 dev database locally in docker-compose, health-checked by pg_isready.' },
          { kind: 'project', ref: 'ai-agency-engagement-bot', how: 'Self-hosted n8n through docker-compose, with a persistent data volume and keys from .env.' },
        ],
      },
      {
        name: 'n8n',
        icon: 'n8n',
        what: 'Workflow automation platform.',
        uses: [
          { kind: 'project', ref: 'ai-agency-engagement-bot', how: 'Built seven scheduled pipelines in one workflow covering scraping, DM drafting, follow-ups, reports and event checks.' },
        ],
      },
      {
        name: 'AWS',
        icon: 'aws',
        what: 'Cloud platform.',
        uses: [
          { kind: 'work', how: 'Cloud services in company projects; the code is private.' },
        ],
      },
      {
        name: 'Git',
        icon: 'git',
        what: 'Version control.',
        uses: [
          { kind: 'role', ref: 'krion', how: 'CI/CD workflows for production delivery.' },
          { kind: 'project', ref: 'agentic-ai-rag-chatbot', how: 'GitHub Actions ran Ruff, strict mypy and offline pytest on pushes to main and PRs.' },
        ],
      },
      {
        name: 'Supabase',
        icon: 'supabase',
        what: 'Postgres-based backend platform.',
        uses: [
          { kind: 'project', ref: 'thesis-ai-trading-research-assistant', how: 'Hosted Postgres for the deployed app; the client disables prepared statements on its transaction pooler.' },
        ],
      },
    ],
  },
]

export const allSkills = skillGroups.flatMap((g) => g.skills)
