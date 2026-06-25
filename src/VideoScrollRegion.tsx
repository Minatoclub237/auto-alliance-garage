import { useEffect, useRef, type ReactNode } from 'react'

/* Cinematic region: a looping background video that plays only while this
   region fills the viewport (so it never bleeds onto the section above/below),
   with `children` scrolling over it. */
export default function VideoScrollRegion({
  videoSrc,
  children,
}: {
  videoSrc: string
  children: ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current!
    const bg = bgRef.current!
    const video = videoRef.current!

    const update = () => {
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight
      // Fade in only once the region's top reaches the viewport top (the
      // content above is fully gone), and fade out as its bottom leaves.
      const enter = Math.max(0, Math.min(1, -rect.top / (vh * 0.12)))
      const exit = Math.max(0, Math.min(1, rect.bottom / (vh * 0.3)))
      const op = Math.min(enter, exit)
      bg.style.opacity = String(op)
      if (op > 0.02) {
        if (video.paused) video.play().catch(() => {})
      } else if (!video.paused) {
        video.pause()
      }
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [videoSrc])

  return (
    <div className="video-scroll" ref={wrapRef}>
      <div className="vs-bg" ref={bgRef}>
        <video ref={videoRef} src={videoSrc} autoPlay loop muted playsInline />
        <div className="vs-overlay" />
      </div>
      <div className="vs-content">{children}</div>
    </div>
  )
}
