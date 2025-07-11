export default function Home() {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00ff88'
        }}>
          ChilizWinner
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="/" style={{ color: '#ffffff', textDecoration: 'none' }}>Home</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00ff88, #0099ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Blazing fast updates ⚡
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#888',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Track team and player statistics, comment on players, and earn crypto rewards. 
          Real-time sports data community.
        </p>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '60px auto',
          padding: '0 20px'
        }}>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>Live Statistics 📊</h3>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              Real-time player and team stats that update as games happen. 
              Never miss a play or score update.
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0099ff', marginBottom: '15px' }}>Community Comments 💬</h3>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              Share your thoughts on players and teams. Engage with other fans 
              in real-time discussions.
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>Crypto Rewards 🪙</h3>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              Like comments with tokens and earn crypto for quality contributions. 
              Get paid for your sports insights.
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '60px',
          padding: '40px',
          backgroundColor: '#111',
          borderRadius: '12px',
          border: '1px solid #333',
          maxWidth: '800px',
          margin: '60px auto 0'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#ffffff' }}>We are 100% about sports</h2>
          <p style={{ color: '#888', fontSize: '18px', lineHeight: '1.6' }}>
            No subjective media agenda. Just pure sports data, community engagement, 
            and fair rewards for quality content.
          </p>
        </div>
      </main>
    </div>
  )
}