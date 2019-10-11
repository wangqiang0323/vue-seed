export default function setRem(baseWidth: number = 750) {
  const dpr: number = window.devicePixelRatio
  const currentWidth: number = document.documentElement.clientWidth
  let remSize: number = 0
  let scale: number = 0
  scale = currentWidth / baseWidth
  remSize = baseWidth / 10
  remSize = remSize * scale
  document.documentElement.style.fontSize = remSize + 'px'
  document.documentElement.setAttribute('data-dpr', `${dpr}`)
}
