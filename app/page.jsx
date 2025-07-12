'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import MatchDiscussion from './community/page'
import PublicComments from './components/PublicComments'
import { apiRequest } from './utils/api-config'

export default function Home() {
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [floatingElements, setFloatingElements] = useState([])
  const [currentAnimation, setCurrentAnimation] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchRecentMatches()
    setIsVisible(true)
    
    // Create floating elements
    const elements = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: ['⚽', '🏆', '🔥', '⭐', '🎯', '⚡'][Math.floor(Math.random() * 6)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      speed: 15 + Math.random() * 10
    }))
    setFloatingElements(elements)

    // Cycle through animation states
    const animationInterval = setInterval(() => {
      setCurrentAnimation(prev => (prev + 1) % 3)
    }, 4000)

    return () => clearInterval(animationInterval)
  }, [])

  const fetchRecentMatches = async () => {
    try {
      console.log('🚀 Frontend: Fetching recent matches...')
      
      const data = await apiRequest('/matches?status=recent&limit=6', {
        method: 'GET',
      })
      
      console.log('✅ Frontend: Recent matches loaded:', {
        matchesCount: data.matches?.length || 0,
        timestamp: data.timestamp
      })
      
      setRecentMatches(data.matches || [])
    } catch (err) {
      console.error('❌ Frontend: Error loading recent matches:', err)
      setError('Failed to load recent matches')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return '#00ff88'
      case 'ft': return '#888'
      case 'ns': return '#0099ff'
      default: return '#888'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-25px) rotate(90deg); opacity: 0.6; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 0.8; }
          75% { transform: translateY(-20px) rotate(270deg); opacity: 0.4; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 25px rgba(0, 255, 136, 0.4); }
          50% { box-shadow: 0 0 45px rgba(0, 255, 136, 0.8); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.2); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          70% { transform: scale(1); }
        }
        
        .floating-element {
          position: absolute;
          font-size: 28px;
          pointer-events: none;
          animation: float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          z-index: 1;
        }
        
        .hero-bg {
          background: linear-gradient(-45deg, #0a0a0a, #111111, #0f0f0f, #0a0a0a);
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .card-hover:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 25px 50px rgba(0, 255, 136, 0.3);
        }
        
        .card-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .card-hover:hover::before {
          left: 100%;
        }
        
        .live-indicator {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        .rotating-border {
          position: relative;
        }
        
        .rotating-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, #00ff88, #0099ff, #ff6b35, #00ff88);
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.3s;
          animation: rotate 3s linear infinite;
          z-index: -1;
        }
        
        .rotating-border:hover::before {
          opacity: 1;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .floating-element {
            font-size: 20px !important;
          }
          
          .mobile-menu-btn {
            display: block !important;
          }
          
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-nav {
            flex-direction: column;
            gap: 15px !important;
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(20px);
            padding: 20px;
            transition: left 0.3s ease;
            z-index: 99;
            border-bottom: 1px solid #333;
          }
          
          .mobile-nav.open {
            left: 0;
          }
          
          .mobile-header {
            padding: 15px !important;
            flex-wrap: wrap;
          }
          
          .mobile-title {
            font-size: 20px !important;
          }
          
          .mobile-hero {
            padding: 40px 15px !important;
          }
          
          .mobile-hero-title {
            font-size: 32px !important;
            line-height: 1.2 !important;
          }
          
          .mobile-hero-text {
            font-size: 16px !important;
            margin: 0 auto 30px !important;
          }
          
          .mobile-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 0 15px !important;
          }
          
          .mobile-card {
            padding: 20px !important;
            margin: 0 !important;
          }
          
          .mobile-match-card {
            padding: 20px !important;
          }
          
          .mobile-teams {
            flex-direction: column !important;
            gap: 15px !important;
            text-align: center !important;
          }
          
          .mobile-score {
            font-size: 20px !important;
            margin: 15px 0 !important;
          }
          
          .mobile-team {
            justify-content: center !important;
          }
          
          .mobile-team img {
            width: 24px !important;
            height: 24px !important;
          }
          
          .mobile-team span {
            font-size: 14px !important;
          }
          
          .mobile-match-info {
            flex-direction: column !important;
            gap: 8px !important;
            text-align: center !important;
          }
          
          .mobile-feature {
            padding: 25px !important;
            text-align: center !important;
          }
          
          .mobile-feature h3 {
            font-size: 18px !important;
          }
          
          .mobile-feature p {
            font-size: 15px !important;
          }
          
          .mobile-cta {
            padding: 30px 20px !important;
            margin: 40px 15px 0 !important;
          }
          
          .mobile-cta h2 {
            font-size: 24px !important;
          }
          
          .mobile-cta p {
            font-size: 16px !important;
          }
          
          .mobile-btn {
            padding: 14px 28px !important;
            font-size: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-hero-title {
            font-size: 28px !important;
          }
          
          .mobile-hero-text {
            font-size: 15px !important;
          }
          
          .mobile-card {
            padding: 15px !important;
          }
          
          .mobile-feature {
            padding: 20px !important;
          }
          
          .mobile-cta {
            padding: 25px 15px !important;
          }
        }
      `}</style>

      {/* Floating Background Elements */}
      {floatingElements.map(element => (
        <div
          key={element.id}
          className="floating-element"
          style={{
            '--duration': `${element.speed}s`,
            '--delay': `${element.delay}s`,
            top: `${element.y}%`,
            left: `${element.x}%`
          }}
        >
          {element.emoji}
        </div>
      ))}

      <Header />

      {/* Hero Section */}
      <main className="hero-bg mobile-hero" style={{ 
        padding: '80px 20px', 
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <h1 className="mobile-hero-title" style={{
            fontSize: '56px',
            fontWeight: '900',
            marginBottom: '25px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35, #00ff88)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 4s ease infinite',
            textShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
          }}>
            FIFA Club World Cup 2025 ⚽
          </h1>
          <p className="mobile-hero-text" style={{
            fontSize: '22px',
            color: '#cccccc',
            marginBottom: '50px',
            maxWidth: '700px',
            margin: '0 auto 50px',
            animation: 'slideInUp 1s ease-out 0.3s both',
            lineHeight: '1.6'
          }}>
            Follow the expanded Club World Cup with 32 teams from around the world. 
            Real-time match results, player stats, and community discussions.
          </p>
        </div>

        {/* Top Goal Scorers - Compact Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '60px auto 40px',
          padding: '0 20px'
        }}>
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            border: '2px solid #333',
            padding: '20px',
            marginBottom: '40px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '15px',
              color: '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚽ Top Goal Scorers
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '5px'
            }}>
              {[
                { name: 'Haaland', team: 'Man City', goals: 15, flag: '🇳🇴' },
                { name: 'Mbappé', team: 'Real Madrid', goals: 12, flag: '🇫🇷' },
                { name: 'Messi', team: 'Inter Miami', goals: 11, flag: '🇦🇷' },
                { name: 'Benzema', team: 'Al-Ittihad', goals: 10, flag: '🇫🇷' },
                { name: 'Vini Jr.', team: 'Real Madrid', goals: 9, flag: '🇧🇷' }
              ].map((player, index) => (
                <div key={index} style={{
                  minWidth: '120px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88'
                  e.currentTarget.style.transform = 'translateY(-2px) translateZ(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.transform = 'translateY(0) translateZ(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#00ff88',
                    marginBottom: '4px'
                  }}>
                    {player.goals}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <span>{player.flag}</span>
                    {player.name}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#888'
                  }}>
                    {player.team}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Matches Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '80px auto',
          padding: '0 20px'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '40px',
            textAlign: 'center',
            color: '#ffffff',
            animation: 'slideInUp 1s ease-out 0.5s both'
          }}>
            🏆 Recent Match Results
          </h2>
          
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#888'
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '20px',
                animation: 'bounce 1.5s infinite'
              }}>⚽</div>
              <div style={{ 
                fontSize: '20px',
                animation: 'pulse 2s infinite'
              }}>
                Loading recent matches...
              </div>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: '#ff4444'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'bounce 1s infinite' }}>⚠️</div>
              <div style={{ fontSize: '18px' }}>{error}</div>
            </div>
          ) : (
            <div className="mobile-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '25px'
            }}>
              {recentMatches.map((match, index) => (
                <div
                  key={match.id}
                  className="card-hover rotating-border mobile-match-card"
                  style={{
                    backgroundColor: '#111',
                    border: '2px solid #333',
                    borderRadius: '16px',
                    padding: '25px',
                    animation: `slideInUp 0.8s ease-out ${index * 0.15}s both`,
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.location.href = `/matches/${match.id}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00ff88'
                    e.currentTarget.style.backgroundColor = '#1a1a1a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333'
                    e.currentTarget.style.backgroundColor = '#111'
                  }}
                >
                  {/* Live Match Shimmer Effect */}
                  {match.status === 'live' && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent)',
                      animation: 'shimmer 2s infinite'
                    }} />
                  )}
                  
                  {/* Match Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#888',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {match.round}
                    </div>
                    <div className={match.status === 'live' ? 'live-indicator' : ''} style={{
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(match.status),
                      color: match.status === 'live' ? '#000' : '#fff',
                      fontWeight: 'bold',
                      animation: match.status === 'live' ? 'pulse 2s infinite' : 'none'
                    }}>
                      {match.status === 'ft' ? 'FINAL' : match.status === 'live' ? 'LIVE' : 'UPCOMING'}
                    </div>
                  </div>
                  
                  {/* Teams and Score */}
                  <div className="mobile-teams" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div className="mobile-team" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/teams/${match.homeTeam.id}`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img 
                        src={match.homeTeam.logo} 
                        alt={match.homeTeam.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {match.homeTeam.name}
                      </span>
                    </div>
                    
                    <div className="mobile-score" style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#00ff88',
                      margin: '0 20px',
                      animation: match.status === 'live' ? 'glow 2s infinite' : 'none',
                      textShadow: match.status === 'live' ? '0 0 20px rgba(0, 255, 136, 0.6)' : 'none'
                    }}>
                      {match.score.home !== null && match.score.away !== null ? 
                        `${match.score.home} - ${match.score.away}` : 
                        'vs'
                      }
                    </div>
                    
                    <div className="mobile-team" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/teams/${match.awayTeam.id}`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {match.awayTeam.name}
                      </span>
                      <img 
                        src={match.awayTeam.logo} 
                        alt={match.awayTeam.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Match Info */}
                  <div className="mobile-match-info" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: '#666',
                    paddingTop: '10px',
                    borderTop: '1px solid #333'
                  }}>
                    <span>{formatDate(match.date)}</span>
                    <span>{match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{
            textAlign: 'center',
            marginTop: '50px'
          }}>
            <a 
              href="/community" 
              className="rotating-border mobile-btn"
              style={{
                display: 'inline-block',
                backgroundColor: '#00ff88',
                color: '#000',
                textDecoration: 'none',
                padding: '16px 32px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'glow 4s infinite',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a'
                e.target.style.transform = 'translateY(-5px) scale(1.08)'
                e.target.style.boxShadow = '0 15px 35px rgba(0, 255, 136, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Join Match Discussions 💬
            </a>
          </div>
        </div>

        {/* Top Competitions Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '80px auto',
          padding: '0 20px'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '40px',
            textAlign: 'center',
            color: '#ffffff',
            animation: 'slideInUp 1s ease-out 0.7s both'
          }}>
            🏆 Top Current Competitions
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {[
              {
                name: 'FIFA Club World Cup 2025',
                status: 'LIVE',
                statusColor: '#00ff88',
                stage: 'Group Stage',
                teams: '32 Teams',
                location: '🇺🇸 USA',
                prize: '$100M',
                logo: 'https://media.api-sports.io/football/leagues/15.png'
              },
              {
                name: 'UEFA Champions League',
                status: 'ONGOING',
                statusColor: '#0099ff',
                stage: 'League Phase',
                teams: '36 Teams',
                location: '🇪🇺 Europe',
                prize: '€2.03B',
                logo: 'https://media.api-sports.io/football/leagues/2.png'
              },
              {
                name: 'AFC Champions League',
                status: 'ONGOING',
                statusColor: '#0099ff',
                stage: 'League Stage',
                teams: '24 Teams',
                location: '🌏 Asia',
                prize: '$12M',
                logo: 'https://media.api-sports.io/football/leagues/1.png'
              },
              {
                name: 'Copa Libertadores',
                status: 'COMPLETED',
                statusColor: '#888',
                stage: 'Final',
                teams: '47 Teams',
                location: '🌎 South America',
                prize: '$23M',
                logo: 'https://media.api-sports.io/football/leagues/13.png'
              },
              {
                name: 'CAF Champions League',
                status: 'UPCOMING',
                statusColor: '#ff6b35',
                stage: 'Group Stage',
                teams: '16 Teams',
                location: '🌍 Africa',
                prize: '$2.5M',
                logo: 'https://media.api-sports.io/football/leagues/12.png'
              }
            ].map((competition, index) => (
              <div
                key={index}
                className="card-hover"
                style={{
                  backgroundColor: '#111',
                  border: '2px solid #333',
                  borderRadius: '12px',
                  padding: '20px',
                  animation: `slideInUp 0.8s ease-out ${0.8 + index * 0.1}s both`,
                  cursor: 'pointer'
                }}
                onClick={() => window.location.href = '/competitions'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = competition.statusColor
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.backgroundColor = '#111'
                }}
              >
                {/* Status Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <img 
                    src={competition.logo} 
                    alt={competition.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{
                    color: competition.statusColor,
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: `${competition.statusColor}20`,
                    padding: '3px 8px',
                    borderRadius: '10px'
                  }}>
                    {competition.status}
                  </span>
                </div>

                {/* Competition Name */}
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {competition.name}
                </h4>

                {/* Quick Info */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#888'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Stage:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{competition.stage}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Teams:</span>
                    <span style={{ color: '#00ff88' }}>{competition.teams}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Prize:</span>
                    <span style={{ color: '#0099ff' }}>{competition.prize}</span>
                  </div>
                  <div style={{ 
                    textAlign: 'center',
                    marginTop: '8px',
                    padding: '6px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '6px',
                    fontSize: '10px',
                    color: '#ffdd00'
                  }}>
                    {competition.location}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '30px'
          }}>
            <a 
              href="/competitions" 
              style={{
                display: 'inline-block',
                backgroundColor: 'transparent',
                color: '#00ff88',
                border: '2px solid #00ff88',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.color = '#000'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = '#00ff88'
              }}
            >
              View All Competitions →
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '35px',
          maxWidth: '1200px',
          margin: '80px auto',
          padding: '0 20px'
        }}>
          {[
            {
              title: 'Match Analytics 📊',
              desc: 'Real-time match data and insights from top competitions worldwide. Track scores, goals, and key moments.',
              color: '#00ff88',
              delay: '0.2s'
            },
            {
              title: 'Community Discussions 💬',
              desc: 'Share your thoughts on matches and players. Engage with fans from around the world during live games.',
              color: '#0099ff',
              delay: '0.4s'
            },
            {
              title: 'Player Profiles 👤',
              desc: 'Explore detailed profiles of players from top competitions worldwide. View career highlights and achievements.',
              color: '#ff6b35',
              delay: '0.6s'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="card-hover rotating-border mobile-feature"
              style={{
                backgroundColor: '#111',
                border: `2px solid ${feature.color}`,
                borderRadius: '16px',
                padding: '35px',
                textAlign: 'left',
                animation: `slideInUp 0.8s ease-out ${feature.delay} both`,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = feature.color
                e.currentTarget.style.boxShadow = `0 0 40px ${feature.color}60`
                e.currentTarget.style.backgroundColor = '#1a1a1a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = feature.color
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.backgroundColor = '#111'
              }}
            >
              <h3 style={{ 
                color: feature.color, 
                marginBottom: '18px',
                fontSize: '20px',
                animation: 'bounce 3s infinite',
                animationDelay: feature.delay
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: '#aaa', 
                lineHeight: '1.7',
                fontSize: '16px'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mobile-cta" style={{
          marginTop: '80px',
          padding: '50px',
          backgroundColor: '#111',
          borderRadius: '20px',
          border: '2px solid #333',
          maxWidth: '900px',
          margin: '80px auto 0',
          animation: 'slideInUp 0.8s ease-out 0.8s both',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,255,136,0.15), rgba(0,153,255,0.15), rgba(255,107,53,0.15))',
            opacity: 0.7
          }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ 
              marginBottom: '25px', 
              color: '#ffffff',
              fontSize: '28px',
              animation: 'glow 4s infinite'
            }}>
              FIFA Club World Cup 2025
            </h2>
            <p style={{ 
              color: '#bbb', 
              fontSize: '19px', 
              lineHeight: '1.7'
            }}>
              The expanded tournament featuring 32 clubs from around the world. 
              Real-time data, comprehensive player profiles, and community discussions.
            </p>
          </div>
        </div>

        {/* Public Comments Section */}
        <div style={{
          marginTop: '80px',
          maxWidth: '1200px',
          margin: '80px auto 0',
          animation: 'slideInUp 0.8s ease-out 1s both'
        }}>
          <PublicComments showForm={true} />
        </div>
      </main>
    </div>
  )
}