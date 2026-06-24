import { useEffect, useRef, useState, type ReactNode } from 'react'

export const ACCENT = '#e23b2e'
export const ACCENT_DARK = '#c52f24'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Fade + rise into view when scrolled to. */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReduced()) {
      el.classList.add('reveal-in')
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('reveal-in')
          obs.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* Counts up to `value` when it scrolls into view (French decimal comma). */
export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1600,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fmt = (v: number) => v.toFixed(decimals).replace('.', ',')
    if (prefersReduced()) {
      setDisplay(fmt(value))
      return
    }
    let raf = 0
    let start = 0
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        obs.unobserve(el)
        const step = (t: number) => {
          if (!start) start = t
          const p = Math.min(1, (t - start) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(fmt(value * eased))
          if (p < 1) raf = requestAnimationFrame(step)
          else setDisplay(fmt(value))
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, decimals, duration])
  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/* Anchor that gently pulls toward the cursor (desktop only). */
export function Magnetic({
  children,
  className = '',
  href,
  target,
  rel,
}: {
  children: ReactNode
  className?: string
  href: string
  target?: string
  rel?: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const strength = 0.3
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    }
    const onLeave = () => {
      el.style.transform = 'translate(0, 0)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])
  return (
    <a ref={ref} href={href} target={target} rel={rel} className={`magnetic ${className}`}>
      {children}
    </a>
  )
}

/* Custom cursor: a dot that tracks 1:1 and a ring that eases behind it. */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const dot = dotRef.current!
    const ring = ringRef.current!
    let mx = -100
    let my = -100
    let rx = -100
    let ry = -100
    let raf = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate(${mx}px, ${my}px)`
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, input, textarea, select, [data-cursor]')) {
        ring.classList.add('cursor-grow')
      } else {
        ring.classList.remove('cursor-grow')
      }
    }
    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    raf = requestAnimationFrame(loop)
    document.body.classList.add('has-custom-cursor')
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])
  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}
