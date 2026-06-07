import Spline from '@splinetool/react-spline'
import { useRef, useState, useEffect } from 'react'
import ChatWidget from './ChatWidget'

const steps = [
  {
    num: '01',
    title: 'Enter a GitHub repo',
    desc: 'Type any public repo in the header — owner/repo format. The agent loads it instantly via Coral SQL.',
    icon: '⬡',
    color: '#60a5fa',
  },
  {
    num: '02',
    title: 'Run Triage',
    desc: 'Coral queries github.issues as SQL. Groq AI classifies each issue as bug / feature / docs with priority.',
    icon: '⬡',
    color: '#818cf8',
  },
  {
    num: '03',
    title: 'Find Duplicates',
    desc: 'The agent pairs issues describing the same problem with confidence scores — no manual scanning.',
    icon: '⬡',
    color: '#a78bfa',
  },
  {
    num: '04',
    title: 'Generate Release Notes',
    desc: 'Coral queries merged PRs via github.pulls. Groq drafts a markdown changelog ready to ship.',
    icon: '⬡',
    color: '#34d399',
  },
  {
    num: '05',
    title: 'Slack Insights',
    desc: 'Cross-source JOIN — GitHub issues matched to Slack channel discussions via LLM semantic join.',
    icon: '⬡',
    color: '#f472b6',
  },
  {
    num: '06',
    title: 'Inspect SQL Log',
    desc: 'Every Coral query is logged transparently. See exactly what SQL ran — auditable, no black boxes.',
    icon: '⬡',
    color: '#22d3ee',
  },
]

