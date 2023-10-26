import React from 'react'
import { useMap } from 'react-map-gl'
import PropTypes from 'prop-types'

export interface FitBoundsProps {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  padding: number
  duration: number
}

export const FitBounds = (props: FitBoundsProps) => {
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
        [props.xmin, props.ymin],
        [props.xmax, props.ymax],
      ],
      { padding: props.padding, duration: props.duration },
    )
  }, [map, props])

  return null
}
FitBounds.propTypes = {
  xmin: PropTypes.number.isRequired,
  xmax: PropTypes.number.isRequired,
  ymin: PropTypes.number.isRequired,
  ymax: PropTypes.number.isRequired,
}

FitBounds.defaultProps = {
  padding: 40,
  duration: 1000,
}
