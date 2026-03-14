import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './style.css'

const params = new URLSearchParams(window.location.search)
const redirectedPath = params.get('p')

if (redirectedPath) {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL
  const restoredPath = decodeURIComponent(redirectedPath)
  const nextUrl = `${base}${restoredPath}`
  window.history.replaceState(null, '', nextUrl)
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
