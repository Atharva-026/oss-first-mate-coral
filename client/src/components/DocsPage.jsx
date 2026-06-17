import { useState, useEffect, useRef } from 'react'
import PlanetIcon from './PlanetIcon'
import ChatWidget from './ChatWidget'

// ── Animated star field ──────────────────────────────────────────────────────
function StarField() {
  useEffect(() => {
    const canvas = document.getElementById('docs-stars')
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
  return (
    <canvas
      id="docs-stars"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
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

const SECTIONS = [
  { id: 'what',       label: 'What is OSS First Mate' },
  { id: 'dashboard',  label: 'What you will see' },
  { id: 'how',        label: 'How it works' },
  { id: 'features',   label: 'Features' },
  { id: 'api-keys',   label: 'API keys setup' },
  { id: 'coral',      label: 'How Coral powers it' },
  { id: 'quickstart', label: 'Try it yourself' },
  { id: 'faq',        label: 'FAQ' },
]

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ position: 'relative', margin: '16px 0', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px', background: 'rgba(99,102,241,0.07)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <span style={{ fontSize: 10, color: '#6366f1', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{lang}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 5, color: copied ? '#22c55e' : '#a5b4fc', fontSize: 11, padding: '2px 8px', cursor: 'pointer' }}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px', background: 'rgba(3,7,18,0.85)', color: '#e2e8f0', fontSize: 12.5, lineHeight: 1.7, overflowX: 'auto', fontFamily: '"Fira Code", "Cascadia Code", monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Step({ num, title, desc, color }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 14, padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: color || '#6366f1', fontFamily: 'monospace', flexShrink: 0, paddingTop: 2, minWidth: 24 }}>{num}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: '#f1f5f9', marginBottom: 3 }}>{title}</div>
        {desc && <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{desc}</div>}
      </div>
    </div>
  )
}

function Section({ id, title, children }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); observer.disconnect() } },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id={id}
      style={{
        marginBottom: 64,
        scrollMarginTop: 72,
        // 3D scroll reveal — rotate up into place as it enters the viewport
        opacity: shown ? 1 : 0,
        transform: shown
          ? 'perspective(1200px) rotateX(0deg) translateY(0)'
          : 'perspective(1200px) rotateX(14deg) translateY(46px)',
        transformOrigin: 'center bottom',
        transition: 'opacity 0.7s ease, transform 0.8s cubic-bezier(0.2,0.7,0.2,1)',
        willChange: 'transform, opacity',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 3, height: 24, background: 'linear-gradient(180deg,#6366f1,#a855f7)', borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9', letterSpacing: -0.4 }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none',
        color: open ? '#a5b4fc' : '#e2e8f0', fontSize: 13.5, fontWeight: 600,
        padding: '14px 0', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {q}
        <span style={{ color: '#6b7280', fontSize: 16, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 12 }}>+</span>
      </button>
      {open && <p style={{ margin: '0 0 14px', color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>{a}</p>}
    </div>
  )
}

function ApiKeyCard({ title, required, color, steps, link, linkLabel }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 12, borderRadius: 12, border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', background: open ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
        border: 'none', padding: '16px 18px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: required ? 'rgba(239,68,68,0.1)' : 'rgba(107,114,128,0.15)', color: required ? '#fca5a5' : '#6b7280', fontWeight: 600 }}>
            {required ? 'required' : 'optional'}
          </span>
        </div>
        <span style={{ color: '#6b7280', fontSize: 14, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>v</span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px', background: 'rgba(255,255,255,0.01)' }}>
          <a href={`https://${link}`} target="_blank" style={{ display: 'inline-block', marginBottom: 14, fontSize: 12, color: '#6366f1' }}>
            Open {linkLabel} →
          </a>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: color, fontFamily: 'monospace', flexShrink: 0, paddingTop: 1, minWidth: 20 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TabCard({ title, desc, color }) {
  return (
    <div style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 13.5, color: '#f1f5f9' }}>{title}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

export default function DocsPage({ onGetStarted, onHome }) {
  const [activeSection, setActiveSection] = useState('what')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { rootMargin: '-30% 0px -60% 0px' }
    )
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: '"DM Sans", system-ui, sans-serif', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
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
          <button onClick={onHome} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}>
            Back
          </button>
          <div style={{ width: 1, height: 16, background: '#1f2937' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlanetIcon size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>OSS First Mate</span>
          </div>
          <span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(99,102,241,0.14)', color: '#a5b4fc', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>DOCS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="https://github.com/Atharva-026/oss-first-mate-coral" target="_blank" style={{ color: '#6b7280', fontSize: 12, textDecoration: 'none' }}>GitHub</a>
          <button onClick={onGetStarted} style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', color: '#fff', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Get Started
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', paddingTop: 54 }}>
        {/* Sidebar */}
        <aside style={{
          width: 228, flexShrink: 0, position: 'fixed', top: 54, bottom: 0,
          overflowY: 'auto', padding: '24px 0', zIndex: 40,
          background: 'rgba(3,7,18,0.75)', backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(99,102,241,0.08)',
        }}>
          <div style={{ padding: '0 18px 10px', fontSize: 9, letterSpacing: 2, color: '#374151', textTransform: 'uppercase', fontWeight: 700 }}>
            Documentation
          </div>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 18px', fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400,
              color: activeSection === s.id ? '#a5b4fc' : '#6b7280',
              background: activeSection === s.id ? 'rgba(99,102,241,0.09)' : 'transparent',
              borderLeft: activeSection === s.id ? '2px solid #6366f1' : '2px solid transparent',
              border: 'none',
              borderLeft: activeSection === s.id ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.12s',
            }}>
              {s.label}
            </button>
          ))}
          <div style={{ margin: '20px 18px 0', padding: '14px', background: 'rgba(99,102,241,0.05)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.12)' }}>
            <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 700, marginBottom: 5 }}>Need help?</div>
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>Use the chat widget in the bottom right corner for instant answers.</div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft: 228, flex: 1, padding: '44px 60px 80px', maxWidth: 820, animation: 'fadeIn 0.4s ease', position: 'relative', zIndex: 1 }}>

          {/* Hero */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.07)', color: '#a5b4fc', fontSize: 10, letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase' }}>
              Documentation v1.0
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.15, margin: '0 0 14px', background: 'linear-gradient(135deg,#f1f5f9 0%,#a5b4fc 60%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OSS First Mate
            </h1>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
              AI-powered GitHub issue triage for open source maintainers. Powered by Coral SQL, Groq LLM, and your own API keys.
            </p>
          </div>

          {/* What is it */}
          <Section id="what" title="What is OSS First Mate">
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14 }}>
              OSS First Mate is a dashboard that helps open source maintainers manage the never-ending flow of GitHub issues. Instead of manually reading every issue, the tool queries GitHub as a SQL database using <strong style={{ color: '#a5b4fc' }}>Coral</strong>, feeds the results to a large language model, and gives you actionable classification in seconds.
            </p>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14 }}>
              Every data fetch is transparent. The SQL Log tab shows the exact queries that ran. No black boxes, no hidden API calls.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                { label: 'Fast', desc: 'Triage 10 issues in ~15 seconds', color: '#6366f1' },
                { label: 'Transparent', desc: 'Every SQL query is logged', color: '#a855f7' },
                { label: 'Your keys', desc: 'Bring your own API credentials', color: '#06b6d4' },
              ].map(item => (
                <div key={item.label} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: item.color, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* What you will see */}
          <Section id="dashboard" title="What you will see in the dashboard">
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              After logging in and adding your API keys, you will land on the dashboard. At the top is a header with a repo input field — type any public GitHub repo in <code style={{ background: '#1f2937', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>owner/repo</code> format and click Load. The dashboard has six tabs:
            </p>
            <TabCard title="Triage" color="#3b82f6" desc="Shows a table of the latest 10 open issues. Each row has the issue number, title, type badge (bug / feature / docs / other), priority badge (high / medium / low), a suggested label, and a Mark Resolved button that sends a Slack notification." />
            <TabCard title="Duplicates" color="#eab308" desc="Fetches 20 open issues and finds pairs that describe the same problem. Each pair shows both issue numbers, a confidence level (high / medium / low), and the reason why they were flagged as duplicates." />
            <TabCard title="Release Notes" color="#22c55e" desc="Pulls the latest merged pull requests and drafts a structured markdown changelog with sections for New Features, Bug Fixes, and Other Changes. You can copy or export as a .md file." />
            <TabCard title="Slack Insights" color="#a855f7" desc="Matches open GitHub issues to messages in your Slack channel semantically. Requires a Slack bot token and the bot to be invited to your github-issues channel." />
            <TabCard title="SQL Log" color="#06b6d4" desc="Shows every Coral SQL query that ran in the current session. This is the transparency layer — you can see exactly what data was fetched, no hidden API calls." />
            <TabCard title="History" color="#ec4899" desc="All past runs stored in MongoDB, filtered by your account. Shows the repo, type of run, result count, timestamp, and the exact SQL query that ran." />
          </Section>

          {/* How it works */}
          <Section id="how" title="How it works">
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14, marginBottom: 20 }}>
              The pipeline is simple. Coral runs a SQL query against GitHub. The results are sent to Groq LLM. The AI returns structured JSON. The dashboard renders it.
            </p>
            <Step num="01" title="Enter a GitHub repo" desc="Type any public repo in owner/repo format. Click Load." color="#6366f1" />
            <Step num="02" title="Coral queries GitHub as SQL" desc="No API wrappers. No ETL. Coral turns github.issues into a SQL table and executes the query locally on your machine." color="#a855f7" />
            <Step num="03" title="Groq LLM classifies" desc="Raw issue data is sent to llama-3.3-70b. It returns type, priority, and a suggested label for each issue as structured JSON." color="#06b6d4" />
            <Step num="04" title="Dashboard renders results" desc="Results appear in a sortable table. Every run is saved to MongoDB. The SQL log tab shows exactly what ran." color="#22c55e" />
          </Section>

          {/* Features */}
          <Section id="features" title="Features">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { title: 'Issue Triage', badge: 'Coral SQL', color: '#3b82f6', desc: 'Classifies open issues as bug / feature / docs / other with high / medium / low priority using llama-3.3-70b.' },
                { title: 'Duplicate Detection', badge: 'LLM', color: '#a855f7', desc: 'Finds pairs of issues describing the same problem with confidence scores and plain-English reasoning.' },
                { title: 'Release Notes', badge: 'Coral SQL', color: '#22c55e', desc: 'Queries merged PRs via github.pulls and drafts a markdown changelog with New Features, Bug Fixes, and Other Changes.' },
                { title: 'Slack Insights', badge: 'Cross-source', color: '#eab308', desc: 'Semantic join between GitHub issues and Slack messages. Requires a Slack bot token.' },
                { title: 'SQL Log', badge: 'Audit', color: '#06b6d4', desc: 'Every Coral query logged per session. Full transparency, no black boxes.' },
                { title: 'Run History', badge: 'MongoDB', color: '#ec4899', desc: 'All past runs stored per user in MongoDB Atlas. Track how a repo changes over time.' },
              ].map(f => (
                <div key={f.title} style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: '#f1f5f9' }}>{f.title}</span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${f.color}22`, color: f.color, fontWeight: 700, letterSpacing: 0.5 }}>{f.badge}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* API Keys */}
          <Section id="api-keys" title="API keys setup">
            <div style={{ padding: '14px 16px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.18)', borderRadius: 10, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#fde047', fontWeight: 700, marginBottom: 4 }}>Important</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                OSS First Mate uses your own API keys. This keeps you in control of usage limits and ensures your data stays private. Keys are encrypted with AES-256 before storing in MongoDB.
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 16 }}>
              Click each key below to see step-by-step instructions for getting it.
            </p>
            <ApiKeyCard
              title="Groq API Key"
              required={true}
              color="#f97316"
              link="console.groq.com"
              linkLabel="console.groq.com"
              steps={[
                'Go to console.groq.com',
                'Click Sign Up and create a free account',
                'After login, click "API Keys" in the left sidebar',
                'Click "Create API Key"',
                'Give it a name like oss-first-mate',
                'Copy the key — it starts with gsk_',
                'Go to Settings in the OSS First Mate dashboard and paste it there',
              ]}
            />
            <ApiKeyCard
              title="GitHub Personal Access Token"
              required={true}
              color="#6366f1"
              link="github.com/settings/tokens"
              linkLabel="github.com"
              steps={[
                'Go to github.com and log in to your account',
                'Click your profile picture in the top right',
                'Click Settings from the dropdown',
                'Scroll down in the left sidebar and click Developer settings',
                'Click Personal access tokens, then Tokens (classic)',
                'Click Generate new token (classic)',
                'Give it a name and set an expiry (90 days is recommended)',
                'Under Select scopes, check the repo checkbox',
                'Scroll down and click Generate token',
                'Copy the token — it starts with ghp_ or github_pat_',
                'Go to Settings in the OSS First Mate dashboard and paste it there',
              ]}
            />
            <ApiKeyCard
              title="Slack Bot Token"
              required={false}
              color="#a855f7"
              link="api.slack.com/apps"
              linkLabel="api.slack.com"
              steps={[
                'Go to api.slack.com/apps and click Create New App',
                'Choose From scratch, give it a name like OSS First Mate Bot',
                'Select your workspace and click Create App',
                'In the left sidebar click OAuth and Permissions',
                'Under Scopes, add Bot Token Scopes: channels:read, channels:history, chat:write',
                'Click Install to Workspace at the top and confirm',
                'Copy the Bot User OAuth Token — it starts with xoxb-',
                'Go to Settings in the OSS First Mate dashboard and paste it there',
                'In Slack, go to your #github-issues channel and type /invite @OSS First Mate Bot',
              ]}
            />
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 700, marginBottom: 4 }}>Updating your keys</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>You can update any key at any time from the Settings page in the dashboard. Changes take effect immediately.</div>
            </div>
          </Section>

          {/* Coral */}
          <Section id="coral" title="How Coral powers it">
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14 }}>
              Coral is an open-source query layer that turns any API into a SQL table. OSS First Mate uses it to query GitHub with no custom API wrappers and no ETL pipelines.
            </p>
            <CodeBlock lang="sql" code={`-- Triage: fetch open issues
