import { Pane } from "tweakpane"
import * as THREE from "three/webgpu"
import { sin, positionLocal, time, vec2, vec3, vec4, uv, uniform, color, rangeFog } from "three/tsl"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

export default class Playground {
  constructor(canvas) {
    // Initialize viewport dimensions
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    this.init(canvas)
  }

  // Setup all initial configurations
  init(canvas) {
    this.setupCamera()
    this.setupScene()
    this.setupRenderer(canvas)
    this.setupDebugPanel()
    this.setupMesh()
    this.setupControls()
  }

  // Configure the camera
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(25, this.viewport.width / this.viewport.height, 0.1, 100)
    this.camera.position.set(6, 3, 10)
  }

  // Create and configure the scene
  setupScene() {
    this.scene = new THREE.Scene()
    this.fogColor = uniform(color("#1b191f"))
    this.fogNode = rangeFog(this.fogColor, 20, 50)
    this.scene.fogNode = this.fogNode
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
  setupMesh() {
    this.material = new THREE.MeshBasicNodeMaterial()
    this.timeFrequency = uniform(0.5)
    this.positionFrequency = uniform(2)
    this.intensityFrequency = uniform(0.5)

    this.oscillation = sin(time.mul(this.timeFrequency).add(positionLocal.y.mul(this.positionFrequency))).mul(
      this.intensityFrequency
    )
    this.material.positionNode = vec3(positionLocal.x.add(this.oscillation), positionLocal.y, positionLocal.z)

    this.material.colorNode = vec4(uv().mul(vec2(32, 8)).fract(), 1, 1)

    this.mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.35, 128, 32), this.material)
    this.scene.add(this.mesh)
  }

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
  render(time) {
    this.controls.update()
    this.renderer.renderAsync(this.scene, this.camera)
    this.renderer.setAnimationLoop(() => this.render(time))
  }

  // Handle viewport resize
  resize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    this.camera.aspect = this.viewport.width / this.viewport.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  // Dispose resources
  dispose() {}
}
