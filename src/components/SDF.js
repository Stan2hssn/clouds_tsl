import App from "../App.js"

import { MeshBasicNodeMaterial, RenderTarget, StorageTexture } from "three/webgpu"
import {
  uv,
  vec2,
  Fn,
  viewportSize,
  max,
  texture,
  vec4,
  instanceIndex,
  float,
  textureStore,
  uniform,
  uvec2,
  length,
  smoothstep,
  min,
  mix,
  clamp,
  step,
  vec3,
  viewportCoordinate,
  screenUV,
} from "three/tsl"
import * as THREE from "three"
import getFullscreenTriangle from "../pure/Geometries/getFullScreenTriangle"

export default class SDF {
  constructor() {
    this.currentTargetIndex = 0

    this.width = App.viewport.width
    this.height = App.viewport.height

    this.init()
  }

  init() {
    this.initScene()
    this.setupRenderTargets()
    this.initMesh()
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  }

  initMesh() {
    this.geometry = getFullscreenTriangle()
    this.initMaterial()

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    App.scene.add(this.mesh)
  }

  setupRenderTargets() {
    const width = this.width
    const height = this.height

    this.computeTextures = [new StorageTexture(width, height), new StorageTexture(width, height)]
  }

  initMaterial() {
    this.uTime = uniform(float(0))

    const uCoords = uniform(vec2(App.coords))
    const uPrevCoords = uniform(vec2(App.prevCoords))

    const scaleUv = Fn(([uv, scale]) => uv.toVar().sub(vec2(0.5)).mul(scale).add(vec2(0.5)))

    const line = Fn(([p, a, b]) => {
      const aspectRatio = float(this.width).div(this.height)
      const pa = p.sub(a).mul(aspectRatio)
      const ba = b.sub(a).mul(aspectRatio)
      const h = clamp(pa.dot(ba).div(ba.dot(ba)), 0, 1)
      return length(pa.sub(ba.mul(h)))
    })

    this.computeFn = Fn(({ readTex, writeTex, time }) => {
      const posX = instanceIndex.modInt(App.viewport.width)
      const posY = instanceIndex.div(App.viewport.width)
      const coord = vec2(posX, posY)

      const texelUV = vec2(posX, posY).add(0.5).div(vec2(App.viewport.width, App.viewport.height))
      const prev = texture(readTex, texelUV).r

      const reinitFlag = step(0.016, time)
      const sdf = mix(length(texelUV).add(999.9), prev, reinitFlag)

      const mouse = uCoords.add(1).mul(0.5)
      const prevMouse = uPrevCoords.add(1).mul(0.5)

      const d = line(texelUV, prevMouse, mouse)
      const finalSdf = min(sdf, d)

      textureStore(writeTex, coord, vec4(vec3(finalSdf), 1))
    })

    this.material = new MeshBasicNodeMaterial()

    const dist = texture(this.computeTextures[this.currentTargetIndex]).r

    const stroke = step(dist, 0.01).toVec3()

    this.material.colorNode = stroke
  }

  render(t) {
    const readIndex = this.currentTargetIndex
    const writeIndex = 1 - this.currentTargetIndex

    this.uTime.value = t / 1000

    // Build a new compute node with updated read/write textures
    this.computeNode = this.computeFn({
      readTex: this.computeTextures[readIndex],
      writeTex: this.computeTextures[writeIndex],
      time: this.uTime,
    }).compute(App.viewport.width * App.viewport.height)

    App.renderer.computeAsync(this.computeNode)

    // Swap textures
    this.currentTargetIndex = writeIndex

    // Update material to sample from the new write texture (now current)
    this.material.colorNode = texture(this.computeTextures[this.currentTargetIndex])
  }

  dispose() {}

  resize() {
    const width = App.viewport.width
    const height = App.viewport.height
  }

  setDebug(debug) {}
}
