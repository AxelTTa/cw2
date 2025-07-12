'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function Overview() {
  const [data, setData] = useState({
    topPlayers: [],
    competitions: [],
    topTeams: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetchAllData()
    setIsVisible(true)
  }, [])

  async function fetchAllData() {
    try {
      setLoading(true)
      setError(null)

      // Fetch top players
      const playersResponse = await fetch('/api/players?limit=6')
      const playersData = await playersResponse.json()
      
      // Fetch teams
      const teamsResponse = await fetch('/api/teams?limit=6')
      const teamsData = await teamsResponse.json()

      // Mock competitions data (could be fetched from API)
      const competitions = [
        {
          id: 'club-world-cup-2025',
          name: 'FIFA Club World Cup 2025',
          logo: 'https://media.api-sports.io/football/leagues/15.png',
          status: 'ongoing',
          teams: 32,
          currentStage: 'Group Stage'
        },
        {
          id: 'champions-league-2024',
          name: 'UEFA Champions League 2024/25',
          logo: 'https://media.api-sports.io/football/leagues/2.png',
          status: 'ongoing',
          teams: 36,
          currentStage: 'League Phase'
        },
        {
          id: 'copa-libertadores-2024',
          name: 'CONMEBOL Libertadores 2024',
          logo: 'https://media.api-sports.io/football/leagues/13.png',
          status: 'completed',
          teams: 47,
          currentStage: 'Final'
        }
      ]

      setData({
        topPlayers: playersData.players?.slice(0, 6) || [],
        competitions: competitions,
        topTeams: teamsData.teams?.slice(0, 6) || []
      })
    } catch (err) {
      console.error('Error loading overview data:', err)
      setError('Failed to load overview data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return '#00ff88'
      case 'upcoming': return '#0099ff'
      case 'completed': return '#888'
      default: return '#888'
    }
  }

  const getCountryFlag = (country) => {
    const flagMap = {
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Spain': '🇪🇸',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷',
      'USA': '🇺🇸',
      'Mexico': '🇲🇽',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'Morocco': '🇲🇦'
    }
    return flagMap[country] || '🌍'
  }

  const getPositionColor = (position) => {
    const positionColors = {
      'Goalkeeper': '#ff6b35',
      'Defender': '#0099ff',
      'Midfielder': '#00ff88',
      'Attacker': '#ef4444'
    }
    return positionColors[position] || '#888'
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
          🌟 Football Overview
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#cccccc',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Discover elite players, top competitions, and world-class teams
        </p>
      </section>

      {/* Main Content */}
      <main style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
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
            }}>Loading overview...</div>
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
          <div style={{ display: 'grid', gap: '50px' }}>
            
            {/* Top Competitions Section */}
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#00ff88',
                  margin: 0
                }}>
                  🏆 Key Competitions
                </h2>
                <a
                  href="/competitions"
                  style={{
                    backgroundColor: '#00ff88',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
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
                  View All Competitions →
                </a>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {data.competitions.map((competition) => (
                  <div
                    key={competition.id}
                    style={{
                      backgroundColor: '#111',
                      border: '2px solid #333',
                      borderRadius: '12px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = getStatusColor(competition.status)
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    onClick={() => window.location.href = '/competitions'}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      marginBottom: '16px'
                    }}>
                      <img
                        src={competition.logo}
                        alt={competition.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '6px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          margin: '0 0 4px 0',
                          color: '#ffffff'
                        }}>
                          {competition.name}
                        </h3>
                        <span style={{
                          color: getStatusColor(competition.status),
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: `${getStatusColor(competition.status)}20`,
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          {competition.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: '#888'
                    }}>
                      <span>{competition.teams} teams</span>
                      <span>{competition.currentStage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Players Section */}
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#0099ff',
                  margin: 0
                }}>
                  ⭐ Elite Players
                </h2>
                <a
                  href="/players"
                  style={{
                    backgroundColor: '#0099ff',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0088cc'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#0099ff'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  View All Players →
                </a>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {data.topPlayers.map((playerData, index) => {
                  const player = playerData.player
                  const team = playerData.team
                  const statistics = playerData.statistics
                  return (
                    <div
                      key={player.id || index}
                      style={{
                        backgroundColor: '#111',
                        border: '2px solid #333',
                        borderRadius: '12px',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = getPositionColor(player.position)
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#333'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                      onClick={() => window.location.href = `/players/${player.id}`}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        {player.photo && (
                          <img
                            src={player.photo}
                            alt={`${player.name} photo`}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              marginRight: '16px',
                              objectFit: 'cover',
                              border: `2px solid ${getPositionColor(player.position)}`
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            color: '#ffffff'
                          }}>
                            {player.name}
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '4px'
                          }}>
                            <span style={{ marginRight: '8px', fontSize: '16px' }}>
                              {getCountryFlag(player.nationality)}
                            </span>
                            {player.nationality}
                            {player.age && <span style={{ marginLeft: '8px' }}>• {player.age}y</span>}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: getPositionColor(player.position),
                            fontWeight: 'bold'
                          }}>
                            {player.position}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        color: '#888'
                      }}>
                        <span style={{ color: '#00ff88' }}>{team?.name || 'Unknown Team'}</span>
                        {statistics && (
                          <span style={{ color: '#ff6b35' }}>
                            {statistics.goals || 0}G • {statistics.assists || 0}A
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Top Teams Section */}
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  margin: 0
                }}>
                  🏟️ Top Teams
                </h2>
                <a
                  href="/teams"
                  style={{
                    backgroundColor: '#ff6b35',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e55a2b'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ff6b35'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  View All Teams →
                </a>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {data.topTeams.map((teamData, index) => {
                  const team = teamData.team
                  return (
                    <div
                      key={team.id || index}
                      style={{
                        backgroundColor: '#111',
                        border: '2px solid #333',
                        borderRadius: '12px',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ff6b35'
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#333'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                      onClick={() => window.location.href = `/teams/${team.id}`}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt={`${team.name} logo`}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              marginRight: '16px',
                              objectFit: 'contain',
                              border: '2px solid #ff6b35'
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            color: '#ffffff'
                          }}>
                            {team.name}
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '14px',
                            color: '#ff6b35',
                            fontWeight: 'bold'
                          }}>
                            <span style={{ marginRight: '8px', fontSize: '18px' }}>
                              {getCountryFlag(team.country)}
                            </span>
                            {team.country}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        color: '#888'
                      }}>
                        {team.founded && <span>Founded {team.founded}</span>}
                        {team.code && <span>{team.code}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
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

        @media (max-width: 768px) {
          section h2 {
            font-size: 24px !important;
          }
          
          section > div:first-child {
            flex-direction: column !important;
            gap: 15px !important;
            align-items: flex-start !important;
          }
          
          section > div:first-child a {
            align-self: center !important;
          }
        }
      `}</style>
    </div>
  )
}