SELECT number, title, body, labels, created_at, state
FROM github.issues
WHERE owner = 'fastify' AND repo = 'fastify'
  AND state = 'open'
ORDER BY created_at DESC
LIMIT 10;

-- Duplicate detection
SELECT number, title, body, labels, created_at
FROM github.issues
WHERE owner = 'fastify' AND repo = 'fastify'
  AND state = 'open'
ORDER BY created_at DESC
LIMIT 20;

-- Release notes: merged pull requests
SELECT number, title, body, merged_at, labels
FROM github.pulls
WHERE owner = 'fastify' AND repo = 'fastify'
  AND state = 'closed'
ORDER BY number DESC
LIMIT 15;`} />
            <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: 14, marginTop: 14 }}>
              Coral runs locally. Your GitHub token never leaves your machine. Auth, pagination, and rate limits are handled inside Coral. The backend sends SQL and receives JSON.
            </p>
          </Section>

          {/* Quickstart */}
          <Section id="quickstart" title="Try it yourself">
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              The full setup guide is in the <a href="https://github.com/Atharva-026/oss-first-mate-coral" target="_blank" style={{ color: '#6366f1' }}>GitHub README</a>. Here is the quick version:
            </p>
            <Step num="01" title="Install Coral" desc="Mac: brew install withcoral/tap/coral   |   Windows: download from github.com/withcoral/coral/releases" color="#6366f1" />
            <Step num="02" title="Add GitHub as a Coral source" desc="Run: coral source add github — then enter your GitHub token when prompted" color="#a855f7" />
            <Step num="03" title="Clone and install" color="#06b6d4"
              desc="git clone https://github.com/Atharva-026/oss-first-mate-coral then cd into the folder and run npm install in both server and client folders" />
            <Step num="04" title="Add your .env file" desc="Copy .env.example to .env and fill in your GROQ_API_KEY, GITHUB_TOKEN, MONGODB_URI, and CORAL_PATH" color="#22c55e" />
            <Step num="05" title="Run the app" desc="Terminal 1: cd server && nodemon index.js    |    Terminal 2: cd client && npm run dev    |    Open: http://localhost:5173" color="#f97316" />
          </Section>

          {/* FAQ */}
          <Section id="faq" title="FAQ">
            {[
              { q: 'Does it work with private repos?', a: 'Yes, as long as your GitHub Personal Access Token has access to the private repo. Coral will use your token to authenticate the SQL query.' },
              { q: 'What happens when I hit the Groq rate limit?', a: 'The dashboard shows an error message. You can make 10 triage, duplicate, or release note requests per hour. The chat widget has a separate limit of 30 messages per hour.' },
              { q: 'Why does Coral need to be installed locally?', a: 'Coral runs as a local binary and handles auth on your machine. Your API tokens never leave your computer. When you deploy to a server, Coral is installed on the server instead.' },
              { q: 'Release notes show a fallback message — is that a bug?', a: 'Not a bug. Coral SQL support for merged PRs is being improved. Release notes still work correctly via the GitHub REST API fallback in the meantime.' },
              { q: 'Can I use a different LLM instead of Groq?', a: 'Not out of the box, but it is straightforward to swap. Edit server/services/groqService.js and replace the Groq SDK calls with any OpenAI-compatible API.' },
              { q: 'How do I update my API keys?', a: 'Click Settings in the dashboard header (top right). Enter the new value for any key and click Update keys. Changes take effect immediately.' },
              { q: 'Is my data private?', a: 'Yes. Your API keys are encrypted with AES-256 before storing. Coral runs locally so your GitHub token never leaves your machine. Run history is stored in your own MongoDB Atlas cluster.' },
            ].map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </Section>

          {/* CTA */}
          <div style={{ marginTop: 40, padding: '36px', background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <PlanetIcon size={22} color="#fff" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Ready to triage?</h3>
            <p style={{ color: '#94a3b8', fontSize: 13.5, margin: '0 0 20px' }}>Sign in with Google to get started. Your run history is saved automatically.</p>
            <button onClick={onGetStarted} style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none', color: '#fff', borderRadius: 8, padding: '11px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Get Started — it is free
            </button>
          </div>

          {/* Footer note */}
          <div style={{
            textAlign: 'center',
            padding: '24px 20px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            marginTop: 40,
          }}>
            <span style={{ fontSize: 12, color: '#4b5563', letterSpacing: 0.3 }}>
              🔒 HTTPS coming soon — custom domain in setup, live by end of month.
            </span>
          </div>

        </main>
      </div>

      <ChatWidget />
    </div>
  )
}