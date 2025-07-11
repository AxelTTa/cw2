export default function Hello() {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00ff88, #0099ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Hello Sports Fans! 👋
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#888',
          marginBottom: '40px'
        }}>
          Welcome to ChilizWinner - Your crypto-powered sports community
        </p>
        <a href="/" style={{
          display: 'inline-block',
          backgroundColor: '#00ff88',
          color: '#0a0a0a',
          padding: '15px 30px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Explore the App
        </a>
      </div>
    </div>
  )
}