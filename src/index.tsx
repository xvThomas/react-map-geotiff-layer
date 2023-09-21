import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './Home'
import BasicMap from './BasicMap'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

function Index() {
  const element = (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path='basic' element={<BasicMap />} />
        </Routes>
        <Home></Home>
      </BrowserRouter>
    </StrictMode>
  )
  root.render(element)
}

Index()
