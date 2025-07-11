export default function Community() {
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
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/community" style={{ color: '#ffffff', textDecoration: 'none' }}>Community</a>
        </nav>
      </header>

      {/* Community Content */}
      <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#0099ff'
        }}>
          Community 💬
        </h1>

        {/* Post Input */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <textarea
            placeholder="Share your thoughts about the game..."
            style={{
              width: '100%',
              minHeight: '100px',
              backgroundColor: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '15px',
              color: '#ffffff',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '15px'
          }}>
            <div style={{ color: '#888', fontSize: '14px' }}>
              💡 Quality comments earn crypto rewards
            </div>
            <button style={{
              backgroundColor: '#00ff88',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Post Comment
            </button>
          </div>
        </div>

        {/* Comments Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            {
              user: 'SportsFan2024',
              time: '5 minutes ago',
              comment: 'LeBron is absolutely dominating this quarter! Those 3-pointers are unreal 🔥',
              likes: 12,
              tokens: 5.2,
              game: 'Lakers vs Warriors'
            },
            {
              user: 'BasketballGuru',
              time: '12 minutes ago',
              comment: 'Warriors need to tighten up their defense. Too many easy baskets for the Lakers.',
              likes: 8,
              tokens: 3.1,
              game: 'Lakers vs Warriors'
            },
            {
              user: 'SoccerExpert',
              time: '18 minutes ago',
              comment: 'That penalty decision was questionable. Arsenal got robbed there. VAR should have overturned it.',
              likes: 15,
              tokens: 7.8,
              game: 'Chelsea vs Arsenal'
            },
            {
              user: 'ChelseaBlue',
              time: '25 minutes ago',
              comment: 'Havertz is having an amazing game! Perfect timing for that goal 💙',
              likes: 6,
              tokens: 2.4,
              game: 'Chelsea vs Arsenal'
            }
          ].map((post, index) => (
            <div key={index} style={{
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '20px'
            }}>
              {/* Post Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#00ff88',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#0a0a0a'
                  }}>
                    {post.user[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{post.user}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>{post.time}</div>
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#333',
                  color: '#00ff88',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {post.game}
                </div>
              </div>

              {/* Comment Text */}
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '15px',
                color: '#ffffff'
              }}>
                {post.comment}
              </p>

              {/* Interaction Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '15px',
                borderTop: '1px solid #333'
              }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <button style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    👍 {post.likes}
                  </button>
                  <button style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: '#888',
                    cursor: 'pointer'
                  }}>
                    Reply
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#ff6b35',
                  fontWeight: 'bold'
                }}>
                  🪙 {post.tokens} CHZ
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button style={{
            backgroundColor: 'transparent',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '12px 24px',
            color: '#888',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Load More Comments
          </button>
        </div>
      </main>
    </div>
  )
}