import { createShaderProgram, ShaderProgram } from 'ts-gl-shader'
import { CustomLayerInterface, Map } from 'mapbox-gl'
import { GeotiffData } from '../helpers/fetchGeotiff'
import { Color } from 'chroma-js'
import { CreateGLBuffersOutput, CreateGLBuffersInput } from './createGLBuffers'

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

export interface GridLayerProps {
  id: string
  visible: boolean
  colors: (string | Color)[]
  domain: number[]
  opacity: number
  interpolated: boolean
  interpolateBounds: boolean
  geotiffData: GeotiffData
  wireframe: boolean
}

export interface GridLayerInterface extends CustomLayerInterface, GridLayerProps {}

export default class GridGLLayer implements GridLayerInterface {
  constructor(props: GridLayerProps) {
    this.id = props.id
    this.opacity = props.opacity
    this.visible = props.visible
    this.colors = props.colors
    this.domain = props.domain
    this.interpolated = props.interpolated
    this.interpolateBounds = props.interpolateBounds
    this.geotiffData = props.geotiffData
    this.wireframe = props.wireframe
    this.type = 'custom'
    this.renderingMode = '2d'

    this.worker = new Worker('./createGLBuffers.ts')
  }

  worker: Worker
  readonly id: string
  readonly type: 'custom'
  readonly renderingMode?: '2d' | '3d' | undefined

  visible: boolean
  colors: Array<string | Color>
  domain: number[]
  opacity: number
  interpolated: boolean
  interpolateBounds: boolean
  geotiffData: GeotiffData
  wireframe: boolean

  private myShader: ShaderProgram<typeof vertSrc, typeof fragSrc> | null = null
  private pBuffer: WebGLBuffer | null = null
  private cBuffer: WebGLBuffer | null = null
  private vertexCount = 0

  setOpacity(opacity: number) {
    this.opacity = opacity
  }

  setInterpolated(interpolated: boolean) {
    this.interpolated = interpolated
  }

  setInterpolateBounds(interpolateBounds: boolean) {
    this.interpolateBounds = interpolateBounds
  }

  onRemove(_map: Map, gl: WebGLRenderingContext): void {
    if (this.pBuffer) gl.deleteBuffer(this.pBuffer)
    if (this.cBuffer) gl.deleteBuffer(this.cBuffer)
  }

  onAdd?(_map: Map, gl: WebGL2RenderingContext): void {
    this.myShader = createShaderProgram(gl, vertSrc, fragSrc)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    this.worker.addEventListener('message', function (messageEvent: MessageEvent<CreateGLBuffersOutput>) {
      that.createGLBuffers(messageEvent.data, gl)
    })

    this.worker.postMessage({
      interpolated: this.interpolated,
      interpolateBounds: this.interpolateBounds,
      geotiffData: this.geotiffData,
      wireframe: this.wireframe,
      colors: this.colors,
      domain: this.domain,
    } as CreateGLBuffersInput)
  }

  createGLBuffers(processOutput: CreateGLBuffersOutput, gl: WebGL2RenderingContext) {
    this.pBuffer = gl.createBuffer()
    this.cBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(processOutput.pBufferData), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(processOutput.cBufferData), gl.STATIC_DRAW)

    this.vertexCount = processOutput.vertexCount
  }

  render(gl: WebGLRenderingContext, matrix: number[]): void {
    if (!this.myShader) return
    if (!this.pBuffer) return
    if (!this.cBuffer) return
    this.myShader.use()

    gl.uniformMatrix4fv(this.myShader.uniforms.u_matrix.location, false, matrix)

    this.myShader.uniforms.u_opacity.set(this.opacity)

    // scaling
    this.myShader.uniforms.u_scale.set(
      Math.abs(this.geotiffData.cellWidth) / 100,
      Math.abs(this.geotiffData.cellHeight) / 100.0,
    )

    // translation
    this.myShader.uniforms.u_translation.set(
      this.geotiffData.xmin + this.geotiffData.cellWidth / 2.0,
      this.geotiffData.ymin + this.geotiffData.cellHeight / 2.0,
    )

    this.myShader.attributes.a_position.set(this.pBuffer)
    this.myShader.attributes.a_color.set(this.cBuffer)

    const offset = 0
    const vertexCount = this.vertexCount
    gl.drawArrays(this.wireframe ? gl.LINE_STRIP : gl.TRIANGLES, offset, vertexCount)
  }
}
