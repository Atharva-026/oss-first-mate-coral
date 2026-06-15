import PlanetIcon from './components/PlanetIcon'
import ChatWidget from './components/ChatWidget'

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/auth/google`
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#030712',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif', color: '#fff',
    }}>
      <div style={{
        background: '#0d1117', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 400, width: '90%',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <PlanetIcon size={28} color="#fff" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#f1f5f9' }}>
          OSS First Mate
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13.5, margin: '0 0 32px', lineHeight: 1.6 }}>
          AI-powered assistant for open source maintainers.
          Sign in to save your triage history and API keys.
        </p>
        <button onClick={handleLogin} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, background: '#fff', color: '#111', border: 'none',
          borderRadius: 8, padding: '12px 24px', fontSize: 14,
          fontWeight: 600, cursor: 'pointer', width: '100%',
        }}>
          <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="" />
          Sign in with Google
        </button>
        <p style={{ fontSize: 11, color: '#374151', marginTop: 16, marginBottom: 0 }}>
          Free to use. No credit card required.
        </p>
      </div>
      <ChatWidget />
    </div>
  )
}