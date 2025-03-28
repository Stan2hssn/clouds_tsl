import { Pane } from "tweakpane"
import * as THREE from "three/webgpu"

import { sin, positionLocal, time, vec2, vec3, vec4, uv, uniform, color, rangeFog } from "three/tsl"
import getFullscreenTriangle from "./pure/Geometries/getFullScreenTriangle"
import SDFMaterial from "./pure/Materials/getSDFMaterial"

import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import SDF from "./components/SDF"
import gsap from "gsap"

class App {
  constructor(canvas) {
    // Initialize viewport dimensions
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    this.coords = new THREE.Vector2(0)
    this.prevCoords = new THREE.Vector2(0)
    this.timer = 0
    this.mouseMoved = false

    this.Components = {}

    this.setupInput()
  }

  // Setup all initial configurations
  init(canvas) {
    this.setupCamera()
    this.setupScene()
    this.setupRenderer(canvas)
    this.setupDebugPanel()

    this.Components.SDF = new SDF()

    this.setupControls()
  }

  // Configure the camera
  setupCamera() {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  }

  // Create and configure the scene
  setupScene() {
    this.scene = new THREE.Scene()
    this.fogColor = uniform(color("#1b191f"))
    this.fogNode = rangeFog(this.fogColor, 20, 50)
    this.scene.fogNode = this.fogNode
  }

  setupInput() {
    this.xTo = gsap.quickTo(this.coords, "x", {
      duration: 0.6,
      ease: "power2.out",
    })
    this.yTo = gsap.quickTo(this.coords, "y", {
      duration: 0.6,
      ease: "power2.out",
    })

    document.addEventListener("mousemove", this.onDocumentTouchMove.bind(this), false)
  }

  onDocumentTouchMove(event) {
    this.setCoords(event.clientX, event.clientY)
  }

  setCoords(x, y) {
    if (this.timer) clearTimeout(this.timer)

    this.xTo((x / this.viewport.width) * 2 - 1)
    this.yTo(-(y / this.viewport.height) * 2 + 1)

    this.mouseMoved = true
    this.timer = setTimeout(() => {
      this.mouseMoved = false
    }, 100)
  }

  // Configure the renderer
  setupRenderer(canvas) {
    this.renderer = new THREE.WebGPURenderer({
      canvas,
      forceWebGL: false,
    })
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(this.fogColor.value)
  }

  // Create and configure the mesh
  setupMesh() {}

  // Setup the debug panel
  setupDebugPanel() {
    this.debugPanel = new Pane()
  }

  // Configure controls
  setupControls() {
    this.controls = new OrbitControls(this.camera, document.querySelector("canvas"))
    this.controls.enableDamping = true
  }

  // Render the scene
  render(t) {
    this.prevCoords.copy(this.coords)

    Object.values(this.Components).forEach((component) => {
      component.render(t)
    })

    this.controls.update()
    this.renderer.renderAsync(this.scene, this.camera)
    this.renderer.setAnimationLoop((t) => this.render(t))
  }

  // Handle viewport resize
  resize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    Object.values(this.Components).forEach((component) => {
      component.resize()
    })

    this.camera.left = -1
    this.camera.right = 1
    this.camera.top = 1
    this.camera.bottom = -1

    this.camera.aspect = this.viewport.width / this.viewport.height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  // Dispose resources
  dispose() {}
}

export default new App()
