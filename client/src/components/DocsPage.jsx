import { useState, useEffect, useRef } from 'react'

// ── Animated star field ──────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
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
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
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
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

// ── Floating orb ─────────────────────────────────────────────────────────────
function Orb({ size, color, top, left, delay, blur }) {
  return (
    <div style={{
      position: 'fixed', width: size, height: size, borderRadius: '50%',
      background: color, top, left, filter: `blur(${blur || size / 2}px)`,
      opacity: 0.18, zIndex: 0, pointerEvents: 'none',
      animation: `floatOrb 8s ease-in-out ${delay || 0}s infinite alternate`,
    }} />
  )
}

// ── Section IDs ───────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'what',       label: 'What is OSS First Mate' },
  { id: 'how',        label: 'How it works' },
  { id: 'features',   label: 'Features' },
  { id: 'quickstart', label: 'Quick start' },
  { id: 'api-keys',   label: 'Bring your own API keys' },
  { id: 'coral',      label: 'How Coral powers it' },
  { id: 'faq',        label: 'FAQ' },
]

const CODE = {
  install: `# Install Coral (Mac)
brew install withcoral/tap/coral

# Windows — download from:
# https://github.com/withcoral/coral/releases

# Add GitHub as a source
coral source add github
# → Enter your GitHub Personal Access Token when prompted`,

  env: `# .env (root of project)
GROQ_API_KEY=your_groq_key_here
GITHUB_TOKEN=your_github_pat_here
MONGODB_URI=mongodb+srv://...
CORAL_PATH=/usr/local/bin/coral   # or C:\\coral\\coral.exe on Windows
PORT=5000
CLIENT_URL=http://localhost:5173`,

  run: `# Terminal 1 — backend
cd server && npm install && nodemon index.js

# Terminal 2 — frontend
cd client && npm install && npm run dev

# Open → http://localhost:5173`,

  sql: `-- Triage: fetch open issues
SELECT number, title, body, labels, created_at, state
FROM github.issues
WHERE owner = 'fastify' AND repo = 'fastify'
  AND state = 'open'
ORDER BY created_at DESC
LIMIT 10;

-- Duplicates: broader fetch for similarity check
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
LIMIT 15;`,
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: 'relative', margin: '20px 0', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <span style={{ fontSize: 11, color: '#6366f1', letterSpacing: 1, textTransform: 'uppercase' }}>{lang}</span>
        <button onClick={copy} style={{ background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: copied ? '#22c55e' : '#a5b4fc', fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '20px', background: 'rgba(3,7,18,0.8)', color: '#e2e8f0', fontSize: 13, lineHeight: 1.7, overflowX: 'auto', fontFamily: '"Fira Code", "Cascadia Code", monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Badge({ children, color }) {
  const colors = {
    blue:   { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)',  text: '#93c5fd' },
    green:  { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',   text: '#86efac' },
    purple: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)',  text: '#d8b4fe' },
    yellow: { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)',   text: '#fde047' },
    cyan:   { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)',   text: '#67e8f9' },
  }
  const c = colors[color] || colors.blue
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
      {children}
    </span>
  )
}

function FeatureCard({ icon, title, desc, color, badge }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 14, padding: '24px',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{title}</span>
        {badge && <Badge color={color}>{badge}</Badge>}
      </div>
      <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 72, scrollMarginTop: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 3, height: 28, background: 'linear-gradient(180deg,#6366f1,#a855f7)', borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: -0.5 }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function DocsPage({ onGetStarted, onHome }) {
  const [activeSection, setActiveSection] = useState('what')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
    }, { rootMargin: '-30% 0px -60% 0px' })
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: '"DM Sans", system-ui, sans-serif', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        @keyframes floatOrb { from { transform: translateY(0px) scale(1); } to { transform: translateY(-40px) scale(1.08); } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
        a { color: #a5b4fc; text-decoration: none; }
        a:hover { color: #818cf8; text-decoration: underline; }
      `}</style>

      <StarField />
      <Orb size={500} color="radial-gradient(circle,#6366f1,transparent)" top="-100px" left="-150px" delay={0} />
      <Orb size={400} color="radial-gradient(circle,#a855f7,transparent)" top="40%" left="70%" delay={3} />
      <Orb size={300} color="radial-gradient(circle,#06b6d4,transparent)" top="80%" left="10%" delay={5} />

      {/* ── Top navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onHome} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Home
          </button>
          <div style={{ width: 1, height: 18, background: '#1f2937' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>⚓ OSS First Mate</span>
          <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: 11, fontWeight: 600 }}>Docs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://github.com/Atharva-026/oss-first-mate-coral" target="_blank" style={{ color: '#6b7280', fontSize: 13 }}>GitHub</a>
          <button onClick={onGetStarted} style={{
            background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none',
            color: '#fff', borderRadius: 8, padding: '7px 18px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Get Started →
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', paddingTop: 56 }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 240, flexShrink: 0, position: 'fixed', top: 56, bottom: 0,
          overflowY: 'auto', padding: '28px 0', zIndex: 40,
          background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(99,102,241,0.1)',
        }}>
          <div style={{ padding: '0 20px 12px', fontSize: 10, letterSpacing: 1.5, color: '#4b5563', textTransform: 'uppercase', fontWeight: 600 }}>
            Documentation
          </div>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 20px', fontSize: 13.5, fontWeight: activeSection === s.id ? 600 : 400,
              color: activeSection === s.id ? '#a5b4fc' : '#6b7280',
              background: activeSection === s.id ? 'rgba(99,102,241,0.1)' : 'transparent',
              borderLeft: activeSection === s.id ? '2px solid #6366f1' : '2px solid transparent',
              border: 'none', borderLeft: activeSection === s.id ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {s.label}
            </button>
          ))}
          <div style={{ margin: '24px 20px 0', padding: '16px', background: 'rgba(99,102,241,0.06)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600, marginBottom: 6 }}>Need help?</div>
            <div style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.5 }}>Open an issue on GitHub or check the FAQ section below.</div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ marginLeft: 240, flex: 1, padding: '48px 64px 80px 64px', maxWidth: 860, animation: 'fadeSlideIn 0.5s ease' }}>

          {/* Hero */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', fontSize: 11, letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }}>
              Documentation · v1.0
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, margin: '0 0 16px', background: 'linear-gradient(135deg,#f1f5f9 0%,#a5b4fc 60%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OSS First Mate
            </h1>
            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
              AI-powered GitHub issue triage for open source maintainers — powered by Coral SQL, Groq LLM, and your own API keys.
            </p>
          </div>

          {/* What is it */}
          <Section id="what" title="What is OSS First Mate">
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14.5 }}>
              OSS First Mate is a dashboard that helps open source maintainers manage the never-ending flow of GitHub issues. Instead of manually reading every issue, the tool queries GitHub as a SQL database using <strong style={{ color: '#a5b4fc' }}>Coral</strong>, feeds the results to a large language model, and gives you actionable classification in seconds.
            </p>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14.5 }}>
              Every data fetch is transparent — the <strong style={{ color: '#a5b4fc' }}>SQL Log</strong> tab shows the exact queries that ran. No black boxes, no hidden API calls.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24 }}>
              {[
                { icon: '⚡', label: 'Fast', desc: 'Triage 10 issues in ~15 seconds' },
                { icon: '🔍', label: 'Transparent', desc: 'Every SQL query is logged' },
                { icon: '🔑', label: 'Your keys', desc: 'Bring your own API credentials' },
              ].map(item => (
                <div key={item.label} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* How it works */}
          <Section id="how" title="How it works">
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14.5, marginBottom: 24 }}>
              The pipeline is simple: Coral runs a SQL query against GitHub → results are sent to Groq's LLM → the AI classifies and returns structured JSON → the dashboard renders it.
            </p>
            {[
              { num: '01', title: 'Enter a GitHub repo', desc: 'Type any public repo in owner/repo format. The agent loads it instantly.', color: '#6366f1' },
              { num: '02', title: 'Coral queries GitHub as SQL', desc: 'No API wrappers. No ETL. Coral turns github.issues into a SQL table and executes your query locally.', color: '#a855f7' },
              { num: '03', title: 'Groq LLM classifies', desc: 'Raw issue data is sent to llama-3.3-70b. It returns type (bug/feature/docs), priority, and a suggested label for each issue.', color: '#06b6d4' },
              { num: '04', title: 'Dashboard renders results', desc: 'Results appear in a sortable table. Every run is saved to MongoDB. The SQL log shows exactly what ran.', color: '#22c55e' },
            ].map(step => (
              <div key={step.num} style={{ display: 'flex', gap: 20, marginBottom: 20, padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: step.color, fontFamily: 'monospace', flexShrink: 0, paddingTop: 2 }}>{step.num}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </Section>

          {/* Features */}
          <Section id="features" title="Features">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FeatureCard icon="🗂️" title="Issue Triage" badge="Coral SQL" color="blue" desc="Classifies open issues as bug / feature / docs / other with high / medium / low priority. Runs via Coral SQL on github.issues." />
              <FeatureCard icon="🔁" title="Duplicate Detection" badge="LLM" color="purple" desc="Fetches 20 issues and uses the LLM to find pairs describing the same problem — with confidence scores and reasoning." />
              <FeatureCard icon="📝" title="Release Notes" badge="Coral SQL" color="green" desc="Queries merged PRs via github.pulls and drafts a structured markdown changelog — New Features, Bug Fixes, Other Changes." />
              <FeatureCard icon="💬" title="Slack Insights" badge="Cross-source" color="yellow" desc="Semantic JOIN between GitHub issues and Slack messages. The LLM matches discussions to open issues automatically." />
              <FeatureCard icon="🔎" title="SQL Log" badge="Audit" color="cyan" desc="Every Coral query that ran is logged in a dedicated tab. Full transparency — you can see exactly what data was fetched." />
              <FeatureCard icon="🕓" title="Run History" badge="MongoDB" color="blue" desc="All past runs stored in MongoDB Atlas per user. Track how a repo's issue patterns change over time." />
            </div>
          </Section>

          {/* Quick start */}
          <Section id="quickstart" title="Quick start">
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14.5, marginBottom: 8 }}>
              <strong style={{ color: '#f1f5f9' }}>Prerequisites:</strong> Node.js 18+, MongoDB Atlas account (free), Groq API key (free), GitHub Personal Access Token, Coral v0.3+ binary.
            </p>
            <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 4 }}>1. Install Coral and clone the repo:</p>
            <CodeBlock lang="bash" code={CODE.install} />
            <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 4, marginTop: 20 }}>2. Configure your environment:</p>
            <CodeBlock lang="env" code={CODE.env} />
            <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 4, marginTop: 20 }}>3. Run the app:</p>
            <CodeBlock lang="bash" code={CODE.run} />
          </Section>

          {/* API keys */}
          <Section id="api-keys" title="Bring your own API keys">
            <div style={{ padding: 20, background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 12, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#fde047', fontWeight: 600, marginBottom: 6 }}>⚠️ Important</div>
              <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
                OSS First Mate requires your own API keys. This keeps you in control of your usage limits and ensures your data stays private.
              </div>
            </div>
            {[
              { name: 'Groq API Key', where: 'console.groq.com', desc: 'Free tier includes 500k tokens/day and 30 requests/minute. Used for issue classification, duplicate detection, and release note generation.', color: '#f97316' },
              { name: 'GitHub Personal Access Token', where: 'github.com/settings/tokens', desc: 'Classic token with repo:read scope. Used by Coral to query github.issues and github.pulls as SQL tables. Free — no limits beyond GitHub\'s standard rate limits.', color: '#6366f1' },
              { name: 'MongoDB URI', where: 'cloud.mongodb.com', desc: 'Free M0 cluster is enough. Used to store run history and user sessions. 512MB free storage.', color: '#22c55e' },
              { name: 'Slack Bot Token (optional)', where: 'api.slack.com/apps', desc: 'Only needed for Slack Insights feature. Create a Slack app, add bot:read scopes, install to your workspace. Invite the bot to your #github-issues channel.', color: '#a855f7' },
            ].map(key => (
              <div key={key.name} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: key.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{key.name}</span>
                  <a href={`https://${key.where}`} target="_blank" style={{ fontSize: 11, color: '#6b7280', marginLeft: 'auto' }}>
                    {key.where} ↗
                  </a>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>{key.desc}</p>
              </div>
            ))}
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 16 }}>
              After logging in, you can update your API keys anytime from the <strong style={{ color: '#a5b4fc' }}>Settings</strong> page in the dashboard.
            </p>
          </Section>

          {/* Coral */}
          <Section id="coral" title="How Coral powers it">
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14.5 }}>
              <a href="https://github.com/withcoral/coral" target="_blank">Coral</a> is an open-source query layer that turns any API into a SQL table. OSS First Mate uses it to query GitHub — no custom API wrappers, no ETL pipelines.
            </p>
            <CodeBlock lang="sql" code={CODE.sql} />
            <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14.5, marginTop: 16 }}>
              Coral runs locally on your machine. Your GitHub token never leaves your computer. Auth, pagination, and rate limits are all handled inside Coral — the backend just sends SQL and receives JSON.
            </p>
            <div style={{ padding: 20, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, marginTop: 8 }}>
              <div style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600, marginBottom: 6 }}>💡 Why this matters</div>
              <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
                The SQL Log tab in OSS First Mate is a direct reflection of this — every query is auditable. You're not trusting a black box. You're reading SQL. This is the foundation for trustworthy AI agents.
              </div>
            </div>
          </Section>

          {/* FAQ */}
          <Section id="faq" title="FAQ">
            {[
              { q: 'Does it work with private repos?', a: 'Yes, as long as your GitHub Personal Access Token has access to the private repo. Coral will use your token to authenticate.' },
              { q: 'What happens when I hit the Groq rate limit?', a: 'The dashboard will show an error message. You can wait a minute and retry. Groq free tier allows 30 requests/minute and 500k tokens/day — enough for dozens of triage runs.' },
              { q: 'Why does Coral need to be installed locally?', a: 'Coral runs as a local binary and handles auth entirely on your machine. Your API tokens never leave your computer. When you deploy to a server, Coral is installed on the server instead.' },
              { q: 'Can I use a different LLM instead of Groq?', a: 'Not out of the box, but it\'s easy to swap — edit groqService.js and replace the Groq SDK calls with any OpenAI-compatible API.' },
              { q: 'Release notes show "using GitHub API fallback" — is that a bug?', a: 'This means Coral returned no results for that PR query. This is a known limitation being fixed. The release notes feature still works correctly via the GitHub REST API fallback.' },
              { q: 'How do I update my API keys after signup?', a: 'Go to Settings in the dashboard (top right menu). You can update any key at any time. Changes take effect immediately.' },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </Section>

          {/* CTA */}
          <div style={{ marginTop: 48, padding: 40, background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚓</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Ready to triage?</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px' }}>Sign in with Google to get started. Your run history is saved automatically.</p>
            <button onClick={onGetStarted} style={{
              background: 'linear-gradient(135deg,#6366f1,#a855f7)', border: 'none',
              color: '#fff', borderRadius: 10, padding: '12px 32px', fontSize: 15,
              fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3,
            }}>
              Get Started — it's free →
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 4 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none',
        color: open ? '#a5b4fc' : '#e2e8f0', fontSize: 14, fontWeight: 600,
        padding: '16px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {q}
        <span style={{ color: '#6b7280', fontSize: 18, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
      </button>
      {open && <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: 13.5, lineHeight: 1.7 }}>{a}</p>}
    </div>
  )
}