import { useState, useEffect } from 'react'
import PlanetIcon from './PlanetIcon'

const API = import.meta.env.VITE_API_URL || ''

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ fontSize: 15, color: n <= rating ? '#fbbf24' : '#374151' }}>★</span>
      ))}
    </div>
  )
}

export default function AdminFeedback({ onHome }) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [busy, setBusy]       = useState(null) // id being acted on

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/feedback/pending`, { credentials: 'include' })
      .then(async r => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(data.error || 'Failed to load pending feedback')
        return data
      })
      .then(data => setItems(data.feedback || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const act = async (id, kind) => {
    setBusy(id)
    setError('')
    try {
      const url    = kind === 'approve' ? `${API}/api/feedback/${id}/approve` : `${API}/api/feedback/${id}`
      const method = kind === 'approve' ? 'PATCH' : 'DELETE'
      const res    = await fetch(url, { method, credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Action failed')
      }
      setItems(prev => prev.filter(i => i._id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top bar */}
      <header style={{ borderBottom: '1px solid #1f2937', position: 'sticky', top: 0, background: '#030712', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', height: 56, maxWidth: 900, margin: '0 auto' }}>
          <button onClick={onHome} style={{ background: 'transparent', border: '1px solid #1f2937', borderRadius: 8, color: '#6b7280', padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlanetIcon size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Feedback moderation</span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>{items.length} pending</span>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {error && (
          <div style={{ marginBottom: 18, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, padding: '40px 0' }}>Loading…</div>}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, color: '#94a3b8', fontSize: 14 }}>
            Nothing pending review. 🎉
          </div>
        )}

        {items.map(item => (
          <div key={item._id} style={{ marginBottom: 16, padding: '22px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {item.avatar
                ? <img src={item.avatar} width={42} height={42} style={{ borderRadius: '50%', border: '1px solid #374151' }} alt="" />
                : <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{(item.name || '?').charAt(0).toUpperCase()}</div>
              }
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{item.email}{item.role ? ` · ${item.role}` : ''}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}><Stars rating={item.rating} /></div>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.text}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
              {item.githubHandle && <span>@{item.githubHandle.replace(/^@/, '')}</span>}
              {item.blogUrl && <a href={item.blogUrl} target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>{item.blogUrl}</a>}
              {item.createdAt && <span style={{ marginLeft: 'auto' }}>{new Date(item.createdAt).toLocaleDateString()}</span>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => act(item._id, 'approve')}
                disabled={busy === item._id}
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: busy === item._id ? 'default' : 'pointer', opacity: busy === item._id ? 0.6 : 1 }}
              >
                Approve
              </button>
              <button
                onClick={() => act(item._id, 'reject')}
                disabled={busy === item._id}
                style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: busy === item._id ? 'default' : 'pointer', opacity: busy === item._id ? 0.6 : 1 }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
