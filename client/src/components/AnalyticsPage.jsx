import { useState, useEffect } from 'react'
import PlanetIcon from './PlanetIcon'

const API = import.meta.env.VITE_API_URL || ''

// ── A single gradient-accented stat card ──────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      position: 'relative',
      padding: '20px 22px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 36, height: 2,
        borderRadius: '2px 0 0 0', background: color,
      }} />
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6b7280', fontWeight: 600, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800, letterSpacing: -1, lineHeight: 1,
        background: `linear-gradient(135deg,#f1f5f9,${color})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>{sub}</div>}
    </div>
  )
}

// ── Pure-CSS vertical bar chart ───────────────────────────────────────────────
function BarChart({ data, color, formatLabel }) {
  const max = Math.max(1, ...data.map(d => d.count))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = (d.count / max) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#94a3b8', height: 14 }}>{d.count > 0 ? d.count : ''}</div>
            <div
              title={`${d.label}: ${d.count}`}
              style={{
                width: '100%',
                height: `${Math.max(2, h)}%`,
                minHeight: 2,
                borderRadius: '4px 4px 0 0',
                background: `linear-gradient(180deg,${color},${color}55)`,
                transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
            <div style={{ fontSize: 9, color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {formatLabel ? formatLabel(d.label) : d.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Panel({ title, accent, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, background: accent || 'linear-gradient(180deg,#6366f1,#a855f7)', borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: -0.2 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function AnalyticsPage({ onHome }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch(`${API}/api/analytics/summary`, { credentials: 'include' })
      .then(async r => {
        const json = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(json.error || 'Failed to load analytics')
        return json
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const signupDays = (data?.signupsByDay || []).map(d => ({
    label: d.date,
    count: d.count,
  }))

  const runTypes = data ? [
    { label: 'Triage',        count: data.runsByType?.triage       || 0 },
    { label: 'Duplicates',    count: data.runsByType?.duplicates   || 0 },
    { label: 'Release notes', count: data.runsByType?.releaseNotes || 0 },
    { label: 'Slack',         count: data.runsByType?.slack        || 0 },
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top bar */}
      <header style={{ borderBottom: '1px solid #1f2937', position: 'sticky', top: 0, background: '#030712', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', height: 56, maxWidth: 1100, margin: '0 auto' }}>
          <button onClick={onHome} style={{ background: 'transparent', border: '1px solid #1f2937', borderRadius: 8, color: '#6b7280', padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlanetIcon size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Analytics</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {error && (
          <div style={{ marginBottom: 18, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, padding: '60px 0' }}>Loading analytics…</div>}

        {!loading && !error && data && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              <StatCard label="Total Users"    value={data.totalUsers}        sub={`+${data.newUsersLast7Days} in 7d · +${data.newUsersLast30Days} in 30d`} color="#60a5fa" />
              <StatCard label="Visitors"       value={data.totalVisits}       sub={`${data.visitsLast7Days} in last 7 days`} color="#a78bfa" />
              <StatCard label="Users w/ Keys"  value={data.usersWithApiKeys}  sub={data.totalUsers ? `${Math.round((data.usersWithApiKeys / data.totalUsers) * 100)}% activated` : ''} color="#34d399" />
              <StatCard label="Total Runs"     value={data.totalRuns}         sub="Triage · dupes · notes" color="#22d3ee" />
              <StatCard label="Feedback"       value={data.totalFeedback}     sub={`${data.approvedFeedback} approved · ${data.pendingFeedback} pending`} color="#f472b6" />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 24 }}>
              <Panel title="Signups — last 14 days" accent="linear-gradient(180deg,#6366f1,#60a5fa)">
                <BarChart
                  data={signupDays}
                  color="#60a5fa"
                  formatLabel={(d) => {
                    const dt = new Date(d)
                    return `${dt.getMonth() + 1}/${dt.getDate()}`
                  }}
                />
              </Panel>
              <Panel title="Runs by type" accent="linear-gradient(180deg,#a855f7,#22d3ee)">
                <BarChart data={runTypes} color="#a78bfa" />
              </Panel>
            </div>

            {/* Signed-up users */}
            <div style={{ marginBottom: 24 }}>
              <Panel title={`Signed-up users${data.users ? ` (${data.users.length})` : ''}`} accent="linear-gradient(180deg,#6366f1,#06b6d4)">
                {(!data.users || data.users.length === 0) && (
                  <div style={{ color: '#6b7280', fontSize: 13, padding: '8px 0' }}>No users yet.</div>
                )}
                {data.users && data.users.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 360, overflowY: 'auto' }}>
                    {data.users.map((u, i) => (
                      <div key={u.email || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {u.avatar
                          ? <img src={u.avatar} width={28} height={28} style={{ borderRadius: '50%', border: '1px solid #374151', flexShrink: 0 }} alt="" />
                          : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, flexShrink: 0 }}>{(u.name || u.email || '?').charAt(0).toUpperCase()}</div>
                        }
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                          {u.name && <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>}
                        </div>
                        <span style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 999, flexShrink: 0,
                          background: u.hasApiKeys ? 'rgba(52,211,153,0.12)' : 'rgba(107,114,128,0.15)',
                          color: u.hasApiKeys ? '#6ee7b7' : '#6b7280', fontWeight: 600,
                        }}>
                          {u.hasApiKeys ? 'activated' : 'no keys'}
                        </span>
                        <span style={{ fontSize: 11, color: '#4b5563', flexShrink: 0, width: 78, textAlign: 'right' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            {/* Top repos */}
            <Panel title="Top repos" accent="linear-gradient(180deg,#f97316,#f472b6)">
              {(!data.topRepos || data.topRepos.length === 0) && (
                <div style={{ color: '#6b7280', fontSize: 13, padding: '8px 0' }}>No runs recorded yet.</div>
              )}
              {data.topRepos && data.topRepos.length > 0 && (() => {
                const maxRepo = Math.max(1, ...data.topRepos.map(r => r.count))
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.topRepos.map((r, i) => (
                      <div key={r.repo} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: '#4b5563', fontFamily: 'monospace', width: 18, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, width: 200, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.repo}</span>
                        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${(r.count / maxRepo) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8', width: 40, textAlign: 'right', flexShrink: 0 }}>{r.count}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </Panel>
          </>
        )}
      </main>
    </div>
  )
}
