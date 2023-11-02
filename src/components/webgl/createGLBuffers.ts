import { Color, Scale, scale } from 'chroma-js'
import { GeotiffData } from '../helpers/fetchGeotiff'

export interface CreateGLBuffersInput {
  interpolated: boolean
  interpolateBounds: boolean
  geotiffData: GeotiffData
  wireframe: boolean
  colors: Array<string | Color>
  domain: number[]
}

export interface CreateGLBuffersOutput {
  pBufferData: number[]
  cBufferData: number[]
  vertexCount: number
}

type RGBA = [number, number, number, number]

class GridGLBuffers {
  private readonly interpolated: boolean
  private readonly interpolateBounds: boolean
  private readonly values: number[][]
  private readonly width: number
  private readonly height: number
  private readonly wireframe: boolean
  private readonly chromaScale: Scale
  private readonly noDataValue: number | null
  private readonly noDataColor: RGBA = [0, 0, 0, 0]

  constructor(params: CreateGLBuffersInput) {
    this.interpolated = params.interpolated
    this.interpolateBounds = params.interpolateBounds
    this.values = params.geotiffData.values
    this.width = params.geotiffData.width
    this.height = params.geotiffData.height
    this.wireframe = params.wireframe
    this.noDataValue = params.geotiffData.noDataValue
    this.chromaScale = scale(params.colors).domain(params.domain)
  }

  create(): CreateGLBuffersOutput {
    const pBufferData: number[] = []
    const cBufferData: number[] = []

    let vertexCount = 0

    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        // 3   2
        // | x |
        // 0   1
        const firstTriangle = [
          // 0, 1, 2, 0
          i * 100 - 50,
          j * 100 - 50,
          i * 100 + 50,
          j * 100 - 50,
          i * 100 + 50,
          j * 100 + 50,
        ]

        const secondTriangle = [
          // 2, 3, 0, 2
          i * 100 + 50,
          j * 100 + 50,
          i * 100 - 50,
          j * 100 + 50,
          i * 100 - 50,
          j * 100 - 50,
        ]

        const geometry = this.wireframe
          ? [...firstTriangle, ...firstTriangle.slice(0, 2), ...secondTriangle, ...secondTriangle.slice(0, 2)]
          : [...firstTriangle, ...secondTriangle]

        pBufferData.push(...geometry)
        vertexCount = vertexCount + geometry.length / 2

        const inversedJ = this.height - 1 - j

        const firstColors = [
          ...this.vertexColors(inversedJ, i)[0],
          ...this.vertexColors(inversedJ, i)[1],
          ...this.vertexColors(inversedJ, i)[2],
        ]

        const secondColors = [
          ...this.vertexColors(inversedJ, i)[2],
          ...this.vertexColors(inversedJ, i)[3],
          ...this.vertexColors(inversedJ, i)[0],
        ]

        const colors = this.wireframe
          ? [...firstColors, ...firstColors.slice(0, 4), ...secondColors, ...secondColors.slice(0, 4)]
          : [...firstColors, ...secondColors]
        cBufferData.push(...colors)
      }
    }

    return {
      pBufferData,
      cBufferData,
      vertexCount,
    } as CreateGLBuffersOutput
  }

  /** check if a value is a no data value */
  isNoData(value: number | null) {
    return value === this.noDataValue || value === 0
  }

  /** return the color of a grid value */
  getColor(value: number | null): RGBA {
    // if the value is no data, the color is "invisible"
    if (!this.isNoData(value)) {
      const [r, g, b, a] = this.chromaScale(value as number).rgba()
      return [r / 255.0, g / 255.0, b / 255.0, a] // webgl only supports color range [0..1]
    } else return this.noDataColor
  }

  getAvgColor(values: number[]): RGBA {
    if (values.length === 0) return this.noDataColor
    if (!this.interpolateBounds && values.find((value) => this.isNoData(value)) !== undefined) {
      return this.noDataColor
    }
    return this.getColor(values.reduce((x, y) => x + y) / values.length)
  }

  /** return color of the right bottom vertex */
  rightBottomVertexColor(j: number, i: number): RGBA {
    const values = [this.values[j][i]]
    if (j > 0) values.push(this.values[j - 1][i])
    if (j > 0 && i < this.width - 1) values.push(this.values[j - 1][i + 1])
    if (i < this.width - 1) values.push(this.values[j][i + 1])
    return this.getAvgColor(values)
  }

  /** return color of the left bottom vertex */
  leftBottomVertexColor(j: number, i: number): RGBA {
    const values = [this.values[j][i]]
    if (j > 0) values.push(this.values[j - 1][i])
    if (j > 0 && i > 0) values.push(this.values[j - 1][i - 1])
    if (i > 0) values.push(this.values[j][i - 1])
    return this.getAvgColor(values)
  }

  /** return color of the right top vertex */
  rightTopVertexColor(j: number, i: number): RGBA {
    const values = [this.values[j][i]]
    if (i < this.width - 1) values.push(this.values[j][i + 1])
    if (j < this.height - 1 && i < this.width - 1) values.push(this.values[j + 1][i + 1])
    if (j < this.height - 1) values.push(this.values[j + 1][i])
    return this.getAvgColor(values)
  }

  /** return color of the left top vertex */
  leftTopVertexColor(j: number, i: number): RGBA {
    const values = [this.values[j][i]]
    if (i > 0) values.push(this.values[j][i - 1])
    if (j < this.height - 1 && i > 0) values.push(this.values[j + 1][i - 1])
    if (j < this.height - 1) values.push(this.values[j + 1][i])
    return this.getAvgColor(values)
  }

  uniformColor(j: number, i: number): RGBA {
    return this.getColor(this.values[j][i])
  }

  vertexColors(j: number, i: number): [RGBA, RGBA, RGBA, RGBA] {
    if (this.interpolated)
      // 0   1
      // | x |
      // 3   2
      return [
        this.leftTopVertexColor(j, i), // 0
        this.rightTopVertexColor(j, i), // 1
        this.rightBottomVertexColor(j, i), // 2
        this.leftBottomVertexColor(j, i), // 3
      ]
    else {
      const color = this.uniformColor(j, i)
      return [color, color, color, color]
    }
  }
}

self.addEventListener('message', function (messageEvent: MessageEvent<CreateGLBuffersInput>) {
  const gridGLBuffers = new GridGLBuffers(messageEvent.data)
  self.postMessage(gridGLBuffers.create())
})
