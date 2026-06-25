import { useEffect, useRef, type ReactNode } from 'react'

/* Cinematic region: a looping background video, sticky-pinned INSIDE this
   region. Sticky confines it to the section (never bleeds onto the section
   above/below) and it plays continuously, so it's never frozen on the black
   first frame — it's already running the moment the section is in view. */
export default function VideoScrollRegion({
  videoSrc,
  children,
}: {
  videoSrc: string
  children: ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current!
    const video = videoRef.current!

    // Render a real frame ASAP (avoids a black flash on first reveal).
    const kick = () => video.play().catch(() => {})
    video.addEventListener('loadeddata', kick)

    // Start playing a bit BEFORE the region is on screen (rootMargin) so it's
    // already running — not black — when it becomes visible; pause when far.
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0, rootMargin: '40% 0px 40% 0px' },
    )
    obs.observe(wrap)

    return () => {
      obs.disconnect()
      video.removeEventListener('loadeddata', kick)
    }
  }, [videoSrc])

  return (
    <div className="video-scroll" ref={wrapRef}>
      <div className="vs-bg">
        <video ref={videoRef} src={videoSrc} autoPlay loop muted playsInline preload="auto" />
        <div className="vs-overlay" />
      </div>
      <div className="vs-content">{children}</div>
    </div>
  )
}
