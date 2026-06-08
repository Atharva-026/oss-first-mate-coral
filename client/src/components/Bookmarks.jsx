import { useState, useEffect } from 'react'
import PlanetIcon from './PlanetIcon'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function RepoCard({ repo, onLoad, onRemove }) {
  const [owner, name] = repo.split('/')
  const [hovered, setHovered] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleRemove = async (e) => {
    e.stopPropagation()
    setRemoving(true)
    await onRemove(repo)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px 22px',
        background: hovered ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 12,
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Repo name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg,#6366f1,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <PlanetIcon size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{owner}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>{name}</div>
        </div>
        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={removing}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 6,
            color: '#6b7280',
            fontSize: 12,
            padding: '3px 8px',
            cursor: removing ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#6b7280' }}
        >
          {removing ? '...' : 'Remove'}
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onLoad(repo, 'triage')}
          style={{
            flex: 1, padding: '8px', borderRadius: 7, border: 'none',
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Run Triage
        </button>
        <button
          onClick={() => onLoad(repo, 'duplicates')}
          style={{
            flex: 1, padding: '8px', borderRadius: 7,
            border: '1px solid rgba(234,179,8,0.3)',
            background: 'transparent',
            color: '#fde047', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Duplicates
        </button>
        <button
          onClick={() => onLoad(repo, 'release-notes')}
          style={{
            flex: 1, padding: '8px', borderRadius: 7,
            border: '1px solid rgba(34,197,94,0.3)',
            background: 'transparent',
            color: '#86efac', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Release Notes
        </button>
      </div>
    </div>
  )
}

export default function Bookmarks({ currentRepo, onLoadRepo }) {
  const [bookmarks, setBookmarks] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  const fetchBookmarks = async () => {
    try {
      const res  = await fetch(`${API}/api/bookmarks`, { credentials: 'include' })
      const data = await res.json()
      setBookmarks(data.bookmarks || [])
    } catch {
      setError('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookmarks() }, [])

  const handleSave = async () => {
    const repo = `${currentRepo.owner}/${currentRepo.repo}`
    setSaving(true); setError(''); setSuccess('')
    try {
      const res  = await fetch(`${API}/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ repo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBookmarks(data.bookmarks)
      setSuccess(`Saved ${repo}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (repo) => {
    try {
      const res  = await fetch(`${API}/api/bookmarks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ repo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBookmarks(data.bookmarks)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLoad = (repo, tab) => {
    const [owner, name] = repo.split('/')
    onLoadRepo({ owner, repo: name }, tab)
  }

  const currentRepoStr  = `${currentRepo.owner}/${currentRepo.repo}`
  const alreadyBookmarked = bookmarks.includes(currentRepoStr)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
            Bookmarks
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13.5 }}>
            Save repos you visit frequently. Click any action to jump straight to that tab.
          </p>
        </div>

        {/* Save current repo button */}
        <button
          onClick={handleSave}
          disabled={saving || alreadyBookmarked || bookmarks.length >= 10}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 9, border: 'none',
            background: alreadyBookmarked
              ? 'rgba(99,102,241,0.15)'
              : saving
                ? '#374151'
                : 'linear-gradient(135deg,#6366f1,#a855f7)',
            color: alreadyBookmarked ? '#a5b4fc' : '#fff',
            fontSize: 13, fontWeight: 600,
            cursor: alreadyBookmarked || saving || bookmarks.length >= 10 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14 }}>{alreadyBookmarked ? '★' : '☆'}</span>
          {alreadyBookmarked
            ? `${currentRepoStr} saved`
            : saving
              ? 'Saving...'
              : `Save ${currentRepoStr}`}
        </button>
      </div>

      {/* Feedback messages */}
      {error   && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: 16 }}>{success}</div>}

      {/* Limit indicator */}
      {bookmarks.length > 0 && (
        <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 16, textAlign: 'right' }}>
          {bookmarks.length} / 10 bookmarks used
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280', fontSize: 14 }}>
          Loading bookmarks...
        </div>
      )}

      {/* Empty state */}
      {!loading && bookmarks.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 14,
        }}>
          <div style={{ marginBottom: 12, opacity: 0.4 }}>
            <PlanetIcon size={40} color="#6366f1" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
            No bookmarks yet
          </div>
          <div style={{ fontSize: 13, color: '#4b5563' }}>
            Load a repo and click "Save {currentRepoStr}" above to bookmark it
          </div>
        </div>
      )}

      {/* Bookmarks grid */}
      {!loading && bookmarks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {bookmarks.map(repo => (
            <RepoCard
              key={repo}
              repo={repo}
              onLoad={handleLoad}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}