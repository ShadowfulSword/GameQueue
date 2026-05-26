import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Written by: Alec
// Tested by: Jake
// Debugged by: Ayush
// Commented and Refactored by: Ali 

//React app startup
//sets up root div for app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
