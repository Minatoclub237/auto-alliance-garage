import { useEffect, useRef } from 'react'
import {
  EntretienPanel,
  TarifsPanel,
  AvisPanel,
  AvisPanel2,
  ProcessPanel,
} from './Sections'

const PANEL_IDS = ['entretien', 'tarifs', 'avis', 'avis2', 'process']
const PANEL_COUNT = PANEL_IDS.length

// Scroll-progress of each panel's peak. TAIL reserves scroll at the end so the
// LAST rubrique fades fully to 0 BEFORE the region exits — otherwise the fixed
// panel overlaps the brand marquee / next section as they scroll up. Tuned so
// the card is gone by ~95% (clean "card off → logos" sequence, minimal gap).
const LEAD = 0.12
const TAIL = 0.14
function panelCenter(i: number, n: number) {
  if (n <= 1) return 0.5
  return LEAD + (i / (n - 1)) * (1 - LEAD - TAIL)
}

const VIDEO_URL = '/garage-scroll.mp4'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export default function VeldaraSection({
  onSection,
}: {
  onSection?: (id: string) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoElRef = useRef<HTMLVideoElement>(null)
  const particlesRef = useRef<HTMLCanvasElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const videoEl = videoElRef.current!
    const wrap = wrapRef.current!
    const videoContainer = videoContainerRef.current!
    const pCanvas = particlesRef.current!
    const pCtx = pCanvas.getContext('2d')!

    let regionVisible = false
    let rafMain = 0
    let rafParticles = 0
    let lastSection = ''

    // ---- Scroll-scrubbed video: drive currentTime from scroll. Works on PC
    //      AND mobile, and initialises itself. A one-time muted play()/pause()
    //      "kick" forces iOS to render frames so seeking displays.
    let videoReady = false
    let seeking = false
    videoEl.addEventListener('loadedmetadata', () => {
      videoReady = isFinite(videoEl.duration) && videoEl.duration > 0
    })
    videoEl.addEventListener('seeked', () => {
      seeking = false
    })
    videoEl.addEventListener('loadeddata', () => {
      try {
        videoEl.currentTime = 0
      } catch {
        /* ignore */
      }
      // Kick playback once (muted) then pause, so the first frame paints.
      videoEl.play().then(() => videoEl.pause()).catch(() => {})
    })
    videoEl.load()

    // ---- Region progress relative to this section (composes under the hero).
    function getRegion() {
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight
      const total = wrap.offsetHeight - vh
      const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0
      const enterT = Math.max(0, Math.min(1, (vh - rect.top) / vh))
      const exitT = Math.max(0, Math.min(1, rect.bottom / vh))
      return { progress, opacity: Math.min(enterT, exitT) }
    }

    // Each rubrique peaks at the center of its scroll segment, sliding in from
    // its own side (left/right) and easing back out as the next one arrives.
    function updateRubriques(progress: number) {
      const panels = panelsRef.current
      if (!panels) return null
      const els = panels.children
      const n = els.length
      if (n === 0) return null
      const spacing = n > 1 ? (1 - LEAD - TAIL) / (n - 1) : 1
      const hold = spacing * 0.36
      const edge = spacing * 0.12
      let maxOp = 0
      let maxIdx = 0
      for (let i = 0; i < n; i++) {
        const el = els[i] as HTMLElement
        const center = panelCenter(i, n)
        const d = progress - center
        const opacity = Math.max(0, Math.min(1, (hold + edge - Math.abs(d)) / edge))
        const side = el.dataset.side
        const dir = side === 'right' ? 1 : side === 'left' ? -1 : 0
        const x = dir * (1 - opacity) * 60
        const y = -d * 110
        el.style.opacity = String(opacity)
        el.style.transform = `translate(${x}px, ${y}px)`
        el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
        if (opacity > maxOp) {
          maxOp = opacity
          maxIdx = i
        }
      }
      return maxOp > 0.05 ? PANEL_IDS[maxIdx] : null
    }

    function mainTick() {
      const { progress, opacity } = getRegion()
      videoContainer.style.opacity = String(opacity)
      pCanvas.style.opacity = String(opacity)
      regionVisible = opacity > 0.001

      if (panelsRef.current) panelsRef.current.style.opacity = String(opacity)
      const dominant = updateRubriques(progress)
      if (opacity > 0.05 && dominant && dominant !== lastSection) {
        lastSection = dominant
        onSection?.('#' + dominant)
      }

      // Scrub the video to match scroll progress while the region is visible.
      if (regionVisible && videoReady) {
        const target = progress * (videoEl.duration - 0.05)
        if (!seeking && Math.abs(videoEl.currentTime - target) > 0.03) {
          seeking = true
          try {
            videoEl.currentTime = target
          } catch {
            seeking = false
          }
        }
      }
      rafMain = requestAnimationFrame(mainTick)
    }
    rafMain = requestAnimationFrame(mainTick)

    // ===================== PARTICLES =====================
    let particles: Particle[] = []

    function createParticles() {
      particles = []
      const count = Math.floor((pCanvas.width * pCanvas.height) / 12000)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * pCanvas.width,
          y: Math.random() * pCanvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.2,
        })
      }
    }

    function resizeParticles() {
      pCanvas.width = window.innerWidth
      pCanvas.height = window.innerHeight
      createParticles()
    }

    function animateParticles() {
      if (regionVisible) {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height)
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0) p.x = pCanvas.width
          if (p.x > pCanvas.width) p.x = 0
          if (p.y < 0) p.y = pCanvas.height
          if (p.y > pCanvas.height) p.y = 0
          pCtx.beginPath()
          pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          pCtx.fillStyle = `rgba(255,255,255,${p.opacity})`
          pCtx.fill()
        }
      }
      rafParticles = requestAnimationFrame(animateParticles)
    }

    resizeParticles()
    window.addEventListener('resize', resizeParticles)
    rafParticles = requestAnimationFrame(animateParticles)

    return () => {
      cancelAnimationFrame(rafMain)
      cancelAnimationFrame(rafParticles)
      window.removeEventListener('resize', resizeParticles)
    }
  }, [])

  return (
    <div id="veldara" ref={wrapRef}>
      {/* Scroll-scrubbed video background */}
      <div className="scroll-video-container" ref={videoContainerRef}>
        <video
          ref={videoElRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
        />
        <div className="overlay" />
      </div>

      {/* Particles */}
      <canvas className="particles-canvas" ref={particlesRef} />

      {/* Scroll-position anchors for the nav (panels themselves are fixed) */}
      {PANEL_IDS.map((id, i) => (
        <div
          key={id}
          id={id}
          className="rubrique-anchor"
          style={{ top: `calc(${panelCenter(i, PANEL_COUNT)} * (100% - 100vh))` }}
        />
      ))}

      {/* Pinned rubriques: fade + slide in from alternating sides on scroll */}
      <div className="rubriques" ref={panelsRef}>
        <EntretienPanel />
        <TarifsPanel />
        <AvisPanel />
        <AvisPanel2 />
        <ProcessPanel />
      </div>

      {/* Scroll distance that drives the rubriques */}
      <div
        className="rubriques-spacer"
        style={{ height: `${PANEL_COUNT * 165}vh` }}
      />
    </div>
  )
}
