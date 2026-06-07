import { useState, useEffect } from 'react'
import PlanetIcon from './PlanetIcon'
import ChatWidget from './ChatWidget'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function SettingsPage({ user, onBack }) {
  const [keys,    setKeys]    = useState({ groqKey: '', githubToken: '', slackToken: '' })
  const [newKeys, setNewKeys] = useState({ groqKey: '', githubToken: '', slackToken: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch(`${API}/api/settings/keys`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setKeys(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!newKeys.groqKey && !newKeys.githubToken && !newKeys.slackToken) {
      setError('Enter at least one new key to update.')
      return
    }
    setSaving(true); setError(''); setSuccess(false)
    try {
      const res = await fetch(`${API}/api/settings/keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          groqKey:     newKeys.groqKey     || undefined,
          githubToken: newKeys.githubToken || undefined,
          slackToken:  newKeys.slackToken  || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      setNewKeys({ groqKey: '', githubToken: '', slackToken: '' })
      // Refresh masked display
      const fresh = await fetch(`${API}/api/settings/keys`, { credentials: 'include' }).then(r => r.json())
      setKeys(fresh)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', fontFamily: 'system-ui, sans-serif', color: '#f1f5f9' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f2937', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #1f2937', borderRadius: 8, color: '#6b7280', padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700, fontSize: 15 }}>
          <PlanetIcon size={18} color="#fff" />
          <span>Settings</span>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px' }}>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: 32 }}>
          {user?.avatar && <img src={user.avatar} width={40} height={40} style={{ borderRadius: '50%' }} />}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>API Keys</h2>
        <p style={{ color: '#6b7280', fontSize: 13.5, marginBottom: 24 }}>
          Your keys are encrypted with AES-256 and never exposed. Enter a new value to update a key — leave blank to keep existing.
        </p>

        {loading ? (
          <div style={{ color: '#6b7280', fontSize: 14 }}>Loading...</div>
        ) : (
          <>
            {[
              { label: 'Groq API Key', field: 'groqKey', placeholder: 'gsk_...', color: '#f97316', current: keys.groqKey, link: 'console.groq.com' },
              { label: 'GitHub Token', field: 'githubToken', placeholder: 'ghp_...', color: '#6366f1', current: keys.githubToken, link: 'github.com/settings/tokens' },
              { label: 'Slack Bot Token', field: 'slackToken', placeholder: 'xoxb-... (optional)', color: '#a855f7', current: keys.slackToken, link: 'api.slack.com/apps' },
            ].map(item => (
              <div key={item.field} style={{ marginBottom: 22 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                  {item.label}
                </label>
                {item.current && (
                  <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 6, fontFamily: 'monospace' }}>
                    Current: {item.current}
                  </div>
                )}
                <input
                  type="password"
                  placeholder={item.current ? `Enter new ${item.label.toLowerCase()} to replace` : item.placeholder}
                  value={newKeys[item.field]}
                  onChange={e => setNewKeys(k => ({ ...k, [item.field]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}

            {error   && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: 16 }}>✓ Keys updated successfully</div>}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: saving ? '#374151' : 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Update keys'}
            </button>
          </>
        )}
      </main>
      <ChatWidget />
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
}