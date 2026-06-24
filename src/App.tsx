import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import VeldaraSection from './Veldara'
import { GarageFooter } from './Sections'
import {
  MarqueeSection,
  ProcessSection,
  CarrosserieSection,
  PourquoiSection,
  FaqSection,
  RdvSection,
} from './MoreSections'
import { CustomCursor } from './ui'

const NAV_ITEMS = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Entretien', href: '#entretien' },
  { label: 'Tarifs', href: '#tarifs' },
  { label: 'Avis', href: '#avis' },
  { label: 'Carrosserie', href: '#carrosserie' },
  { label: 'Contact', href: '#rdv' },
]

const BG_IMAGE_1 =
  'https://www.photo-pick.com/online/api/v1/albums/6caacbcd-4010-4f0d-bb25-084e4472f94f.jpg'
const BG_IMAGE_2 =
  'https://www.photo-pick.com/online/api/v1/albums/85fcf4d5-2486-41cb-861d-f9999cd655a0.jpg'

// Desktop max radius; on small viewports it scales down (see App).
const SPOTLIGHT_R = 260

// Soft-edged spotlight falloff, expressed as mask alpha stops. Identical
// curve to the original canvas radial gradient, but rendered by the GPU.
const MASK_STOPS =
  'rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, ' +
  'rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%'

type Pos = { x: number; y: number }

function RevealLayer({
  image,
  cursorX,
  cursorY,
  radius,
}: {
  image: string
  cursorX: number
  cursorY: number
  radius: number
}) {
  // GPU-composited radial-gradient mask — no per-frame canvas re-encoding,
  // so it stays at 60fps on phones. Pixel-identical to the canvas version.
  const mask = `radial-gradient(circle ${radius}px at ${cursorX}px ${cursorY}px, ${MASK_STOPS})`
  return (
    <div
      className="absolute inset-0 hero-bg bg-cover bg-no-repeat z-30 pointer-events-none hero-zoom"
      style={{
        backgroundImage: `url(${image})`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  )
}

function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false)
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {/* Left: logo + wordmark */}
      <a href="#accueil" className="flex items-center gap-2">
        <svg
          width="26"
          height="26"
          viewBox="0 0 256 256"
          fill="#ffffff"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span className="text-white text-2xl font-playfair italic">Auto Alliance</span>
      </a>

      {/* Center pill */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={
              active === item.href
                ? 'bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium transition-colors'
                : 'text-white/80 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/20 hover:text-white transition-colors'
            }
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Right: Prendre RDV (desktop) + hamburger (mobile) */}
      <a
        href="tel:+33472718631"
        className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100"
      >
        Prendre RDV
      </a>
      <button
        className="md:hidden text-white p-2"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === item.href
                  ? 'bg-white text-gray-900'
                  : 'text-white/85 hover:bg-white/10'
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="tel:+33472718631"
            onClick={() => setOpen(false)}
            className="mt-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#e23b2e] text-white text-center"
          >
            Prendre rendez-vous
          </a>
        </div>
      )}
    </nav>
  )
}

export default function App() {
  const mouse = useRef<Pos>({ x: -999, y: -999 })
  const smooth = useRef<Pos>({ x: -999, y: -999 })
  const rafRef = useRef<number>(0)
  const lastInteract = useRef<number>(-99999)
  const seeded = useRef<boolean>(false)
  const [cursorPos, setCursorPos] = useState<Pos>({ x: -999, y: -999 })
  const [radius, setRadius] = useState<number>(SPOTLIGHT_R)
  const [active, setActive] = useState<string>('#accueil')

  // Scrollspy for the normal-flow sections. The in-video rubriques
  // (#entretien/#tarifs/#avis) report themselves via VeldaraSection's
  // onSection callback below.
  useEffect(() => {
    const ids = ['accueil', 'carrosserie', 'rdv']
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    const visible = new Set<string>()
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        })
        for (let i = ids.length - 1; i >= 0; i--) {
          if (visible.has(ids[i])) {
            setActive('#' + ids[i])
            break
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Scale the spotlight to the screen so it never swallows a small phone.
    const computeRadius = () =>
      setRadius(Math.max(150, Math.min(SPOTLIGHT_R, window.innerWidth * 0.5)))
    computeRadius()
    window.addEventListener('resize', computeRadius)

    const setTarget = (x: number, y: number) => {
      mouse.current.x = x
      mouse.current.y = y
      lastInteract.current = performance.now()
    }
    const onMouse = (e: MouseEvent) => setTarget(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) setTarget(t.clientX, t.clientY)
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    const loop = () => {
      const now = performance.now()
      // No pointer for a beat (phones always, desktop at rest) → the
      // spotlight drifts on a gentle organic orbit so the reveal is alive.
      if (now - lastInteract.current > 2000) {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight * 0.52
        if (reduceMotion) {
          mouse.current.x = cx
          mouse.current.y = cy
        } else {
          const t = now / 1000
          mouse.current.x = cx + Math.cos(t * 0.55) * window.innerWidth * 0.26
          mouse.current.y = cy + Math.sin(t * 0.9) * window.innerHeight * 0.16
        }
        if (!seeded.current) {
          // Park the eased value on the first idle target so it appears in
          // place instead of flying in from the off-screen seed.
          smooth.current.x = mouse.current.x
          smooth.current.y = mouse.current.y
          seeded.current = true
        }
      } else {
        seeded.current = true
      }
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1
      setCursorPos({ x: smooth.current.x, y: smooth.current.y })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', computeRadius)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Nav active={active} />

      <section
        id="accueil"
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh', touchAction: 'pan-y' }}
      >
        {/* 1. Base image */}
        <div
          className="absolute inset-0 hero-bg bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* 2. Reveal layer */}
        <RevealLayer
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
          radius={radius}
        />

        {/* 3. Heading */}
        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              Votre voiture
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
entre de bonnes mains
            </span>
          </h1>
        </div>

        {/* 4. Bottom-left paragraph */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-sm text-white/80 leading-relaxed">
            106 rue André Bollier, Lyon 7ᵉ. Ouvert du lundi au jeudi de 7h30 à
            18h30 et le vendredi matin. Atelier Eurorepar noté 4,6/5 sur 179 avis.
          </p>
        </div>

        {/* 5. Bottom-right block */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Révision, freinage, pneumatiques, climatisation et diagnostic, toutes
            marques. Confiez votre véhicule à une équipe de confiance, au cœur de
            Lyon.
          </p>
          <a
            href="tel:+33472718631"
            className="bg-[#e23b2e] hover:bg-[#c52f24] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e23b2e]/30"
          >
            Prendre rendez-vous
          </a>
        </div>
      </section>

      <VeldaraSection onSection={setActive} />

      <MarqueeSection />
      <ProcessSection />
      <CarrosserieSection />
      <PourquoiSection />
      <FaqSection />
      <RdvSection />

      <GarageFooter />

      <CustomCursor />
    </div>
  )
}
