import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

// ⚠️  REPLACE THIS with your LIVE Stripe Payment Link (from Stripe Dashboard → Payment Links).
// The link must be created in LIVE mode (not test), for $5, and have a Custom text field
// with Key = "artist_name" so we can prefill the voted-for artist automatically.
//
// Example after copy: 'https://buy.stripe.com/cFabJ19NjdJEg0meei43S07'
const VOTE_PAYMENT_URL = 'https://buy.stripe.com/aFabJ19NjdJEg0meei43S06'

// ─── Master artist roster (single source of truth for Lineup + Vote) ─────────
export const ARTISTS = [
  { name: "DJFADEGAME",                role: "DJ · Headliner", isHeadliner: true },
  { name: "TALKNICETOKIA",             role: "Artist" },
  { name: "LAYDI GENEVIEVE",           role: "Artist" },
  { name: "MEME SHONTE",              role: "Artist" },
  { name: "Habit$",                    role: "Artist" },
  { name: "Ryan Movesmade Johnson",    role: "Artist" },
  { name: "WORDTHATSJAY",              role: "Artist" },
  { name: "PARDON",                    role: "Artist" },
  { name: "Mike Lowry",                role: "Artist" },
  { name: "Moe Moshef Moses",          role: "Artist" },
  { name: "2CXD",                      role: "Artist" },
  { name: "Your Favorite BroccoliTop", role: "Artist" },
  { name: "Da'Valor",                  role: "Artist" },
  { name: "Auntie Panda",              role: "Artist" },
  { name: "Kia - R&B Artist",          role: "Artist" },
  { name: "Polo_b_coolin VR",          role: "Artist" },
]

function useReveal(options = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.1, ...options }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

// ─── Artist Vote Card ─────────────────────────────────────────────────────────
function ArtistVoteCard({ name }) {
  const [hovered, setHovered] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  // Build the prefilled custom field URL (for the $5 Stripe Payment Link checkout).
  // The key "artist_name" must match the custom text field you created on the Payment Link in Stripe.
  const prefillKey = 'prefilled_custom_field[artist_name]'
  const voteUrl = `${VOTE_PAYMENT_URL}?${encodeURIComponent(prefillKey)}=${encodeURIComponent(name)}`

  const castVote = async () => {
    // Record the vote right now. The $5 payment happens in the opened tab (a separate Stripe Payment Link).
    // We are not relying on a server Stripe webhook to write the vote.
    try {
      await supabase.from('votes').insert({ artist_name: name })
    } catch (err) {
      // Non-blocking. The payment tab will still open.
    }
    setHasVoted(true)

    // Open Stripe checkout (with artist pre-filled).
    window.open(voteUrl, '_blank')
  }

  return (
    <div
      className="vote-card relative flex flex-col justify-between p-5"
      style={{
        backgroundColor: '#181818',
        borderLeft: `3px solid ${hovered ? '#D81E1E' : 'transparent'}`,
        borderBottom: '1px solid #2a2a2a',
        minHeight: '120px',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 30px rgba(216,30,30,0.2)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Artist name */}
      <div>
        <p className="uppercase tracking-widest text-[#888] text-xs mb-1"
           style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.2em' }}>
          Artist
        </p>
        <h3
          style={{
            fontFamily: '"Black Han Sans", Impact, sans-serif',
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#F5F0ED',
            lineHeight: 1.1,
          }}
        >
          {name}
        </h3>
      </div>

      {/* Vote button */}
      <div className="mt-4">
        <button
          onClick={castVote}
          disabled={hasVoted}
          className="btn-angled btn-red text-xs"
          style={{ padding: '8px 20px', opacity: hasVoted ? 0.7 : 1, cursor: hasVoted ? 'default' : 'pointer' }}
        >
          {hasVoted ? 'Voted ✓ — tab opened' : 'Vote — $5'}
        </button>
      </div>
    </div>
  )
}


// ─── VoteSection (main export) ────────────────────────────────────────────────
export default function VoteSection() {
  const headRef = useReveal()
  const gridRef = useReveal()

  return (
    <section id="vote" className="py-20 px-4 border-t-2 border-[#D81E1E]"
             style={{ backgroundColor: '#111111' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div ref={headRef} className="reveal text-center mb-10">
          <p className="text-[#D81E1E] uppercase tracking-widest text-sm font-bold mb-2">
            Trapaganza 26
          </p>
          <h2 style={{
            fontFamily: '"Black Han Sans", Impact, sans-serif',
            fontSize: 'clamp(36px, 7vw, 72px)',
            color: '#F5F0ED',
            lineHeight: 1,
          }}>
            Vote for Your<br />
            <span style={{ color: '#D81E1E' }}>Favorite Artist</span>
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-base leading-relaxed"
             style={{ color: '#aaa', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '17px' }}>
            The stage is set and the artists are ready. Now it&apos;s <strong style={{ color: '#F5F0ED' }}>YOUR</strong> turn.
            Cast your <strong style={{ color: '#D81E1E' }}>$5 vote</strong> for your favorite performer and help crown the
            winner of Trapaganza 26. Every vote counts and the artist with the most votes takes the
            entire pot. Who are you riding for?
          </p>
        </div>

        {/* Artist grid — clicking Vote records the vote (immediate) + opens Stripe checkout (with artist pre-filled) */}
        <div ref={gridRef}
             className="reveal reveal-stagger grid grid-cols-2 md:grid-cols-3 gap-[2px]">
          {ARTISTS.map(({ name }) => (
            <ArtistVoteCard key={name} name={name} />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center mt-10 text-xs uppercase tracking-widest"
           style={{ color: '#444', fontFamily: 'Barlow Condensed, sans-serif' }}>
          $5 per vote · Winner takes the entire pot · All sales final
        </p>
      </div>
    </section>
  )
}
