import { useState } from 'react'
import PlanetIcon from './PlanetIcon'

const API = import.meta.env.VITE_API_URL || ''

function Star({ value, filled, hovered, onClick, onMouseEnter }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 2,
        fontSize: 34, lineHeight: 1,
        color: filled || hovered ? '#fbbf24' : '#374151',
        transition: 'color 0.15s, transform 0.15s',
        transform: hovered ? 'scale(1.15)' : 'scale(1)',
      }}
      aria-label={`Rate ${value} out of 5`}
    >
      ★
    </button>
  )
}

export default function FeedbackForm({ user, onHome }) {
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [text, setText]       = useState('')
  const [github, setGithub]   = useState('')
  const [role, setRole]       = useState('')
  const [blogUrl, setBlogUrl] = useState('')
  const [status, setStatus]   = useState('idle') // idle | submitting | done
  const [error, setError]     = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (rating < 1 || rating > 5) { setError('Please pick a star rating.'); return }
    if (!text.trim())             { setError('Please write a little about your experience.'); return }

    setStatus('submitting')
    try {
      const res = await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, text: text.trim(), githubHandle: github.trim(), role: role.trim(), blogUrl: blogUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9',
    fontSize: 14, padding: '10px 12px', fontFamily: 'inherit', outline: 'none',
  }
  const labelStyle = { display: 'block', fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: 560, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <button onClick={onHome} style={{ background: 'transparent', border: '1px solid #1f2937', borderRadius: 8, color: '#6b7280', padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
          ← Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlanetIcon size={13} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>OSS First Mate</span>
        </div>
      </div>

      {status === 'done' ? (
        // ── Thank-you screen ──────────────────────────────────────────────
        <div style={{ width: '100%', maxWidth: 560, background: '#0d1117', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg,#6366f1,#a855f7,#06b6d4)', borderRadius: 4, margin: '-40px -36px 32px' }} />
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <PlanetIcon size={28} color="#fff" />
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 700 }}>Thanks! Your feedback is pending review.</h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>
            We read every submission. Once approved, it'll appear on our testimonials page.
          </p>
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '18px 20px', textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 700, marginBottom: 6 }}>Want to share more?</div>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
              Write a blog about how OSS First Mate helped you — on <a href="https://hashnode.com" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>Hashnode</a> (free) or any platform you like. Drop the link in your feedback and we'll feature it on our testimonials page!
            </p>
          </div>
          <button onClick={onHome} style={{ marginTop: 26, background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', color: '#fff', borderRadius: 8, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Back to home
          </button>
        </div>
      ) : (
        // ── Form ──────────────────────────────────────────────────────────
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 560, background: '#0d1117', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '36px', overflow: 'hidden' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg,#6366f1,#a855f7,#06b6d4)', borderRadius: 4, margin: '-36px -36px 28px' }} />

          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Share your feedback</h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
            How has OSS First Mate worked for you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}? It takes 30 seconds and helps other maintainers find the tool.
          </p>

          {/* Rating */}
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Your rating</label>
            <div style={{ display: 'flex', gap: 2 }} onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  value={n}
                  filled={n <= rating}
                  hovered={n <= hover}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                />
              ))}
            </div>
          </div>

          {/* Text */}
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Your experience</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="What did OSS First Mate help you do? What did you like?"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: '#4b5563', marginTop: 4 }}>{text.length}/2000</div>
          </div>

          {/* Optional fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>GitHub handle <span style={{ color: '#4b5563', fontWeight: 400 }}>(optional)</span></label>
              <input value={github} onChange={e => setGithub(e.target.value)} placeholder="octocat" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role <span style={{ color: '#4b5563', fontWeight: 400 }}>(optional)</span></label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="Maintainer @ project" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Blog post URL <span style={{ color: '#4b5563', fontWeight: 400 }}>(optional)</span></label>
            <input value={blogUrl} onChange={e => setBlogUrl(e.target.value)} placeholder="https://yourblog.hashnode.dev/..." style={inputStyle} />
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6, lineHeight: 1.5 }}>
              Wrote about your experience? Drop the link and we'll feature it. <a href="https://hashnode.com" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>Hashnode</a> is free — any platform works.
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 18, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              width: '100%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none',
              color: '#fff', borderRadius: 8, padding: '13px', fontSize: 14, fontWeight: 700,
              cursor: status === 'submitting' ? 'default' : 'pointer', opacity: status === 'submitting' ? 0.6 : 1,
            }}
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit feedback'}
          </button>
        </form>
      )}
    </div>
  )
}
