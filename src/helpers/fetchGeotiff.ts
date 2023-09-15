import { fromUrl, GeoTIFFImage, ReadRasterResult, TypedArray } from 'geotiff'

export interface GridData {
  grid: number[][][]
  resolution: number[]
  width: number
  height: number
}

interface GeotiffData {
  image: GeoTIFFImage
  rasters: ReadRasterResult
}

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
