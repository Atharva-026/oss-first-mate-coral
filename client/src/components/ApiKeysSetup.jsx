import { useState } from 'react'
import PlanetIcon from './PlanetIcon'
import ChatWidget from './ChatWidget'

const API = import.meta.env.VITE_API_URL || ''

export default function ApiKeysSetup({ user, onComplete }) {
  const [groqKey,     setGroqKey]     = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [slackToken,  setSlackToken]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSave = async () => {
    if (!groqKey.trim() || !githubToken.trim()) {
      setError('Groq API key and GitHub token are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/settings/keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groqKey, githubToken, slackToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}><PlanetIcon size={36} color="#fff" /></div>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
            Add your API keys to get started. These are stored encrypted and never shared.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>

          {/* Groq */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
              Groq API Key <span style={{ color: '#ef4444', fontSize: 11 }}>required</span>
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              style={inputStyle}
            />
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 5 }}>
              Free at <a href="https://console.groq.com" target="_blank" style={{ color: '#6366f1' }}>console.groq.com</a> — 500k tokens/day free tier
            </div>
          </div>

          {/* GitHub */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
              GitHub Personal Access Token <span style={{ color: '#ef4444', fontSize: 11 }}>required</span>
            </label>
            <input
              type="password"
              placeholder="ghp_... or github_pat_..."
              value={githubToken}
              onChange={e => setGithubToken(e.target.value)}
              style={inputStyle}
            />
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 5 }}>
              Create at <a href="https://github.com/settings/tokens" target="_blank" style={{ color: '#6366f1' }}>github.com/settings/tokens</a> — needs <code style={{ background: '#1f2937', padding: '1px 4px', borderRadius: 3 }}>repo:read</code> scope
            </div>
          </div>

          {/* Slack */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', display: 'inline-block' }} />
              Slack Bot Token
              <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 400 }}>optional</span>
            </label>
            <input
              type="password"
              placeholder="xoxb-..."
              value={slackToken}
              onChange={e => setSlackToken(e.target.value)}
              style={inputStyle}
            />
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 5 }}>
              Only needed for Slack Insights feature. You can add this later in Settings.
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: loading ? '#374151' : 'linear-gradient(135deg,#6366f1,#a855f7)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving...' : 'Save keys and continue →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 14, marginBottom: 0 }}>
            🔒 Keys are encrypted with AES-256 before storing. You can update them anytime in Settings.
          </p>
        </div>
        <ChatWidget />
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
}