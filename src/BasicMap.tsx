import * as React from 'react'
import Map, { Marker } from 'react-map-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

// TODO -> .env
const MAPBOX_TOKEN = 'pk.eyJ1IjoieHZ0aG9tYXMiLCJhIjoib28xSWthOCJ9.fFF9G9e14LSvOINrnEeWhQ' /*process.env.MAPBOX_TOKEN$*/

export default function BasicMap() {
  return (
    <div>
      <Map
        initialViewState={{
          latitude: 37.8,
          longitude: -122.4,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100vh' }}
        mapStyle='mapbox://styles/mapbox/streets-v9'
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Marker longitude={-122.4} latitude={37.8} color='red' />
      </Map>
      pas cool
    </div>
  )
}
