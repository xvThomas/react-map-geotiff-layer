import React from 'react'
import { PaddingOptions, useMap } from 'react-map-gl'

type FitBoundsProps = {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  padding?: number | PaddingOptions
  duration?: number
}

const FitBounds: React.FC<FitBoundsProps> = ({ xmin, xmax, ymin, ymax, padding, duration }) => {
  const { current: map } = useMap()

  React.useEffect(() => {
    if (map === undefined) {
      throw Error('FitBounds must be used inside a Map component')
    }
  }, [map])

  React.useEffect(() => {
    if (map === undefined) return
    map.fitBounds(
      [
        [xmin, ymin],
        [xmax, ymax],
      ],
      {
        padding,
        duration,
      },
    )
  }, [map, xmin, xmax, ymin, ymax, padding, duration])
  return null
}

FitBounds.defaultProps = {
  padding: 40,
  duration: 1000,
}

export default FitBounds
