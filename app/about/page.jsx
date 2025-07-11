export default function AboutUs() {
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
          Clutch
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
          <a href="/about" style={{ color: '#ffffff', textDecoration: 'none' }}>About</a>
          <a href="/rewards" style={{ color: '#888', textDecoration: 'none' }}>Rewards</a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '40px',
          background: 'linear-gradient(45deg, #00ff88, #0099ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          About Us
        </h1>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '60px auto',
          padding: '0 20px'
        }}>
          
          {/* Who We Are */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>🧩 Who We Are</h3>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              We're a group of sport-obsessed builders who got tired of just watching games.
            </p>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              We've worked in product, design, Web3, data, and gaming — and we've all asked ourselves the same question during a match:
            </p>
            <p style={{ 
              color: '#0099ff', 
              lineHeight: '1.6', 
              fontStyle: 'italic',
              fontSize: '18px',
              textAlign: 'center',
              margin: '20px 0'
            }}>
              "Why are fans still on the sidelines?"
            </p>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              Clutch was born from that frustration — and from our love for banter, prediction games, fantasy leagues, and live reactions.
            </p>
          </div>

          {/* Why We Built Clutch */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0099ff', marginBottom: '15px' }}>⚽ Why We Built Clutch</h3>
            <h4 style={{ color: '#ff6b35', marginBottom: '15px', fontSize: '20px' }}>
              Matchday is broken.
            </h4>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              Today's fan experience is scattered:
            </p>
            <ul style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px', paddingLeft: '20px' }}>
              <li>SofaScore for the score</li>
              <li>Twitter for the drama</li>
              <li>WhatsApp for memes</li>
              <li>Reddit for deep takes</li>
              <li>FlashScore for stats</li>
            </ul>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              But nothing connects it. Nothing rewards you. Nothing makes you feel inside the match.
            </p>
            <div style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #00ff88',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '15px'
            }}>
              <p style={{ color: '#00ff88', fontWeight: 'bold', marginBottom: '5px' }}>
                Clutch fixes that:
              </p>
              <p style={{ color: '#ffffff', lineHeight: '1.6', margin: 0 }}>
                It's a second screen that's made for fans, by fans — not broadcasters.
              </p>
            </div>
          </div>

          {/* What We Believe */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>🧠 What We Believe</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#00ff88', fontSize: '16px' }}>⚡</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Live means live</strong> — If it doesn't happen during the game, it doesn't matter.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#0099ff', fontSize: '16px' }}>🤝</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Fans aren't followers. They're participants.</strong>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#ff6b35', fontSize: '16px' }}>📱</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Matchday deserves a real digital playground.</strong>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#00ff88', fontSize: '16px' }}>🧠</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Skill luck.</strong> Read the game, predict better, and earn it.
                </p>
              </div>
            </div>
          </div>

          {/* How We Work */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0099ff', marginBottom: '15px' }}>🔧 How We Work</h3>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              We're building fast, shipping weekly, and talking to our users every single day.
            </p>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              Clutch is still in early development, but we already have:
            </p>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00ff88', fontSize: '16px' }}>✅</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  A working prototype with real match events
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00ff88', fontSize: '16px' }}>✅</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  XP logic tied to predictions and reactions
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00ff88', fontSize: '16px' }}>✅</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  First users testing drops, voting, leaderboards
                </p>
              </div>
            </div>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              We test on real matches — from UCL to Club World Cup — and we improve Clutch with every half-time.
            </p>
          </div>

          {/* Join Us */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>🚀 Join Us</h3>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              Whether you're:
            </p>
            <ul style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px', paddingLeft: '20px' }}>
              <li>A fan who screams at the TV</li>
              <li>A stats addict who sees the pass before it happens</li>
              <li>A dev, designer, or community builder</li>
              <li>Or just someone tired of boring second screens…</li>
            </ul>
            <div style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #00ff88',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center',
              marginTop: '15px'
            }}>
              <p style={{ color: '#00ff88', fontWeight: 'bold', margin: 0 }}>
                You're exactly who we're building this for.
              </p>
            </div>
          </div>

          {/* Additional Card for Balance */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
            <h3 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '24px' }}>
              Built for Fans
            </h3>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              Every feature, every update, every decision is made with one thing in mind: 
              making matchday better for real sports fans.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}