
# react-map-geotiff-layer (Work in progress, not ready for production)

![node](https://img.shields.io/badge/node-18.16.0-blue)

Here is an example with mapbox-gl behind react-map-gl:

```jsx
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
  <GeotiffLayer id='grid-layer-example' url='https://mycompany.com/some-geotiff/my-geotiff.tif' />
</Map>
```

## Main dependencies

- [visgl/react-map-gl](https://github.com/visgl/react-map-gl): [mapbox-gl](https://docs.mapbox.com/mapbox-gl-js/guides/) and [maplibre](https://maplibre.org) react wrapper
- [GeoTIFF/georaster](https://github.com/GeoTIFF/georaster): Geotiff loader
- [gka/chromajs](https://github.com/gka/chroma.js): Geotiff values converter to color
- [AlexJWayne/ts-gl-shader](https://github.com/AlexJWayne/ts-gl-shader): Typed WebGL shaders
- [gcanti/fp-ts](https://github.com/gcanti/fp-ts): Functional typescript

## Usage

### Installation

```bash
npm i react-map-geotiff-layer
```

### `<GeotiffLayer/>` Properties

| prop              | type                | required | default value                  | description                                                                                                                                                                                                                                          |
| ----------------- | ------------------- | :------: | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                | string              |   yes    |                                | Unique layer name (see [mapbox-gl documentation](https://docs.mapbox.com/style-spec/reference/layers/#layer-properties))                                                                                                                             |
| url               | string              |   yes    |                                | Url of the geotiff (http or https)                                                                                                                                                                                                                   |
| band              | number              |    no    | 0                              | A positive number indicating the geotiff band to be used                                                                                                                                                                                             |
| interpolated      | boolean             |    no    | true                           | Interpolate web-gl vertex colors                                                                                                                                                                                                                     |
| interpolateBounds | boolean             |    no    | false                          | Interpolate with closest noData cells (only applicable if `interpolate` is `true`)                                                                                                                                                                   |
| opacity           | number              |    no    | 1                              | Opacity ratio from 0 (transparent) to 1                                                                                                                                                                                                              |
| visible           | boolean             |    no    | true                           | Show/hide geotiff layer                                                                                                                                                                                                                              |
| colors            | (string \| Color)[] |    no    | ['#FFFFFF', '#000000']         | Color range applied in conjunction with property `domain`. Behind the scene, the [chromajs scale and domain](https://gka.github.io/chroma.js/#color-scales) functions are used to determine the cells colors: chroma.scale(`color`).domain(`domain`) |
| domain            | number[]            |    no    | [`geotiff.min`, `geotiff.max`] | If not specified the data values range is used                                                                                                                                                                                                       |
| maxzoom           | number              |    no    | undefined                      | The maximum zoom level for the layer (between 0 and 24 inclusive). At zoom levels equal to or greater than the maxzoom, the layer will be hidden (not yed implemented)                                                                               |
| minzoom           | number              |    no    | undefined                      | The minimum zoom level for the layer (between 0 and 24 inclusive). At zoom levels less than the minzoom, the layer will be hidden (not yed implemented)                                                                                              |
| noDataValue       | number \| null      |    no    | undefined                      | Override noDataValue originally stored in the geotiff                                                                                                                                                                                                |

### `<GeotiffLayer/>` Events

| event   | signature                     | description                                                                   |
| ------- | ----------------------------- | ----------------------------------------------------------------------------- |
| loaded  | (geotiff: GeotiffData) => any | Fired when the geotiff is downloaded. Emit a GeotiffData instance (see below) |
| onError | (e: Error) => any             | Rired when an error occured during geotiff download                           |

### Internal representation of geotiff

The internal data structure of geotiff is highly inspired by the [georaster](https://github.com/GeoTIFF/georaster#required-properties) properties.

```typescript
export interface GeotiffData {
  values: number[][]
  cellWidth: number
  cellHeight: number
  width: number
  height: number
  noDataValue: number | null
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  min: number
  max: number
}
```

## Roadmap

- github-pages demo
- S3 download
- Cloud Optimized Geotiff
- Multi urls (introduce array of urls and indexation of selected geotiff)
- Resolve jitter effect at low resolution
- Ensure support of maplibre

## Run Playground example in dev mode

This repository contains an example project. To use it, follow the instructions below.

### Get a mapbox token

- First register to [mapbox](https://account.mapbox.com/auth/signup/) and get a token (if you don't have one)
- Create a `.env` file with the following key:

```bash
MAPBOX_TOKEN=<your-token>
```

### Launch http-server to serve geotiff samples

```bash
cd public
http-server -p 5625 --cors
```

### Build, compile and run

```bash
npm install
npm run build
npm start
```
