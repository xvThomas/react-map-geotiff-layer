import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import parseGeoraster from 'georaster'

export type LngLatVal = [number, number, number]
export type Resolution = [number, number]

export interface GeotiffData {
  values: number[][]
  resolution: Resolution
  width: number
  height: number
  noDataValue: number | null
  xmin: number
  xmax: number
  ymin: number
  ymax: number
}

interface ParsedGeoRaster {
  width: number
  height: number
  pixelHeight: number
  pixelWidth: number
  projection: number
  noDataValue: number | null
  numberOfRasters: number
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  values: number[][][]
}

export const fetchGeotiff = (url: string, band: number = 0): TaskEither<Error, any> =>
  tryCatch(
    () =>
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then(parseGeoraster)
        .then((raster) => parsedGeoRasterToGeotiffData(raster as unknown as ParsedGeoRaster, band))
        .then((geotiffData) => {
          console.log(geotiffData)
          return geotiffData
        }),
    (e) => Error(`unable to fetch ${url} - ${e}`),
  )

const parsedGeoRasterToGeotiffData = (raster: ParsedGeoRaster, band: number): GeotiffData => {
  if (raster.projection !== 4326) throw new Error(`Projection ${raster.projection} not supported`)
  if (band >= raster.numberOfRasters) throw new Error(`band ${band} not available`)
  return {
    values: raster.values[band],
    width: raster.width,
    height: raster.height,
    resolution: [raster.pixelWidth, raster.pixelHeight],
    noDataValue: raster.noDataValue,
    xmin: raster.xmin,
    xmax: raster.xmax,
    ymin: raster.ymin,
    ymax: raster.ymax,
  } as GeotiffData
}
