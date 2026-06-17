import Spline from '@splinetool/react-spline'
import { useRef, useState, useEffect } from 'react'
import ChatWidget from './ChatWidget'

const API = import.meta.env.VITE_API_URL || ''

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

const stats = [
  { value: '9', label: 'AI Features', color: '#60a5fa' },
  { value: '~15s', label: 'To triage', color: '#a78bfa' },
  { value: '100%', label: 'Open source', color: '#34d399' },
  { value: 'Free', label: 'Forever', color: '#22d3ee' },
]

// ── Large, soft, slowly-drifting ambient orb (matches TestimonialsPage style) ──
function Orb({ size, color, top, left, right, bottom, delay }) {
  return (
    <div style={{
      position: 'absolute', width: size, height: size, borderRadius: '50%',
      background: color, top, left, right, bottom,
      filter: `blur(${size / 2.6}px)`,
      opacity: 0.26, zIndex: 0, pointerEvents: 'none',
      animation: `driftOrb 12s ease-in-out ${delay || 0}s infinite alternate`,
    }} />
  )
}

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

function StepCard({ step, index, revealed }) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const cardRef = useRef(null)

  // 3D tilt toward cursor — max ~8deg, with translateZ lift on hover
  const handleMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width   // 0..1
    const py = (e.clientY - rect.top) / rect.height
    setTilt({
      rx: -(py - 0.5) * 2 * 12,
      ry: (px - 0.5) * 2 * 12,
    })
  }

  const handleLeave = () => {
    setHovered(false)
    setTilt({ rx: 0, ry: 0 })
  }

  return (
    <div
      style={{
        // scroll-reveal wrapper — staggered 3D rotate-up into place
        opacity: revealed ? 1 : 0,
        transform: revealed
          ? 'perspective(1100px) rotateX(0deg) translateY(0) translateZ(0)'
          : 'perspective(1100px) rotateX(18deg) translateY(48px) translateZ(-70px)',
        transition: 'opacity 0.7s ease, transform 0.8s cubic-bezier(0.2,0.7,0.2,1)',
        transitionDelay: `${index * 0.09}s`,
        transformOrigin: 'center bottom',
        perspective: 700,
      }}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          position: 'relative',
          padding: '28px 28px 24px',
          borderRadius: 16,
          border: `1px solid ${hovered ? step.color + '55' : 'rgba(255,255,255,0.07)'}`,
          // multi-layer: subtle top highlight + soft outer shadow
          borderTop: `1px solid ${hovered ? step.color + '70' : 'rgba(255,255,255,0.12)'}`,
          background: hovered
            ? `linear-gradient(135deg, ${step.color}12 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.015) 100%)`
            : 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.18s ease-out, box-shadow 0.3s, border-color 0.3s, background 0.3s',
          cursor: 'default',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${hovered ? 34 : 0}px)`,
          boxShadow: hovered
            ? `0 32px 64px ${step.color}33, 0 0 24px ${step.color}1f, inset 0 1px 0 rgba(255,255,255,0.1)`
            : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          willChange: 'transform',
        }}
      >
        {/* inner gradient sheen on hover */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 16,
          pointerEvents: 'none',
          background: 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, transparent 42%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s',
        }} />

        {/* step number */}
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
          color: hovered ? step.color : 'rgba(255,255,255,0.2)',
          marginBottom: 14,
          fontFamily: 'monospace',
          transition: 'color 0.3s',
          transform: 'translateZ(40px)',
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
          boxShadow: hovered ? `0 0 16px ${step.color}, 0 0 4px ${step.color}` : 'none',
          transition: 'all 0.3s',
          transform: 'translateZ(38px)',
        }} />

        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: hovered ? '#ffffff' : 'rgba(255,255,255,0.75)',
          marginBottom: 10,
          letterSpacing: '-0.2px',
          transition: 'color 0.3s',
          lineHeight: 1.3,
          transform: 'translateZ(28px)',
        }}>
          {step.title}
        </div>

        <div style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.38)',
          lineHeight: 1.7,
          transition: 'color 0.3s',
          transform: 'translateZ(18px)',
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
    </div>
  )
}

export default function LandingPage({ onStart, onDocs, onTestimonials }) {
  const hasLaunched = useRef(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const heroGroupRef = useRef(null)
  const howRef = useRef(null)
  const scrollTicking = useRef(false)
  const scrollYRef = useRef(0)

  const handleSplineEvent = () => {
    if (hasLaunched.current) return
    hasLaunched.current = true
    onStart()
  }

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    scrollYRef.current = el.scrollTop   // read every frame for the hero recede loop
    if (scrollTicking.current) return
    scrollTicking.current = true
    requestAnimationFrame(() => {
      const max = el.scrollHeight - el.clientHeight
      const pct = max > 0 ? Math.min(1, el.scrollTop / max) : 0
      setScrolled(el.scrollTop > 20)
      setScrollPct(pct)
      scrollTicking.current = false
    })
  }

  // ── Hero parallax — text group drifts opposite to the cursor (smooth lerp) ──
  useEffect(() => {
    const hero = heroRef.current
    const group = heroGroupRef.current
    if (!hero || !group) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf

    const onMove = (e) => {
      const rect = hero.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2   // -1..1
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    const onLeave = () => { target.x = 0; target.y = 0 }

    const tick = () => {
      current.x += (target.x - current.x) * 0.07
      current.y += (target.y - current.y) * 0.07
      // scroll-driven recede — hero text tilts back into depth as you scroll past
      const h = hero.offsetHeight || 1
      const sp = Math.min(1, (scrollYRef.current || 0) / h)   // 0..1 over first screen
      const lift = sp * -90
      const depth = sp * 220
      const rot = sp * 12
      // opposite to mouse — depth against the Spline scene + scroll recede
      group.style.transform =
        `translate3d(${-current.x * 28}px, ${-current.y * 20 + lift}px, ${-depth}px) ` +
        `rotateX(${current.y * 3 + rot}deg) rotateY(${-current.x * 4}deg)`
      group.style.opacity = String(Math.max(0, 1 - sp * 1.25))
      raf = requestAnimationFrame(tick)
    }

    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // ── Visit logging — fire once per browser session ──
  useEffect(() => {
    if (sessionStorage.getItem('visit-logged')) return
    sessionStorage.setItem('visit-logged', '1')
    fetch(`${API}/api/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/' }),
    }).catch(() => { /* analytics must never break the page */ })
  }, [])

  // ── Scroll-reveal — trigger the staggered card animation in view ──
  useEffect(() => {
    const el = howRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect() } },
      { root: containerRef.current, threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
      <div ref={heroRef} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', flexShrink: 0, perspective: '1000px' }}>

        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <Spline
            scene="https://prod.spline.design/obU-4y-eb8Dv3wQX/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
            onSplineMouseDown={handleSplineEvent}
          />
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(3,7,18,0.15)', pointerEvents: 'none' }} />

        <div ref={heroGroupRef} style={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 2, pointerEvents: 'none', textAlign: 'center', willChange: 'transform' }}>
          <div style={{ display: 'inline-block', padding: '5px 18px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: '#a5b4fc', fontSize: 11, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
            Coral SQL · Groq AI · GitHub · Slack
          </div>
          <div style={{
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: -1.8,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 55%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 6px 30px rgba(99,102,241,0.5)) drop-shadow(0 2px 10px rgba(192,132,252,0.35))',
          }}>
            OSS First Mate
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 12, letterSpacing: 0.3, fontWeight: 500 }}>
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

      {/* ── SOCIAL PROOF / STATS STRIP ── */}
      <div style={{ position: 'relative', backgroundColor: '#030712', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: '34px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          justifyContent: 'center',
        }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                padding: '12px 22px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <span style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: -0.5,
                background: `linear-gradient(135deg, #f1f5f9, ${s.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {s.value}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', letterSpacing: 0.3 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS SECTION ── */}
      <div ref={howRef} style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#030712' }}>

        {/* background gradient wash — intensifies as you scroll */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95vw',
          height: '70vh',
          background: 'radial-gradient(ellipse at center top, rgba(59,130,246,0.14) 0%, rgba(99,102,241,0.09) 38%, rgba(192,132,252,0.04) 60%, transparent 75%)',
          opacity: 0.6 + scrollPct * 1.1,
          transition: 'opacity 0.2s linear',
          pointerEvents: 'none',
        }} />

        {/* floating ambient orbs for depth */}
        <Orb size={460} color="radial-gradient(circle,#6366f1,transparent)" top="6%" left="-120px" delay={0} />
        <Orb size={360} color="radial-gradient(circle,#a855f7,transparent)" top="48%" right="-90px" delay={4} />
        <Orb size={300} color="radial-gradient(circle,#06b6d4,transparent)" bottom="4%" left="12%" delay={7} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '80px 32px 100px' }}>

          {/* Section header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 72,
            opacity: revealed ? 1 : 0,
            transform: revealed
              ? 'perspective(1200px) rotateX(0deg) translateY(0)'
              : 'perspective(1200px) rotateX(16deg) translateY(36px)',
            transformOrigin: 'center bottom',
            transition: 'opacity 0.7s ease, transform 0.8s cubic-bezier(0.2,0.7,0.2,1)',
          }}>
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
            <h2 style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: -0.8,
              lineHeight: 1.2,
              margin: '0 0 14px',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 55%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
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
                <StepCard key={step.num} step={step} index={i} revealed={revealed} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 72 }}>
            <button
              onClick={onStart}
              className="ofm-cta"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '15px 34px',
                borderRadius: 12,
                border: '1px solid rgba(96,165,250,0.4)',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(99,102,241,0.12))',
                backgroundSize: '200% 200%',
                color: '#bfdbfe',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 0.3,
                transition: 'all 0.25s',
                animation: 'pulseGlow 2.8s ease-in-out infinite',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(96,165,250,0.8)'
                e.currentTarget.style.color = '#eff6ff'
                e.currentTarget.style.backgroundPosition = '100% 100%'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 16px 44px rgba(59,130,246,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'
                e.currentTarget.style.color = '#bfdbfe'
                e.currentTarget.style.backgroundPosition = '0% 0%'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              Launch the dashboard
              <span style={{ fontSize: 16 }}>→</span>
            </button>
            <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <span>or click the planet above</span>
              <button
                onClick={onDocs}
                className="ofm-link"
                style={{
                  position: 'relative',
                  background: 'transparent',
                  border: 'none',
                  color: '#93c5fd',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 4px',
                }}
              >
                Docs →
              </button>
              <button
                onClick={onTestimonials}
                className="ofm-link"
                style={{
                  position: 'relative',
                  background: 'transparent',
                  border: 'none',
                  color: '#93c5fd',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 4px',
                }}
              >
                Testimonials →
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
        @keyframes driftOrb {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -40px) scale(1.08); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.0), 0 8px 30px rgba(59,130,246,0.12); }
          50%      { box-shadow: 0 0 0 6px rgba(99,102,241,0.08), 0 10px 36px rgba(59,130,246,0.22); }
        }
        .ofm-link::after {
          content: '';
          position: absolute;
          left: 4px;
          right: 4px;
          bottom: 2px;
          height: 1px;
          background: linear-gradient(90deg, #93c5fd, #c084fc);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .ofm-link:hover::after { transform: scaleX(1); }
        .ofm-link:hover { color: #bfdbfe; }
      `}</style>
      <ChatWidget />
    </div>
  )
}
