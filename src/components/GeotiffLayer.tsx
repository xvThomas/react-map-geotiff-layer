import * as React from 'react'
import { CustomLayerInterface, useMap } from 'react-map-gl'
import { GeotiffData, fetchGeotiff } from './helpers/fetchGeotiff'
import { match } from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import GridGLLayer from './webgl/gridGLLayer'
import { Color } from 'chroma-js'

type GeotiffLayerProps = {
  id: string
  url: string
  interpolated?: boolean
  interpolateBounds?: boolean
  opacity?: number
  visible?: boolean
  wireframe?: boolean
  colors?: (string | Color)[]
  domain?: number[]
  loaded?: (geotiff: GeotiffData) => any
  onError?: (e: Error) => any
}

const GeotiffLayer: React.FC<GeotiffLayerProps> = (props) => {
  const [gridGLLayer, setGridGLLayer] = React.useState<CustomLayerInterface | null>(null)
  const [geotiffData, setGeotiffData] = React.useState<GeotiffData | undefined>(undefined)

  const { current: map } = useMap()

  const removeLayer = React.useCallback(() => {
    if (gridGLLayer !== null && map !== undefined) {
      // console.log('remove layer')
      map.getMap().removeLayer(props.id)
    }
  }, [gridGLLayer, map, props.id])

  React.useEffect(() => {
    return () => {
      removeLayer()
    }
  }, [removeLayer])

  React.useEffect(() => {
    if (props.url === undefined) return
    if (map === undefined) {
      throw Error('GeotiffLayer must be used inside a Map component')
    } else {
      map.once('load', function () {
        pipe(
          fetchGeotiff(props.url, 0),
          match<Error, void, GeotiffData>(
            (left) => {
              if (props.onError) props.onError(left)
            },
            (geotiffData) => {
              setGeotiffData(geotiffData)
            },
          ),
        )()
      })
    }
  }, [map, props, props.url])

  React.useEffect(() => {
    if (map === undefined) return
    if (geotiffData === undefined) return
    if (gridGLLayer !== null) {
      map.getMap().removeLayer(gridGLLayer.id)
      setGridGLLayer(null)
    }

    const gridLayer = new GridGLLayer({
      id: props.id,
      geotiffData: geotiffData,
      colors: props.colors ?? ['#FFFFFF', '#000000'],
      domain: props.domain ?? [geotiffData.min, geotiffData.max],
      visible: props.visible === undefined ? true : props.visible,
      opacity: props.opacity === undefined ? 1 : props.opacity,
      interpolated: props.interpolated == undefined ? true : props.interpolated,
      interpolateBounds: props.interpolateBounds == undefined ? false : props.interpolateBounds,
      wireframe: props.wireframe == undefined ? false : props.wireframe,
    })

    map.getMap().addLayer(gridLayer)
    setGridGLLayer(gridLayer)
    if (props.loaded) props.loaded(geotiffData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geotiffData])

  return null
}

export default GeotiffLayer

/*
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
*/
