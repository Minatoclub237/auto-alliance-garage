import { useEffect, useRef, type ReactNode } from 'react'

/* Cinematic region: a looping background video pinned (sticky) inside this
   region — it appears as soon as the region enters, is naturally confined to
   it (never bleeds onto the section above/below), with `children` over it. */
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
    // Only play while the region is on screen (saves CPU).
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0 },
    )
    obs.observe(wrap)
    return () => obs.disconnect()
  }, [videoSrc])

  return (
    <div className="video-scroll" ref={wrapRef}>
      <div className="vs-bg">
        <video ref={videoRef} src={videoSrc} autoPlay loop muted playsInline />
        <div className="vs-overlay" />
      </div>
      <div className="vs-content">{children}</div>
    </div>
  )
}
