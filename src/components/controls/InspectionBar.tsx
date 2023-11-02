import mapboxgl, { IControl, Map } from 'mapbox-gl'
import './InspectionBar.css'
import React, { Fragment } from 'react'
import { ControlPosition, useControl } from 'react-map-gl'
import { Root, createRoot } from 'react-dom/client'

export type InspectionBarControlOptions = {
  position?: ControlPosition
}

export default function InspectionBarControl(props: InspectionBarControlOptions) {
  useControl(() => new InspectionBar(), {
    position: props.position,
  })

  return null
}

type InspectionBarComponentProps = {
  lng?: number
  lat?: number
  zoom?: number
}

const InspectionBarComponent: React.FC<InspectionBarComponentProps> = ({ lng, lat, zoom }) => {
  return (
    <Fragment>
      {lng !== undefined && lat !== undefined && zoom !== undefined && (
        <div>
          <div>lng: {lng?.toFixed(4)}°</div>
          <div>lat: {lat?.toFixed(4)}°</div>
          <div>zoom: {zoom?.toFixed(2)}</div>
        </div>
      )}
    </Fragment>
  )
}

class InspectionBar implements IControl {
  node: HTMLDivElement
  map?: Map
  // title: HTMLDivElement | null = null
  root: Root

  lat?: number = undefined
  lng?: number = undefined
  zoom?: number = undefined

  constructor() {
    this.node = document.createElement('div')
    this.node.classList.add('mapboxgl-ctrl')
    this.node.style.display = 'block'
    this.root = createRoot(this.node)
    this.map = undefined
  }

  updateInspectionBarComponent = () => {
    this.root?.render(<InspectionBarComponent lng={this.lng} lat={this.lat} zoom={this.zoom} />)
  }

  onMouseMove = (ev: mapboxgl.MapMouseEvent) => {
    this.lng = ev.lngLat.lng
    this.lat = ev.lngLat.lat
    this.updateInspectionBarComponent()
  }

  onZoomChange = () => {
    if (this.map) {
      this.zoom = this.map.getZoom()
      this.updateInspectionBarComponent()
    }
  }

  onAdd(map: Map) {
    this.map = map
    // if (this.map) {
    this.map.on('mousemove', (ev) => this.onMouseMove(ev))
    this.map.on('zoom', this.onZoomChange)
    this.onZoomChange()
    //}
    return this.node
  }

  onRemove() {
    this.root.unmount
    this.node.parentNode?.removeChild(this.node)
  }
}
