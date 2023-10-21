import { createShaderProgram, ShaderProgram } from 'ts-gl-shader'
import { CustomLayerInterface, Map } from 'mapbox-gl'
import { GeotiffData } from '../helpers/fetchGeotiff'
import { Scale } from 'chroma-js'

const vertSrc = /* glsl */ `
precision highp float;

uniform mat4 u_matrix;
attribute vec2 a_position;
attribute vec4 a_color;
varying vec4 v_color;
uniform vec2 u_translation;
uniform vec2 u_scale;

#define PI 3.1415926535897932384626433832795

void main(void) {
    vec2 position = a_position;

    // scale
    position = position * u_scale;
       
    // translate
    position = position + u_translation;

    // convert lng/lat to web mercator
    position = vec2(
        (180.0 + position.x)/360.0,
        (180.0 - (180.0 / PI * log(tan(PI / 4.0 + position.y * PI / 360.0)))) / 360.0);
    
    v_color = a_color;  

    gl_Position = u_matrix * vec4(position, 0.0, 1.0);   
}
` as const

const fragSrc = /* glsl */ `
precision highp float;
varying vec4 v_color;
uniform float u_opacity;

void main(void) {
    gl_FragColor = v_color * u_opacity;
}
` as const

type RGBA = [number, number, number, number]

export interface GridProps {
  id: string
  visible: boolean
  chromaScale: Scale
  opacity: number
  interpolated: boolean
  interpolateBounds: boolean
  geotiffData: GeotiffData
  wireframe: boolean
}

export interface GridLayerInterface extends CustomLayerInterface, GridProps {}

export default class GridGLLayer implements GridLayerInterface {
  constructor(props: GridProps) {
    this.id = props.id
    this.opacity = props.opacity
    this.visible = props.visible
    this.chromaScale = props.chromaScale
    this.interpolated = props.interpolated
    this.interpolateBounds = props.interpolateBounds
    this.resolution = props.geotiffData.resolution
    this.grid = props.geotiffData.values
    this.width = props.geotiffData.width
    this.height = props.geotiffData.height
    this.geotiffData = props.geotiffData
    this.wireframe = props.wireframe
    this.type = 'custom'
    this.renderingMode = '2d'
  }

  readonly id: string
  readonly type: 'custom'
  readonly renderingMode?: '2d' | '3d' | undefined

  visible: boolean
  chromaScale: Scale
  resolution: number[]
  opacity: number
  interpolated: boolean
  interpolateBounds: boolean
  geotiffData: GeotiffData
  wireframe: boolean

  private grid: number[][]
  private width: number
  private height: number

  private myShader: ShaderProgram<typeof vertSrc, typeof fragSrc> | null = null
  private pBuffer: WebGLBuffer | null = null
  private cBuffer: WebGLBuffer | null = null
  private vertexCount = 0

  private readonly noDataColor: RGBA = [0, 0, 0, 0]

  setOpacity(opacity: number) {
    this.opacity = opacity
  }

  setInterpolated(interpolated: boolean) {
    this.interpolated = interpolated
  }

  setInterpolateBounds(interpolateBounds: boolean) {
    this.interpolateBounds = interpolateBounds
  }

  deleteProgram(_: Map, gl: WebGLRenderingContext) {
    if (this.pBuffer) gl.deleteBuffer(this.pBuffer)
    if (this.cBuffer) gl.deleteBuffer(this.cBuffer)
  }

  createProgram(_: Map, gl: WebGL2RenderingContext) {
    this.myShader = createShaderProgram(gl, vertSrc, fragSrc)

    const pBufferData: number[] = []
    const cBufferData: number[] = []

    this.vertexCount = 0

    console.log(this.geotiffData)

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
        this.vertexCount = this.vertexCount + geometry.length / 2

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

      this.pBuffer = gl.createBuffer()
      this.cBuffer = gl.createBuffer()

      gl.bindBuffer(gl.ARRAY_BUFFER, this.pBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pBufferData), gl.STATIC_DRAW)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cBufferData), gl.STATIC_DRAW)
    }
  }

  onRemove(map: Map, gl: WebGLRenderingContext): void {
    this.deleteProgram(map, gl)
  }

  onAdd?(map: Map, gl: WebGL2RenderingContext): void {
    this.createProgram(map, gl)
  }

  render(gl: WebGLRenderingContext, matrix: number[]): void {
    if (!this.myShader) return
    this.myShader.use()

    gl.uniformMatrix4fv(this.myShader.uniforms.u_matrix.location, false, matrix)

    this.myShader.uniforms.u_opacity.set(this.opacity)

    // scaling
    const scale = [Math.abs(this.resolution[0]) / 100.0, Math.abs(this.resolution[1]) / 100.0]
    this.myShader.uniforms.u_scale.set(scale[0], scale[1])

    this.myShader.uniforms.u_translation.set(
      this.geotiffData.xmin + this.resolution[0] / 2.0,
      this.geotiffData.ymin + this.resolution[1] / 2.0,
    )

    if (!this.pBuffer) return
    if (!this.cBuffer) return
    this.myShader.attributes.a_position.set(this.pBuffer)
    this.myShader.attributes.a_color.set(this.cBuffer)

    const offset = 0
    const vertexCount = this.vertexCount
    gl.drawArrays(this.wireframe ? gl.LINE_STRIP : gl.TRIANGLES, offset, vertexCount)
  }

  /** check if a value is a no data value */
  isNoData(value: number | null) {
    return value === null || value === 0
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
    const values = [this.grid[j][i]]
    if (j > 0) values.push(this.grid[j - 1][i])
    if (j > 0 && i < this.width - 1) values.push(this.grid[j - 1][i + 1])
    if (i < this.width - 1) values.push(this.grid[j][i + 1])
    return this.getAvgColor(values)
  }

  /** return color of the left bottom vertex */
  leftBottomVertexColor(j: number, i: number): RGBA {
    const values = [this.grid[j][i]]
    if (j > 0) values.push(this.grid[j - 1][i])
    if (j > 0 && i > 0) values.push(this.grid[j - 1][i - 1])
    if (i > 0) values.push(this.grid[j][i - 1])
    return this.getAvgColor(values)
  }

  /** return color of the right top vertex */
  rightTopVertexColor(j: number, i: number): RGBA {
    const values = [this.grid[j][i]]
    if (i < this.width - 1) values.push(this.grid[j][i + 1])
    if (j < this.height - 1 && i < this.width - 1) values.push(this.grid[j + 1][i + 1])
    if (j < this.height - 1) values.push(this.grid[j + 1][i])
    return this.getAvgColor(values)
  }

  /** return color of the left top vertex */
  leftTopVertexColor(j: number, i: number): RGBA {
    const values = [this.grid[j][i]]
    if (i > 0) values.push(this.grid[j][i - 1])
    if (j < this.height - 1 && i > 0) values.push(this.grid[j + 1][i - 1])
    if (j < this.height - 1) values.push(this.grid[j + 1][i])
    return this.getAvgColor(values)
  }

  uniformColor(j: number, i: number): RGBA {
    return this.getColor(this.grid[j][i])
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
