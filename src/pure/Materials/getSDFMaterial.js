import { MeshBasicNodeMaterial } from "three/webgpu"

import { uv, vec4, Fn, viewportSize, max, vec2, texture } from "three/tsl"

const SDFMaterial = () => {
  const material = new MeshBasicNodeMaterial()

  const scaleUv = /*@__PURE__*/ Fn(([uv, scale]) => uv.toVar().sub(vec2(0.5)).mul(scale).add(vec2(0.5)))

  const main = Fn(() => {
    const corUv = scaleUv(uv(), viewportSize.div(max(viewportSize.x, viewportSize.y))).toVar()

    const prevSDF = texture("prevSDF", corUv).toVar()

    return prevSDF
  })

  material.colorNode = main()

  return material
}

export default SDFMaterial
