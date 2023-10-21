import { Scale, scale } from 'chroma-js'
import * as React from 'react'
import PropTypes from 'prop-types'
import { CustomLayerInterface, useMap } from 'react-map-gl'
import { GeotiffData, fetchGeotiff } from './helpers/fetchGeotiff'
import { match } from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import GridGLLayer from './webgl/GridGLLayer'

export interface GeotiffLayerProps {
  id: string
  interpolated: boolean
  interpolateBounds: boolean
  visible: boolean
  opacity: number
  chromaColorScale: Scale
  url: string
  beforeId: string
}

export const GeotiffLayer = (props: GeotiffLayerProps) => {
  const [gridGLLayer, setGridGLLayer] = React.useState<CustomLayerInterface | null>(null)
  const [geotiffData, setGeotiffData] = React.useState<GeotiffData | undefined>(undefined)

  const { current: map } = useMap()

  const removeLayer = React.useCallback(() => {
    if (gridGLLayer !== null && map !== undefined) {
      // console.log('remove layer')
      // map.getMap().removeLayer(gridGLLayer.id)
    }
  }, [gridGLLayer, map])

  React.useEffect(() => {
    return () => {
      /*
      if (gridGLLayer !== null && map !== undefined) {
        console.log('remove layer')
        map.getMap().removeLayer(gridGLLayer.id)
      }
      */
      removeLayer()
    }
  })

  React.useEffect(() => {
    if (map === undefined) {
      throw Error('GeotiffLayer must be used inside a Map component')
    } else {
      map.on('load', function () {
        pipe(
          fetchGeotiff(props.url, 0),
          match<Error, void, GeotiffData>(
            (left) => console.log(left),
            (geotiffData) => {
              console.log('set', geotiffData)
              setGeotiffData(geotiffData)
            },
          ),
        )()
      })
    }
  }, [map, props.url])

  React.useEffect(() => {
    console.log('hooks geotiffData', map, geotiffData, gridGLLayer)
    if (map === undefined) return
    if (geotiffData === undefined) return
    if (gridGLLayer !== null) {
      map.getMap().removeLayer(gridGLLayer.id)
      setGridGLLayer(null)
    }

    const gridLayer = new GridGLLayer({
      id: props.id,
      visible: props.visible,
      chromaScale: props.chromaColorScale,
      opacity: props.opacity,
      interpolated: props.interpolated,
      interpolateBounds: props.interpolateBounds,
      geotiffData: geotiffData,
      wireframe: true,
    })
    map.getMap().addLayer(gridLayer)
    setGridGLLayer(gridLayer)
  }, [geotiffData])
}

GeotiffLayer.propTypes = {
  url: PropTypes.string.isRequired,
}

GeotiffLayer.defaultProps = {
  interpolated: true,
  interpolateBounds: false,
  opacity: 0.75,
  visible: true,
  chromaColorScale: scale(['#FFFFFF', '#000000']).domain([0, 8]),
  beforeId: undefined,
}
