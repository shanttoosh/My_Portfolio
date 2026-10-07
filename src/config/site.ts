import { asset } from '../lib/asset'
import type { SectionId } from '../types'

export const site = {
  name: 'Shanttoosh V',
  logo: 'SV',
  eyebrow: ['AI Engineer', 'Python', 'Backend', 'LLMs'],
  statement: 'I build AI systems, automate workflows and turn ideas into real world applications.',
  intro:
    'AI-focused developer with experience in LLM applications, backend systems and automation. I enjoy working at the intersection of AI, software engineering and real world problem solving.',
  location: 'Chennai, India',
  locationShort: 'Chennai, TN',
  timezone: 'IST (UTC+5:30)',
  email: 'shanttoosh@gmail.com',
  links: {
    github: 'https://github.com/shanttoosh',
    linkedin: 'https://www.linkedin.com/in/shanttoosh-v-470484289/',
    resume: asset('resume.pdf'),
  },
  opportunities: ['AI Engineering', 'Backend Development', 'LLM Applications', 'AI Automation', 'Interesting Projects'],
  services: [
    { title: 'AI Applications', caption: 'From idea to production' },
    { title: 'Backend Systems', caption: 'Scalable and efficient' },
    { title: 'Automation Workflows', caption: 'Save time, do more' },
    { title: 'Just a Good Conversation', caption: 'Always happy to connect' },
  ],
  quote:
    "I'm always excited to work on meaningful problems, learn new things, and build solutions that make a real impact.",
  belief: { lead: 'Not just AI demos.', accent: 'Systems that actually run.' },
}

export interface SectionMeta {
  id: SectionId
  nav: string
  rail: string
}

/** The page's chapters, in order. `nav` is the chapter name in the top bar, the chapter pill and the hero. */
export const sections: SectionMeta[] = [
  { id: 'intro', nav: 'Home', rail: 'Intro' },
  { id: 'projects', nav: 'Projects', rail: 'Projects' },
  { id: 'experience', nav: 'Experience', rail: 'Experience' },
  { id: 'skills', nav: 'Toolkit', rail: 'Skills' },
  { id: 'contact', nav: 'Contact', rail: 'Contact' },
]

export const education = {
  degree: 'B.E. Computer Science',
  school: 'Meenakshi College of Engineering',
  place: 'Chennai',
  period: 'Oct 2021 – May 2025',
  gpa: '7.62 / 10',
}

export const certifications = [
  {
    name: 'Google Analytics Certification (92%)',
    url: 'https://skillshop.credential.net/40b06d26-dfb3-4afe-b20f-b95167a8f68a',
  },
  {
    name: 'Google Data Analytics Professional Certificate',
    url: 'https://www.coursera.org/account/accomplishments/specialization/KZRI2FDF5ZW8',
  },
]
