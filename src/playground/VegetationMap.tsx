import * as React from 'react'
import Map from 'react-map-gl'
import InspectionBarControl from '../components/controls/InspectionBar'
import GeotiffLayer from '../components/GeotiffLayer'

import 'mapbox-gl/dist/mapbox-gl.css'
import { GeotiffData } from '../components/helpers/fetchGeotiff'
import FitBounds from './FitBounds'

const VegetationMap = () => {
  const files = ['1449551', '1516681', '1517972']
  const [currentFile] = React.useState<string>(files[2])
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
        mapStyle='mapbox://styles/mapbox/satellite-streets-v9'
        mapboxAccessToken={process.env.MAPBOX_TOKEN}
      >
        <GeotiffLayer
          id='vegetation-layer-example'
          url={`http://localhost:5625/vegetation/${currentFile}.tif`}
          colors={['#FFFF00', '#FF0000', '#00FF00']}
          domain={[-10, -5, 0]}
          interpolated={false}
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

export default VegetationMap
