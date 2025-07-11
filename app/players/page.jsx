'use client'

import { useState, useEffect } from 'react'

export default function Players() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🚀 Frontend: Starting players fetch from API...')
        console.log('📅 Frontend: Current time:', new Date().toISOString())
        
        const response = await fetch('/api/players', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        console.log('📡 Frontend: API Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        })
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        
        const apiData = await response.json()
        
        console.log('📦 Frontend: API Data parsed:', {
          success: apiData.success,
          playersCount: apiData.count,
          dataKeys: Object.keys(apiData),
          timestamp: apiData.timestamp,
          fullApiData: apiData
        })
        
        const playersData = apiData.players
        
        console.log('✅ Frontend: Successfully received players data:', {
          playersCount: playersData?.length || 0,
          firstPlayer: playersData?.[0]?.player?.name || 'None',
          timestamp: new Date().toISOString(),
          fullPlayersData: playersData,
          playersDataStructure: playersData?.length > 0 ? Object.keys(playersData[0]) : [],
          firstFewPlayers: playersData?.slice(0, 3)
        })
        
        if (!playersData || playersData.length === 0) {
          console.warn('⚠️ Frontend: No players data received')
          setError('No players found for Club World Cup 2025. The tournament data may not be available yet.')
          return
        }
        
        setPlayers(playersData)
      } catch (err) {
        console.error('❌ Frontend: Error loading players:', {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
          errorType: err.constructor.name,
          fullError: err,
          errorString: err.toString()
        })
        
        let errorMessage = 'Failed to load players. '
        
        if (err.message.includes('API request failed')) {
          errorMessage += 'Backend API request failed. Please check the server logs.'
        } else if (err.message.includes('fetch')) {
          errorMessage += 'Network error connecting to backend. Please check your connection.'
        } else {
          errorMessage += 'Please try again later.'
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
        console.log('🏁 Frontend: Players fetch completed')
      }
    }

    fetchPlayers()
  }, [])

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
      'New-Zealand': '🇳🇿',
      'South-Africa': '🇿🇦',
      'United-Arab-Emirates': '🇦🇪'
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
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00ff88'
        }}>
          ChilizWinner
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/players" style={{ color: '#ffffff', textDecoration: 'none' }}>Players</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
        </nav>
      </header>

      {/* Players Content */}
      <main style={{ padding: '40px 20px' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '15px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FIFA Club World Cup 2025 Players ⭐
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#888',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            All players from the 32 teams competing in the expanded Club World Cup tournament
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
            }}>Loading players...</div>
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
        )}

        {!loading && !error && players.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>🔍</div>
            <div style={{
              fontSize: '18px',
              color: '#888'
            }}>No players found for Club World Cup 2025</div>
          </div>
        )}

        {!loading && !error && players.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              {players.map((playerData, index) => {
                const player = playerData.player
                const statistics = playerData.statistics?.[0]
                return (
                  <div key={player.id || index} style={{
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = getPositionColor(player.position)
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#333'
                  }}>
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
                      {statistics?.team?.name && (
                        <div style={{
                          marginTop: '10px',
                          padding: '8px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}>
                          <strong>Team:</strong> {statistics.team.name}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '60px',
              padding: '30px',
              backgroundColor: '#111',
              borderRadius: '12px',
              border: '1px solid #333',
              maxWidth: '800px',
              margin: '60px auto 0'
            }}>
              <h2 style={{ 
                marginBottom: '15px', 
                color: '#ffffff',
                fontSize: '24px'
              }}>
                Position Guide
              </h2>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                flexWrap: 'wrap',
                fontSize: '14px'
              }}>
                <div style={{ color: '#ff6b35' }}>🥅 Goalkeeper</div>
                <div style={{ color: '#0099ff' }}>🛡️ Defender</div>
                <div style={{ color: '#00ff88' }}>⚡ Midfielder</div>
                <div style={{ color: '#ef4444' }}>⚽ Attacker</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}