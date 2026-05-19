import React, { useEffect, useRef } from 'react'

// ─── Particle canvas ─────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let W, H, particles = [], raf

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    const rand = (a, b) => Math.random() * (b - a) + a

    const spawn = () => ({
      x:    rand(0, W),
      y:    rand(0, H),
      vx:   rand(-0.4, 0.4),
      vy:   rand(-0.8, -0.2),
      size: rand(1, 3),
      alpha: rand(0.4, 1),
      decay: rand(0.003, 0.008),
      color: Math.random() > 0.65 ? '#FF2020' : Math.random() > 0.5 ? '#C0A050' : '#F5F0ED',
    })

    const init = () => {
      resize()
      particles = Array.from({ length: 80 }, spawn)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach((p, i) => {
        p.x     += p.vx
        p.y     += p.vy
        p.alpha -= p.decay
        if (p.alpha <= 0 || p.y < -10) particles[i] = { ...spawn(), x: rand(0, W), y: H + 5 }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle   = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur  = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Occasional streak
      if (Math.random() < 0.04) {
        const sx = rand(0, W)
        ctx.save()
        ctx.strokeStyle = 'rgba(216,30,30,0.3)'
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.moveTo(sx, H)
        ctx.lineTo(sx + rand(-30, 30), 0)
        ctx.stroke()
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1, opacity: 0.7 }}
    />
  )
}

// ─── Scan line ───────────────────────────────────────────────────────────────
function ScanLine() {
  return (
    <>
      <style>{`
        @keyframes scanDown {
          0%   { top: -4px; opacity: 0.8; }
          90%  { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scanDown2 {
          0%   { top: -4px; opacity: 0.5; }
          90%  { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes gridMove {
          0%   { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        @keyframes vignetteFlicker {
          0%,100% { opacity: 0.55; }
          50%     { opacity: 0.45; }
        }
        @keyframes glitchH {
          0%,90%,100% { transform: translateX(0) skewX(0); }
          92%          { transform: translateX(-4px) skewX(-1deg); }
          94%          { transform: translateX(6px) skewX(1deg); }
          96%          { transform: translateX(-2px); }
        }
        @keyframes glitchSlice {
          0%,89%,100% { clip-path: inset(0 0 100% 0); opacity: 0; }
          90%          { clip-path: inset(20% 0 60% 0); opacity: 0.7; transform: translateX(8px); }
          92%          { clip-path: inset(50% 0 30% 0); opacity: 0.5; transform: translateX(-6px); }
          94%          { clip-path: inset(10% 0 80% 0); opacity: 0.4; transform: translateX(4px); }
          96%          { clip-path: inset(0 0 100% 0); opacity: 0; }
        }
        @keyframes cornerPulse {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
        @keyframes rgbShift {
          0%,100% { text-shadow: -2px 0 #FF2020, 2px 0 #00ffff; }
          50%     { text-shadow: 2px 0 #FF2020, -2px 0 #00ffff; }
        }
        .hero-glitch { animation: glitchH 8s infinite; }
        .hero-glitch-slice {
          position: absolute; inset: 0;
          font-family: "Black Han Sans", Impact, sans-serif;
          color: #FF2020;
          animation: glitchSlice 8s infinite;
          pointer-events: none;
          user-select: none;
        }
      `}</style>

      {/* Moving grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 1,
        backgroundImage: 'linear-gradient(rgba(216,30,30,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(216,30,30,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        animation: 'gridMove 4s linear infinite',
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 2,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)',
        animation: 'vignetteFlicker 6s ease-in-out infinite',
      }} />

      {/* Primary scan line */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{
        zIndex: 3, height: '3px',
        background: 'linear-gradient(90deg, transparent, #D81E1E, #FF6060, #D81E1E, transparent)',
        boxShadow: '0 0 18px 4px rgba(216,30,30,0.6)',
        animation: 'scanDown 5s linear infinite',
      }} />

      {/* Secondary scan line */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{
        zIndex: 3, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        animation: 'scanDown2 5s linear 2.5s infinite',
      }} />

      {/* Corner brackets */}
      {[
        { top: 16, left: 16,  borderTop: '2px solid #D81E1E', borderLeft:  '2px solid #D81E1E' },
        { top: 16, right: 16, borderTop: '2px solid #D81E1E', borderRight: '2px solid #D81E1E' },
        { bottom: 16, left: 16,  borderBottom: '2px solid #D81E1E', borderLeft:  '2px solid #D81E1E' },
        { bottom: 16, right: 16, borderBottom: '2px solid #D81E1E', borderRight: '2px solid #D81E1E' },
      ].map((s, i) => (
        <div key={i} className="absolute pointer-events-none"
             style={{ ...s, width: 32, height: 32, zIndex: 4,
                      animation: `cornerPulse ${2 + i * 0.3}s ease-in-out infinite` }} />
      ))}

      {/* Horizontal noise bars */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 3,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export { ParticleCanvas, ScanLine }
