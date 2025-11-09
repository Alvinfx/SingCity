import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { withErrorOverlay } from './components/with-error-overlay'
import { Buffer } from 'buffer'

// Make Buffer and process available globally for IRYS SDK
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
  // @ts-ignore - Adding browser-specific process shim for IRYS SDK
  window.process = window.process || {
    env: {},
    version: 'v18.0.0',
    browser: true,
  } as any
}

const AppWithErrorOverlay = withErrorOverlay(App)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithErrorOverlay />
  </StrictMode>,
)
