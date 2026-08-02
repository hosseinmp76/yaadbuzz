import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from './auth'
import { TourProvider } from './onboarding/TourContext'
import { ThemeProvider } from './theme/ThemeProvider'
import { initSentry } from './sentry'
import './i18n'
import './styles.css'

initSentry()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <TourProvider>
            <App />
            <Toaster richColors position="top-center" closeButton />
          </TourProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
