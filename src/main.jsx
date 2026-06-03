// React application entry point — renders the App component within context providers.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './i18n.jsx'
import { ThemeProvider } from './theme.jsx'

// Provider nesting order matters: ThemeProvider must wrap LanguageProvider
// to ensure theme colors are available when rendering language-dependent UI.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
