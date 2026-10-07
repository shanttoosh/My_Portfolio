import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './design/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/demos.css'
import './design/editions.css'
import './design/console.css'
import './design/console-motion.css'
import './design/console-interact.css'
import './design/console-sections.css'
import './design/keyframes.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root is missing')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
