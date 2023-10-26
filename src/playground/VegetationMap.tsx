import * as React from 'react'
import Map from 'react-map-gl'
import InspectionBarControl from '../components/controls/InspectionBar'
import { GeotiffLayer } from '../components/GeotiffLayer'

import 'mapbox-gl/dist/mapbox-gl.css'
import { GeotiffData } from '../components/helpers/fetchGeotiff'
import { FitBounds } from './FitBounds'

export default function VegetationMap() {
  const files = ['1449551', '15166681', '1517972']
  const [currentFile, setCurrentFile] = React.useState<string>(files[0])
  const [geotiffData, setGeotiffData] = React.useState<GeotiffData | undefined>(undefined)
  return (
    <div>
      <Map
        initialViewState={{
          latitude: 47.25,
          longitude: 4.483,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100vh' }}
        mapStyle='mapbox://styles/mapbox/streets-v9'
        mapboxAccessToken={process.env.MAPBOX_TOKEN}
      >
        <GeotiffLayer
          id='vegetation-layer-example'
          url={`http://localhost:5625/vegetation/${currentFile}.tif`}
          loaded={(geotiff: GeotiffData) => setGeotiffData(geotiff)}
        />
        <InspectionBarControl />
        {geotiffData !== undefined && (
          <FitBounds
            xmin={geotiffData.xmin}
            xmax={geotiffData.xmax}
            ymin={geotiffData.ymin}
            ymax={geotiffData.ymax}
          ></FitBounds>
        )}
      </Map>
    </div>
  )
}
