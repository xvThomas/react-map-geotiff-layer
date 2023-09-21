import * as React from 'react'
import { GithubLogo } from './brands/GithubLogo'
import { NpmLogo } from './brands/NpmLogo'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div data-theme='dark' className='flex flex-col h-screen bg-gradient-to-tr from-slate-600 to-slate-900'>
      <div className='flex justify-end'>
        <a className='m-2' href='https://github.com/xvThomas/react-map-geotiff-layer' target='_blank' rel='noreferrer'>
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
                <b>reactmap-geotiff-layer</b> aims to visualize <b>geotiff</b> using{' '}
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
              <Link to='basic'>
                <button className='btn btn-primary'>See the basic demo</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
