export default function Stats() {
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
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
          <a href="/stats" style={{ color: '#ffffff', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
        </nav>
      </header>

      {/* Stats Content */}
      <main style={{ padding: '40px 20px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#00ff88'
        }}>
          Live Statistics 📊
        </h1>

        {/* Live Games */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '24px' }}>Live Games</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}>LIVE</span>
                <span style={{ color: '#888', fontSize: '14px' }}>Q3 8:42</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Lakers</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0099ff' }}>98</div>
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>vs</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Warriors</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0099ff' }}>102</div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}>LIVE</span>
                <span style={{ color: '#888', fontSize: '14px' }}>2nd Half 67:23</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Chelsea</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0099ff' }}>2</div>
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>vs</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>Arsenal</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0099ff' }}>1</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Players */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '24px' }}>Top Players This Week</h2>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {[
              { name: 'LeBron James', team: 'Lakers', points: '28.5', assists: '7.2', rebounds: '8.1' },
              { name: 'Luka Dončić', team: 'Mavericks', points: '32.1', assists: '8.9', rebounds: '8.3' },
              { name: 'Jayson Tatum', team: 'Celtics', points: '27.8', assists: '4.2', rebounds: '8.7' }
            ].map((player, index) => (
              <div key={index} style={{
                padding: '20px',
                borderBottom: index < 2 ? '1px solid #333' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{player.name}</div>
                  <div style={{ color: '#888', fontSize: '14px' }}>{player.team}</div>
                </div>
                <div style={{ display: 'flex', gap: '30px', textAlign: 'center' }}>
                  <div>
                    <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 'bold' }}>{player.points}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>PPG</div>
                  </div>
                  <div>
                    <div style={{ color: '#0099ff', fontSize: '20px', fontWeight: 'bold' }}>{player.assists}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>APG</div>
                  </div>
                  <div>
                    <div style={{ color: '#ff6b35', fontSize: '20px', fontWeight: 'bold' }}>{player.rebounds}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>RPG</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Updates */}
        <section>
          <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '24px' }}>Recent Updates ⚡</h2>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            {[
              { time: '2 min ago', text: 'LeBron James scores 3-pointer, Lakers 98-102 Warriors' },
              { time: '5 min ago', text: 'Penalty goal by Havertz, Chelsea 2-1 Arsenal' },
              { time: '8 min ago', text: 'Timeout called by Warriors coach Steve Kerr' },
              { time: '12 min ago', text: 'Yellow card for Xhaka, Arsenal vs Chelsea' }
            ].map((update, index) => (
              <div key={index} style={{
                padding: '15px 0',
                borderBottom: index < 3 ? '1px solid #333' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  color: '#00ff88',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  minWidth: '80px'
                }}>
                  {update.time}
                </div>
                <div style={{ color: '#ffffff', fontSize: '16px' }}>
                  {update.text}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}