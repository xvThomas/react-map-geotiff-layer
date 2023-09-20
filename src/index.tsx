import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
// import Map from './Map'
import './index.css'
import { GithubLogo } from './brands/GithubLogo'
import { NpmLogo } from './brands/NpmLogo'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

function Index() {
  const handleClick = (e: any) => {
    console.log(e)
  }
  const element = (
    <StrictMode>
      <div data-theme='dark' className='flex flex-col h-screen bg-gradient-to-tr from-slate-600 to-slate-900'>
        <div className='flex justify-end'>
          <a
            className='m-2'
            href='https://github.com/xvThomas/react-map-geotiff-layer'
            target='_blank'
            rel='noreferrer'
          >
            <GithubLogo />
          </a>
          <a
            className='m-2'
            href='https://www.npmjs.com/package/react-map-geotiff-layer'
            target='_blank'
            rel='noreferrer'
          >
            <NpmLogo />
          </a>
        </div>
        <div className='flex grow'>
          <div className='hero'>
            <div className='hero-content text-center'>
              <div className='max-w-xl'>
                <h1 className='text-5xl font-bold'>react-map-geotiff-layer</h1>
                <p className='py-6'>
                  <b>reactmap-geotiff-layer</b> helps you to visualize <b>geotiff</b> using{' '}
                  <a
                    className='font-bold text-primary hover:text-secondary'
                    href='https://www.mapbox.com/mapbox-gljs'
                    target='_blank'
                    rel='noreferrer'
                  >
                    mapbox-gl
                  </a>{' '}
                  or{' '}
                  <a
                    className='font-bold text-primary hover:text-secondary'
                    href='https://maplibre.org'
                    target='_blank'
                    rel='noreferrer'
                  >
                    maplibre gl js
                  </a>{' '}
                  thanks to{' '}
                  <a
                    className='font-bold text-primary hover:text-secondary'
                    href='https://visgl.github.io/react-map-gl'
                    target='_blank'
                    rel='noreferrer'
                  >
                    react-map-gl
                  </a>
                </p>
                <button className='btn btn-primary' onClick={handleClick}>
                  See the basic demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StrictMode>
  )
  root.render(element)
}

Index()
