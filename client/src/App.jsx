import { useState, useEffect } from 'react'
import RepoForm      from './components/RepoForm'
import TriageBoard   from './components/TriageBoard'
import DuplicatesPanel from './components/DuplicatesPanel'
import ReleaseNotes  from './components/ReleaseNotes'
import SqlLog        from './components/SqlLog'
import RunHistory    from './components/RunHistory'
import SlackInsights from './components/SlackInsights'
import LandingPage   from './components/LandingPage'
import DocsPage      from './components/DocsPage'
import LoginPage     from './LoginPage'
import ApiKeysSetup  from './components/ApiKeysSetup'
import SettingsPage  from './components/SettingsPage'

const getSavedRepo = () => {
  try {
    const saved = localStorage.getItem('oss-first-mate-repo')
    return saved ? JSON.parse(saved) : { owner: 'expressjs', repo: 'express' }
  } catch { return { owner: 'expressjs', repo: 'express' } }
}

const TABS = [
  { id: 'triage',        label: 'Triage',        active: '#3b82f6' },
  { id: 'duplicates',    label: 'Duplicates',     active: '#eab308' },
  { id: 'release-notes', label: 'Release notes',  active: '#22c55e' },
  { id: 'slack',         label: 'Slack insights', active: '#a855f7' },
  { id: 'sql-log',       label: 'SQL log',        active: '#06b6d4' },
  { id: 'history',       label: 'History',        active: '#ec4899' },
]

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [user,        setUser]        = useState(undefined) // undefined=loading
  const [page,        setPage]        = useState('landing') // landing|docs|login|setup|settings|dashboard
  const [repo,        setRepo]        = useState(getSavedRepo)
  const [activeTab,   setActiveTab]   = useState('triage')
  const [sqlLog,      setSqlLog]      = useState([])

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setUser(data)
        // If already logged in, skip landing for returning users
        // but still show landing on first load
      })
      .catch(() => setUser(null))
  }, [])

  // Loading
  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚓</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    )
  }

  // ── Page routing ──────────────────────────────────────────────────────────

  if (page === 'landing') {
    return (
      <LandingPage
        onStart={() => {
          if (!user) { setPage('login'); return }
          if (!user.hasApiKeys) { setPage('setup'); return }
          setPage('dashboard')
        }}
        onDocs={() => setPage('docs')}
      />
    )
  }

  if (page === 'docs') {
    return (
      <DocsPage
        onGetStarted={() => {
          if (!user) { setPage('login'); return }
          if (!user.hasApiKeys) { setPage('setup'); return }
          setPage('dashboard')
        }}
        onHome={() => setPage('landing')}
      />
    )
  }

  if (page === 'login') {
    return <LoginPage />
    // After Google OAuth redirect, page reloads → useEffect fires → user set
    // We handle post-login routing in a separate effect below
  }

  if (page === 'setup') {
    return (
      <ApiKeysSetup
        user={user}
        onComplete={async () => {
          // Refresh user to get hasApiKeys: true
          const fresh = await fetch(`${API}/auth/me`, { credentials: 'include' }).then(r => r.json())
          setUser(fresh)
          setPage('dashboard')
        }}
      />
    )
  }

  if (page === 'settings') {
    return <SettingsPage user={user} onBack={() => setPage('dashboard')} />
  }

  // ── Post OAuth redirect handling ─────────────────────────────────────────
  // If user is logged in but page is still 'landing', auto-route
  if (user && page === 'landing') {
    // Let landing page handle it via onStart
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const activeColor = TABS.find(t => t.id === activeTab)?.active || '#3b82f6'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #1f2937', backgroundColor: '#030712', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56 }}>

          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setPage('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', background: 'transparent', border: '1px solid #1f2937', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
              ← Home
            </button>
            <div style={{ width: 1, height: 20, backgroundColor: '#1f2937' }} />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 15 }}>OSS First Mate</div>
              <div style={{ color: '#4b5563', fontSize: 11 }}>AI-powered OSS maintainer assistant</div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <RepoForm repo={repo} setRepo={setRepo} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user?.avatar && <img src={user.avatar} width={28} height={28} style={{ borderRadius: '50%', border: '1px solid #374151' }} />}
              <button onClick={() => setPage('settings')} style={{ background: 'none', border: '1px solid #1f2937', borderRadius: 8, color: '#6b7280', padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>
                Settings
              </button>
              <a href={`${API}/auth/logout`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
                Logout
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 24px', overflowX: 'auto' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '10px 16px', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                border: 'none', borderBottom: isActive ? `2px solid ${tab.active}` : '2px solid transparent',
                backgroundColor: 'transparent', color: isActive ? '#ffffff' : '#6b7280', cursor: 'pointer',
              }}>
                {tab.label}
              </button>
            )
          })}
        </div>
      </header>

      <div style={{ height: 2, backgroundColor: activeColor, opacity: 0.15 }} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'triage'        && <TriageBoard     owner={repo.owner} repo={repo.repo} onSql={q => setSqlLog(l => [...l, q])} />}
        {activeTab === 'duplicates'    && <DuplicatesPanel owner={repo.owner} repo={repo.repo} onSql={q => setSqlLog(l => [...l, q])} />}
        {activeTab === 'release-notes' && <ReleaseNotes    owner={repo.owner} repo={repo.repo} onSql={q => setSqlLog(l => [...l, q])} />}
        {activeTab === 'slack'         && <SlackInsights   owner={repo.owner} repo={repo.repo} onSql={q => setSqlLog(l => [...l, q])} />}
        {activeTab === 'sql-log'       && <SqlLog queries={sqlLog} />}
        {activeTab === 'history'       && <RunHistory />}
      </main>
    </div>
  )
}