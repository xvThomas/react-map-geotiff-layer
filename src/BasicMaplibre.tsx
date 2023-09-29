import * as React from 'react'
import Map, { Layer, Source } from 'react-map-gl/maplibre'

export default function BasicMaplibre() {
  return (
    <Map
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100vh' }}
    >
      <Source id='raster-tiles' type='raster' tiles={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']} tileSize={256}>
        <Layer id='simple-tiles' type='raster'></Layer>
      </Source>
    </Map>
  )
}
