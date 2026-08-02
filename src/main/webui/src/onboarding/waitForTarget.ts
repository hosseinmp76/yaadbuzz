import { tourTargetSelector } from './tourSteps'

export async function waitForTarget(
  target: string,
  timeoutMs = 4000,
): Promise<Element | null> {
  const selector = tourTargetSelector(target)
  const start = performance.now()

  while (performance.now() - start < timeoutMs) {
    const el = document.querySelector(selector)
    if (el) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
      await new Promise((r) => setTimeout(r, 80))
      return el
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  }

  return null
}
