import { closeView } from '../../lib/router'
import { projectsWithDemo } from '../../config/projects'
import type { DemoId } from '../../types'
import { ProjectActions } from '../projects/ProjectActions'
import { Modal } from '../ui/Modal'
import { ClarifierDemo } from './ClarifierDemo'
import { HallucinationDemo } from './HallucinationDemo'
import { VoiceAgentDemo } from './VoiceAgentDemo'

const DEMOS: Record<DemoId, { title: string; intro: string }> = {
  'voice-agent': {
    title: 'Voice-controlled agent',
    intro: 'Speak or type a command. It is split into steps, classified, checked against the output/ sandbox and confirmed before anything is written.',
  },
  clarifier: {
    title: 'Question clarifier',
    intro: 'A vague trading question becomes nine explicit parameters, each marked with where it came from. Only the gaps that change the answer block the run.',
  },
  hallucination: {
    title: 'Hallucination check',
    intro: 'Checks each sentence of a response against the context it should be based on, in the heuristic mode of the evaluation pipeline.',
  },
}

export function DemoModal({ demoId }: { demoId: string }) {
  const close = closeView
  const id = demoId as DemoId
  const meta = DEMOS[id]

  if (!meta) {
    return (
      <Modal label="Demo not found" onClose={close}>
        <div className="case">
          <h2 className="case-title">Demo not found</h2>
          <p className="lead">There is no demo at this address.</p>
        </div>
      </Modal>
    )
  }

  const related = projectsWithDemo(id)

  return (
    <Modal label={`${meta.title} demo`} onClose={close} wide>
      <div className="demo">
        <header className="demo-head">
          <p className="eyebrow">Interactive demo · runs in your browser</p>
          <h2 className="case-title">{meta.title}</h2>
          <p className="lead">{meta.intro}</p>
        </header>
        {id === 'voice-agent' && <VoiceAgentDemo />}
        {id === 'clarifier' && <ClarifierDemo />}
        {id === 'hallucination' && <HallucinationDemo />}
        {related.length > 0 && (
          <footer className="demo-related">
            <p className="mini-label">From {related.length > 1 ? 'these projects' : 'this project'}</p>
            {related.map((p) => (
              <div key={p.slug} className="demo-related-row">
                <strong>{p.name}</strong>
                <ProjectActions project={{ ...p, demoId: null }} size="sm" />
              </div>
            ))}
          </footer>
        )}
      </div>
    </Modal>
  )
}
