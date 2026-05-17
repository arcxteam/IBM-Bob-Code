'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CanvasBackgroundProps {
  className?: string
  variant?: 'landing' | 'module' | 'subtle'
}

/**
 * Global noise grain texture rendered with HTML5 Canvas 2D.
 * Creates a subtle, premium grain/noise overlay that covers the entire
 * background — similar to pingu.exchange. The grain is static (rendered once)
 * with very low opacity, giving gradients a physical/organic quality.
 *
 * For 'landing' variant: denser grain with warm emerald-teal tinting
 * For 'module' variant: medium grain, neutral
 * For 'subtle' variant: light grain, barely visible
 */
export function CanvasBackground({ className, variant = 'module' }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.parentElement?.clientWidth || window.innerWidth
      const h = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Config per variant
      const grainIntensity = variant === 'landing' ? 35 : variant === 'subtle' ? 15 : 25
      const grainDensity = variant === 'landing' ? 0.45 : variant === 'subtle' ? 0.25 : 0.35

      // Generate noise grain using ImageData for maximum performance
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data
      const pixelW = canvas.width
      const pixelH = canvas.height

      for (let y = 0; y < pixelH; y++) {
        for (let x = 0; x < pixelW; x++) {
          if (Math.random() > grainDensity) continue

          const i = (y * pixelW + x) * 4
          const noise = Math.random() * grainIntensity

          // Slight warm tint for landing (emerald-ish), neutral for others
          if (variant === 'landing') {
            data[i] = noise * 0.7          // R - slightly less
            data[i + 1] = noise * 1.1      // G - slightly more (emerald tint)
            data[i + 2] = noise * 0.9      // B - medium
          } else {
            data[i] = noise                // R
            data[i + 1] = noise            // G
            data[i + 2] = noise            // B
          }
          data[i + 3] = 20 + Math.random() * 25  // A - very subtle alpha
        }
      }

      ctx.putImageData(imageData, 0, 0)
      renderedRef.current = true
    }

    render()

    // Re-render on resize of parent (handles sidebar toggles)
    let resizeTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        renderedRef.current = false
        render()
      }, 100) // faster debounce
    }

    const observer = new ResizeObserver(() => {
      handleResize()
    })

    if (canvas.parentElement) {
      observer.observe(canvas.parentElement)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [variant])

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-multiply dark:mix-blend-screen"
        style={{ opacity: variant === 'landing' ? 0.18 : variant === 'subtle' ? 0.08 : 0.12 }}
        aria-hidden="true"
      />
    </div>
  )
}
