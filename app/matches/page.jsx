'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function Matches() {
  const [activeTab, setActiveTab] = useState('live')
  const [matchData, setMatchData] = useState({
    live: [],
    upcoming: [],
    past: [],
    stats: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllMatchData()
    // Auto-refresh every 30 seconds for live matches
    const interval = setInterval(() => {
      if (activeTab === 'live') {
        fetchLiveMatches()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllMatchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch live matches
      const liveResponse = await fetch('/api/matches?status=live&limit=20')
      const liveData = await liveResponse.json()

      // Fetch upcoming matches
      const upcomingResponse = await fetch('/api/matches?status=upcoming&limit=20')
      const upcomingData = await upcomingResponse.json()

      // Fetch past matches  
      const pastResponse = await fetch('/api/matches?status=recent&limit=20')
      const pastData = await pastResponse.json()

      // Generate stats from the data
      const stats = {
        totalMatches: (liveData.matches?.length || 0) + (upcomingData.matches?.length || 0) + (pastData.matches?.length || 0),
        liveMatches: liveData.matches?.length || 0,
        upcomingMatches: upcomingData.matches?.length || 0,
        completedMatches: pastData.matches?.length || 0,
        topScorer: { name: 'Kylian Mbappé', goals: 8, team: 'Real Madrid' },
        mostGoals: pastData.matches?.reduce((max, match) => 
          Math.max(max, (match.score?.home || 0) + (match.score?.away || 0)), 0) || 0
      }

      setMatchData({
        live: liveData.matches || [],
        upcoming: upcomingData.matches || [],
        past: pastData.matches || [],
        stats
      })

    } catch (err) {
      console.error('Error fetching match data:', err)
      setError('Failed to load match data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveMatches = async () => {
    try {
      const response = await fetch('/api/matches?status=live&limit=20')
      const data = await response.json()
      setMatchData(prev => ({ ...prev, live: data.matches || [] }))
    } catch (err) {
      console.error('Error refreshing live matches:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': case '1H': case '2H': case 'HT': case 'ET': case 'P': return '#00ff88'
      case 'ft': case 'aet': case 'pen': return '#888'
      case 'ns': return '#0099ff'
      default: return '#888'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'live': case '1H': case '2H': return 'LIVE'
      case 'HT': return 'HALF TIME'
      case 'ET': return 'EXTRA TIME'
      case 'P': return 'PENALTIES'
      case 'ft': return 'FINISHED'
      case 'aet': return 'FINISHED (AET)'
      case 'pen': return 'FINISHED (PEN)'
      case 'ns': return 'UPCOMING'
      default: return status.toUpperCase()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const MatchCard = ({ match, showLiveIndicator = false }) => (
    <div
      style={{
        backgroundColor: '#111',
        border: showLiveIndicator && match.status !== 'ns' && match.status !== 'ft' ? '2px solid #00ff88' : '2px solid #333',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = getStatusColor(match.status)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = showLiveIndicator && match.status !== 'ns' && match.status !== 'ft' ? '#00ff88' : '#333'
      }}
      onClick={() => window.location.href = `/matches/${match.id}`}
    >
      {/* Live indicator */}
      {showLiveIndicator && match.status !== 'ns' && match.status !== 'ft' && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: '#00ff88',
          color: '#000',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          animation: 'pulse 2s infinite'
        }}>
          LIVE
        </div>
      )}

      {/* Match status and date */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '12px',
          color: getStatusColor(match.status),
          fontWeight: 'bold',
          backgroundColor: `${getStatusColor(match.status)}20`,
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {getStatusText(match.status)}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#888'
        }}>
          {formatDate(match.date || match.match_date)}
        </div>
      </div>

      {/* Teams and score */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        {/* Home team */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1
        }}>
          <img 
            src={match.homeTeam?.logo || match.home_team_logo} 
            alt={match.homeTeam?.name || match.home_team}
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            {match.homeTeam?.name || match.home_team}
          </span>
        </div>

        {/* Score */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: match.status === 'ns' ? '#888' : '#00ff88',
          margin: '0 20px',
          minWidth: '80px',
          textAlign: 'center'
        }}>
          {match.status === 'ns' ? (
            <span style={{ fontSize: '14px', color: '#888' }}>
              {new Date(match.date || match.match_date).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          ) : (
            `${match.score?.home || match.home_score || 0} - ${match.score?.away || match.away_score || 0}`
          )}
        </div>

        {/* Away team */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1,
          justifyContent: 'flex-end'
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            {match.awayTeam?.name || match.away_team}
          </span>
          <img 
            src={match.awayTeam?.logo || match.away_team_logo} 
            alt={match.awayTeam?.name || match.away_team}
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Match details */}
      <div style={{
        borderTop: '1px solid #333',
        paddingTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#888'
      }}>
        <span>{match.round || match.league || 'Club World Cup'}</span>
        <span>{match.venue || 'TBA'}</span>
      </div>
    </div>
  )

  const StatsCard = ({ title, value, subtitle, color }) => (
    <div style={{
      backgroundColor: '#111',
      border: '2px solid #333',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = color
      e.currentTarget.style.transform = 'translateY(-4px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#333'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    >
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '8px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: '4px'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '12px',
          color: '#888'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  )

  const tabs = [
    { id: 'live', label: '🔴 Live', count: matchData.live.length },
    { id: 'upcoming', label: '📅 Upcoming', count: matchData.upcoming.length },
    { id: 'past', label: '📊 Past', count: matchData.past.length },
    { id: 'stats', label: '📈 Stats', count: null }
  ]

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '2px solid #333'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏆 FIFA Club World Cup 2025
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#cccccc',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Follow all 63 matches from the expanded 32-team tournament across the USA
        </p>
      </section>

      {/* Main Content */}
      <main style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '40px',
          backgroundColor: '#111',
          padding: '8px',
          borderRadius: '12px',
          border: '2px solid #333',
          flexWrap: 'wrap'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: activeTab === tab.id ? '#00ff88' : 'transparent',
                color: activeTab === tab.id ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: 1,
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = 'transparent'
                }
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  marginLeft: '8px',
                  backgroundColor: activeTab === tab.id ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '25px',
              animation: 'bounce 1.5s infinite'
            }}>⚽</div>
            <div style={{
              fontSize: '24px',
              color: '#00ff88',
              fontWeight: 'bold'
            }}>Loading match data...</div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#2d1b1b',
            border: '1px solid #664444',
            borderRadius: '8px',
            padding: '20px',
            color: '#ff6b6b',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Live Matches Tab */}
            {activeTab === 'live' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '30px'
                }}>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#00ff88',
                    margin: 0
                  }}>
                    🔴 Live Matches
                  </h2>
                  <div style={{
                    backgroundColor: '#00ff88',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    Auto-refresh: 30s
                  </div>
                </div>

                {matchData.live.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    backgroundColor: '#111',
                    borderRadius: '12px',
                    border: '2px solid #333'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏸️</div>
                    <div style={{ fontSize: '20px', color: '#888', marginBottom: '8px' }}>
                      No live matches
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Check back during match times for live updates
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px'
                  }}>
                    {matchData.live.map(match => (
                      <MatchCard key={match.id} match={match} showLiveIndicator={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Matches Tab */}
            {activeTab === 'upcoming' && (
              <div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#0099ff',
                  margin: '0 0 30px 0'
                }}>
                  📅 Upcoming Matches
                </h2>

                {matchData.upcoming.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    backgroundColor: '#111',
                    borderRadius: '12px',
                    border: '2px solid #333'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <div style={{ fontSize: '20px', color: '#888' }}>
                      No upcoming matches scheduled
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px'
                  }}>
                    {matchData.upcoming.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Past Matches Tab */}
            {activeTab === 'past' && (
              <div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  margin: '0 0 30px 0'
                }}>
                  📊 Past Results
                </h2>

                {matchData.past.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    backgroundColor: '#111',
                    borderRadius: '12px',
                    border: '2px solid #333'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <div style={{ fontSize: '20px', color: '#888' }}>
                      No completed matches yet
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px'
                  }}>
                    {matchData.past.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && matchData.stats && (
              <div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#8b5cf6',
                  margin: '0 0 30px 0'
                }}>
                  📈 Tournament Statistics
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                  marginBottom: '40px'
                }}>
                  <StatsCard 
                    title="Total Matches" 
                    value={matchData.stats.totalMatches} 
                    subtitle="Across all stages"
                    color="#00ff88"
                  />
                  <StatsCard 
                    title="Live Now" 
                    value={matchData.stats.liveMatches} 
                    subtitle="Currently playing"
                    color="#ef4444"
                  />
                  <StatsCard 
                    title="Upcoming" 
                    value={matchData.stats.upcomingMatches} 
                    subtitle="Scheduled matches"
                    color="#0099ff"
                  />
                  <StatsCard 
                    title="Completed" 
                    value={matchData.stats.completedMatches} 
                    subtitle="Finished matches"
                    color="#888"
                  />
                </div>

                {/* Additional Stats */}
                <div style={{
                  backgroundColor: '#111',
                  border: '2px solid #333',
                  borderRadius: '12px',
                  padding: '30px'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '20px'
                  }}>
                    🏆 Tournament Highlights
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    <div style={{
                      backgroundColor: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #333'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00ff88', marginBottom: '8px' }}>
                        🥅 Top Scorer
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                        {matchData.stats.topScorer.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#888' }}>
                        {matchData.stats.topScorer.goals} goals • {matchData.stats.topScorer.team}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #333'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff6b35', marginBottom: '8px' }}>
                        🔥 Highest Scoring Match
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                        {matchData.stats.mostGoals} Goals
                      </div>
                      <div style={{ fontSize: '14px', color: '#888' }}>
                        Most goals in a single match
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          section h1 {
            font-size: 36px !important;
          }
          
          main h2 {
            font-size: 24px !important;
          }
          
          main > div:first-child {
            flex-direction: column !important;
          }
          
          main > div:first-child button {
            min-width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}