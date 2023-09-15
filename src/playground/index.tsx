import React from 'react'
import ReactDOM from 'react-dom/client'
import PlaygroundMap from './PlaygroundMap'
import './index.css'

let parcelRequire
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <PlaygroundMap />
  </React.StrictMode>,
)
