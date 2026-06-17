import { useState, useEffect } from 'react'
import PlanetIcon from './PlanetIcon'
import ChatWidget from './ChatWidget'

const API = import.meta.env.VITE_API_URL || ''

// ── Animated star field (matches DocsPage) ───────────────────────────────────
function StarField() {
  useEffect(() => {
    const canvas = document.getElementById('testimonials-stars')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.003,
    }))
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.a = Math.max(0.05, Math.min(1, s.a + s.da))
        if (s.a <= 0.05 || s.a >= 1) s.da *= -1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(165,180,252,${s.a})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas id="testimonials-stars" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

function Orb({ size, color, top, left, delay }) {
  return (
    <div style={{
      position: 'fixed', width: size, height: size, borderRadius: '50%',
      background: color, top, left,
      filter: `blur(${size / 2}px)`,
      opacity: 0.15, zIndex: 0, pointerEvents: 'none',
      animation: `floatOrb 8s ease-in-out ${delay || 0}s infinite alternate`,
    }} />
  )
}

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ fontSize: 15, color: n <= rating ? '#fbbf24' : '#374151' }}>★</span>
      ))}
    </div>
  )
}

function TestimonialCard({ item }) {
  const initial = (item.name || '?').charAt(0).toUpperCase()
  return (
    <div style={{
      breakInside: 'avoid', marginBottom: 16,
      padding: '22px 24px', background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {item.avatar
          ? <img src={item.avatar} width={42} height={42} style={{ borderRadius: '50%', border: '1px solid #374151' }} alt="" />
          : <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 16 }}>{initial}</div>
        }
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{item.name}</div>
          {item.role && <div style={{ fontSize: 12, color: '#6b7280' }}>{item.role}</div>}
        </div>
        <div style={{ marginLeft: 'auto' }}><Stars rating={item.rating} /></div>
      </div>

      <p style={{ margin: 0, fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.text}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
        {item.githubHandle && (
          <a href={`https://github.com/${item.githubHandle.replace(/^@/, '')}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
            @{item.githubHandle.replace(/^@/, '')}
          </a>
        )}
        {item.blogUrl && (
          <a href={/^https?:\/\//.test(item.blogUrl) ? item.blogUrl : `https://${item.blogUrl}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none', fontWeight: 600, marginLeft: 'auto' }}>
            Read their blog →
          </a>
        )}
      </div>
    </div>
  )
}

export default function TestimonialsPage({ onHome, onGetStarted, onWriteFeedback }) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch(`${API}/api/feedback/approved`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load testimonials')))
      .then(data => setItems(data.feedback || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: '"DM Sans", system-ui, sans-serif', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes floatOrb { from { transform: translateY(0px); } to { transform: translateY(-30px); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 3px; }
      `}</style>

      <StarField />
      <Orb size={500} color="radial-gradient(circle,#6366f1,transparent)" top="-100px" left="-150px" delay={0} />
      <Orb size={350} color="radial-gradient(circle,#a855f7,transparent)" top="45%" left="72%" delay={3} />
      <Orb size={280} color="radial-gradient(circle,#06b6d4,transparent)" top="80%" left="8%" delay={5} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(3,7,18,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: 54,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onHome} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}>Back</button>
          <div style={{ width: 1, height: 16, background: '#1f2937' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlanetIcon size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>OSS First Mate</span>
          </div>
          <span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(99,102,241,0.14)', color: '#a5b4fc', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>TESTIMONIALS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {onWriteFeedback && (
            <button onClick={onWriteFeedback} style={{ background: 'none', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Leave feedback
            </button>
          )}
          {onGetStarted && (
            <button onClick={onGetStarted} style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', color: '#fff', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Get Started
            </button>
          )}
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '110px 32px 80px', animation: 'fadeIn 0.4s ease' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.07)', color: '#a5b4fc', fontSize: 10, letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase' }}>
            From the community
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.15, margin: '0 0 14px', background: 'linear-gradient(135deg,#f1f5f9 0%,#a5b4fc 60%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Loved by maintainers
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Real feedback from open source maintainers using OSS First Mate to tame their issue backlogs.
          </p>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, padding: '40px 0' }}>Loading testimonials…</div>}
        {error && <div style={{ textAlign: 'center', color: '#fca5a5', fontSize: 14, padding: '40px 0' }}>{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <PlanetIcon size={24} color="#fff" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>No testimonials yet</h3>
            <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8' }}>Be the first to share how OSS First Mate helped you.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div style={{ columns: '320px 3', columnGap: 16 }}>
            {items.map(item => <TestimonialCard key={item._id || `${item.name}-${item.createdAt}`} item={item} />)}
          </div>
        )}
      </main>

      <ChatWidget />
    </div>
  )
}
