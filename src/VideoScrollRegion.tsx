import { useEffect, useRef, type ReactNode } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

/* Reusable cinematic scroll region: a fixed video background scrubbed by
   scroll progress (+ particles), with `children` scrolling over it. */
export default function VideoScrollRegion({
  videoSrc,
  children,
}: {
  videoSrc: string
  children: ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoElRef = useRef<HTMLVideoElement>(null)
  const particlesRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const videoEl = videoElRef.current!
    const ctx = canvas.getContext('2d')!
    const wrap = wrapRef.current!
    const bg = bgRef.current!
    const pCanvas = particlesRef.current!
    const pCtx = pCanvas.getContext('2d')!

    let cancelled = false
    let frames: ImageBitmap[] = []
    let framesReady = false
    let lastFrameIndex = -1
    let videoSeeking = false
    let regionVisible = false
    let rafMain = 0
    let rafParticles = 0

    function getRegion() {
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight
      const total = wrap.offsetHeight - vh
      const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0
      const enterT = Math.max(0, Math.min(1, (vh - rect.top) / vh))
      const exitT = Math.max(0, Math.min(1, rect.bottom / vh))
      return { progress, opacity: Math.min(enterT, exitT) }
    }

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
        const response = await fetch(videoSrc, { mode: 'cors' })
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
        const frameCount = Math.max(48, Math.min(140, Math.round(video.duration * 12)))

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

    function mainTick() {
      const { progress, opacity } = getRegion()
      bg.style.opacity = String(opacity)
      pCanvas.style.opacity = String(opacity)
      regionVisible = opacity > 0.01

      if (regionVisible) {
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

    // Particles
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
      cancelled = true
      cancelAnimationFrame(rafMain)
      cancelAnimationFrame(rafParticles)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('resize', resizeParticles)
      frames.forEach((f) => f.close())
      frames = []
    }
  }, [videoSrc])

  return (
    <div className="video-scroll" ref={wrapRef}>
      <div className="vs-bg" ref={bgRef}>
        <canvas ref={canvasRef} />
        <video
          ref={videoElRef}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          src={videoSrc}
        />
        <div className="vs-overlay" />
      </div>
      <canvas className="vs-particles" ref={particlesRef} />
      <div className="vs-content">{children}</div>
    </div>
  )
}
