'use client'

import { useState, useEffect } from 'react'

export default function TeamDetail({ params }) {
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState('')

  useEffect(() => {
    if (params?.id) {
      fetchTeamDetails()
    }
  }, [params?.id])

  const fetchTeamDetails = async () => {
    try {
      console.log('🚀 Frontend: Fetching team details for ID:', params.id)
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/teams/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team details: ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('✅ Frontend: Team details loaded:', {
        teamName: data.team?.name,
        playersCount: data.players?.length || 0,
        timestamp: data.timestamp
      })
      
      setTeam(data.team)
      setPlayers(data.players || [])
    } catch (err) {
      console.error('❌ Frontend: Error loading team details:', err)
      setError('Failed to load team details')
    } finally {
      setLoading(false)
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
      'South-Korea': '🇰🇷',
      'Morocco': '🇲🇦',
      'Egypt': '🇪🇬',
      'Australia': '🇦🇺',
      'Saudi Arabia': '🇸🇦',
      'Saudi-Arabia': '🇸🇦',
      'Uruguay': '🇺🇾',
      'Colombia': '🇨🇴',
      'Chile': '🇨🇱',
      'Peru': '🇵🇪',
      'Ecuador': '🇪🇨',
      'Portugal': '🇵🇹',
      'Austria': '🇦🇹',
      'Tunisia': '🇹🇳',
      'New Zealand': '🇳🇿',
      'New-Zealand': '🇳🇿',
      'South Africa': '🇿🇦',
      'South-Africa': '🇿🇦',
      'United Arab Emirates': '🇦🇪'
    }
    return flagMap[country] || '🏳️'
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

  const getPositionEmoji = (position) => {
    const positionEmojis = {
      'Goalkeeper': '🥅',
      'Defender': '🛡️',
      'Midfielder': '⚡',
      'Attacker': '⚽'
    }
    return positionEmojis[position] || '🏃'
  }

  const filteredPlayers = selectedPosition 
    ? players.filter(player => player.position === selectedPosition)
    : players

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading team details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '18px', color: '#ef4444', marginBottom: '20px' }}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
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
            Try Again
          </button>
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
          <a href="/live" style={{ color: '#888', textDecoration: 'none' }}>Live</a>
          <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#ffffff', textDecoration: 'none' }}>Teams</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
          <a href="/about" style={{ color: '#888', textDecoration: 'none' }}>About</a>
          <a href="/rewards" style={{ color: '#888', textDecoration: 'none' }}>Rewards</a>
        </nav>
      </header>

      <main style={{ padding: '40px 20px' }}>
        {/* Team Header */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 40px',
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '40px'
        }}>
          <img 
            src={team?.logo} 
            alt={`${team?.name} logo`}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain'
            }}
          />
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '700',
              marginBottom: '15px',
              background: 'linear-gradient(45deg, #00ff88, #0099ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {team?.name}
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontSize: '18px',
              color: '#888',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{getCountryFlag(team?.country)}</span>
                <span>{team?.country}</span>
              </div>
              {team?.founded && (
                <div>Founded: {team.founded}</div>
              )}
              {team?.code && (
                <div style={{
                  backgroundColor: '#00ff88',
                  color: '#000',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {team.code}
                </div>
              )}
            </div>
            {team?.venue && (
              <div style={{
                fontSize: '16px',
                color: '#ccc',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div>🏟️ {team.venue.name}</div>
                {team.venue.city && <div>📍 {team.venue.city}</div>}
                {team.venue.capacity && <div>👥 {team.venue.capacity.toLocaleString()} capacity</div>}
              </div>
            )}
          </div>
        </div>

        {/* Squad Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              Squad ({filteredPlayers.length} players)
            </h2>
            
            {/* Position Filter */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '16px',
                minWidth: '200px'
              }}
            >
              <option value="">All Positions</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Attacker">Attacker</option>
            </select>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {filteredPlayers.map((player) => (
              <div 
                key={player.id} 
                style={{
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => window.location.href = `/players/${player.id}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = getPositionColor(player.position)
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = '#333'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  {player.photo && (
                    <img 
                      src={player.photo} 
                      alt={`${player.name} photo`}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        marginRight: '15px',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      color: '#ffffff'
                    }}>
                      {player.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: getPositionColor(player.position),
                      marginBottom: '5px'
                    }}>
                      <span style={{ marginRight: '8px' }}>
                        {getPositionEmoji(player.position)}
                      </span>
                      {player.position}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      <span style={{ marginRight: '8px' }}>
                        {getCountryFlag(player.nationality)}
                      </span>
                      {player.nationality}
                    </div>
                  </div>
                  {player.number && (
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#00ff88',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      #{player.number}
                    </div>
                  )}
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: '#888',
                  lineHeight: '1.4'
                }}>
                  {player.age && (
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Age:</strong> {player.age}
                    </div>
                  )}
                  {player.height && (
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Height:</strong> {player.height}
                    </div>
                  )}
                  {player.weight && (
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Weight:</strong> {player.weight}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
              <div style={{ fontSize: '18px', color: '#888' }}>
                No players found for the selected position
              </div>
              <button 
                onClick={() => setSelectedPosition('')}
                style={{
                  marginTop: '20px',
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
                Show All Players
              </button>
            </div>
          )}

          {/* Squad Statistics */}
          <div style={{
            marginTop: '40px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '30px'
          }}>
            <h3 style={{ 
              marginBottom: '20px', 
              color: '#ffffff',
              fontSize: '24px'
            }}>
              Squad Statistics
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                  {players.length}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>Total Players</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b35' }}>
                  {players.filter(p => p.position === 'Goalkeeper').length}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>Goalkeepers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0099ff' }}>
                  {players.filter(p => p.position === 'Defender').length}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>Defenders</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                  {players.filter(p => p.position === 'Midfielder').length}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>Midfielders</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                  {players.filter(p => p.position === 'Attacker').length}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>Attackers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#888' }}>
                  {players.length > 0 ? Math.round(players.reduce((sum, p) => sum + (p.age || 0), 0) / players.length) : 0}
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>Avg Age</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}