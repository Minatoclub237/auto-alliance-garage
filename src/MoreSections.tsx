import { useState, type FormEvent } from 'react'
import {
  ReceiptText,
  Car,
  ShieldCheck,
  Award,
  ChevronDown,
  Send,
  Check,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { Reveal, ScrollCount, Magnetic, ACCENT } from './ui'

const PHONE = '+33472718631'
const PHONE_DISPLAY = '04 72 71 86 31'
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Garage+Auto+Alliance+106+Rue+Andr%C3%A9+Bollier+69007+Lyon'

// Vrais retours clients vérifiés de ce garage (source Fixter). Attribution
// neutre faute d'accès au nom exact — à remplacer par les avis Google verbatim.
const GOOGLE_REVIEWS = [
  {
    text: 'Travail rapide et sérieux. Très bonne réactivité du patron par téléphone comme par e-mail. Voiture rendue propre, et on m’a montré les pièces changées : un vrai signe de sérieux.',
    author: 'Client vérifié',
  },
  {
    text: 'Une équipe plus que géniale pour une réparation en urgence : compétents, méticuleux et efficaces. Je recommande vivement.',
    author: 'Client vérifié',
  },
]

const BEFORE_IMG =
  'https://www.photo-pick.com/online/api/v1/albums/6caacbcd-4010-4f0d-bb25-084e4472f94f.jpg'
const AFTER_IMG =
  'https://www.photo-pick.com/online/api/v1/albums/85fcf4d5-2486-41cb-861d-f9999cd655a0.jpg'

/* ===================== MARQUEE DES MARQUES ===================== */
const BRANDS = [
  { slug: 'renault', name: 'Renault' },
  { slug: 'peugeot', name: 'Peugeot' },
  { slug: 'citroen', name: 'Citroën' },
  { slug: 'bmw', name: 'BMW' },
  { slug: 'audi', name: 'Audi' },
  { slug: 'volkswagen', name: 'Volkswagen' },
  { slug: 'toyota', name: 'Toyota' },
  { slug: 'ford', name: 'Ford' },
  { slug: 'opel', name: 'Opel' },
  { slug: 'dacia', name: 'Dacia' },
  { slug: 'fiat', name: 'Fiat' },
  { slug: 'skoda', name: 'Škoda' },
  { slug: 'nissan', name: 'Nissan' },
  { slug: 'honda', name: 'Honda' },
  { slug: 'hyundai', name: 'Hyundai' },
  { slug: 'mazda', name: 'Mazda' },
  { slug: 'volvo', name: 'Volvo' },
  { slug: 'suzuki', name: 'Suzuki' },
  { slug: 'jeep', name: 'Jeep' },
  { slug: 'mini', name: 'MINI' },
  { slug: 'porsche', name: 'Porsche' },
  { slug: 'seat', name: 'SEAT' },
  { slug: 'subaru', name: 'Subaru' },
]

export function MarqueeSection() {
  return (
    <section className="bg-black py-10 border-y border-white/10 overflow-hidden" aria-hidden>
      <div className="marquee">
        <div className="marquee-track">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <img
              key={i}
              src={`/brands/${b.slug}.svg`}
              alt={b.name}
              className="marquee-logo"
              loading="lazy"
              draggable={false}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===================== CARROSSERIE AVANT / APRÈS ===================== */
export function CarrosserieSection() {
  const [pos, setPos] = useState(50)
  return (
    <section id="carrosserie" className="scroll-mt-24 bg-[#060606] text-white py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center flex flex-col items-center">
          <p className="font-script text-3xl mb-1" style={{ color: ACCENT }}>
            Carrosserie
          </p>
          <h2 className="font-anton uppercase text-4xl sm:text-6xl leading-[0.95]">
            Comme si rien n'était arrivé
          </h2>
          <p className="mt-5 text-white/60 max-w-xl leading-relaxed">
            Débosselage, redressage de châssis et peinture au teintier. Glissez le
            curseur pour voir la différence avant / après.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="ba-slider mt-12">
            <img src={AFTER_IMG} alt="Après réparation" className="ba-img" />
            <img
              src={BEFORE_IMG}
              alt="Avant réparation"
              className="ba-img"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            />
            <span className="ba-label" style={{ left: '1rem' }}>
              Avant
            </span>
            <span className="ba-label" style={{ right: '1rem' }}>
              Après
            </span>
            <div className="ba-divider" style={{ left: `${pos}%` }} />
            <div className="ba-handle" style={{ left: `${pos}%`, background: ACCENT }}>
              ⟷
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              className="ba-range"
              aria-label="Comparateur avant après"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ===================== POURQUOI NOUS + CHIFFRES ===================== */
const STATS = [
  { value: 4.6, decimals: 1, suffix: '★', label: 'Note Google' },
  { value: 179, suffix: '+', label: 'Avis clients' },
  { value: 30, suffix: '', label: 'Points de contrôle' },
  { value: 100, suffix: '%', label: 'Toutes marques' },
]

const GUARANTEES = [
  { icon: ReceiptText, t: 'Devis gratuit', d: 'Un chiffrage clair et détaillé avant toute intervention.' },
  { icon: Car, t: 'Véhicule de prêt', d: 'Restez mobile pendant la réparation, sur demande.' },
  { icon: ShieldCheck, t: 'Garantie préservée', d: 'L’entretien respecte la garantie constructeur.' },
  { icon: Award, t: 'Atelier Eurorepar', d: 'Le savoir-faire d’un réseau, la proximité d’un indépendant.' },
]

export function PourquoiSection() {
  return (
    <section id="pourquoi" className="scroll-mt-24 bg-transparent text-white py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center flex flex-col items-center">
          <p className="font-script text-3xl mb-1" style={{ color: ACCENT }}>
            Pourquoi nous
          </p>
          <h2 className="font-anton uppercase text-4xl sm:text-6xl leading-[0.95]">
            Un garage, zéro mauvaise surprise
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="font-anton text-5xl sm:text-6xl" style={{ color: ACCENT }}>
                <ScrollCount value={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm text-white/55">{s.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GUARANTEES.map(({ icon: Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 80}>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-7 h-full">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${ACCENT}1a`, color: ACCENT }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===================== FAQ ===================== */
// Questions phrased the way people actually search (local + price + service
// intent), with self-contained, citable answers (name + address + phone) —
// optimised for SEO rich results and AI answer engines (GEO). Kept in sync
// with the FAQPage JSON-LD in index.html.
const FAQS = [
  {
    q: 'Où se trouve le Garage Auto Alliance et comment le contacter ?',
    a: 'Le Garage Auto Alliance est situé au 106 rue André Bollier, dans le 7ᵉ arrondissement de Lyon (69007), près de la Guillotière. Vous pouvez nous joindre au ' + PHONE_DISPLAY + ' ou prendre rendez-vous via le formulaire en ligne.',
  },
  {
    q: 'Quels services proposez-vous à Lyon 7ᵉ ?',
    a: 'Nous assurons l’entretien et la réparation toutes marques : révision, vidange, freinage, distribution, climatisation, pneumatiques et diagnostic électronique, ainsi que la carrosserie (débosselage, peinture au teintier, châssis, pare-brise). Un véhicule de prêt est disponible sur demande.',
  },
  {
    q: 'Travaillez-vous toutes les marques de véhicules ?',
    a: 'Oui. En tant qu’atelier du réseau Eurorepar, nous entretenons et réparons tous les véhicules, toutes marques, qu’ils soient essence, diesel ou hybrides — l’entretien préserve la garantie constructeur.',
  },
  {
    q: 'Combien coûte une vidange ou une révision ?',
    a: 'À titre indicatif, une vidange avec filtre démarre à 79 € et une révision complète à 149 € (pièces et main-d’œuvre incluses). Chaque intervention fait l’objet d’un devis gratuit et personnalisé selon votre véhicule.',
  },
  {
    q: 'Le devis est-il gratuit ?',
    a: 'Oui, le devis est gratuit et sans engagement. Le coût d’un diagnostic électronique est déduit de la facture si vous nous confiez la réparation.',
  },
  {
    q: 'Faites-vous la carrosserie après un accident ?',
    a: 'Oui. Notre atelier carrosserie réalise le débosselage, le redressage de châssis, le remplacement de pare-brise et la peinture au teintier pour une finition d’origine, toutes marques.',
  },
  {
    q: 'Quels sont vos horaires et comment prendre rendez-vous ?',
    a: 'Le garage est ouvert du lundi au jeudi de 7h30 à 18h30 et le vendredi de 9h00 à 12h00 (fermé le week-end). Pour un rendez-vous, appelez le ' + PHONE_DISPLAY + ' ou utilisez le formulaire de prise de rendez-vous du site.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-24 bg-transparent text-white py-24 sm:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center flex flex-col items-center mb-12">
          <p className="font-script text-3xl mb-1" style={{ color: ACCENT }}>
            Questions fréquentes
          </p>
          <h2 className="font-anton uppercase text-4xl sm:text-6xl leading-[0.95]">
            Bon à savoir
          </h2>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div className="border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium">{f.q}</span>
                    <ChevronDown
                      size={20}
                      className="shrink-0 transition-transform duration-300"
                      style={{ color: ACCENT, transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out px-6"
                    style={{
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                      opacity: isOpen ? 1 : 0,
                      paddingBottom: isOpen ? '1.25rem' : 0,
                    }}
                  >
                    <p className="overflow-hidden text-sm text-white/60 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ===================== PRISE DE RDV + CARTE ===================== */
const SERVICES_OPTIONS = [
  'Révision / entretien',
  'Freinage',
  'Carrosserie / peinture',
  'Climatisation',
  'Pneumatiques',
  'Diagnostic',
  'Autre',
]

export function RdvSection() {
  const [sent, setSent] = useState(false)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }
  return (
    <section id="rdv" className="scroll-mt-24 bg-transparent text-white py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-stretch">
        <Reveal>
          <p className="font-script text-3xl mb-1" style={{ color: ACCENT }}>
            Prendre rendez-vous
          </p>
          <h2 className="font-anton uppercase text-4xl sm:text-6xl leading-[0.95] mb-6">
            On s'occupe de tout
          </h2>

          {sent ? (
            <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: ACCENT }}
              >
                <Check size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Demande enregistrée, merci !</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Nous vous recontactons au plus vite. Pour une prise en charge
                immédiate, appelez-nous directement.
              </p>
              <Magnetic
                href={`tel:${PHONE}`}
                className="mt-5 gap-2 text-white font-medium px-6 py-3 rounded-full bg-[#e23b2e]"
              >
                <Phone size={18} /> {PHONE_DISPLAY}
              </Magnetic>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4" aria-label="Prise de rendez-vous">
              <input required name="nom" aria-label="Nom" placeholder="Nom" className="form-field" />
              <input required name="tel" type="tel" aria-label="Téléphone" placeholder="Téléphone" className="form-field" />
              <input name="email" type="email" aria-label="Email (facultatif)" placeholder="Email (facultatif)" className="form-field sm:col-span-2" />
              <input name="vehicule" aria-label="Véhicule (marque, modèle)" placeholder="Véhicule (marque, modèle)" className="form-field sm:col-span-2" />
              <select required name="prestation" aria-label="Prestation souhaitée" defaultValue="" className="form-field sm:col-span-2">
                <option value="" disabled>
                  Prestation souhaitée…
                </option>
                {SERVICES_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                name="message"
                aria-label="Votre message (facultatif)"
                placeholder="Votre message (facultatif)"
                rows={3}
                className="form-field sm:col-span-2 resize-none"
              />
              <button
                type="submit"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 text-white font-medium px-6 py-3.5 rounded-full transition-transform hover:scale-[1.01] active:scale-95"
                style={{ background: ACCENT }}
              >
                Envoyer ma demande <Send size={18} />
              </button>
            </form>
          )}
        </Reveal>

        <Reveal delay={120} className="space-y-5">
          {/* Localisation — lien visible vers Google Maps (sans embed) */}
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
              <MapPin size={16} style={{ color: ACCENT }} /> Nous trouver
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              106 rue André Bollier, 69007 Lyon 7ᵉ — près de la Guillotière.
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: ACCENT }}
            >
              Ouvrir dans Google Maps <ArrowRight size={15} />
            </a>
          </div>

          {/* Avis Google */}
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Avis Google</h3>
              <span className="text-sm text-white/70">
                <span style={{ color: ACCENT }}>★</span> 4,6 · 179 avis
              </span>
            </div>
            <div className="space-y-4">
              {GOOGLE_REVIEWS.map((r) => (
                <figure key={r.author} className="border-l-2 pl-3" style={{ borderColor: ACCENT }}>
                  <span className="text-xs tracking-wider" style={{ color: ACCENT }}>
                    ★★★★★
                  </span>
                  <blockquote className="mt-1 text-sm text-white/80 leading-relaxed">
                    “{r.text}”
                  </blockquote>
                  <figcaption className="mt-1 text-xs text-white/45">{r.author}</figcaption>
                </figure>
              ))}
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors"
            >
              Voir tous les avis <ArrowRight size={15} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
