import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'material-symbols/outlined.css'  // self-hosted icons (no CDN text-flash)
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
