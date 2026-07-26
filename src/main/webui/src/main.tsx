import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider as UrqlProvider } from 'urql'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from './auth'
import { ThemeProvider } from './theme/ThemeProvider'
import { client } from './api/graphql'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <UrqlProvider value={client}>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster richColors position="top-center" closeButton />
          </BrowserRouter>
        </AuthProvider>
      </UrqlProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
