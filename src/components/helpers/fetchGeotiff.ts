import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import parseGeoraster from 'georaster'

export type LngLatVal = [number, number, number]

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
  mins: number[]
  maxs: number[]
  values: number[][][]
}

export const fetchGeotiff = (url: string, band: number = 0): TaskEither<Error, any> =>
  tryCatch(
    () =>
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then(parseGeoraster)
        .then((raster) => parsedGeoRasterToGeotiffData(raster as unknown as ParsedGeoRaster, band)),
    (e) => Error(`unable to fetch ${url} - ${e}`),
  )

const parsedGeoRasterToGeotiffData = (raster: ParsedGeoRaster, band: number): GeotiffData => {
  if (raster.projection !== 4326) throw new Error(`Projection ${raster.projection} not supported`)
  if (band >= raster.numberOfRasters) throw new Error(`band ${band} not available`)
  return {
    values: raster.values[band],
    width: raster.width,
    height: raster.height,
    cellWidth: raster.pixelWidth,
    cellHeight: raster.pixelHeight,
    noDataValue: raster.noDataValue,
    xmin: raster.xmin,
    xmax: raster.xmax,
    ymin: raster.ymin,
    ymax: raster.ymax,
    min: raster.mins[band],
    max: raster.maxs[band],
  } as GeotiffData
}
