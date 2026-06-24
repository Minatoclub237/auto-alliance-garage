import { Star, Phone, MapPin, Clock, Check, ArrowRight } from 'lucide-react'

const PHONE = '+33472718631'
const PHONE_DISPLAY = '04 72 71 86 31'
const ACCENT = '#e23b2e'
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Garage+Auto+Alliance+106+Rue+Andr%C3%A9+Bollier+69007+Lyon'

/* Rating stars with fractional fill (e.g. 4.6 / 5). */
function Stars({ value = 5, size = 18 }: { value?: number; size?: number }) {
  return (
    <div
      className="relative inline-flex"
      style={{ width: size * 5 }}
      aria-label={`${value} sur 5`}
    >
      <div className="flex text-white/20">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
        ))}
      </div>
      <div
        className="flex overflow-hidden absolute top-0 left-0"
        style={{ width: `${(value / 5) * 100}%`, color: ACCENT }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
        ))}
      </div>
    </div>
  )
}

const MECANIQUE = [
  'Révision constructeur',
  'Freinage',
  'Distribution & embrayage',
  'Vidange & filtres',
  'Climatisation',
  'Diagnostic électronique',
]

const CARROSSERIE = [
  'Débosselage',
  'Peinture au teintier',
  'Redressage de châssis',
  'Pare-brise & vitrage',
]

const BADGES = ['Eurorepar', 'Devis gratuit', 'Toutes marques', 'Véhicule de prêt']

const PRICING = [
  { title: 'Vidange + filtre', price: '79', note: 'Huile adaptée, filtre, niveaux' },
  { title: 'Révision complète', price: '149', note: 'Contrôle 30 points + diagnostic' },
  { title: 'Freinage avant', price: '119', note: 'Plaquettes + contrôle disques' },
  { title: 'Diagnostic', price: '49', note: 'Déduit si réparation' },
]

const PRAISE = ['Accueil', 'Rapidité', 'Transparence', 'Travail soigné']

/* ===================== RUBRIQUE : ENTRETIEN (gauche) ===================== */
export function EntretienPanel() {
  return (
    <div className="rubrique" data-side="left">
      <div className="rubrique-inner bg-black/35 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <p className="font-script text-3xl mb-1" style={{ color: ACCENT }}>
          Nos prestations
        </p>
        <h2 className="font-anton uppercase text-4xl sm:text-5xl leading-[0.95] mb-3">
          Mécanique &amp; carrosserie
        </h2>
        <p className="text-sm text-white/75 leading-relaxed mb-6">
          Atelier Eurorepar au 106 rue André Bollier, Lyon 7ᵉ. De la révision à la
          réparation après choc, on prend tout en charge — toutes marques.
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-3">
              Mécanique
            </p>
            <ul className="space-y-2 text-sm">
              {MECANIQUE.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Check size={15} className="shrink-0" style={{ color: ACCENT }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-3">
              Carrosserie
            </p>
            <ul className="space-y-2 text-sm">
              {CARROSSERIE.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Check size={15} className="shrink-0" style={{ color: ACCENT }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <span
              key={b}
              className="text-xs px-3 py-1 rounded-full border border-white/15 text-white/70"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===================== RUBRIQUE : TARIFS (droite) ===================== */
export function TarifsPanel() {
  return (
    <div className="rubrique" data-side="right">
      <div className="rubrique-inner bg-black/35 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <p className="font-script text-3xl mb-1" style={{ color: ACCENT }}>
          Tarifs
        </p>
        <h2 className="font-anton uppercase text-4xl sm:text-5xl leading-[0.95] mb-3">
          Des prix clairs
        </h2>
        <p className="text-sm text-white/75 leading-relaxed mb-5">
          Tarifs indicatifs TTC, pièces &amp; main-d'œuvre incluses. Devis gratuit
          et personnalisé selon votre véhicule.
        </p>
        <ul className="divide-y divide-white/10 mb-6">
          {PRICING.map((p) => (
            <li key={p.title} className="flex items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-sm text-white/90">{p.title}</span>
                <span className="block text-xs text-white/45">{p.note}</span>
              </span>
              <span className="whitespace-nowrap text-sm text-white/50">
                dès{' '}
                <span className="font-anton text-2xl align-baseline" style={{ color: ACCENT }}>
                  {p.price}
                </span>
                <span className="font-semibold" style={{ color: ACCENT }}>
                  €
                </span>
              </span>
            </li>
          ))}
        </ul>
        <a
          href={`tel:${PHONE}`}
          className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95"
          style={{ background: ACCENT }}
        >
          Demander un devis <ArrowRight size={18} />
        </a>
        <p className="mt-3 text-xs text-white/45">
          Sur rendez-vous au {PHONE_DISPLAY} — garantie constructeur préservée.
        </p>
      </div>
    </div>
  )
}

/* ===================== RUBRIQUE : AVIS (gauche) ===================== */
export function AvisPanel() {
  return (
    <div className="rubrique" data-side="left">
      <div className="rubrique-inner bg-black/35 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <p className="font-script text-3xl mb-1" style={{ color: ACCENT }}>
          Avis clients
        </p>
        <h2 className="font-anton uppercase text-4xl sm:text-5xl leading-[0.95] mb-5">
          Ils nous font confiance
        </h2>
        <div className="flex items-end gap-4 mb-4">
          <span className="font-anton text-6xl leading-none">4,6</span>
          <div className="pb-1">
            <Stars value={4.6} size={20} />
            <p className="mt-1 text-sm text-white/65">179 avis Google</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {PRAISE.map((t) => (
            <span
              key={t}
              className="text-xs px-3 py-1 rounded-full border text-white/80"
              style={{ borderColor: `${ACCENT}66` }}
            >
              {t}
            </span>
          ))}
        </div>
        <blockquote className="text-sm text-white/80 leading-relaxed border-l-2 pl-4" style={{ borderColor: ACCENT }}>
          “Accueil chaleureux, prise en charge rapide et travail soigné. Le devis a
          été respecté au centime près. Je recommande les yeux fermés.”
        </blockquote>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors"
        >
          Voir tous les avis <ArrowRight size={16} />
        </a>
      </div>
    </div>
  )
}

/* ===================== CONTACT / FOOTER ===================== */
export function GarageFooter() {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 bg-black text-white pt-20 pb-10 px-6 border-t border-white/10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 256 256" fill="#ffffff">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
              </svg>
              <span className="text-2xl font-playfair italic">Auto Alliance</span>
            </div>
            <p className="mt-4 text-white/55 max-w-sm leading-relaxed">
              Votre garage de confiance à Lyon 7ᵉ — carrosserie, mécanique et
              entretien toutes marques, au cœur de la Guillotière.
            </p>
            <a
              href={`tel:${PHONE}`}
              className="mt-6 inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95"
              style={{ background: ACCENT }}
            >
              <Phone size={18} /> {PHONE_DISPLAY}
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <MapPin size={16} style={{ color: ACCENT }} /> Adresse
              </h3>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed"
              >
                106 rue André Bollier
                <br />
                69007 Lyon, France
              </a>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock size={16} style={{ color: ACCENT }} /> Horaires
              </h3>
              <ul className="text-sm text-white/60 space-y-1">
                <li>Lun – Jeu : 7h30 – 18h30</li>
                <li>Vendredi : 9h00 – 12h00</li>
                <li className="text-white/35">Week-end : fermé</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <span>© 2026 Garage Auto Alliance — Tous droits réservés.</span>
          <span>Atelier Eurorepar · Toutes marques</span>
        </div>
      </div>
    </footer>
  )
}
