'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import MatchDiscussion from './community/page'

export default function Home() {
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecentMatches()
  }, [])

  const fetchRecentMatches = async () => {
    try {
      console.log('🚀 Frontend: Fetching recent matches...')
      
      const response = await fetch('/api/matches?status=recent&limit=6', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`)
      }
      
      const data = await response.json()
      
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header />

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
          FIFA Club World Cup 2025 ⚽
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#888',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Follow the expanded Club World Cup with 32 teams from around the world. 
          Real-time match results, player stats, and community discussions.
        </p>

        {/* Recent Matches Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '60px auto',
          padding: '0 20px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '30px',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            🏆 Recent Club World Cup Results
          </h2>
          
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#888'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>⚽</div>
              Loading recent matches...
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#ff4444'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>⚠️</div>
              {error}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {recentMatches.map(match => (
                <div
                  key={match.id}
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = '#00ff88'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#333'
                  }}
                >
                  {/* Match Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#888'
                    }}>
                      {match.round}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getStatusColor(match.status),
                      color: match.status === 'live' ? '#000' : '#fff',
                      fontWeight: 'bold'
                    }}>
                      {match.status === 'ft' ? 'FINAL' : match.status === 'live' ? 'LIVE' : 'UPCOMING'}
                    </div>
                  </div>
                  
                  {/* Teams and Score */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flex: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => window.location.href = `/teams/${match.homeTeam.id}`}
                    >
                      <img 
                        src={match.homeTeam.logo} 
                        alt={match.homeTeam.name}
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'contain'
                        }}
                      />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {match.homeTeam.name}
                      </span>
                    </div>
                    
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#00ff88',
                      margin: '0 15px'
                    }}>
                      {match.score.home !== null && match.score.away !== null ? 
                        `${match.score.home} - ${match.score.away}` : 
                        'vs'
                      }
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flex: 1,
                      justifyContent: 'flex-end',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.location.href = `/teams/${match.awayTeam.id}`}
                    >
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {match.awayTeam.name}
                      </span>
                      <img 
                        src={match.awayTeam.logo} 
                        alt={match.awayTeam.name}
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Match Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#666'
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
            marginTop: '30px'
          }}>
            <a 
              href="/community" 
              style={{
                display: 'inline-block',
                backgroundColor: '#00ff88',
                color: '#000',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Join Match Discussions 💬
            </a>
          </div>
        </div>

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
              Real-time player and team stats from all 32 Club World Cup teams. 
              Track goals, assists, and performances.
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#0099ff', marginBottom: '15px' }}>Community Discussions 💬</h3>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              Share your thoughts on matches and players. Engage with fans 
              from around the world during live games.
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>Player Profiles 👤</h3>
            <p style={{ color: '#888', lineHeight: '1.6' }}>
              Explore detailed profiles of all Club World Cup players. 
              View stats, photos, and career highlights.
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
          <h2 style={{ marginBottom: '20px', color: '#ffffff' }}>FIFA Club World Cup 2025</h2>
          <p style={{ color: '#888', fontSize: '18px', lineHeight: '1.6' }}>
            The expanded tournament featuring 32 clubs from around the world. 
            Real-time data, comprehensive player profiles, and community discussions.
          </p>
        </div>

        {/* Match Discussion Section */}
        <div style={{
          marginTop: '60px',
          maxWidth: '1200px',
          margin: '60px auto 0'
        }}>
          <MatchDiscussion />
        </div>
      </main>
    </div>
  )
}