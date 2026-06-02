import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

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
  const voteUrl = `${VOTE_PAYMENT_URL}?prefilled_custom_field[artist_name]=${encodeURIComponent(name)}`

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

      {/* Vote button — opens Stripe Payment Link with artist pre-filled */}
      <div className="mt-4">
        <a
          href={voteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-angled btn-red text-xs inline-block"
          style={{ padding: '8px 20px' }}
        >
          Vote — $5
        </a>
      </div>
    </div>
  )
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function Leaderboard({ voteCounts }) {
  const ref = useReveal()

  // Sort descending
  const sorted = [...ARTISTS]
    .map(({ name }) => ({ name, count: voteCounts[name] || 0 }))
    .sort((a, b) => b.count - a.count)

  const maxVotes = Math.max(1, ...sorted.map(a => a.count))
  const totalVotes = sorted.reduce((s, a) => s + a.count, 0)

  return (
    <div ref={ref} className="reveal mt-14">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-[1px]" style={{ backgroundColor: '#2a2a2a' }} />
        <p className="text-[#D81E1E] uppercase tracking-widest text-xs font-bold"
           style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.3em' }}>
          Live Leaderboard
        </p>
        <div className="flex-1 h-[1px]" style={{ backgroundColor: '#2a2a2a' }} />
      </div>

      <div className="space-y-3">
        {sorted.map((artist, i) => {
          const pct = maxVotes > 0 ? (artist.count / maxVotes) * 100 : 0
          const isLeader = i === 0 && artist.count > 0
          return (
            <div key={artist.name}
                 className="flex items-center gap-3"
                 style={{ opacity: artist.count === 0 && totalVotes > 0 ? 0.4 : 1 }}>
              {/* Rank */}
              <span
                className="text-xs font-bold tabular-nums"
                style={{
                  fontFamily: '"Courier New", monospace',
                  color: isLeader ? '#D81E1E' : '#555',
                  width: '20px',
                  flexShrink: 0,
                  textAlign: 'right',
                }}
              >
                {i + 1}
              </span>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="truncate text-sm font-semibold"
                    style={{
                      fontFamily: '"Black Han Sans", Impact, sans-serif',
                      color: isLeader ? '#D81E1E' : '#F5F0ED',
                      fontSize: '13px',
                    }}
                  >
                    {artist.name}
                    {isLeader && (
                      <span className="ml-2 text-xs uppercase tracking-widest"
                            style={{ color: '#D81E1E', fontFamily: 'Barlow Condensed, sans-serif' }}>
                        · LEADING
                      </span>
                    )}
                  </span>
                  <span
                    className="ml-3 text-xs font-bold tabular-nums flex-shrink-0"
                    style={{ fontFamily: '"Courier New", monospace', color: '#888' }}
                  >
                    {artist.count}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-[3px] rounded-full overflow-hidden"
                     style={{ backgroundColor: '#2a2a2a' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isLeader ? '#D81E1E' : '#444',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {totalVotes > 0 && (
        <p className="text-center mt-6 text-xs uppercase tracking-widest"
           style={{ color: '#555', fontFamily: 'Barlow Condensed, sans-serif' }}>
          {totalVotes} total vote{totalVotes !== 1 ? 's' : ''} cast
        </p>
      )}
      {totalVotes === 0 && (
        <p className="text-center mt-6 text-xs uppercase tracking-widest"
           style={{ color: '#555', fontFamily: 'Barlow Condensed, sans-serif' }}>
          No votes yet — be the first!
        </p>
      )}
    </div>
  )
}

// ─── VoteSection (main export) ────────────────────────────────────────────────
export default function VoteSection() {
  const [voteCounts, setVoteCounts] = useState({})

  const headRef = useReveal()
  const gridRef = useReveal()

  // ── Load initial vote counts ──────────────────────────────────────────────
  useEffect(() => {
    async function loadVotes() {
      const { data, error } = await supabase
        .from('votes')
        .select('artist_name')
      if (error || !data) return
      const counts = {}
      data.forEach(row => {
        counts[row.artist_name] = (counts[row.artist_name] || 0) + 1
      })
      setVoteCounts(counts)
    }
    loadVotes()
  }, [])

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('votes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        (payload) => {
          const name = payload.new?.artist_name
          if (name) {
            setVoteCounts(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

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

        {/* Artist grid — each card links directly to Stripe with artist pre-filled */}
        <div ref={gridRef}
             className="reveal reveal-stagger grid grid-cols-2 md:grid-cols-3 gap-[2px]">
          {ARTISTS.map(({ name }) => (
            <ArtistVoteCard key={name} name={name} />
          ))}
        </div>

        {/* Live Leaderboard */}
        <Leaderboard voteCounts={voteCounts} />

        {/* Disclaimer */}
        <p className="text-center mt-10 text-xs uppercase tracking-widest"
           style={{ color: '#444', fontFamily: 'Barlow Condensed, sans-serif' }}>
          $5 per vote · Winner takes the entire pot · All sales final
        </p>
      </div>
    </section>
  )
}
