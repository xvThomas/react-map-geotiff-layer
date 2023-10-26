import React from 'react'
import ReactDOM from 'react-dom/client'
// import PlaygroundMap from './PlaygroundMap'
import VegetationMap from './VegetationMap'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  // <React.StrictMode>
  <VegetationMap />,
  // </React.StrictMode>,
)
