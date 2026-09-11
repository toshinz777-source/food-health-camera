import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function showFatalError(message: string) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = ''
  const box = document.createElement('div')
  box.style.cssText =
    'padding:24px;font-family:sans-serif;color:#991b1b;background:#fef2f2;min-height:100vh;box-sizing:border-box;'
  const title = document.createElement('h2')
  title.style.cssText = 'margin:0 0 12px;font-size:18px;'
  title.textContent = 'アプリの読み込みに失敗しました'
  const body = document.createElement('pre')
  body.style.cssText = 'white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.6;'
  body.textContent = message
  box.appendChild(title)
  box.appendChild(body)
  root.appendChild(box)
}

window.addEventListener('error', (event) => {
  showFatalError(`${event.message}\n${event.error?.stack ?? ''}`)
})

window.addEventListener('unhandledrejection', (event) => {
  showFatalError(`Unhandled rejection: ${String(event.reason)}`)
})

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('#root element was not found in the document.')

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  showFatalError(err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err))
}
