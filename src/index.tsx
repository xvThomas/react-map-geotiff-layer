import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './Home'
import BasicMapbox from './BasicMapbox'
import BasicMaplibre from './BasicMaplibre'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

function Index() {
  const element = (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path='basicM' element={<BasicMapbox />} />
          <Route path='basic' element={<BasicMaplibre />} />
        </Routes>
        <Home></Home>
      </BrowserRouter>
    </StrictMode>
  )
  root.render(element)
}

Index()
