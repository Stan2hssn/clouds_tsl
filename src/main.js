import App from "./index.js"

let app = null

function onMounted() {
  // Canvas
  const canvas = document.getElementById("webgpu")

  if (!canvas) {
    console.error("Canvas element not found")
    return
  }

  app = new App(canvas)
  app.render()

  window.addEventListener("resize", () => {
    app.resize()
  })
}

document.addEventListener("DOMContentLoaded", onMounted, true)