function WireframeSphere({ size = 340 }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  // mouse state: normalised -1..1 offset from centre
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, over: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // ── background particle field ──────────────────────────────────────
    const PARTICLES = 55
    const particles = Array.from({ length: PARTICLES }, () => ({
      x: Math.random() * size,
      y: Math.random() * size,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.35 + 0.08,
      color: Math.random() > 0.5 ? '96,165,250' : '129,140,248',
    }))

    // ── mouse tracking ─────────────────────────────────────────────────
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / size  // 0..1
      const my = (e.clientY - rect.top)  / size
      mouseRef.current.tx = (mx - 0.5) * 2       // -1..1
      mouseRef.current.ty = (my - 0.5) * 2
      mouseRef.current.over = true
    }
    const onLeave = () => {
      mouseRef.current.tx = 0
      mouseRef.current.ty = 0
      mouseRef.current.over = false
    }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    const cx = size / 2
    const cy = size / 2
    const LAT = 14
    const LON = 18

    function project(lat, lon, rotY, rotX, radiusX, radiusY) {
      const phi   = (lat * Math.PI) / 180
      const theta = (lon * Math.PI) / 180 + rotY

      // sphere point
      let x = radiusX * Math.cos(phi) * Math.cos(theta)
      let y = radiusY * Math.sin(phi)
      let z = radiusX * Math.cos(phi) * Math.sin(theta)

      // tilt around X axis (mouse Y)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
      const ny =  y * cosX - z * sinX
      const nz =  y * sinX + z * cosX
      y = ny; z = nz

      return { x: cx + x, y: cy - y, z }
    }

    function draw(t) {
      // lerp mouse towards target (smooth follow)
      const m = mouseRef.current
      m.x += (m.tx - m.x) * 0.06
      m.y += (m.ty - m.y) * 0.06

      const hoverStrength = m.over
        ? Math.min(1, Math.sqrt(m.x * m.x + m.y * m.y) * 1.2)
        : Math.sqrt(m.x * m.x + m.y * m.y) * 1.2

      // rotation
      const rotY = t * 0.00035 + m.x * 0.6
      const rotX = -m.y * 0.5

      // radius distortion: bulge toward mouse
      const baseR  = size * 0.42
      const bulge  = 1 + hoverStrength * 0.14          // up to +14% radius
      const squish = 1 - hoverStrength * 0.06
      const radiusX = baseR * bulge
      const radiusY = baseR * squish

      // ── moving particle field ──────────────────────────────────────
      ctx.clearRect(0, 0, size, size)

      // field drifts slightly with mouse
      const fieldDX = m.x * 8
      const fieldDY = m.y * 8

      for (const p of particles) {
        p.x += p.vx + fieldDX * 0.003
        p.y += p.vy + fieldDY * 0.003
        if (p.x < -4)       p.x = size + 4
        if (p.x > size + 4) p.x = -4
        if (p.y < -4)       p.y = size + 4
        if (p.y > size + 4) p.y = -4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`
        ctx.fill()
      }

      // draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 55) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(96,165,250,${0.07 * (1 - dist / 55)})`
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
        }
      }

      // ── ambient glow that shifts with mouse ──────────────────────────
      const glowCX = cx + m.x * 30
      const glowCY = cy + m.y * 30
      const grd = ctx.createRadialGradient(glowCX, glowCY, baseR * 0.1, glowCX, glowCY, baseR * 1.4)
      grd.addColorStop(0, `rgba(59,130,246,${0.10 + hoverStrength * 0.08})`)
      grd.addColorStop(0.45, `rgba(99,102,241,${0.05 + hoverStrength * 0.04})`)
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(glowCX, glowCY, baseR * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // ── latitude lines ────────────────────────────────────────────────
      for (let i = 0; i <= LAT; i++) {
        const lat = -90 + (180 / LAT) * i
        let first = true
        for (let j = 0; j <= 120; j++) {
          const lon = -180 + (360 / 120) * j
          const p = project(lat, lon, rotY, rotX, radiusX, radiusY)
          const alpha = p.z > 0 ? (0.5 + hoverStrength * 0.25) : 0.10
          if (first) { ctx.beginPath(); ctx.moveTo(p.x, p.y); first = false }
          else {
            ctx.strokeStyle = `rgba(96,165,250,${alpha})`
            ctx.lineWidth = 0.5
            ctx.lineTo(p.x, p.y)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
          }
        }
      }

      // ── longitude lines ───────────────────────────────────────────────
      for (let j = 0; j < LON; j++) {
        const lon = (360 / LON) * j
        let first = true
        for (let i = 0; i <= 90; i++) {
          const lat = -90 + (180 / 90) * i
          const p = project(lat, lon, rotY, rotX, radiusX, radiusY)
          const alpha = p.z > 0 ? (0.5 + hoverStrength * 0.25) : 0.10
          if (first) { ctx.beginPath(); ctx.moveTo(p.x, p.y); first = false }
          else {
            ctx.strokeStyle = `rgba(129,140,248,${alpha})`
            ctx.lineWidth = 0.5
            ctx.lineTo(p.x, p.y)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
          }
        }
      }

      // ── intersection nodes ────────────────────────────────────────────
      for (let i = 0; i <= LAT; i += 2) {
        for (let j = 0; j < LON; j += 2) {
          const lat = -90 + (180 / LAT) * i
          const lon = (360 / LON) * j
          const p = project(lat, lon, rotY, rotX, radiusX, radiusY)
          if (p.z < 0) continue
          const pulse = 0.55 + 0.45 * Math.sin(t * 0.0018 + i * 0.7 + j * 0.5)
          const nodeR  = (1.2 + hoverStrength * 0.8) * pulse
          ctx.beginPath()
          ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(147,197,253,${(0.5 + hoverStrength * 0.3) * pulse})`
          ctx.fill()
        }
      }

      // ── pole glow bursts (shift with mouse) ───────────────────────────
      const topY = cy - radiusY * 0.72 + m.y * -12
      const burst = ctx.createRadialGradient(cx + m.x * 10, topY, 0, cx + m.x * 10, topY, baseR * 0.45)
      burst.addColorStop(0, `rgba(167,139,250,${0.30 + hoverStrength * 0.20})`)
      burst.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = burst
      ctx.beginPath()
      ctx.arc(cx + m.x * 10, topY, baseR * 0.45, 0, Math.PI * 2)
      ctx.fill()

      const botY = cy + radiusY * 0.72 + m.y * 12
      const burst2 = ctx.createRadialGradient(cx + m.x * 10, botY, 0, cx + m.x * 10, botY, baseR * 0.38)
      burst2.addColorStop(0, `rgba(52,211,153,${0.22 + hoverStrength * 0.15})`)
      burst2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = burst2
      ctx.beginPath()
      ctx.arc(cx + m.x * 10, botY, baseR * 0.38, 0, Math.PI * 2)
      ctx.fill()

      // ── edge highlight rim ────────────────────────────────────────────
      if (hoverStrength > 0.05) {
        ctx.beginPath()
        ctx.ellipse(cx, cy, radiusX * 1.01, radiusY * 1.01, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(147,197,253,${hoverStrength * 0.18})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    let animId
    function loop(t) {
      draw(t)
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block', cursor: 'crosshair' }}
    />
  )
}

function StepCard({ step, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '28px 28px 24px',
        borderRadius: 16,
        border: `1px solid ${hovered ? step.color + '55' : 'rgba(255,255,255,0.06)'}`,
        background: hovered
          ? `linear-gradient(135deg, ${step.color}0a 0%, rgba(255,255,255,0.02) 100%)`
          : 'rgba(255,255,255,0.02)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'default',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px ${step.color}15` : 'none',
      }}
    >
      {/* step number */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 3,
        color: hovered ? step.color : 'rgba(255,255,255,0.2)',
        marginBottom: 14,
        fontFamily: 'monospace',
        transition: 'color 0.3s',
      }}>
        {step.num}
      </div>

      {/* dot accent */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: step.color,
        marginBottom: 16,
        opacity: hovered ? 1 : 0.4,
        boxShadow: hovered ? `0 0 12px ${step.color}` : 'none',
        transition: 'all 0.3s',
      }} />

      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: hovered ? '#ffffff' : 'rgba(255,255,255,0.75)',
        marginBottom: 10,
        letterSpacing: '-0.2px',
        transition: 'color 0.3s',
        lineHeight: 1.3,
      }}>
        {step.title}
      </div>

      <div style={{
        fontSize: 13,
        color: 'rgba(255,255,255,0.38)',
        lineHeight: 1.7,
        transition: 'color 0.3s',
      }}>
        {step.desc}
      </div>

      {/* corner accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: hovered ? 40 : 0,
        height: 2,
        borderRadius: '2px 0 0 0',
        background: step.color,
        transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

export default function LandingPage({ onStart, onDocs }) {
  const hasLaunched = useRef(false)
  const [scrolled, setScrolled] = useState(false)
  const containerRef = useRef(null)

  const handleSplineEvent = () => {
    if (hasLaunched.current) return
    hasLaunched.current = true
    onStart()
  }

  const handleScroll = () => {
    if (containerRef.current) {
      setScrolled(containerRef.current.scrollTop > 20)
    }
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#030712',
        color: '#f3f4f6',
        fontFamily: 'system-ui, sans-serif',
        scrollBehavior: 'smooth',
      }}
    >
      {/* ── HERO SECTION ── */}
      <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>

        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <Spline
            scene="https://prod.spline.design/obU-4y-eb8Dv3wQX/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
            onSplineMouseDown={handleSplineEvent}
          />
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(3,7,18,0.15)', pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 2, pointerEvents: 'none', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '5px 18px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', fontSize: 11, letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' }}>
            Coral SQL · Groq AI · GitHub · Slack
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: 'white', letterSpacing: -1, lineHeight: 1 }}>
            OSS First Mate
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 10, letterSpacing: 0.3 }}>
            AI-powered assistant for open source maintainers
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, zIndex: 2, pointerEvents: 'none', textAlign: 'center' }}>
          <div style={{ color: '#374151', fontSize: 11, letterSpacing: 1, marginBottom: 16 }}>CLICK THE PLANET TO LAUNCH</div>
          {/* scroll hint */}
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              opacity: scrolled ? 0 : 0.5,
              transition: 'opacity 0.4s',
              animation: 'bounce 2s infinite',
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: 2, color: '#4b5563' }}>SCROLL TO EXPLORE</div>
            <div style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, #4b5563, transparent)' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 130, height: 44, background: '#030712', zIndex: 3 }} />
      </div>

      {/* ── HOW IT WORKS SECTION ── */}
      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#030712' }}>

        {/* background gradient wash */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '60vh',
          background: 'radial-gradient(ellipse at center top, rgba(59,130,246,0.06) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px 100px' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: 999,
              border: '1px solid rgba(96,165,250,0.25)',
              background: 'rgba(96,165,250,0.06)',
              color: '#93c5fd',
              fontSize: 10,
              letterSpacing: 2.5,
              marginBottom: 20,
              textTransform: 'uppercase',
            }}>
              How it works
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: '#ffffff', letterSpacing: -0.5, lineHeight: 1.2, margin: '0 0 14px' }}>
              Your repo, queried as SQL
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Coral turns GitHub into a SQL database. No ETL, no webhooks, no glue code — just queries.
            </p>
          </div>

          {/* Main layout: sphere + steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap', justifyContent: 'center' }}>

            {/* Wireframe sphere */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <WireframeSphere size={340} />
              {/* floating SQL chip */}
              <div style={{
                position: 'absolute',
                top: '18%',
                right: '-60px',
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(96,165,250,0.3)',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 11,
                color: '#93c5fd',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.15)',
              }}>
                SELECT * FROM github.issues
              </div>
              {/* floating result chip */}
              <div style={{
                position: 'absolute',
                bottom: '22%',
                left: '-50px',
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(52,211,153,0.3)',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 11,
                color: '#6ee7b7',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 32px rgba(52,211,153,0.1)',
              }}>
                10 rows · AI classified
              </div>
            </div>

            {/* Steps grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
              flex: 1,
              minWidth: 340,
              maxWidth: 580,
            }}>
              {steps.map((step, i) => (
                <StepCard key={step.num} step={step} index={i} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 72 }}>
            <button
              onClick={onStart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 32px',
                borderRadius: 12,
                border: '1px solid rgba(96,165,250,0.4)',
                background: 'rgba(59,130,246,0.1)',
                color: '#93c5fd',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 0.3,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.2)'
                e.currentTarget.style.borderColor = 'rgba(96,165,250,0.7)'
                e.currentTarget.style.color = '#bfdbfe'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
                e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'
                e.currentTarget.style.color = '#93c5fd'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Launch the dashboard
              <span style={{ fontSize: 16 }}>→</span>
            </button>
            <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <span>or click the planet above</span>
              <button
                onClick={onDocs}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#93c5fd',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 10px',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 0.9 }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 1 }}
              >
                Docs →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
      <ChatWidget />
    </div>
  )
}