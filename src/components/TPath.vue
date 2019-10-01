<template>
  <div id="t-path" ref="path"></div>
</template>
<script lang="ts">
import * as THREE from 'three'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class TPath extends Vue {
  public camera: THREE.PerspectiveCamera
  public scene: THREE.Scene
  public renderer: THREE.WebGLRenderer
  @Prop() private msg!: string

  private width: number = 300
  private height: number  = 300

  constructor() {
    super()
    this.camera = new THREE.PerspectiveCamera(
      90,
      this.width / this.height,
      0.1,
      100
    )

    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
  }

  public init() {
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    })

    this.camera.position.z = 100
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    const geometry = new THREE.Geometry()
    geometry.vertices.push(
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(0, 10, 0),
      new THREE.Vector3(10, 0, 0)
    )

    const line = new THREE.Line(geometry, material)
    this.scene.add(line)

    this.renderer.setSize(this.width, this.height)

    const path = this.$refs.path as HTMLElement

    path.appendChild(this.renderer.domElement)
  }

  public animate() {
    requestAnimationFrame(this.animate)
    this.camera.position.y += 0.1

    this.renderer.render(this.scene, this.camera)
  }

  public mounted() {
    this.init()
    this.animate()
  }
}
</script>