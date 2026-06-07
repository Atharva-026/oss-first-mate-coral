export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: '#fff',
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚓</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          OSS First Mate
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
          AI-powered assistant for open source maintainers
        </p>
        <button
          onClick={handleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <img
            src="https://www.google.com/favicon.ico"
            width="18"
            height="18"
            alt="Google"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}