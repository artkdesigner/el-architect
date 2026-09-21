import Lenis from 'lenis'

let lenis: Lenis | null = null

export function initSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1.2,
    touchMultiplier: 1.25,
    syncTouch: true,
  })

  const raf = (time: number) => {
    lenis?.raf(time)
    frame = requestAnimationFrame(raf)
  }
  let frame = requestAnimationFrame(raf)

  return () => {
    cancelAnimationFrame(frame)
    lenis?.destroy()
    lenis = null
  }
}

export function getLenis() {
  return lenis
}
