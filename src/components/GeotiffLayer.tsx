import { Color } from 'chroma-js'
import * as React from 'react'
import PropTypes from 'prop-types'
import { CustomLayerInterface, useMap } from 'react-map-gl'
import { GeotiffData, fetchGeotiff } from './helpers/fetchGeotiff'
import { match } from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import GridGLLayer from './webgl/gridGLLayer'

export interface GeotiffLayerProps {
  id: string
  interpolated: boolean
  interpolateBounds: boolean
  visible: boolean
  opacity: number
  colors: (string | Color)[]
  domain: number[] | undefined
  url: string
  wireframe: boolean
  loaded: (geotiffData: GeotiffData) => void
}

export const GeotiffLayer = (props: GeotiffLayerProps) => {
  const [gridGLLayer, setGridGLLayer] = React.useState<CustomLayerInterface | null>(null)
  const [geotiffData, setGeotiffData] = React.useState<GeotiffData | undefined>(undefined)

  const { current: map } = useMap()

  /*
  const removeLayer = React.useCallback(() => {
    if (gridGLLayer !== null && map !== undefined) {
      // console.log('remove layer')
      // map.getMap().removeLayer(gridGLLayer.id)
    }
  }, [gridGLLayer, map])

  React.useEffect(() => {
    return () => {
      
      // if (gridGLLayer !== null && map !== undefined) {
      //   console.log('remove layer')
      //   map.getMap().removeLayer(gridGLLayer.id)
      // }
     
      removeLayer()
    }
  })
  */

  React.useEffect(() => {
    console.log('empty')
  }, [])

  React.useEffect(() => {
    if (props.url === undefined) return
    if (map === undefined) {
      throw Error('GeotiffLayer must be used inside a Map component')
    } else {
      map.once('load', function () {
        pipe(
          fetchGeotiff(props.url, 0),
          match<Error, void, GeotiffData>(
            (left) => console.log(left),
            (geotiffData) => {
              setGeotiffData(geotiffData)
            },
          ),
        )()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.url])

  React.useEffect(() => {
    if (map === undefined) return
    if (geotiffData === undefined) return
    if (gridGLLayer !== null) {
      map.getMap().removeLayer(gridGLLayer.id)
      setGridGLLayer(null)
    }

    const gridLayer = new GridGLLayer({
      id: props.id,
      visible: props.visible,
      colors: props.colors,
      domain: props.domain ? props.domain : [geotiffData.min, geotiffData.max],
      opacity: props.opacity,
      interpolated: props.interpolated,
      interpolateBounds: props.interpolateBounds,
      geotiffData: geotiffData,
      wireframe: props.wireframe,
    })

    map.getMap().addLayer(gridLayer)
    setGridGLLayer(gridLayer)
    if (props.loaded !== undefined) props.loaded(geotiffData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geotiffData])

  return null
}

GeotiffLayer.propTypes = {
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
}

GeotiffLayer.defaultProps = {
  interpolated: true,
  interpolateBounds: false,
  opacity: 1,
  visible: true,
  wireframe: false,
  colors: ['#FFFFFF', '#000000'],
  domain: undefined,
  loaded: undefined,
}
