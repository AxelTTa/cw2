export default function Rewards() {
  // Mock user data - in real app this would come from your backend/database
  const userStats = {
    totalLikes: 847,
    totalComments: 156,
    tokensEarned: 2340,
    currentStreak: 7,
    level: 'Gold Commentator',
    availableTokens: 450
  }

  const rewardTiers = [
    { threshold: 10, reward: 50, icon: '🔥', name: 'Fire Comment', description: 'First viral comment!', color: '#ff6b35' },
    { threshold: 25, reward: 100, icon: '💎', name: 'Diamond Take', description: 'Quality insights recognized', color: '#0099ff' },
    { threshold: 50, reward: 200, icon: '⚡', name: 'Lightning Strike', description: 'Community favorite', color: '#00ff88' },
    { threshold: 100, reward: 500, icon: '🚀', name: 'Rocket Fuel', description: 'Top tier commentary', color: '#ff6b35' },
    { threshold: 250, reward: 1000, icon: '👑', name: 'King Comment', description: 'Legendary status', color: '#0099ff' }
  ]

  const recentRewards = [
    { comment: 'Haaland is absolutely unstoppable this season! 🔥', likes: 156, tokens: 500, time: '2 hours ago', tier: 'Rocket Fuel' },
    { comment: 'That VAR decision was questionable at best...', likes: 89, tokens: 200, time: '1 day ago', tier: 'Lightning Strike' },
    { comment: 'Best Champions League final in years!', likes: 234, tokens: 1000, time: '3 days ago', tier: 'King Comment' }
  ]

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
          <a href="/about" style={{ color: '#888', textDecoration: 'none' }}>About</a>
          <a href="/rewards" style={{ color: '#ffffff', textDecoration: 'none' }}>Rewards</a>
        </nav>
      </header>

      {/* Main Content */}
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
          Rewards Dashboard 🪙
        </h1>

        <p style={{
          fontSize: '20px',
          color: '#888',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Get rewarded for quality comments and community engagement. 
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

          {/* User Stats */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>📊 Your Performance</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #00ff88',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Total Earned</span>
                <span style={{ color: '#00ff88', fontSize: '18px', fontWeight: 'bold' }}>
                  {userStats.tokensEarned.toLocaleString()} tokens
                </span>
              </div>
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #0099ff',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Total Likes</span>
                <span style={{ color: '#0099ff', fontSize: '18px', fontWeight: 'bold' }}>
                  {userStats.totalLikes.toLocaleString()}
                </span>
              </div>
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #ff6b35',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Comments Posted</span>
                <span style={{ color: '#ff6b35', fontSize: '18px', fontWeight: 'bold' }}>
                  {userStats.totalComments}
                </span>
              </div>
            </div>
            <div style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #00ff88',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '15px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#00ff88', fontWeight: 'bold', margin: 0 }}>
                Level: {userStats.level}
              </p>
            </div>
          </div>

          {/* Reward Tiers */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0099ff', marginBottom: '15px' }}>🎯 Reward Tiers</h3>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              Reach these like milestones on your comments to unlock token rewards:
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              {rewardTiers.slice(0, 3).map((tier, index) => (
                <div key={index} style={{
                  backgroundColor: '#0a0a0a',
                  border: `1px solid ${tier.color}`,
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{tier.icon}</span>
                    <span style={{ color: '#ffffff', fontSize: '14px' }}>{tier.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: tier.color, fontSize: '12px' }}>{tier.threshold}+ likes</div>
                    <div style={{ color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}>+{tier.reward} tokens</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Rewards */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>🏆 Recent Rewards</h3>
            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '15px' }}>
              Your latest rewarded comments:
            </p>
            <div style={{ display: 'grid', gap: '15px' }}>
              {recentRewards.slice(0, 2).map((reward, index) => (
                <div key={index} style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    marginBottom: '10px',
                    fontStyle: 'italic'
                  }}>
                    "{reward.comment.substring(0, 50)}..."
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{ color: '#0099ff', fontSize: '12px' }}>❤️ {reward.likes}</span>
                      <span style={{ color: '#888', fontSize: '12px' }}>{reward.time}</span>
                    </div>
                    <span style={{ color: '#00ff88', fontSize: '14px', fontWeight: 'bold' }}>
                      +{reward.tokens} tokens
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>⚡ How It Works</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#0099ff', fontSize: '16px' }}>💬</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Post Quality Comments</strong> — Share insights during live matches
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#ff6b35', fontSize: '16px' }}>❤️</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Get Community Likes</strong> — Other fans appreciate your takes
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#00ff88', fontSize: '16px' }}>🪙</span>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>
                  <strong style={{ color: '#ffffff' }}>Earn Token Rewards</strong> — Automatically receive tokens at milestones
                </p>
              </div>
            </div>
          </div>

          {/* All Reward Tiers */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0099ff', marginBottom: '15px' }}>🎖️ All Tiers</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {rewardTiers.map((tier, index) => (
                <div key={index} style={{
                  backgroundColor: '#0a0a0a',
                  border: `1px solid ${tier.color}`,
                  borderRadius: '6px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '14px' }}>{tier.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#ffffff', fontSize: '12px' }}>{tier.name}</div>
                    <div style={{ color: '#888', fontSize: '10px' }}>{tier.threshold}+ likes</div>
                  </div>
                  <div style={{ color: '#00ff88', fontSize: '12px', fontWeight: 'bold' }}>
                    +{tier.reward}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
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
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💡</div>
            <h3 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '24px' }}>
              Pro Tips
            </h3>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              The best comments are timely, insightful, and spark conversation. 
              Comment during live matches for maximum engagement!
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
          <h2 style={{ marginBottom: '20px', color: '#ffffff' }}>Start earning rewards today</h2>
          <p style={{ color: '#888', fontSize: '18px', lineHeight: '1.6' }}>
            Join live match discussions, share your predictions, and get rewarded 
            for quality contributions to the community.
          </p>
        </div>
      </main>
    </div>
  )
}