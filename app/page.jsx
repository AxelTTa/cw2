'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const features = [
    {
      title: '🔮 Predict & Earn',
      description: 'Make predictions on live matches and earn CHZ tokens for accurate calls',
      icon: '🎯',
      bgColor: 'linear-gradient(135deg, #3ABEF9, #0099CC)'
    },
    {
      title: '🏆 Leaderboards',
      description: 'Compete with other fans and climb the daily & weekly rankings',
      icon: '📊',
      bgColor: 'linear-gradient(135deg, #00FFAA, #00CC88)'
    },
    {
      title: '👥 Fan Community',
      description: 'Connect with passionate sports fans and share your insights',
      icon: '💬',
      bgColor: 'linear-gradient(135deg, #FFD700, #FFA500)'
    },
    {
      title: '🎪 Live Events',
      description: 'Join live prediction events during major football matches',
      icon: '⚡',
      bgColor: 'linear-gradient(135deg, #FF6B9D, #C44569)'
    }
  ]

  const testimonials = [
    {
      name: 'Alex Thompson',
      username: '@crypto_king',
      text: 'Made 45 CHZ in my first week! The live predictions are incredibly accurate.',
      earnings: '+45 CHZ',
      avatar: '👑',
      verified: true,
      bgColor: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1))'
    },
    {
      name: 'Sarah Martinez',
      username: '@sports_prophet',
      text: 'Finally, a platform that rewards sports knowledge. Love the community!',
      earnings: '+32 CHZ',
      avatar: '🔮',
      verified: true,
      bgColor: 'linear-gradient(135deg, rgba(58, 190, 249, 0.3), rgba(58, 190, 249, 0.1))'
    },
    {
      name: 'Mike Chen',
      username: '@clutch_master',
      text: 'The real-time stats helped me make better predictions. Already climbing the leaderboard!',
      earnings: '+28 CHZ',
      avatar: '⚡',
      verified: true,
      bgColor: 'linear-gradient(135deg, rgba(0, 255, 170, 0.3), rgba(0, 255, 170, 0.1))'
    }
  ]

  const playerStats = {
    1: {
      name: 'CryptoKing88',
      avatar: '👑',
      totalEarnings: '34 CHZ',
      weeklyEarnings: '+12 CHZ',
      successRate: '87%',
      totalPredictions: 2847,
      streak: 12,
      rank: 1,
      badges: ['🔥', '💎', '🎯'],
      recentPredictions: [
        { match: 'Real Madrid vs Barcelona', prediction: 'Real Madrid Win', result: '✅', payout: '+5 CHZ' },
        { match: 'Arsenal vs Chelsea', prediction: 'Over 2.5 Goals', result: '✅', payout: '+3 CHZ' },
        { match: 'Liverpool vs City', prediction: 'Liverpool Win', result: '❌', payout: '-2 CHZ' }
      ]
    },
    2: {
      name: 'SportsProphet',
      avatar: '🔮',
      totalEarnings: '21 CHZ',
      weeklyEarnings: '+8 CHZ',
      successRate: '82%',
      totalPredictions: 2156,
      streak: 8,
      rank: 2,
      badges: ['⚡', '🎯', '🏆'],
      recentPredictions: [
        { match: 'PSG vs Monaco', prediction: 'PSG Win', result: '✅', payout: '+4 CHZ' },
        { match: 'Bayern vs Dortmund', prediction: 'Under 3.5 Goals', result: '✅', payout: '+2 CHZ' }
      ]
    },
    3: {
      name: 'ClutchMaster',
      avatar: '⚡',
      totalEarnings: '15 CHZ',
      weeklyEarnings: '+6 CHZ',
      successRate: '79%',
      totalPredictions: 1893,
      streak: 6,
      rank: 3,
      badges: ['🔥', '⭐', '🎯'],
      recentPredictions: [
        { match: 'Juventus vs Milan', prediction: 'Both Teams to Score', result: '✅', payout: '+3 CHZ' }
      ]
    }
  }

  useEffect(() => {
    setIsVisible(true)
    
    // Create fewer animated particles for better performance
    const particleArray = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      color: ['#3ABEF9', '#00FFAA', '#FFD700', '#FF6B9D'][Math.floor(Math.random() * 4)]
    }))
    setParticles(particleArray)

    // Animate particles less frequently
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.speedX + 100) % 100,
        y: (particle.y + particle.speedY + 100) % 100
      })))
    }

    const particleInterval = setInterval(animateParticles, 100)

    // Cycle testimonials less frequently
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 6000)

    // Throttled mouse tracking for better performance
    let mouseTimeout
    const handleMouseMove = (e) => {
      if (mouseTimeout) return
      mouseTimeout = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
        mouseTimeout = null
      }, 50)
    }
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      clearInterval(particleInterval)
      clearInterval(testimonialInterval)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

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
        @keyframes float3D {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(58, 190, 249, 0.2); }
          50% { box-shadow: 0 0 25px rgba(58, 190, 249, 0.4); }
        }
        @keyframes bounce3D {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmerFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes numberCount {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.4;
          animation: float3D 8s ease-in-out infinite;
          will-change: transform;
        }
        
        .crypto-bg {
          background: linear-gradient(-45deg, #0a0a0a, #1a1a2e, #16213e, #0f3460, #0a0a0a);
          background-size: 200% 200%;
          animation: gradientWave 20s ease infinite;
          position: relative;
        }
        
        .crypto-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(58, 190, 249, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }
        
        .glass-card:hover::before {
          left: 100%;
        }
        
        .glass-card:hover {
          transform: translateY(-15px) rotateX(5deg) rotateY(5deg);
          box-shadow: 0 35px 60px rgba(58, 190, 249, 0.3);
          border-color: rgba(58, 190, 249, 0.5);
        }
        
        .feature-icon-3d {
          font-size: 80px;
          background: linear-gradient(45deg, #3ABEF9, #00FFAA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 10px 20px rgba(58, 190, 249, 0.3));
          animation: bounce3D 3s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        
        .btn-crypto {
          background: linear-gradient(45deg, #3ABEF9, #00FFAA, #FFD700);
          background-size: 200% 200%;
          animation: gradientWave 3s ease infinite;
          border: none;
          color: #000;
          font-weight: bold;
          padding: 18px 36px;
          border-radius: 16px;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(58, 190, 249, 0.4);
        }
        
        .btn-crypto::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: translateX(-100%) skewX(-15deg);
          transition: transform 0.6s;
        }
        
        .btn-crypto:hover::after {
          animation: shimmerFlow 0.8s ease-in-out;
        }
        
        .btn-crypto:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 40px rgba(58, 190, 249, 0.6);
        }
        
        .rank-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          margin: 12px 0;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .rank-card:hover {
          transform: translateX(10px) scale(1.02);
          border-color: rgba(58, 190, 249, 0.5);
          box-shadow: 0 20px 40px rgba(58, 190, 249, 0.2);
        }
        
        .testimonial-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(25px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          transition: all 0.6s ease;
        }
        
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: slideInUp 0.3s ease-out;
        }
        
        .modal-content {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(17, 17, 17, 0.95));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(58, 190, 249, 0.3);
          border-radius: 24px;
          padding: 40px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .crypto-bg {
            padding: 60px 20px 80px !important;
          }
          .hero-title {
            font-size: 48px !important;
            line-height: 1.2 !important;
          }
          .hero-subtitle {
            font-size: 20px !important;
          }
          .feature-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .feature-icon-3d {
            font-size: 60px !important;
          }
          .btn-crypto {
            padding: 16px 28px !important;
            font-size: 16px !important;
          }
          .rank-card {
            padding: 20px !important;
          }
        }
      `}</style>

      {/* Animated Particles Background */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      ))}

      <Header />

      {/* Hero Section */}
      <section className="crypto-bg" style={{ 
        padding: '80px 20px 100px', 
        textAlign: 'center',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
          transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <h1 className="hero-title" style={{
            fontSize: '72px',
            fontWeight: '900',
            marginBottom: '32px',
            background: 'linear-gradient(45deg, #3ABEF9, #00FFAA, #FFD700, #FF6B9D, #3ABEF9)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientWave 4s ease infinite',
            lineHeight: '1.1',
            textShadow: '0 0 60px rgba(58, 190, 249, 0.5)'
          }}>
            Step Up Your Game with Clutch
          </h1>
          
          <p className="hero-subtitle" style={{
            fontSize: '28px',
            color: '#cccccc',
            marginBottom: '50px',
            fontWeight: '400',
            lineHeight: '1.5',
            animation: 'slideInUp 1.2s ease-out 0.3s both'
          }}>
            Engage, Predict, Monetize – Where Crypto Meets Sports
          </p>

          {/* Live Stats Counter */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginBottom: '50px',
            flexWrap: 'wrap'
          }}>
            {[
              { label: 'Hackathon Demo', value: 'Live Now', icon: '🚀' },
              { label: 'Built With', value: 'Next.js', icon: '⚛️' },
              { label: 'Powered By', value: 'Chiliz', icon: '🌶️' }
            ].map((stat, index) => (
              <div key={index} style={{
                textAlign: 'center',
                animation: `slideInUp 1s ease-out ${0.5 + index * 0.2}s both`
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#00FFAA',
                  animation: 'numberCount 1s ease-out'
                }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#aaa' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '40px'
          }}>
            <button className="btn-crypto" onClick={() => window.location.href = '/login'}>
              🚀 Join Clutch Now
            </button>
            <button className="btn-crypto" onClick={() => window.location.href = '/teams/1'} style={{
              background: 'transparent',
              border: '2px solid #3ABEF9',
              color: '#3ABEF9',
              boxShadow: '0 0 30px rgba(58, 190, 249, 0.3)'
            }}>
              👥 Join the Community
            </button>
          </div>
        </div>
      </section>

      {/* 3D Feature Showcase */}
      <section style={{
        padding: '100px 20px',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '80px',
          background: 'linear-gradient(45deg, #3ABEF9, #00FFAA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          The Ultimate Crypto Sports Experience
        </h2>

        <div className="feature-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '50px'
        }}>
          {/* Real-Time Stats */}
          <div className="glass-card" style={{
            borderRadius: '24px',
            padding: '50px',
            textAlign: 'center',
            animation: 'slideInUp 0.8s ease-out 0.2s both',
            background: 'linear-gradient(135deg, rgba(58, 190, 249, 0.1), rgba(58, 190, 249, 0.05))'
          }}>
            <div className="feature-icon-3d" style={{
              marginBottom: '30px',
              background: 'linear-gradient(45deg, #3ABEF9, #00FFAA, #3ABEF9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>⚡</div>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#3ABEF9',
              marginBottom: '24px'
            }}>
              Real-Time Stats & Insights
            </h3>
            <p style={{
              fontSize: '20px',
              color: '#bbb',
              lineHeight: '1.7',
              marginBottom: '30px'
            }}>
              Stay ahead of the action with instant access to detailed stats on players, teams, and competitions. Knowledge is your edge.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '14px',
              color: '#00FFAA'
            }}>
              <span>⚡ Live Updates</span>
              <span>📈 AI Predictions</span>
              <span>🔥 Hot Streaks</span>
            </div>
          </div>

          {/* Join Conversation */}
          <div className="glass-card" style={{
            borderRadius: '24px',
            padding: '50px',
            textAlign: 'center',
            animation: 'slideInUp 0.8s ease-out 0.4s both',
            background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(0, 255, 170, 0.05))'
          }}>
            <div className="feature-icon-3d" style={{
              marginBottom: '30px',
              background: 'linear-gradient(45deg, #00FFAA, #3ABEF9, #00FFAA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>💬</div>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#00FFAA',
              marginBottom: '24px'
            }}>
              Join the Conversation
            </h3>
            <p style={{
              fontSize: '20px',
              color: '#bbb',
              lineHeight: '1.7',
              marginBottom: '30px'
            }}>
              Share your thoughts, predictions, and analysis. Get likes, build your profile, and compete daily to monetize your sports insight.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '14px',
              color: '#3ABEF9'
            }}>
              <span>👍 Get Likes</span>
              <span>🏆 Build Profile</span>
              <span>💰 Earn Crypto</span>
            </div>
          </div>

          {/* Clutch Bets */}
          <div className="glass-card" style={{
            borderRadius: '24px',
            padding: '50px',
            textAlign: 'center',
            animation: 'slideInUp 0.8s ease-out 0.6s both',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
            gridColumn: 'span 1'
          }}>
            <div className="feature-icon-3d" style={{
              marginBottom: '30px',
              background: 'linear-gradient(45deg, #FFD700, #3ABEF9, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>🎯</div>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#FFD700',
              marginBottom: '24px'
            }}>
              Instant Mini-Bets, Big Rewards
            </h3>
            <p style={{
              fontSize: '20px',
              color: '#bbb',
              lineHeight: '1.7',
              marginBottom: '30px'
            }}>
              Make the game even more thrilling. Place instant Clutch bets on live matches and earn crypto rewards in real-time.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '14px',
              color: '#FFD700'
            }}>
              <span>⚡ Instant Bets</span>
              <span>🔥 Live Matches</span>
              <span>💎 Big Rewards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vertical Ranking - Top Clutch Players */}
      <section style={{
        padding: '100px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #3ABEF9, #00FFAA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🏆 Today's Top Clutch Players
          </h2>
          <p style={{
            fontSize: '22px',
            color: '#aaa'
          }}>
            See who's leading today. Click any player to view their detailed stats!
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {[
            { rank: 1, name: 'CryptoKing88', likes: 2847, earnings: '34 CHZ', change: '+12%', avatar: '👑', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
            { rank: 2, name: 'SportsProphet', likes: 2156, earnings: '21 CHZ', change: '+8%', avatar: '🔮', gradient: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' },
            { rank: 3, name: 'ClutchMaster', likes: 1893, earnings: '15 CHZ', change: '+5%', avatar: '⚡', gradient: 'linear-gradient(135deg, #CD7F32, #B8860B)' }
          ].map((player, index) => (
            <div key={index} 
                 className="rank-card" 
                 style={{
                   background: player.gradient,
                   animation: `slideInUp 0.8s ease-out ${0.8 + index * 0.3}s both`,
                   border: player.rank === 1 ? '3px solid #FFD700' : '2px solid rgba(255, 255, 255, 0.1)'
                 }}
                 onClick={() => setSelectedPlayer(player.rank)}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#000',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    #{player.rank}
                  </div>
                  <div style={{ fontSize: '32px' }}>{player.avatar}</div>
                  <div>
                    <h4 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#000',
                      marginBottom: '4px'
                    }}>
                      {player.name}
                    </h4>
                    <div style={{
                      fontSize: '16px',
                      color: 'rgba(0, 0, 0, 0.7)'
                    }}>
                      👍 {player.likes.toLocaleString()} likes
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#000'
                  }}>
                    {player.earnings}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.8)',
                    background: 'rgba(0, 255, 0, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    marginTop: '4px'
                  }}>
                    {player.change} today
                  </div>
                </div>
              </div>
              
              <div style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                Click for stats →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section style={{
        padding: '100px 20px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #3ABEF9, #00FFAA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚀 Real Success Stories
        </h2>
        <p style={{
          fontSize: '24px',
          color: '#aaa',
          marginBottom: '60px'
        }}>
          The New Era of Sports Fans is Here - Join the Winners!
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} 
                 className="testimonial-card" 
                 style={{
                   background: testimonial.bgColor,
                   opacity: index === currentTestimonial ? 1 : 0.7,
                   transform: index === currentTestimonial ? 'scale(1.05)' : 'scale(1)',
                   animation: `slideInUp 0.8s ease-out ${index * 0.2}s both`
                 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
                gap: '16px'
              }}>
                <div style={{ fontSize: '48px' }}>{testimonial.avatar}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {testimonial.name}
                    {testimonial.verified && <span style={{ color: '#00AAFF' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)' }}>
                    {testimonial.username}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  background: 'rgba(0, 0, 0, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#000'
                }}>
                  {testimonial.earnings}
                </div>
              </div>
              
              <p style={{
                fontSize: '18px',
                color: '#000',
                fontWeight: '500',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Testimonial Navigation Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '30px'
        }}>
          {testimonials.map((_, index) => (
            <div key={index}
                 style={{
                   width: '12px',
                   height: '12px',
                   borderRadius: '50%',
                   background: index === currentTestimonial ? '#3ABEF9' : '#666',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease'
                 }}
                 onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{
        padding: '100px 20px',
        textAlign: 'center',
        background: 'linear-gradient(45deg, rgba(58, 190, 249, 0.15), rgba(0, 255, 170, 0.15), rgba(255, 215, 0, 0.1))',
        margin: '100px 20px 60px',
        borderRadius: '32px',
        maxWidth: '1200px',
        margin: '100px auto 60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%233ABEF9" fill-opacity="0.1"%3E%3Ccircle cx="10" cy="10" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float3D 10s ease-in-out infinite'
        }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 style={{
            fontSize: '52px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '20px',
            animation: 'pulseGlow 3s ease-in-out infinite'
          }}>
            Ready to Go Clutch? 🚀
          </h2>
          <p style={{
            fontSize: '24px',
            color: '#aaa',
            marginBottom: '50px'
          }}>
            Join thousands of fans already turning passion into profit.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="btn-crypto">
              💎 Sign Up & Win Now
            </button>
            <button className="btn-crypto" style={{
              background: 'transparent',
              border: '2px solid #00FFAA',
              color: '#00FFAA',
              boxShadow: '0 0 30px rgba(0, 255, 170, 0.3)'
            }}>
              📊 View Live Stats
            </button>
          </div>
        </div>
      </section>

      {/* Player Stats Modal */}
      {selectedPlayer && (
        <div className="modal" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#3ABEF9'
              }}>
                {playerStats[selectedPlayer].avatar} {playerStats[selectedPlayer].name}
              </h3>
              <button 
                onClick={() => setSelectedPlayer(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { label: 'Total Earnings', value: playerStats[selectedPlayer].totalEarnings, icon: '💰' },
                { label: 'Weekly Earnings', value: playerStats[selectedPlayer].weeklyEarnings, icon: '📈' },
                { label: 'Success Rate', value: playerStats[selectedPlayer].successRate, icon: '🎯' },
                { label: 'Total Predictions', value: playerStats[selectedPlayer].totalPredictions.toLocaleString(), icon: '📊' },
                { label: 'Current Streak', value: `${playerStats[selectedPlayer].streak} wins`, icon: '🔥' },
                { label: 'Global Rank', value: `#${playerStats[selectedPlayer].rank}`, icon: '🏆' }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: 'rgba(58, 190, 249, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3ABEF9' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              justifyContent: 'center'
            }}>
              {playerStats[selectedPlayer].badges.map((badge, index) => (
                <span key={index} style={{ fontSize: '24px' }}>{badge}</span>
              ))}
            </div>

            <h4 style={{ color: '#00FFAA', marginBottom: '15px' }}>Recent Predictions</h4>
            {playerStats[selectedPlayer].recentPredictions.map((pred, index) => (
              <div key={index} style={{
                background: 'rgba(0, 255, 170, 0.1)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{pred.match}</div>
                  <div style={{ fontSize: '14px', color: '#aaa' }}>{pred.prediction}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>{pred.result}</div>
                  <div style={{ 
                    color: pred.payout.includes('+') ? '#00FFAA' : '#FF6B6B',
                    fontWeight: 'bold'
                  }}>
                    {pred.payout}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}