'use client'

import { useState, useEffect } from 'react'

export default function Rewards() {
  const [isVisible, setIsVisible] = useState(false)
  const [celebratingTier, setCelebratingTier] = useState(null)
  const [animatingReward, setAnimatingReward] = useState(null)
  const [floatingCoins, setFloatingCoins] = useState([])

  // Mock user data - in real app this would come from your backend/database
  const userStats = {
    totalLikes: 847,
    totalComments: 156,
    tokensEarned: 2340,
    currentStreak: 7,
    level: 'Gold Commentator',
    availableTokens: 450,
    nextMilestone: 1000,
    progress: 84
  }

  const rewardTiers = [
    { threshold: 10, reward: 50, icon: '🔥', name: 'Fire Comment', description: 'First viral comment!', color: '#ff6b35', unlocked: true },
    { threshold: 25, reward: 100, icon: '💎', name: 'Diamond Take', description: 'Quality insights recognized', color: '#0099ff', unlocked: true },
    { threshold: 50, reward: 200, icon: '⚡', name: 'Lightning Strike', description: 'Community favorite', color: '#00ff88', unlocked: true },
    { threshold: 100, reward: 500, icon: '🚀', name: 'Rocket Fuel', description: 'Top tier commentary', color: '#ff6b35', unlocked: false },
    { threshold: 250, reward: 1000, icon: '👑', name: 'King Comment', description: 'Legendary status', color: '#0099ff', unlocked: false }
  ]

  const recentRewards = [
    { comment: 'Haaland is absolutely unstoppable this season! 🔥', likes: 156, tokens: 500, time: '2 hours ago', tier: 'Rocket Fuel', new: true },
    { comment: 'That VAR decision was questionable at best...', likes: 89, tokens: 200, time: '1 day ago', tier: 'Lightning Strike', new: false },
    { comment: 'Best Champions League final in years!', likes: 234, tokens: 1000, time: '3 days ago', tier: 'King Comment', new: false }
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Celebrate achievement animation
    const celebrationInterval = setInterval(() => {
      setCelebratingTier(Math.floor(Math.random() * 3))
      setTimeout(() => setCelebratingTier(null), 2000)
    }, 8000)

    // Floating coins animation
    const coinsInterval = setInterval(() => {
      const newCoin = {
        id: Date.now(),
        x: Math.random() * 100,
        delay: Math.random() * 2
      }
      setFloatingCoins(prev => [...prev.slice(-4), newCoin])
    }, 3000)

    return () => {
      clearInterval(celebrationInterval)
      clearInterval(coinsInterval)
    }
  }, [])

  const handleRewardClick = (index) => {
    setAnimatingReward(index)
    setTimeout(() => setAnimatingReward(null), 1000)
  }

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes coinFloat {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(-5deg); }
          50% { transform: scale(1.3) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-2deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1); }
          50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.2); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: ${userStats.progress}%; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .floating-coin {
          position: fixed;
          font-size: 24px;
          animation: coinFloat 6s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        .reward-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .reward-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
        }
        .tier-unlocked {
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .celebrate-animation {
          animation: celebrate 0.6s ease-in-out;
        }
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #00ff88;
          border-radius: 50%;
          animation: sparkle 1.5s infinite;
        }
      `}</style>

      {/* Floating Coins */}
      {floatingCoins.map(coin => (
        <div
          key={coin.id}
          className="floating-coin"
          style={{
            left: `${coin.x}%`,
            animationDelay: `${coin.delay}s`
          }}
        >
          🪙
        </div>
      ))}

      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00ff88',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Clutch
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s ease' }}
             onMouseEnter={(e) => e.target.style.color = '#00ff88'}
             onMouseLeave={(e) => e.target.style.color = '#888'}>Home</a>
          <a href="/players" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s ease' }}
             onMouseEnter={(e) => e.target.style.color = '#00ff88'}
             onMouseLeave={(e) => e.target.style.color = '#888'}>Players</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s ease' }}
             onMouseEnter={(e) => e.target.style.color = '#00ff88'}
             onMouseLeave={(e) => e.target.style.color = '#888'}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s ease' }}
             onMouseEnter={(e) => e.target.style.color = '#00ff88'}
             onMouseLeave={(e) => e.target.style.color = '#888'}>Teams</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s ease' }}
             onMouseEnter={(e) => e.target.style.color = '#00ff88'}
             onMouseLeave={(e) => e.target.style.color = '#888'}>Community</a>
          <a href="/about" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s ease' }}
             onMouseEnter={(e) => e.target.style.color = '#00ff88'}
             onMouseLeave={(e) => e.target.style.color = '#888'}>About</a>
          <a href="/rewards" style={{ color: '#ffffff', textDecoration: 'none' }}>Rewards</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '100px 20px 60px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
        position: 'relative'
      }}>
        {/* Sparkles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}

        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s ease-out'
        }}>
          <h1 style={{
            fontSize: '64px',
            fontWeight: '900',
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35, #00ff88)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 3s ease infinite'
          }}>
            🏆 Rewards Dashboard
          </h1>
          
          <p style={{
            fontSize: '24px',
            color: '#ffffff',
            marginBottom: '15px',
            fontWeight: '600'
          }}>
            Every like is a victory, every comment is rewarded!
          </p>
          
          <p style={{
            fontSize: '18px',
            color: '#888',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Transform your sports insights into real rewards. The more the community loves your takes, the more you earn!
          </p>

          {/* Live Token Counter */}
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            border: '2px solid #00ff88',
            borderRadius: '50px',
            padding: '20px 40px',
            animation: 'glow 2s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '32px', animation: 'bounce 2s infinite' }}>🪙</span>
              <div>
                <div style={{ color: '#00ff88', fontSize: '28px', fontWeight: 'bold' }}>
                  {userStats.tokensEarned.toLocaleString()}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>Total Tokens Earned</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {[
            { label: 'Available Now', value: userStats.availableTokens, icon: '💰', color: '#00ff88' },
            { label: 'Total Likes', value: userStats.totalLikes, icon: '❤️', color: '#ff6b35' },
            { label: 'Comments Posted', value: userStats.totalComments, icon: '💬', color: '#0099ff' },
            { label: 'Current Streak', value: `${userStats.currentStreak} days`, icon: '🔥', color: '#ff6b35' }
          ].map((stat, index) => (
            <div
              key={index}
              className="reward-card"
              style={{
                backgroundColor: '#111',
                border: `2px solid ${stat.color}`,
                borderRadius: '15px',
                padding: '25px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => handleRewardClick(index)}
            >
              <div style={{ 
                fontSize: '36px', 
                marginBottom: '10px',
                animation: animatingReward === index ? 'bounce 0.6s ease' : 'none'
              }}>
                {stat.icon}
              </div>
              <div style={{ 
                color: stat.color, 
                fontSize: '24px', 
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#888', fontSize: '14px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Progress to Next Milestone */}
        <div style={{
          backgroundColor: '#111',
          border: '2px solid #00ff88',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#00ff88', marginBottom: '20px', fontSize: '24px' }}>
            🎯 Next Milestone: {userStats.nextMilestone} Total Likes
          </h3>
          <div style={{
            backgroundColor: '#0a0a0a',
            borderRadius: '50px',
            height: '20px',
            margin: '20px 0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #00ff88, #0099ff)',
              height: '100%',
              borderRadius: '50px',
              animation: 'progressFill 2s ease-out',
              width: `${userStats.progress}%`
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {userStats.progress}%
            </div>
          </div>
          <p style={{ color: '#888', margin: 0 }}>
            {userStats.nextMilestone - userStats.totalLikes} more likes to unlock the next reward tier!
          </p>
        </div>
      </section>

      {/* Reward Tiers */}
      <section style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '36px',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#ffffff'
        }}>
          🎖️ Achievement Tiers
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {rewardTiers.map((tier, index) => (
            <div
              key={index}
              className={`reward-card ${tier.unlocked ? 'tier-unlocked' : ''} ${celebratingTier === index ? 'celebrate-animation' : ''}`}
              style={{
                backgroundColor: tier.unlocked ? '#1a1a1a' : '#0f0f0f',
                border: `2px solid ${tier.unlocked ? tier.color : '#333'}`,
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                position: 'relative',
                cursor: 'pointer',
                opacity: tier.unlocked ? 1 : 0.6
              }}
              onClick={() => tier.unlocked && handleRewardClick(index)}
            >
              {tier.unlocked && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: tier.color,
                  color: '#000',
                  padding: '5px 10px',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  UNLOCKED
                </div>
              )}
              
              <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                filter: tier.unlocked ? 'none' : 'grayscale(100%)',
                animation: tier.unlocked ? 'bounce 2s infinite' : 'none',
                animationDelay: `${index * 0.2}s`
              }}>
                {tier.icon}
              </div>
              
              <h3 style={{
                color: tier.unlocked ? tier.color : '#666',
                fontSize: '24px',
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                {tier.name}
              </h3>
              
              <p style={{
                color: '#888',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                {tier.description}
              </p>
              
              <div style={{
                backgroundColor: tier.unlocked ? tier.color + '20' : '#0a0a0a',
                border: `1px solid ${tier.unlocked ? tier.color : '#333'}`,
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '15px'
              }}>
                <div style={{ color: tier.unlocked ? tier.color : '#666', fontSize: '18px', fontWeight: 'bold' }}>
                  {tier.threshold}+ likes required
                </div>
              </div>
              
              <div style={{
                backgroundColor: tier.unlocked ? '#00ff88' : '#333',
                color: tier.unlocked ? '#000' : '#666',
                padding: '12px 24px',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                animation: tier.unlocked ? 'glow 2s ease-in-out infinite' : 'none'
              }}>
                +{tier.reward} tokens
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Rewards */}
      <section style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '36px',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#ffffff'
        }}>
          🏆 Recent Achievements
        </h2>
        
        <div style={{
          display: 'grid',
          gap: '25px'
        }}>
          {recentRewards.map((reward, index) => (
            <div
              key={index}
              className="reward-card"
              style={{
                backgroundColor: '#111',
                border: reward.new ? '2px solid #00ff88' : '1px solid #333',
                borderRadius: '15px',
                padding: '25px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {reward.new && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: '#00ff88',
                  color: '#000',
                  padding: '8px 15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderBottomLeft: '10px',
                  animation: 'bounce 1s infinite'
                }}>
                  NEW!
                </div>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    marginBottom: '10px',
                    fontStyle: 'italic'
                  }}>
                    "{reward.comment}"
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#0a0a0a',
                      padding: '5px 10px',
                      borderRadius: '50px',
                      border: '1px solid #ff6b35'
                    }}>
                      <span style={{ color: '#ff6b35' }}>❤️</span>
                      <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>{reward.likes}</span>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#0a0a0a',
                      padding: '5px 12px',
                      borderRadius: '50px',
                      border: '1px solid #0099ff',
                      color: '#0099ff',
                      fontSize: '12px'
                    }}>
                      {reward.tier}
                    </div>
                    
                    <span style={{ color: '#888', fontSize: '12px' }}>{reward.time}</span>
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  minWidth: '120px'
                }}>
                  <div style={{
                    backgroundColor: '#00ff88',
                    color: '#000',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    animation: reward.new ? 'glow 1s ease-in-out infinite' : 'none'
                  }}>
                    +{reward.tokens}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>tokens</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '40px auto 0'
      }}>
        <div style={{
          backgroundColor: '#111',
          border: '2px solid #00ff88',
          borderRadius: '20px',
          padding: '50px 40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,255,136,0.1), rgba(0,153,255,0.1), rgba(255,107,53,0.1))',
            opacity: 0.5
          }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
            <h2 style={{
              fontSize: '32px',
              marginBottom: '20px',
              color: '#ffffff',
              fontWeight: 'bold'
            }}>
              Ready to earn more rewards?
            </h2>
            <p style={{
              color: '#888',
              fontSize: '18px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              Join live match discussions, share your best takes, and watch your token balance grow!
            </p>
            <a
              href="/community"
              style={{
                display: 'inline-block',
                backgroundColor: '#00ff88',
                color: '#000',
                textDecoration: 'none',
                padding: '18px 40px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a'
                e.target.style.transform = 'translateY(-3px) scale(1.05)'
                e.target.style.boxShadow = '0 10px 25px rgba(0, 255, 136, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Start Earning Now 💰
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}