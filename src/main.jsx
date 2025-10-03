import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppPatched from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppPatched data={[]} />
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
