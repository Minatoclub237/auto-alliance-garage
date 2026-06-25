import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Wrench } from 'lucide-react'

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

/* Number driven by scroll position: it climbs toward `value` as the element
   travels up the viewport, and follows the scroll back down — never frozen. */
export function ScrollCount({
  value,
  decimals = 0,
  suffix = '',
}: {
  value: number
  decimals?: number
  suffix?: string
}) {
  const numRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const fmt = (v: number) => v.toFixed(decimals).replace('.', ',')
    let ticking = false
    const apply = () => {
      ticking = false
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the number sits at the bottom of the viewport, 1 once it has
      // risen into the upper third — mapped continuously to the scroll.
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.7)))
      el.textContent = fmt(value * p)
    }
    // Coalesce scroll bursts to one DOM write per frame (no React re-render).
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(apply)
      }
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [value, decimals])
  return (
    <span>
      <span ref={numRef}>0</span>
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

/* Custom cursor: a wrench that eases toward the pointer and grows on hover. */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current!
    let mx = -100
    let my = -100
    let cx = -100
    let cy = -100
    let scale = 1
    let targetScale = 1
    let raf = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      targetScale = t.closest('a, button, input, textarea, select, [data-cursor]')
        ? 1.45
        : 1
    }
    const loop = () => {
      cx += (mx - cx) * 0.22
      cy += (my - cy) * 0.22
      scale += (targetScale - scale) * 0.2
      el.style.transform = `translate(${cx}px, ${cy}px) rotate(-22deg) scale(${scale})`
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
    <div ref={ref} className="cursor-wrench" aria-hidden>
      <Wrench size={26} strokeWidth={2.4} />
    </div>
  )
}
