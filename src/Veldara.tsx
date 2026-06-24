import { useEffect, useRef } from 'react'
import { EntretienPanel, TarifsPanel, AvisPanel, AvisPanel2 } from './Sections'

const PANEL_IDS = ['entretien', 'tarifs', 'avis', 'avis2']
const PANEL_COUNT = PANEL_IDS.length

// Scroll-progress of each panel's peak, with a lead-in and a tail so the last
// rubrique fully fades out BEFORE the footer enters (clean separation).
const LEAD = 0.15
const TAIL = 0.2
function panelCenter(i: number, n: number) {
  if (n <= 1) return 0.5
  return LEAD + (i / (n - 1)) * (1 - LEAD - TAIL)
}

// Served from /public (same-origin → no CORS issues for frame extraction).
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
  const videoCanvasRef = useRef<HTMLCanvasElement>(null)
  const videoElRef = useRef<HTMLVideoElement>(null)
  const particlesRef = useRef<HTMLCanvasElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = videoCanvasRef.current!
    const videoEl = videoElRef.current!
    const ctx = canvas.getContext('2d')!
    const wrap = wrapRef.current!
    const videoContainer = videoContainerRef.current!
    const pCanvas = particlesRef.current!
    const pCtx = pCanvas.getContext('2d')!

    let cancelled = false
    let frames: ImageBitmap[] = []
    let framesReady = false
    let lastFrameIndex = -1
    let videoSeeking = false
    let rafMain = 0
    let rafParticles = 0
    let lastSection = ''

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

    // ===================== SCROLL VIDEO =====================
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.getBoundingClientRect()
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      lastFrameIndex = -1
    }

    function drawFrame(frame: ImageBitmap) {
      const cw = canvas.width
      const ch = canvas.height
      const s = Math.max(cw / frame.width, ch / frame.height)
      const dw = frame.width * s
      const dh = frame.height * s
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    async function extractFrames() {
      try {
        const response = await fetch(VIDEO_URL, { mode: 'cors' })
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.crossOrigin = 'anonymous'
        video.preload = 'auto'
        video.src = objectUrl

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve()
          video.onerror = () => reject()
          setTimeout(() => reject(), 15000)
        })

        const scale = Math.min(1, 1280 / video.videoWidth)
        const scaledWidth = Math.round(video.videoWidth * scale)
        const scaledHeight = Math.round(video.videoHeight * scale)
        // Sample the WHOLE clip; more frames over the long scroll = smoother.
        const frameCount = Math.max(48, Math.min(160, Math.round(video.duration * 12)))

        for (let i = 0; i < frameCount; i++) {
          if (cancelled) {
            URL.revokeObjectURL(objectUrl)
            return
          }
          const time = (i / (frameCount - 1)) * (video.duration - 0.05)
          video.currentTime = time
          await new Promise<void>((resolve, reject) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked)
              resolve()
            }
            video.addEventListener('seeked', onSeeked)
            setTimeout(() => {
              video.removeEventListener('seeked', onSeeked)
              reject()
            }, 3000)
          })
          const bitmap = await createImageBitmap(video, {
            resizeWidth: scaledWidth,
            resizeHeight: scaledHeight,
          })
          frames.push(bitmap)
        }

        if (frames.length > 0 && !cancelled) {
          framesReady = true
          canvas.style.visibility = 'visible'
          videoEl.style.display = 'none'
        }
        URL.revokeObjectURL(objectUrl)
      } catch {
        /* fallback to live <video> seeking */
      }
    }

    // Each rubrique peaks at the center of its scroll segment, sliding in from
    // its own side (left/right) and easing back out as the next one arrives.
    // Returns the id of the dominant panel (or 'veldara' between panels).
    function updateRubriques(progress: number) {
      const panels = panelsRef.current
      if (!panels) return 'veldara'
      const els = panels.children
      const n = els.length
      if (n === 0) return 'entretien'
      const spacing = n > 1 ? (1 - LEAD - TAIL) / (n - 1) : 1
      // Trapezoidal visibility: fully visible across `hold`, then a short fade
      // over `edge`. hold + edge stays UNDER spacing/2 so a rubrique is fully
      // gone before the next appears — no two cards on screen at once.
      const hold = spacing * 0.36
      const edge = spacing * 0.12
      let maxOp = 0
      let maxIdx = 0
      for (let i = 0; i < n; i++) {
        const el = els[i] as HTMLElement
        const center = panelCenter(i, n)
        const d = progress - center
        const opacity = Math.max(0, Math.min(1, (hold + edge - Math.abs(d)) / edge))
        const dir = el.dataset.side === 'right' ? 1 : -1
        const x = dir * (1 - opacity) * 60 // slide in from its side
        const y = -d * 110 // gentle vertical parallax
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
      // Gate the whole rubriques layer by the region opacity so panels fade
      // out with the video as the footer scrolls in — no bleed-over.
      if (panelsRef.current) panelsRef.current.style.opacity = String(opacity)
      const dominant = updateRubriques(progress)
      if (opacity > 0.05 && dominant && dominant !== lastSection) {
        lastSection = dominant
        onSection?.('#' + dominant)
      }

      if (opacity > 0.001) {
        if (framesReady && frames.length > 0) {
          const idx = Math.round(progress * (frames.length - 1))
          if (idx !== lastFrameIndex) {
            lastFrameIndex = idx
            if (frames[idx]) drawFrame(frames[idx])
          }
        } else if (
          videoEl.duration &&
          isFinite(videoEl.duration) &&
          videoEl.readyState >= 1
        ) {
          const target = progress * videoEl.duration
          if (!videoSeeking && Math.abs(videoEl.currentTime - target) > 0.001) {
            videoSeeking = true
            videoEl.currentTime = target
          }
        }
      }
      rafMain = requestAnimationFrame(mainTick)
    }

    videoEl.addEventListener('seeked', () => {
      videoSeeking = false
    })
    videoEl.addEventListener('stalled', () => {
      videoSeeking = false
    })
    videoEl.addEventListener('loadeddata', () => {
      videoEl.currentTime = 0
    })
    canvas.style.visibility = 'hidden'

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    rafMain = requestAnimationFrame(mainTick)
    extractFrames()

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
      rafParticles = requestAnimationFrame(animateParticles)
    }

    resizeParticles()
    window.addEventListener('resize', resizeParticles)
    rafParticles = requestAnimationFrame(animateParticles)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafMain)
      cancelAnimationFrame(rafParticles)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('resize', resizeParticles)
      frames.forEach((f) => f.close())
      frames = []
    }
  }, [])

  return (
    <div id="veldara" ref={wrapRef}>
      {/* Scroll-driven video background */}
      <div className="scroll-video-container" ref={videoContainerRef}>
        <canvas ref={videoCanvasRef} />
        <video
          ref={videoElRef}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          src={VIDEO_URL}
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
      </div>

      {/* Scroll distance that drives the video scrub + rubriques */}
      <div
        className="rubriques-spacer"
        style={{ height: `${PANEL_COUNT * 165}vh` }}
      />
    </div>
  )
}
