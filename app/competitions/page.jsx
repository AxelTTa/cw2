'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import CompetitionBracket from '../components/CompetitionBracket'

export default function Competitions() {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCompetition, setSelectedCompetition] = useState(null)

  useEffect(() => {
    fetchCompetitions()
  }, [])

  async function fetchCompetitions() {
    try {
      setLoading(true)
      setError(null)
      
      // For now, we'll create mock data based on the Club World Cup structure
      // In a real implementation, this would fetch from an API
      const mockCompetitions = [
        {
          id: 'club-world-cup-2025',
          name: 'FIFA Club World Cup 2025',
          logo: 'https://media.api-sports.io/football/leagues/15.png',
          description: 'The pinnacle of club football competition featuring the world\'s best teams',
          status: 'ongoing',
          startDate: '2025-06-15',
          endDate: '2025-07-13',
          location: 'United States',
          teams: 32,
          currentStage: 'Group Stage',
          prize: '$100M',
          features: ['Live Streaming', 'Fantasy League', 'Player Stats', 'Fan Predictions'],
          recentMatches: 5,
          upcomingMatches: 12,
          totalMatches: 63
        },
        {
          id: 'champions-league-2024',
          name: 'UEFA Champions League 2024/25',
          logo: 'https://media.api-sports.io/football/leagues/2.png',
          description: 'Europe\'s premier club competition',
          status: 'ongoing',
          startDate: '2024-09-17',
          endDate: '2025-05-31',
          location: 'Europe',
          teams: 36,
          currentStage: 'League Phase',
          prize: '€2.03B',
          features: ['Live Commentary', 'Advanced Analytics', 'Player Tracking'],
          recentMatches: 8,
          upcomingMatches: 18,
          totalMatches: 189
        },
        {
          id: 'copa-libertadores-2024',
          name: 'CONMEBOL Libertadores 2024',
          logo: 'https://media.api-sports.io/football/leagues/13.png',
          description: 'South America\'s most prestigious club tournament',
          status: 'completed',
          startDate: '2024-02-06',
          endDate: '2024-11-30',
          location: 'South America',
          teams: 47,
          currentStage: 'Final',
          prize: '$23M',
          features: ['Historical Data', 'Match Replays', 'Statistics'],
          recentMatches: 3,
          upcomingMatches: 0,
          totalMatches: 125
        },
        {
          id: 'afc-champions-league-2024',
          name: 'AFC Champions League Elite 2024/25',
          logo: 'https://media.api-sports.io/football/leagues/1.png',
          description: 'Asia\'s premier continental club football competition',
          status: 'ongoing',
          startDate: '2024-09-16',
          endDate: '2025-05-03',
          location: 'Asia',
          teams: 24,
          currentStage: 'League Stage',
          prize: '$12M',
          features: ['Multi-language Support', 'Regional Coverage'],
          recentMatches: 6,
          upcomingMatches: 15,
          totalMatches: 96
        }
      ]
      
      setCompetitions(mockCompetitions)
      
    } catch (err) {
      console.error('Error fetching competitions:', err)
      setError('Failed to load competitions. Please try again later.')
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

  const getStatusText = (status) => {
    switch (status) {
      case 'ongoing': return 'ONGOING'
      case 'upcoming': return 'UPCOMING'
      case 'completed': return 'COMPLETED'
      default: return status.toUpperCase()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          background: 'linear-gradient(45deg, #00ff88, #0099ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏆 Global Competitions
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#cccccc',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Follow the world's most prestigious football competitions and tournaments
        </p>
      </section>

      {/* Main Content */}
      <main className="mobile-main" style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Loading/Error States */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#888'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px',
              animation: 'bounce 1.5s infinite'
            }}>🏆</div>
            <div style={{ fontSize: '20px' }}>Loading competitions...</div>
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

        {/* Competitions Grid */}
        {!loading && !error && (
          <div className="mobile-competitions-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {competitions.map((competition) => (
              <div
                key={competition.id}
                style={{
                  backgroundColor: '#111',
                  border: '2px solid #333',
                  borderRadius: '16px',
                  padding: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = getStatusColor(competition.status)
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = `0 15px 35px ${getStatusColor(competition.status)}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <img
                    src={competition.logo}
                    alt={competition.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      border: '2px solid #333'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        margin: 0,
                        color: '#ffffff'
                      }}>
                        {competition.name}
                      </h3>
                      <span style={{
                        color: getStatusColor(competition.status),
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: `${getStatusColor(competition.status)}20`,
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {getStatusText(competition.status)}
                      </span>
                    </div>
                    <p style={{
                      color: '#888',
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {competition.description}
                    </p>
                  </div>
                </div>

                {/* Competition Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Teams</div>
                    <div style={{ color: '#00ff88', fontSize: '18px', fontWeight: 'bold' }}>
                      {competition.teams}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Prize Pool</div>
                    <div style={{ color: '#0099ff', fontSize: '18px', fontWeight: 'bold' }}>
                      {competition.prize}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Location</div>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                      {competition.location}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Current Stage</div>
                    <div style={{ color: '#ff6b35', fontSize: '14px', fontWeight: 'bold' }}>
                      {competition.currentStage}
                    </div>
                  </div>
                </div>

                {/* Match Statistics */}
                <div style={{
                  backgroundColor: '#0a0a0a',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{ color: '#888', fontSize: '14px' }}>Match Progress</span>
                    <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                      {competition.totalMatches - competition.upcomingMatches}/{competition.totalMatches}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#333',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${((competition.totalMatches - competition.upcomingMatches) / competition.totalMatches) * 100}%`,
                      height: '100%',
                      backgroundColor: getStatusColor(competition.status),
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>

                {/* Features */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    color: '#888',
                    fontSize: '12px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Features
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    {competition.features.map((feature, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#333',
                          color: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCompetition(competition)
                    }}
                    style={{
                      backgroundColor: '#ff6b35',
                      color: '#000',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      flex: 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)'
                      e.target.style.backgroundColor = '#e55a2b'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.backgroundColor = '#ff6b35'
                    }}
                  >
                    🏆 View Bracket
                  </button>
                  <a
                    href="/matches"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: getStatusColor(competition.status),
                      color: '#000',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      flex: 1,
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                    }}
                  >
                    View Matches
                  </a>
                  <a
                    href="/live"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      border: '1px solid #444',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#ffffff'
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#444'
                      e.target.style.backgroundColor = 'transparent'
                    }}
                  >
                    Live Matches
                  </a>
                </div>

                {/* Tournament Dates */}
                <div style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <span>{formatDate(competition.startDate)}</span>
                  <span>→</span>
                  <span>{formatDate(competition.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && competitions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#888'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>No competitions found</div>
            <div style={{ fontSize: '14px' }}>Check back later for upcoming tournaments</div>
          </div>
        )}

        {/* Competition Bracket Section */}
        {selectedCompetition && (
          <div style={{
            marginTop: '40px',
            padding: '30px',
            backgroundColor: '#111',
            borderRadius: '16px',
            border: '2px solid #333'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h2 style={{
                color: '#fff',
                fontSize: '28px',
                fontWeight: 'bold',
                margin: 0
              }}>
                {selectedCompetition.name} - Tournament Info
              </h2>
              <button
                onClick={() => setSelectedCompetition(null)}
                style={{
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ✕ Close
              </button>
            </div>
            <CompetitionBracket 
              competition={selectedCompetition}
              onClose={() => setSelectedCompetition(null)}
            />
          </div>
        )}
      </main>

      {/* Additional Styles */}
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

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .mobile-main {
            padding: 20px 15px !important;
          }
          
          .mobile-competitions-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .mobile-competition-card {
            padding: 20px !important;
          }
          
          .mobile-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          
          .mobile-page-title {
            font-size: 32px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-page-title {
            font-size: 28px !important;
          }
        }
      `}</style>
    </div>
  )
}