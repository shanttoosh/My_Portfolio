import qmsShot from '../assets/thumbs/qms.webp'
import ragShot from '../assets/thumbs/rag.webp'
import thesisShot from '../assets/thumbs/thesis.webp'
import vaultShot from '../assets/thumbs/vault.webp'
import qmsMp4 from '../assets/video/qms.mp4'
import qmsWebm from '../assets/video/qms.webm'
import ragMp4 from '../assets/video/rag.mp4'
import ragWebm from '../assets/video/rag.webm'
import thesisMp4 from '../assets/video/thesis.mp4'
import thesisWebm from '../assets/video/thesis.webm'
import vaultMp4 from '../assets/video/vault.mp4'
import vaultWebm from '../assets/video/vault.webm'
import type { ProjectThumbnail } from '../types'

/**
 * Recorded runs of the featured projects, keyed by project slug. Each is a real local run of the app (real
 * clicks, real LLM answers); only the waits on the model are sped up, and the camera moves that frame each
 * beat are added afterwards. The chapters are where each beat starts in the video. Kept apart from
 * projects.ts so the knowledge export, which runs in Node, never has to load media.
 */
export const thumbnails: Record<string, ProjectThumbnail> = {
  'thesis-ai-trading-research-assistant': {
    poster: thesisShot,
    posterChapter: 'Learn',
    video: { mp4: thesisMp4, webm: thesisWebm },
    duration: 22.38,
    chapters: [
      { t: 0, label: 'Ask', caption: 'A vague market question, in plain English.' },
      { t: 4.13, label: 'Clarify', caption: 'It asks only the two choices that change the answer.' },
      { t: 8.96, label: 'Define', caption: 'The question becomes an exact, testable experiment.' },
      { t: 13.33, label: 'Learn', caption: 'The backtest result, kept apart from its interpretation.' },
    ],
    alt: 'A recorded run: a vague question about NIFTY 50 becomes an experiment after two clarifying choices, then a 200-trade backtest on real index data shows the edge over baseline, the return distribution and the interpretation. Recorded in the offline interpreter mode its tests use.',
    label: 'Thesis · question to evidence',
  },
  'agentic-ai-rag-chatbot': {
    poster: ragShot,
    posterChapter: 'Confidence',
    video: { mp4: ragMp4, webm: ragWebm },
    duration: 13.57,
    chapters: [
      { t: 0, label: 'Ask', caption: 'A question about the Agentic AI eBook.' },
      { t: 4.3, label: 'Grounded answer', caption: 'Answered only from the book, with page citations.' },
      { t: 5.19, label: 'Confidence', caption: 'Retrieval confidence and the grounding check.' },
      { t: 7.36, label: 'Sources', caption: 'The exact Pinecone chunks behind the answer.' },
      { t: 9.07, label: 'Refuses', caption: 'Off-topic? Refused, without calling the LLM.' },
    ],
    alt: 'A recorded run: an answer drawn only from the eBook with page citations, retrieval confidence and the grounding check, the Pinecone chunks it came from, then an off-topic question refused without calling the LLM.',
    label: 'Agentic RAG · grounded or refused',
  },
  'ai-complaint-management-copilot': {
    poster: qmsShot,
    posterChapter: 'Assess',
    video: { mp4: qmsMp4, webm: qmsWebm },
    duration: 22.1,
    chapters: [
      { t: 0, label: 'Attach', caption: "A customer's complaint letter, attached in the chat." },
      { t: 9.63, label: 'Extract', caption: 'The copilot fills every field of the record from it.' },
      { t: 11.2, label: 'Assess', caption: 'Risk 90 of 100, critical and reportable, with next steps.' },
      { t: 18.59, label: 'Commit', caption: 'The officer reviews it and commits it to the register.' },
    ],
    alt: 'A recorded run: the copilot reads an attached complaint letter and fills every field of the record, scores the risk at 90 of 100, critical and reportable, with next steps and a duplicate check, and the officer commits it to the register.',
    label: 'Complaint copilot · letter to register',
  },
  'vaultmind-obsidian-rag': {
    poster: vaultShot,
    posterChapter: 'Cited answer',
    video: { mp4: vaultMp4, webm: vaultWebm },
    duration: 12.66,
    chapters: [
      { t: 0, label: 'Ask', caption: 'A question to your own Obsidian notes.' },
      { t: 5.28, label: 'Cited answer', caption: 'Answered from the notes, with wikilink citations.' },
      { t: 6.07, label: 'Sources', caption: 'The passages it used, ranked.' },
      { t: 7.1, label: 'Abstains', caption: 'Off-topic? "Not found in your vault", with no model call.' },
      { t: 10.19, label: 'Graph', caption: 'Your notes and their links, as a graph.' },
    ],
    alt: 'A recorded run: an answer drawn from the demo vault with wikilink citations and a grounded badge, the sources it used, an off-topic question refused without a model call, then the graph of the notes.',
    label: 'VaultMind · ask, abstain, graph',
  },
}
