import { useEffect, useState } from 'react'

/** Animates 0 → target once `start` is true. Respects reduced-motion. */
export function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      setValue(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, start, duration])
  return value
}
