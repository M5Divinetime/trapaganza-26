import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import MusicPlayer from './MusicPlayer.jsx'
import VoteSection, { ARTISTS } from './VoteSection.jsx'
import './festival.css'

// ─── useReveal hook ──────────────────────────────────────────────────────────
function useReveal(options = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.15, ...options }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

const NAV_LINKS = [
  { id: 'lineup', label: 'Lineup' },
  { id: 'event', label: 'Event Info' },
  { id: 'vote', label: 'Vote' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'sponsors', label: 'Sponsors' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)

  function handleEscape(event) {
    if (event.key === 'Escape' && menuOpen) {
      setMenuOpen(false)
      menuButton.current?.focus()
    }
  }

  return (
    <header className="festival-header" onKeyDown={handleEscape}>
      <div className="festival-shell festival-nav">
        <Link to="/" className="festival-mark" onClick={() => setMenuOpen(false)}>
          <span>Trap Street Radio</span>
          TRAPAGANZA
        </Link>
        <button ref={menuButton} type="button" className="festival-menu-toggle"
                aria-controls="festival-navigation" aria-expanded={menuOpen}
                onClick={() => setMenuOpen(open => !open)}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        <nav id="festival-navigation" aria-label="Main navigation"
             className={`festival-nav-links ${menuOpen ? 'is-open' : ''}`}>
          {NAV_LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
        <Link to="/tickets" className="btn-angled btn-red festival-nav-cta">Get Tickets</Link>
      </div>
    </header>
  )
}

function Hero() {
  const video = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [motionUnavailable, setMotionUnavailable] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const preview = video.current
    const syncMotion = () => {
      if (preference.matches) preview.pause()
      else preview.play().catch(() => {})
    }

    syncMotion()
    preference.addEventListener('change', syncMotion)
    return () => preference.removeEventListener('change', syncMotion)
  }, [])

  function toggleMotion() {
    if (playing) video.current.pause()
    else video.current.play().catch(() => setMotionUnavailable(true))
  }

  return (
    <section className="festival-hero" aria-labelledby="festival-title">
      <div className="festival-hero-media">
        <video ref={video} muted loop playsInline preload="metadata" aria-hidden="true"
               poster="/trapaganza-hero-poster.webp" src="/trapaganza-hero.mp4"
               onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
               onError={() => setMotionUnavailable(true)} />
      </div>
      <div className="festival-shell festival-hero-inner">
        <div className="festival-hero-copy">
          <h1 id="festival-title" className="sr-only">TRAPAGANZA 26</h1>
          <p className="festival-hero-date">
            <time dateTime="2026-06-13T20:30:00-04:00">June 13, 2026 · 8:30 PM ET</time>
            <span>VRChat · Hosted by Goddesz609vr</span>
          </p>
          <div className="festival-actions">
            <a href="#lineup" className="btn-angled btn-red">Explore the Lineup</a>
            <a href="#event" className="btn-angled btn-outline-white">Event Info</a>
          </div>
        </div>
        {!motionUnavailable && (
          <button type="button" className="festival-motion-control" onClick={toggleMotion}>
            {playing ? 'Pause animation' : 'Play animation'}
          </button>
        )}
      </div>
    </section>
  )
}

function Lineup() {
  const headliner = ARTISTS.find(artist => artist.isHeadliner)
  const performers = ARTISTS.filter(artist => !artist.isHeadliner)

  return (
    <section id="lineup" className="festival-section" aria-labelledby="lineup-title">
      <div className="festival-shell">
        <h2 id="lineup-title" className="festival-heading">The Lineup</h2>
        {headliner && (
          <article className="festival-headliner">
            <p className="festival-kicker">{headliner.role}</p>
            <h3>{headliner.name}</h3>
          </article>
        )}
        <ul className="festival-roster" aria-label="Performers">
          {performers.map(({ name }) => <li key={name}>{name}</li>)}
        </ul>
      </div>
    </section>
  )
}

function EventInfo() {
  return (
    <section id="event" className="festival-event festival-section" aria-labelledby="event-title">
      <div className="festival-shell festival-event-grid">
        <h2 id="event-title" className="festival-heading">Event Info</h2>
        <dl>
          <div><dt>Date &amp; time</dt><dd>June 13, 2026 · 8:30 PM ET</dd></div>
          <div><dt>Platform</dt><dd>VRChat</dd></div>
          <div><dt>Host</dt><dd>Goddesz609vr</dd></div>
        </dl>
      </div>
    </section>
  )
}

