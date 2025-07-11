'use client'

import { useState, useEffect } from 'react'

export default function LiveMatches() {
  const [liveMatches, setLiveMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMatches()
    // Auto-refresh every 30 seconds for live scores
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMatches = async () => {
    try {
      console.log('🚀 Frontend: Fetching live and upcoming matches...')
      
      // Fetch live matches
      const liveResponse = await fetch('/api/matches?status=live&limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      // Fetch upcoming matches
      const upcomingResponse = await fetch('/api/matches?status=upcoming&limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!liveResponse.ok || !upcomingResponse.ok) {
        throw new Error('Failed to fetch matches')
      }
      
      const liveData = await liveResponse.json()
      const upcomingData = await upcomingResponse.json()
      
      setLiveMatches(liveData.matches || [])
      setUpcomingMatches(upcomingData.matches || [])
      
      console.log('✅ Frontend: Live matches loaded:', {
        liveCount: liveData.matches?.length || 0,
        upcomingCount: upcomingData.matches?.length || 0
      })
      
    } catch (err) {
      console.error('❌ Frontend: Error loading matches:', err)
      setError('Failed to load live matches')
    } finally {
      setLoading(false)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return '#00ff88'
      case 'ft': return '#888'
      case 'ns': return '#0099ff'
      default: return '#888'
    }
  }

  const MatchCard = ({ match, isLive = false }) => (
    <div
      style={{
        backgroundColor: '#111',
        border: isLive ? '2px solid #00ff88' : '1px solid #333',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = isLive ? '#00ff88' : '#0099ff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = isLive ? '#00ff88' : '#333'
      }}
    >
      {isLive && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#00ff88',
          color: '#000',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'pulse 2s infinite'
        }}>
          LIVE
        </div>
      )}
      
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
          {match.status === 'ft' ? 'FINAL' : 
           match.status === 'live' ? 'LIVE' : 
           match.status === 'ns' ? 'UPCOMING' : match.status.toUpperCase()}
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
              width: '32px',
              height: '32px',
              objectFit: 'contain'
            }}
          />
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            {match.homeTeam.name}
          </span>
        </div>
        
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: isLive ? '#00ff88' : '#0099ff',
          margin: '0 20px',
          minWidth: '80px',
          textAlign: 'center'
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
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            {match.awayTeam.name}
          </span>
          <img 
            src={match.awayTeam.logo} 
            alt={match.awayTeam.name}
            style={{
              width: '32px',
              height: '32px',
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
      
      {/* Live match additional info */}
      {isLive && match.elapsed && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#0a0a0a',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#00ff88',
          textAlign: 'center'
        }}>
          {match.elapsed}' - Match in progress
        </div>
      )}
    </div>
  )

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
        <div 
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#00ff88',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/'}
        >
          Clutch
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
          <a href="/live" style={{ color: '#ffffff', textDecoration: 'none' }}>Live</a>
          <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
          <a href="/about" style={{ color: '#888', textDecoration: 'none' }}>About</a>
          <a href="/rewards" style={{ color: '#888', textDecoration: 'none' }}>Rewards</a>
        </nav>
      </header>

      <main style={{ padding: '40px 20px' }}>
        {/* Page Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🔴 Live FIFA Club World Cup 2025
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#888',
            marginBottom: '20px',
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            Real-time scores and upcoming key matches from the expanded tournament
          </p>
        </div>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>⚽</div>
            <div style={{
              fontSize: '18px',
              color: '#888'
            }}>Loading live matches...</div>
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>⚠️</div>
            <div style={{
              fontSize: '18px',
              color: '#ef4444',
              marginBottom: '20px'
            }}>{error}</div>
            <button 
              onClick={fetchMatches}
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Live Matches Section */}
            <section style={{
              maxWidth: '1200px',
              margin: '0 auto 60px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
                gap: '15px'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: 0
                }}>
                  🔴 Live Matches
                </h2>
                <div style={{
                  backgroundColor: '#00ff88',
                  color: '#000',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  Auto-refresh every 30s
                </div>
              </div>

              {liveMatches.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '15px' }}>⏸️</div>
                  <div style={{ fontSize: '18px', color: '#888' }}>
                    No live matches at the moment
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    Check back during match times for live updates
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '20px'
                }}>
                  {liveMatches.map(match => (
                    <MatchCard key={match.id} match={match} isLive={true} />
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Matches Section */}
            <section style={{
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '30px',
                color: '#ffffff'
              }}>
                📅 Upcoming Key Matches
              </h2>

              {upcomingMatches.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '15px' }}>📭</div>
                  <div style={{ fontSize: '18px', color: '#888' }}>
                    No upcoming matches scheduled
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '20px'
                }}>
                  {upcomingMatches.map(match => (
                    <MatchCard key={match.id} match={match} isLive={false} />
                  ))}
                </div>
              )}
            </section>

            {/* Tournament Info */}
            <div style={{
              marginTop: '60px',
              padding: '40px',
              backgroundColor: '#111',
              borderRadius: '12px',
              border: '1px solid #333',
              maxWidth: '800px',
              margin: '60px auto 0'
            }}>
              <h3 style={{ 
                marginBottom: '20px', 
                color: '#ffffff',
                fontSize: '24px',
                textAlign: 'center'
              }}>
                🏆 FIFA Club World Cup 2025
              </h3>
              <p style={{ 
                color: '#888', 
                fontSize: '16px', 
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                Follow all the action from the expanded 32-team tournament. 
                Live scores update automatically every 30 seconds during matches.
              </p>
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}