import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Empêcher la molette de modifier les inputs number (source de bugs)
document.addEventListener('wheel', (e) => {
  if (document.activeElement?.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
