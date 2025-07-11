'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../components/Header'

export default function MatchDetail() {
  const params = useParams()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (params.id) {
      fetchMatchDetail()
    }
  }, [params.id])

  async function fetchMatchDetail() {
    try {
      setLoading(true)
      setError(null)
      
      // First get all matches and find the specific one
      const response = await fetch('/api/matches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`)
      }
      
      const apiData = await response.json()
      const matches = apiData.matches || []
      
      const foundMatch = matches.find(m => m.id.toString() === params.id)
      
      if (!foundMatch) {
        throw new Error('Match not found')
      }
      
      setMatch(foundMatch)
      
    } catch (err) {
      console.error('Error fetching match detail:', err)
      setError('Failed to load match details. Please try again later.')
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          Loading match details...
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#2d1b1b',
          border: '1px solid #664444',
          borderRadius: '8px',
          padding: '40px',
          color: '#ff6b6b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Match not found</div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            The match you're looking for doesn't exist or has been removed.
          </div>
          <a href="/matches" style={{
            display: 'inline-block',
            marginTop: '20px',
            backgroundColor: '#00ff88',
            color: '#000',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Back to Matches
          </a>
        </div>
      </div>
    )
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
      <main style={{ padding: '40px 20px' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '30px' }}>
          <a href="/matches" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#888',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Back to Matches
          </a>
        </div>

        {/* Match Header */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          {/* Status and Date */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <div style={{
              color: getStatusColor(match.status),
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: `${getStatusColor(match.status)}15`,
              padding: '6px 12px',
              borderRadius: '6px'
            }}>
              {getStatusText(match.status)}
            </div>
            <div style={{
              color: '#888',
              fontSize: '14px'
            }}>
              {formatDate(match.date)}
            </div>
          </div>

          {/* Teams and Score */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '40px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Home Team */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <img 
                src={match.homeTeam.logo} 
                alt={match.homeTeam.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px'
                }}
              />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {match.homeTeam.name}
                </div>
                <div style={{
                  color: '#888',
                  fontSize: '14px'
                }}>
                  Home
                </div>
              </div>
            </div>

            {/* Score */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              {match.status === 'ns' ? (
                <div style={{
                  fontSize: '18px',
                  color: '#888'
                }}>
                  VS
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#00ff88'
                }}>
                  <span>{match.score.home}</span>
                  <span style={{ color: '#888', fontSize: '24px' }}>-</span>
                  <span>{match.score.away}</span>
                </div>
              )}
              
              {match.status === 'ns' && (
                <div style={{
                  color: '#0099ff',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {new Date(match.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <img 
                src={match.awayTeam.logo} 
                alt={match.awayTeam.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px'
                }}
              />
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {match.awayTeam.name}
                </div>
                <div style={{
                  color: '#888',
                  fontSize: '14px'
                }}>
                  Away
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Information */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Tournament Info */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#00ff88'
            }}>
              Tournament
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Competition:</span>
                <span>{match.league}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Round:</span>
                <span>{match.round}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Season:</span>
                <span>{match.season}</span>
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#00ff88'
            }}>
              Match Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Venue:</span>
                <span>{match.venue}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Status:</span>
                <span style={{ color: getStatusColor(match.status) }}>
                  {match.statusLong}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Match ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  {match.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a href={`/teams/${match.homeTeam.id}`} style={{
            backgroundColor: '#00ff88',
            color: '#000',
            padding: '12px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            View {match.homeTeam.name}
          </a>
          <a href={`/teams/${match.awayTeam.id}`} style={{
            backgroundColor: '#0099ff',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            View {match.awayTeam.name}
          </a>
          <a href="/matches" style={{
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #444',
            padding: '12px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            All Matches
          </a>
        </div>
      </main>
    </div>
  )
}