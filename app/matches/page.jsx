'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import LiveChat from '../components/LiveChat'

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
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedMatchForChat, setSelectedMatchForChat] = useState(null)

  useEffect(() => {
    fetchAllMatchData()
    getCurrentUser()
    // Auto-refresh every 30 seconds for live matches
    const interval = setInterval(() => {
      if (activeTab === 'live') {
        fetchLiveMatches()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getCurrentUser = () => {
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }

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

  const MatchCard = ({ match, showLiveIndicator = false, isUpcoming = false }) => (
    <div
      style={{
        backgroundColor: '#111',
        border: showLiveIndicator && match.status !== 'ns' && match.status !== 'ft' ? '2px solid #00ff88' : '2px solid #333',
        borderRadius: '12px',
        padding: '20px',
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
          flex: 1,
          minWidth: 0
        }}>
          <img 
            src={match.homeTeam?.logo || match.home_team_logo} 
            alt={match.homeTeam?.name || match.home_team}
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              borderRadius: '4px',
              flexShrink: 0
            }}
          />
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0
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
          justifyContent: 'flex-end',
          minWidth: 0
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            textAlign: 'right'
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
              borderRadius: '4px',
              flexShrink: 0
            }}
          />
        </div>
      </div>

      {/* Match details and actions */}
      <div style={{
        borderTop: '1px solid #333',
        paddingTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#888'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>{match.round || match.league || 'Club World Cup'}</span>
          <span>{match.venue || 'TBA'}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Chat button for upcoming matches */}
          {isUpcoming && match.status === 'ns' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedMatchForChat(match)
              }}
              style={{
                backgroundColor: '#0099ff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0088cc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0099ff'}
            >
              💬 Chat
            </button>
          )}
          
          {/* View match button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `/matches/${match.id}`
            }}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >
            View Details
          </button>
        </div>
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px'
                  }}>
                    {matchData.upcoming.map(match => (
                      <MatchCard key={match.id} match={match} isUpcoming={true} />
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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

      {/* Chat Modal */}
      {selectedMatchForChat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0a0a0a',
            borderRadius: '12px',
            border: '2px solid #333',
            width: '100%',
            maxWidth: '900px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Chat Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#00ff88',
                  margin: '0 0 8px 0'
                }}>
                  Live Chat: {selectedMatchForChat.homeTeam?.name || selectedMatchForChat.home_team} vs {selectedMatchForChat.awayTeam?.name || selectedMatchForChat.away_team}
                </h2>
                <div style={{
                  fontSize: '14px',
                  color: '#888'
                }}>
                  {formatDate(selectedMatchForChat.date || selectedMatchForChat.match_date)} • {selectedMatchForChat.venue || 'TBA'}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedMatchForChat(null)}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#666'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#444'}
              >
                ✕ Close
              </button>
            </div>

            {/* Chat Content */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflow: 'hidden'
            }}>
              <LiveChat 
                matchId={selectedMatchForChat.id || selectedMatchForChat.external_id} 
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      )}

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
            font-size: 24px !important;
            margin-bottom: 10px !important;
            line-height: 1.2;
            word-wrap: break-word;
            padding: 0 10px;
          }
          
          section p {
            font-size: 14px !important;
            margin-bottom: 20px !important;
            padding: 0 10px;
          }
          
          .tab-container {
            padding: 0 5px !important;
            margin-bottom: 15px !important;
            overflow-x: auto;
          }
          
          .tab-button {
            padding: 8px 12px !important;
            font-size: 12px !important;
            margin-right: 5px !important;
            white-space: nowrap;
          }
          
          .match-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            padding: 0 5px !important;
          }
          
          .match-card {
            padding: 12px 8px !important;
            margin: 0 !important;
          }
          
          .team-info {
            min-width: auto !important;
            flex: 1 !important;
          }
          
          .team-name {
            font-size: 12px !important;
            line-height: 1.2 !important;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .team-logo {
            width: 30px !important;
            height: 30px !important;
          }
          
          .match-score {
            font-size: 16px !important;
            padding: 0 5px !important;
          }
          
          .match-status {
            font-size: 10px !important;
            padding: 3px 6px !important;
          }
          
          .match-details {
            font-size: 10px !important;
            flex-direction: column !important;
            gap: 3px !important;
          }
          
          .match-actions {
            gap: 5px !important;
            flex-direction: column !important;
          }
          
          .action-button {
            width: 100% !important;
            padding: 6px 8px !important;
            font-size: 10px !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            padding: 0 5px !important;
          }
          
          .stats-card {
            padding: 12px 8px !important;
          }
          
          .chat-modal {
            padding: 5px !important;
          }
          
          .chat-modal-content {
            width: 98% !important;
            height: 95vh !important;
            max-width: 98vw !important;
          }
          
          .chat-header {
            padding: 10px !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .chat-title {
            font-size: 14px !important;
            text-align: center !important;
            word-wrap: break-word !important;
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