import React, { useState, useEffect, useRef } from 'react'

// Extract YouTube video ID from any YT URL format
function getYTId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function MusicPlayer({
  src         = '',
  trackName   = 'Event Mix — Coming Soon',
  artist      = 'TRAPAGANZA',
}) {
  const playerRef   = useRef(null)   // YT.Player instance
  const iframeId    = 'yt-player-iframe'
  const pollRef     = useRef(null)

  const [playing,  setPlaying]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume,   setVolume]   = useState(80)
  const [muted,    setMuted]    = useState(false)
  const [ready,    setReady]    = useState(false)

  const videoId = getYTId(src)

  // ── Load YouTube IFrame API once ────────────────────────────────
  useEffect(() => {
    if (!videoId) return

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(iframeId, {
        videoId,
        playerVars: {
          autoplay: 0, controls: 0, modestbranding: 1,
          rel: 0, showinfo: 0, iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(volume)
            setDuration(e.target.getDuration())
            setReady(true)
          },
          onStateChange: (e) => {
            const YT = window.YT.PlayerState
            if (e.data === YT.PLAYING) {
              setPlaying(true)
              setDuration(playerRef.current.getDuration())
            }
            if (e.data === YT.PAUSED || e.data === YT.ENDED) setPlaying(false)
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      const tag = document.createElement('script')
      tag.src   = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => { clearInterval(pollRef.current) }
  }, [videoId])

  // ── Poll progress while playing ─────────────────────────────────
  useEffect(() => {
    if (playing) {
      pollRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setProgress(playerRef.current.getCurrentTime())
        }
      }, 500)
    } else {
      clearInterval(pollRef.current)
    }
    return () => clearInterval(pollRef.current)
  }, [playing])

  const togglePlay = () => {
    if (!playerRef.current || !ready) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  const seek = (e) => {
    if (!playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const t    = pct * duration
    playerRef.current.seekTo(t, true)
    setProgress(t)
  }

  const changeVolume = (e) => {
    const v = parseInt(e.target.value)
    setVolume(v)
    setMuted(v === 0)
    playerRef.current?.setVolume(v)
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(volume); setMuted(false) }
    else       { playerRef.current.mute(); setMuted(true) }
  }

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const pct = duration ? (progress / duration) * 100 : 0

  const VolumeIcon = () => {
    if (muted || volume === 0) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.63 3.63a1 1 0 0 0-1.41 1.41L7.29 10.1 7 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3l5 5v-6.59l4.18 4.18A6.96 6.96 0 0 1 13 18.93V21a9 9 0 0 0 3.77-1.63l1.64 1.64a1 1 0 0 0 1.41-1.41L3.63 3.63zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53A8.93 8.93 0 0 0 21 12c0-4.28-3-7.86-7-8.77V5.3c2.89.86 5 3.54 5 6.7zm-9-8L7.71 6.29 10 8.59V4z"/>
      </svg>
    )
    if (volume < 50) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5 12A4.5 4.5 0 0 0 16 7.97V16c1.48-.73 2.5-2.25 2.5-4zM5 9v6h4l5 5V4L9 9H5z"/>
      </svg>
    )
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97V16c1.48-.73 2.5-2.25 2.5-4zM14 3.23V5.3c2.89.86 5 3.54 5 6.7s-2.11 5.84-5 6.7v2.07c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#D81E1E]"
         style={{ backgroundColor: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)' }}>

      {/* Hidden YouTube iframe */}
      {videoId && (
        <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
          <div id={iframeId} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 md:gap-6">

        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 w-40 md:w-52 shrink-0">
          <div className={`w-8 h-8 shrink-0 flex items-center justify-center`}
               style={{
                 background: playing
                   ? 'conic-gradient(#D81E1E 0%, #111 40%)'
                   : 'conic-gradient(#333 0%, #111 40%)',
                 clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
                 animation: playing ? 'spin 3s linear infinite' : 'none',
               }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0A0A0A' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[#F5F0ED] text-xs font-bold uppercase tracking-widest truncate"
               style={{ fontFamily: '"Black Han Sans", Impact, sans-serif' }}>
              {artist}
            </p>
            <p className="text-[#888] text-xs truncate" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {trackName}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
          <button onClick={togglePlay}
                  disabled={!ready && !!videoId}
                  className="w-9 h-9 flex items-center justify-center text-white transition-all hover:scale-110"
                  style={{
                    backgroundColor: ready || !videoId ? '#D81E1E' : '#444',
                    clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)',
                  }}>
            {!ready && videoId ? (
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Progress */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-[#555] text-xs shrink-0"
                  style={{ fontFamily: '"Courier New", monospace', minWidth: '32px' }}>
              {fmt(progress)}
            </span>
            <div className="flex-1 h-1 relative cursor-pointer group" onClick={seek}
                 style={{ backgroundColor: '#2a2a2a' }}>
              <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#D81E1E' }} />
              <div className="absolute top-1/2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                   style={{ left: `${pct}%`, transform: 'translate(-50%,-50%)',
                            backgroundColor: '#FF2020',
                            clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' }} />
            </div>
            <span className="text-[#555] text-xs shrink-0"
                  style={{ fontFamily: '"Courier New", monospace', minWidth: '32px', textAlign: 'right' }}>
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2 shrink-0 w-32">
          <button onClick={toggleMute} className="text-[#888] hover:text-[#D81E1E] transition-colors shrink-0">
            <VolumeIcon />
          </button>
          <input type="range" min="0" max="100" step="1"
                 value={muted ? 0 : volume}
                 onChange={changeVolume}
                 className="flex-1 h-1 appearance-none cursor-pointer"
                 style={{ accentColor: '#D81E1E' }} />
        </div>

        {/* No source notice */}
        {!videoId && (
          <span className="text-[#555] text-xs uppercase tracking-widest hidden sm:block">
            No track loaded
          </span>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
