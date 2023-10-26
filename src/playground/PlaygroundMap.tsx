import * as React from 'react'
import Map from 'react-map-gl'
import InspectionBarControl from '../components/controls/InspectionBar'
import { GeotiffLayer } from '../components/GeotiffLayer'

import 'mapbox-gl/dist/mapbox-gl.css'
import { GeotiffData } from '../components/helpers/fetchGeotiff'

export default function PlaygroundMap() {
  return (
    <div>
      <Map
        initialViewState={{
          latitude: 0,
          longitude: 0,
          zoom: 3,
        }}
        style={{ width: '100%', height: '100vh' }}
        mapStyle='mapbox://styles/mapbox/streets-v9'
        mapboxAccessToken={process.env.MAPBOX_TOKEN}
      >
        <GeotiffLayer
          id='grid-layer-example'
          url='http://localhost:5625/test.tif'
          colors={['#FF0000', '#0000FF']}
          loaded={(geotiff: GeotiffData) => console.log('loaded', geotiff)}
        />
        <InspectionBarControl />
      </Map>
    </div>
  )
}
