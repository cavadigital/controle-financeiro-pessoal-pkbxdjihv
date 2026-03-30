import { useState, useEffect } from 'react'

export function useNumberTicker(value: number, duration: number = 800) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)

      // Easing function for smoother stop
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCurrent(easeOutQuart * value)

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step)
      } else {
        setCurrent(value)
      }
    }

    animationFrameId = window.requestAnimationFrame(step)

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [value, duration])

  return current
}
