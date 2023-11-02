import * as React from 'react'
import Map from 'react-map-gl'
import InspectionBarControl from '../components/controls/InspectionBar'
import GeotiffLayer from '../components/GeotiffLayer'

import 'mapbox-gl/dist/mapbox-gl.css'
import { GeotiffData } from '../components/helpers/fetchGeotiff'
import FitBounds from './FitBounds'

export default function PlaygroundMap() {
  const [geotiffData, setGeotiffData] = React.useState<GeotiffData | undefined>(undefined)
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
          loaded={(geotiff: GeotiffData) => setGeotiffData(geotiff)}
        />
        <InspectionBarControl />
        {geotiffData !== undefined && (
          <FitBounds
            xmin={geotiffData.xmin}
            xmax={geotiffData.xmax}
            ymin={geotiffData.ymin}
            ymax={geotiffData.ymax}
            padding={100}
          ></FitBounds>
        )}
      </Map>
    </div>
  )
}
