import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

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

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[#D81E1E] transition-all duration-300"
      style={{ backgroundColor: scrolled ? 'rgba(10,10,10,0.97)' : '#0A0A0A',
               backdropFilter: scrolled ? 'blur(8px)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex flex-col leading-tight">
          <span className="text-[#D81E1E] uppercase tracking-widest text-xs font-bold">Trap Street Radio</span>
          <span className="text-[#F5F0ED] uppercase tracking-wider text-sm font-bold">TRAPAGANZA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[#F5F0ED] uppercase tracking-widest text-sm font-semibold">
          {['lineup','tickets','sponsors'].map(id => (
            <a key={id} href={`#${id}`}
               className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#D81E1E] after:transition-all after:duration-300 hover:after:w-full hover:text-[#D81E1E] transition-colors">
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>
        <Link to="/tickets" className="btn-angled btn-red text-sm">Get Tickets — $10</Link>
      </div>
    </nav>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden pt-16"
             style={{ backgroundColor: '#0A0A0A' }}>
      {/* Ghost number */}
      <div className="ghost-number absolute select-none pointer-events-none"
           style={{ fontSize: 'clamp(200px, 40vw, 500px)', fontFamily: '"Black Han Sans", Impact, sans-serif',
                    color: 'rgba(180,10,10,0.06)', lineHeight: 1, top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', zIndex: 0 }}>
        26
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-5xl">
        <div className="hero-badge border border-[#D81E1E] px-4 py-1 text-[#D81E1E] uppercase tracking-widest text-xs font-bold"
             style={{ animationFillMode: 'both' }}>
          Trap Street Radio Presents
        </div>

        <div className="hero-image w-full relative">
          <img src="/trapaganza-promo.webp" alt="TRAPAGANZA — Trap Street Radio"
               className="w-full" style={{ display: 'block', borderLeft: '3px solid #D81E1E', borderRight: '3px solid #D81E1E' }} />
        </div>

        <div className="hero-date text-[#F5F0ED] tracking-widest text-2xl md:text-3xl"
             style={{ fontFamily: '"Courier New", Courier, monospace' }}>
          05.23.26
        </div>

        <div className="hero-details flex flex-wrap justify-center gap-4 text-[#888] uppercase tracking-widest text-sm font-semibold">
          <span>8:30 PM</span>
          <span className="text-[#D81E1E]">·</span>
          <span>VRChat</span>
          <span className="text-[#D81E1E]">·</span>
          <span>Live Event</span>
          <span className="text-[#D81E1E]">·</span>
          <span>Hosted by <span className="text-[#F5F0ED]">Goddesz609vr</span></span>
        </div>

        <div className="hero-ctas flex flex-wrap gap-4 justify-center mt-2">
          <Link to="/tickets" className="btn-angled btn-red text-base">Get Tickets — $10</Link>
          <a href="#sponsors" className="btn-angled btn-outline-white text-base">Become a Sponsor</a>
        </div>
      </div>
    </section>
  )
}

// ─── Countdown ───────────────────────────────────────────────────────────────
function Countdown() {
  const TARGET = new Date('2026-05-23T20:30:00').getTime()
  const calc = () => {
    const diff = Math.max(0, TARGET - Date.now())
    return {
      days:  Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins:  Math.floor((diff % 3600000) / 60000),
      secs:  Math.floor((diff % 60000) / 1000),
    }
  }
  const [time, setTime] = useState(calc)
  const [prevTime, setPrevTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => { setPrevTime(time); setTime(calc()) }, 1000)
    return () => clearInterval(id)
  }, [time])

  const pad = (n) => String(n).padStart(2, '0')
  const ref = useReveal()

  return (
    <section className="w-full py-8" style={{ backgroundColor: '#D81E1E' }}>
      <div ref={ref} className="reveal max-w-4xl mx-auto px-4 text-center">
        <div className="text-white uppercase tracking-widest text-sm font-bold mb-4"
             style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.3em' }}>
          Drops In
        </div>
        <div className="flex justify-center items-center gap-4 md:gap-8"
             style={{ fontFamily: '"Courier New", Courier, monospace' }}>
          {[
            { val: pad(time.days),  label: 'Days',  changed: time.days  !== prevTime.days  },
            { val: pad(time.hours), label: 'Hours', changed: time.hours !== prevTime.hours },
            { val: pad(time.mins),  label: 'Mins',  changed: time.mins  !== prevTime.mins  },
            { val: pad(time.secs),  label: 'Secs',  changed: true },
          ].map(({ val, label, changed }, i, arr) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <span key={`${label}-${val}`}
                      className="text-white font-bold count-num"
                      style={{ fontSize: 'clamp(40px, 9vw, 90px)', lineHeight: 1 }}>
                  {val}
                </span>
                <span className="text-white/70 uppercase tracking-widest text-xs mt-1"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-white/50 font-bold"
                      style={{ fontSize: 'clamp(30px, 6vw, 70px)', lineHeight: 1, marginTop: '-12px' }}>:</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Lineup ──────────────────────────────────────────────────────────────────
function Lineup() {
  const eyebrowRef = useReveal()
  const gridRef    = useReveal()

  return (
    <section id="lineup" className="py-20 px-4" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-4xl mx-auto">
        <div ref={eyebrowRef} className="reveal text-center mb-12">
          <p className="text-[#D81E1E] uppercase tracking-widest text-sm font-bold mb-2">Live on VRChat</p>
          <h2 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: 'clamp(40px, 8vw, 80px)', color: '#F5F0ED' }}>
            The Lineup
          </h2>
        </div>

        <div ref={gridRef} className="reveal reveal-stagger grid grid-cols-2 gap-[2px]">
          <ArtistCard name="DJFADEGAME"    role="DJ · Headliner" isHeadliner className="col-span-2" />
          <ArtistCard name="TALKNICETOKIA" role="Artist" />
          <ArtistCard name="SKI DA G"      role="Artist" />
          <ArtistCard name="WORDTHATSJAY"  role="Artist" />
          <ArtistCard name="MEME SHONTE"   role="Artist" />
        </div>
      </div>
    </section>
  )
}

function ArtistCard({ name, role, isHeadliner = false, className = '' }) {
  return (
    <div className={`artist-card relative overflow-hidden flex flex-col justify-end p-6 md:p-8 cursor-default ${className}`}
         style={{ backgroundColor: '#181818', minHeight: isHeadliner ? '200px' : '160px', borderLeft: '3px solid transparent' }}
         onMouseEnter={e => { e.currentTarget.style.borderLeftColor = '#D81E1E' }}
         onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'transparent' }}>
      <p className="uppercase tracking-widest text-[#888] text-xs mb-1"
         style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.25em' }}>{role}</p>
      <h3 style={{ fontFamily: '"Black Han Sans", Impact, sans-serif',
                   fontSize: isHeadliner ? 'clamp(28px, 5vw, 56px)' : 'clamp(20px, 3.5vw, 36px)',
                   color: isHeadliner ? '#D81E1E' : '#F5F0ED', lineHeight: 1 }}>
        {name}
      </h3>
    </div>
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
              <Link to="/tickets" className="btn-angled btn-red text-sm">
                Claim Platinum Spot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  const ref = useReveal()
  return (
    <footer ref={ref} className="reveal border-t-2 border-[#D81E1E] py-12 px-4 text-center"
            style={{ backgroundColor: '#0A0A0A' }}>
      <p className="uppercase tracking-widest text-xs font-bold mb-2"
         style={{ color: '#D81E1E', fontFamily: 'Barlow Condensed, sans-serif' }}>Trap Street Radio</p>
      <h2 className="text-[#F5F0ED] mb-2"
          style={{ fontFamily: '"Black Han Sans", Impact, sans-serif', fontSize: 'clamp(36px, 8vw, 72px)' }}>
        TRAPAGANZA
      </h2>
      <p className="text-[#666] uppercase tracking-widest text-sm mb-6"
         style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>05.23.26 · 8:30 PM · VRChat</p>
      <div className="w-24 h-[2px] mx-auto mb-6" style={{ backgroundColor: '#D81E1E' }} />
      <p className="text-[#444] text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
        © 2026 Trap Street Radio. All rights reserved.
      </p>
    </footer>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Countdown />
        <Lineup />
        <Tickets />
        <Sponsorships />
      </main>
      <Footer />
    </>
  )
}
