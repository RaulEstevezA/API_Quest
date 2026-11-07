/**
 * Entry point of the application: mounts the React tree and loads the global styles.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui/App'
import './styles/index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Application root was not found.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
