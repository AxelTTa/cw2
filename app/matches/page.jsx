'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMatches()
  }, [filter])

  async function fetchMatches() {
    try {
      setLoading(true)
      setError(null)
      
      const statusParam = filter !== 'all' ? `?status=${filter}` : ''
      const response = await fetch(`/api/matches${statusParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`)
      }
      
      const apiData = await response.json()
      setMatches(apiData.matches || [])
      
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Failed to load matches. Please try again later.')
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

  const getStatusText = (status) => {
    switch (status) {
      case 'live': return 'LIVE'
      case 'ft': return 'FINISHED'
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
    if (diffDays > 0) return `In ${diffDays} days`
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    
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

      {/* Main Content */}
      <main className="mobile-main" style={{ padding: '40px 20px' }}>
        <h1 className="mobile-page-title" style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#00ff88'
        }}>
          Matches ⚽
        </h1>

        {/* Filter Controls */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {['all', 'live', 'recent', 'upcoming'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              style={{
                backgroundColor: filter === filterOption ? '#00ff88' : 'transparent',
                color: filter === filterOption ? '#000' : '#fff',
                border: `1px solid ${filter === filterOption ? '#00ff88' : '#444'}`,
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
          }}>
            Loading matches...
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#2d1b1b',
            border: '1px solid #664444',
            borderRadius: '8px',
            padding: '20px',
            color: '#ff6b6b',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Matches Grid */}
        {!loading && !error && (
          <div className="mobile-matches-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {matches.map((match) => (
              <a
                key={match.id}
                href={`/matches/${match.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    borderColor: '#00ff88'
                  }
                }}>
                  {/* Match Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      color: getStatusColor(match.status),
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {getStatusText(match.status)}
                    </div>
                    <div style={{
                      color: '#888',
                      fontSize: '12px'
                    }}>
                      {formatDate(match.date)}
                    </div>
                  </div>

                  {/* Teams and Score */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    {/* Home Team */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flex: 1
                    }}>
                      <img 
                        src={match.homeTeam.logo} 
                        alt={match.homeTeam.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px'
                        }}
                      />
                      <div>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {match.homeTeam.name}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#00ff88'
                    }}>
                      {match.status === 'ns' ? (
                        <span style={{ color: '#888', fontSize: '14px' }}>
                          {new Date(match.date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      ) : (
                        <>
                          <span>{match.score.home}</span>
                          <span style={{ color: '#888', fontSize: '16px' }}>-</span>
                          <span>{match.score.away}</span>
                        </>
                      )}
                    </div>

                    {/* Away Team */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flex: 1,
                      justifyContent: 'flex-end'
                    }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {match.awayTeam.name}
                        </div>
                      </div>
                      <img 
                        src={match.awayTeam.logo} 
                        alt={match.awayTeam.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Match Info */}
                  <div style={{
                    borderTop: '1px solid #333',
                    paddingTop: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    <span>{match.round}</span>
                    <span>{match.venue}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && matches.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#888'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>No matches found</div>
            <div style={{ fontSize: '14px' }}>Try changing the filter or check back later</div>
          </div>
        )}
      </main>

      <style jsx>{`
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .mobile-main {
            padding: 20px 15px !important;
          }
          
          .mobile-matches-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .mobile-match-card {
            padding: 15px !important;
          }
          
          .mobile-page-title {
            font-size: 32px !important;
          }
          
          .mobile-filters {
            flex-direction: column !important;
            gap: 10px !important;
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