import React from 'react'
import ReactDOM from 'react-dom/client'
import Map from './Map'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Map />
  </React.StrictMode>,
)