// ─── Tickets ─────────────────────────────────────────────────────────────────
function Tickets() {
  const headRef = useReveal()
  const cardRef = useReveal()

  return (
    <section id="tickets" className="py-20 px-4 border-t-2 border-[#D81E1E]" style={{ backgroundColor: '#111111' }}>
      <div className="max-w-3xl mx-auto">
        <div ref={headRef} className="reveal text-center mb-12">
          <p className="text-[#D81E1E] uppercase tracking-widest text-sm font-bold mb-2">Secure Your Spot</p>
          <h2 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: 'clamp(40px, 8vw, 80px)', color: '#F5F0ED' }}>
            Tickets
          </h2>
        </div>

        <div ref={cardRef} className="reveal flex flex-col md:flex-row items-stretch border border-[#2a2a2a]"
             style={{ backgroundColor: '#181818' }}>
          <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[#2a2a2a]">
            <p className="text-[#D81E1E] uppercase tracking-widest text-xs font-bold mb-2">General Admission · VRChat</p>
            <h3 className="text-[#F5F0ED] mb-6"
                style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: '28px' }}>
              TRAPAGANZA PASS
            </h3>
            <ul className="space-y-3">
              {['Full event access in VRChat','Live sets from all performers','World entry link sent on purchase','Hosted by Goddesz609vr'].map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-[#ccc] text-base">
                  <span className="text-[#D81E1E] font-bold mt-0.5">•</span>{perk}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center p-8 gap-2 min-w-[200px]">
            <span className="text-[#D81E1E] font-bold leading-none"
                  style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: 'clamp(64px, 12vw, 100px)' }}>
              $10
            </span>
            <p className="text-[#888] text-sm uppercase tracking-widest mb-4">Per person</p>
            <a href="https://buy.stripe.com/cNi3cv4sZ6hc5lIfim43S02"
               target="_blank" rel="noopener noreferrer" className="btn-angled btn-red text-base">
              Buy Now
            </a>
            <p className="text-[#555] text-xs mt-3 uppercase tracking-widest">All sales are final. No refunds.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Sponsorships ─────────────────────────────────────────────────────────────
function Sponsorships() {
  const headRef  = useReveal()
  const goldRef  = useReveal()
  const platRef  = useReveal()

  return (
    <section id="sponsors" className="py-20 px-4" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-4xl mx-auto">
        <div ref={headRef} className="reveal text-center mb-12">
          <p className="text-[#D81E1E] uppercase tracking-widest text-sm font-bold mb-2">Partner With Trap Street Radio</p>
          <h2 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: 'clamp(40px, 8vw, 80px)', color: '#F5F0ED' }}>
            Sponsorships
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gold */}
          <div ref={goldRef} className="reveal reveal-left sponsor-card flex flex-col p-8 border border-[#2a2a2a] border-t-4"
               style={{ backgroundColor: '#181818', borderTopColor: '#C0A050' }}>
            <span className="self-start px-3 py-1 text-xs uppercase tracking-widest font-bold mb-6"
                  style={{ color: '#C0A050', border: '1px solid #C0A050' }}>Gold Sponsor</span>
            <p className="font-bold mb-1 leading-none"
               style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: '56px', color: '#C0A050' }}>$50</p>
            <h3 className="text-[#F5F0ED] mb-6"
                style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: '24px' }}>Gold Package</h3>
            <ul className="space-y-3 flex-1">
              {['Logo on event flyer','Live shoutout'].map(perk => (
                <li key={perk} className="flex items-start gap-3 text-[#ccc] text-base">
                  <span style={{ color: '#C0A050' }} className="font-bold mt-0.5">•</span>{perk}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a href="https://buy.stripe.com/14AcN5gbH494g0m0ns43S03"
                 target="_blank" rel="noopener noreferrer" className="btn-angled btn-outline-gold text-sm">
                Claim Gold Spot
              </a>
            </div>
          </div>

          {/* Platinum */}
          <div ref={platRef} className="reveal reveal-right sponsor-card flex flex-col p-8 border border-[#2a2a2a] border-t-4"
               style={{ backgroundColor: '#181818', borderTopColor: '#D81E1E' }}>
            <span className="self-start px-3 py-1 text-xs uppercase tracking-widest font-bold mb-6"
                  style={{ color: '#D81E1E', border: '1px solid #D81E1E' }}>Platinum Sponsor</span>
            <p className="font-bold mb-1 leading-none"
               style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: '56px', color: '#D81E1E' }}>$100</p>
            <h3 className="text-[#F5F0ED] mb-6"
                style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: '24px' }}>Platinum Package</h3>
            <ul className="space-y-3 flex-1">
              {['Logo on event flyer','Live shoutout','Social media post','World logo placement'].map(perk => (
                <li key={perk} className="flex items-start gap-3 text-[#ccc] text-base">
                  <span className="text-[#D81E1E] font-bold mt-0.5">•</span>{perk}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a href="https://buy.stripe.com/3cI6oH0cJcFAbK6c6a43S04"
                 target="_blank" rel="noopener noreferrer" className="btn-angled btn-red text-sm">
                Claim Platinum Spot
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="festival-footer">
      <div className="festival-shell">
        <span className="festival-mark"><span>Presented by</span>Trap Street Radio</span>
        <small>© 2026 Trap Street Radio. All rights reserved.</small>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="festival-site">
      <Navbar />
      <main>
        <Hero />
        <Lineup />
        <EventInfo />
        <Tickets />
        <Sponsorships />
        <VoteSection />
      </main>
      <Footer />
      <MusicPlayer trackName="Event mix coming soon" artist="Trap Street Radio" />
    </div>
  )
}
