import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Chapter } from '../chapter/Chapter'
import { site } from '../config/site'

type Status = 'idle' | 'mail' | 'error'

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`Portfolio enquiry from ${form.name || 'a visitor'}`)}&body=${encodeURIComponent(
    `${form.message}\n\n${form.name}${form.email ? ` <${form.email}>` : ''}`,
  )}`

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.message.trim().length < 10) {
      setError('Please write at least a sentence so I know what you are working on.')
      setStatus('error')
      return
    }
    window.location.href = mailto
    setStatus('mail')
  }

  const channels = [
    { label: 'Email', detail: site.email, href: `mailto:${site.email}` },
    { label: 'GitHub', detail: 'Code and projects', href: site.links.github, external: true },
    { label: 'LinkedIn', detail: "Let's connect", href: site.links.linkedin, external: true },
    { label: 'Resume', detail: 'PDF', href: site.links.resume, download: 'ShanttooshV-Resume.pdf' },
  ]

  return (
    <Chapter
      id="contact"
      num="04"
      title="Contact"
      sub="Whether it's an AI application, an automation workflow, a backend system or just an interesting problem, I'm always open to a good conversation."
      heading="Have an idea? Let's build it."
      text="I enjoy practical problems where I learn something new and build something useful. Tell me what you have in mind."
    >
      <div className="contact" data-reveal>
        <form className="contact-form" onSubmit={submit}>
          <label className="field">
            <span className="field-label">Name</span>
            <input name="name" required maxLength={100} autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="field field-wide">
            <span className="field-label">What are you working on?</span>
            <textarea
              name="message"
              required
              rows={5}
              maxLength={500}
              placeholder="A little about your idea, project or opportunity"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              data-lenis-prevent
            />
            <span className="counter">{form.message.length}/500</span>
          </label>
          <div className="form-foot field-wide">
            <button type="submit" className="pill-btn">
              Send message
            </button>
            <p className="form-status" role="status">
              {status === 'mail' && (
                <>
                  Your email app should open with the message. If it doesn't, write to <a href={`mailto:${site.email}`}>{site.email}</a>.
                </>
              )}
              {status === 'error' && (
                <span className="form-error">
                  {error} You can also email <a href={mailto}>{site.email}</a>.
                </span>
              )}
            </p>
          </div>
        </form>

        <div className="contact-side">
        <ul className="channels" aria-label="Other ways to reach me">
          {channels.map((c) => (
            <li key={c.label}>
              <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...(c.download ? { download: c.download } : {})}>
                <strong>{c.label}</strong>
                <span>{c.detail}</span>
                <ArrowUpRight size={16} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <a className="cta-circle" href={`mailto:${site.email}`} data-magnetic="strong">
          <span>
            Say hello <ArrowUpRight size={18} aria-hidden />
          </span>
        </a>
        </div>
      </div>
    </Chapter>
  )
}
