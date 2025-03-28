import * as THREE from "three"

const getFullscreenTriangle = () => {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3) // Ensure coverage
  )
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2))

  return geometry
}

export default getFullscreenTriangle
