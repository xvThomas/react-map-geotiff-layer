import mapboxgl, { IControl, Map } from 'mapbox-gl'
import './InspectionBar.css'
import { ControlPosition, useControl } from 'react-map-gl'

export type InspectionBarControlOptions = {
  position?: ControlPosition
}

export default function InspectionBarControl(props: InspectionBarControlOptions) {
  useControl(() => new InspectionBar(), {
    position: props.position,
  })

  return null
}

class InspectionBar implements IControl {
  node: HTMLDivElement
  map: Map | null
  title: HTMLDivElement | null = null

  lat: number | null = null
  lng: number | null = null
  zoom: number | null = null

  constructor() {
    this.node = document.createElement('div')
    this.node.classList.add('mapboxgl-ctrl')
    this.title = document.createElement('div')
    this.title.classList.add('inspection-bar-title')
    this.title.textContent = ''
    this.node.appendChild(this.title)
    this.map = null
  }

  addClassName(className: string) {
    this.node.classList.add(className)
  }

  removeClassName(className: string) {
    this.node.classList.remove(className)
  }

  updateTitle = () => {
    if (!this.title) return
    this.title.textContent =
      this.lng && this.lat && this.zoom
        ? `lng: ${this.lng?.toFixed(4)}° lat: ${this.lat?.toFixed(4)}° zoom: ${this.zoom?.toFixed(2)}`
        : ''
  }

  onMouseMove = (ev: mapboxgl.MapMouseEvent) => {
    this.lng = ev.lngLat.lng
    this.lat = ev.lngLat.lat
    this.updateTitle()
  }

  onZoomChange = () => {
    if (this.map) {
      this.zoom = this.map.getZoom()
      this.updateTitle()
    }
  }

  onAdd(map: Map) {
    this.map = map
    this.addClassName('inspection-bar')
    if (this.map) {
      this.map.on('mousemove', (ev) => this.onMouseMove(ev))
      this.map.on('zoom', this.onZoomChange)
      this.onZoomChange()
    }
    return this.node
  }

  onRemove() {
    if (this.node !== null && this.node.parentNode !== null) this.node.parentNode.removeChild(this.node)
  }
}
