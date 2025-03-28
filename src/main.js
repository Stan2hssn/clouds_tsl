import App from "./App.js"

function onMounted() {
  // Canvas
  const canvas = document.getElementById("webgpu")

  if (!canvas) {
    console.error("Canvas element not found")
    return
  }

  App.init(canvas)
  App.render()

  window.addEventListener("resize", () => {
    App.resize()
  })
}

document.addEventListener("DOMContentLoaded", onMounted, true)
