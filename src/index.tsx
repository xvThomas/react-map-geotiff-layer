import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './Home'
import BasicMap from './BasicMap'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

function Index() {
  const element = (
    <StrictMode>
      <HashRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path='basic' element={<BasicMap />} />
        </Routes>
        <Home></Home>
      </HashRouter>
    </StrictMode>
  )
  root.render(element)
}

Index()
