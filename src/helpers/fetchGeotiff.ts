import { fromUrl, GeoTIFFImage, ReadRasterResult, TypedArray, GeoTIFF } from 'geotiff'
import { TaskEither, tryCatch, bind, Do, map } from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'

export interface GeotiffData {
  grid: number[][][]
  resolution: number[]
  width: number
  height: number
}

export function getGeotiffData(url: string, band: number = 0): TaskEither<Error, GeotiffData> {
  return pipe(
    Do,
    bind('geotiff', () => fetchGeoTIFF(url)),
    bind('image', ({ geotiff }) => getImage(url, geotiff)),
    bind('rasters', ({ image }) => getRasters(url, image)),
    bind('raster', ({ rasters }) => getRasterBand(rasters, band)),
    map(({ image, raster }) => toGridData(image, raster)),
  )
}

const fetchGeoTIFF = (url: string): TaskEither<Error, GeoTIFF> =>
  tryCatch(
    () => fromUrl(url),
    () => Error(`unable to fetch ${url}`),
  )

const getImage = (url: string, geotiff: GeoTIFF): TaskEither<Error, GeoTIFFImage> =>
  tryCatch(
    () => geotiff.getImage(),
    () => Error(`Fetched but unable to read geotiff ${url}}`),
  )

const getRasters = (url: string, image: GeoTIFFImage): TaskEither<Error, ReadRasterResult> =>
  tryCatch(
    () => image.readRasters(),
    () => Error(`Fetched but unable to read underlying rasters: ${url}`),
  )

const getRasterBand = (rasters: ReadRasterResult, band: number): TaskEither<Error, TypedArray> =>
  tryCatch(
    () => Promise.resolve(rasters[band] as TypedArray),
    () => Error(`Geotiff does not contains band ${band}`),
  )

const toGridData = (image: GeoTIFFImage, raster: TypedArray): GeotiffData => {
  const origin: number[] = image.getOrigin()
  const resolution: number[] = image.getResolution()

  const startX = origin[0] + resolution[0] / 2
  const startY = origin[1] + resolution[1] / 2

  const width: number = image.getWidth()
  const height: number = image.getHeight()

  const grid: number[][][] = []
  let n = 0
  for (let j = 0; j < height; j++) {
    const line: number[][] = []
    for (let i = 0; i < width; i++) {
      line.push([startX + resolution[0] * i, startY + resolution[1] * j, raster[n++]])
    }
    grid.push(line)
  }

  return {
    grid: grid,
    resolution: resolution,
    width: width,
    height: height,
  }
}

/*
export function fetchGeotiff(url: string): Promise<GeotiffData | null> {
  return fromUrl(url)
    .then((geotiff) =>
      geotiff
        .getImage()
        .catch(() => {
          throw new Error(`Fetched but unable to read geotiff: ${url}`)
        })
        .then((image) =>
          image
            .readRasters()
            .catch(() => {
              throw new Error(`Fetched but unable to read underlying rasters: ${url}`)
            })
            .then((rasters) => {
              return { image, rasters }
            }),
        ),
    )
    .catch(() => null)
}
*/

/*
export const geotiffDataToGridData = ({ image, rasters }: GeotiffData): GridData => {
  // Assume that raster contains at least one band : raster[0]
  const origin: number[] = image.getOrigin()
  const resolution: number[] = image.getResolution()

  const startX = origin[0] + resolution[0] / 2
  const startY = origin[1] + resolution[1] / 2

  // Keep only the first raster
  const raster = rasters[0] as TypedArray
  const grid: number[][][] = []
  let n = 0

  const width: number = image.getWidth()
  const height: number = image.getHeight()

  for (let j = 0; j < height; j++) {
    const line: number[][] = []
    for (let i = 0; i < width; i++) {
      line.push([startX + resolution[0] * i, startY + resolution[1] * j, raster[n++]])
    }
    grid.push(line)
  }

  const res = {
    grid: grid,
    resolution: resolution,
    width: width,
    height: height,
  }

  return res
}
*/
