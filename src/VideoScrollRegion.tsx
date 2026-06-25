import { useEffect, useRef, type ReactNode } from 'react'

/* Cinematic region: a looping background video, FIXED to the viewport (same as
   the first video region) so backdrop-filter glass cards frost it correctly.
   Opacity is gated so it only shows while this region fills the viewport — it
   never bleeds onto the section above or the footer below. */
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
      // Visible only while the region fully covers the viewport (so the fixed
      // video never shows over the neighbouring sections).
      const covering = rect.top <= 1 && rect.bottom >= vh - 1
      bg.style.opacity = covering ? '1' : '0'
      if (covering) {
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
        <video ref={videoRef} src={videoSrc} loop muted playsInline preload="auto" />
        <div className="vs-overlay" />
      </div>
      <div className="vs-content">{children}</div>
    </div>
  )
}
