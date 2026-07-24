import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider as UrqlProvider } from 'urql'
import App from './App'
import { AuthProvider } from './auth'
import { client } from './api/graphql'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UrqlProvider value={client}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </UrqlProvider>
  </React.StrictMode>,
)
