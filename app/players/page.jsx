'use client'

import { useState, useEffect } from 'react'

export default function Players() {
  const [allPlayers, setAllPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [displayedPlayers, setDisplayedPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [playersPerPage] = useState(24)
  const [currentPage, setCurrentPage] = useState(1)
  const [teams, setTeams] = useState([])

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
          totalPlayersCount: apiData.totalCount,
          pagination: apiData.pagination,
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
        
        // Extract unique teams
        const uniqueTeams = [...new Set(playersData.map(p => p.team?.name).filter(Boolean))]
          .sort()
        setTeams(uniqueTeams)
        
        setAllPlayers(playersData)
        setFilteredPlayers(playersData)
        setDisplayedPlayers(playersData.slice(0, playersPerPage))
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

  // Filter and search functionality
  useEffect(() => {
    let filtered = allPlayers

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(playerData => 
        playerData.player?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playerData.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playerData.player?.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply team filter
    if (selectedTeam) {
      filtered = filtered.filter(playerData => playerData.team?.name === selectedTeam)
    }

    // Apply position filter
    if (selectedPosition) {
      filtered = filtered.filter(playerData => playerData.player?.position === selectedPosition)
    }

    setFilteredPlayers(filtered)
    setCurrentPage(1)
    setDisplayedPlayers(filtered.slice(0, playersPerPage))
  }, [searchTerm, selectedTeam, selectedPosition, allPlayers, playersPerPage])

  // Pagination for display
  const handleNextPage = () => {
    const startIndex = currentPage * playersPerPage
    const endIndex = startIndex + playersPerPage
    setDisplayedPlayers(filteredPlayers.slice(0, endIndex))
    setCurrentPage(currentPage + 1)
  }

  const hasMorePlayers = displayedPlayers.length < filteredPlayers.length

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
          <a href="/players" style={{ color: '#ffffff', textDecoration: 'none' }}>Players</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
          <a href="/about" style={{ color: '#888', textDecoration: 'none' }}>About</a>
          <a href="/rewards" style={{ color: '#888', textDecoration: 'none' }}>Rewards</a>
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

        {/* Search and Filter Controls */}
        {!loading && !error && (
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto 40px',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search players, teams, or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '16px',
                minWidth: '300px',
                flex: '1'
              }}
            />
            
            {/* Team Filter */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
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
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            
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
                minWidth: '150px'
              }}
            >
              <option value="">All Positions</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Attacker">Attacker</option>
            </select>
            
            {/* Results Count */}
            <div style={{
              color: '#888',
              fontSize: '14px',
              minWidth: '120px'
            }}>
              {filteredPlayers.length} players
            </div>
          </div>
        )}

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

        {!loading && !error && filteredPlayers.length === 0 && (
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
            }}>No players found matching your criteria</div>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedTeam('')
                setSelectedPosition('')
              }}
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
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && displayedPlayers.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              {displayedPlayers.map((playerData, index) => {
                const player = playerData.player
                const team = playerData.team
                const statistics = playerData.statistics
                return (
                  <div 
                    key={player.id || index} 
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
                          color: '#666',
                          marginBottom: '5px'
                        }}>
                          <span style={{ marginRight: '8px' }}>
                            {getCountryFlag(player.nationality)}
                          </span>
                          {player.nationality}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#00ff88',
                          fontWeight: 'bold'
                        }}>
                          <span style={{ marginRight: '8px' }}>⚽</span>
                          {team?.name || 'Unknown Team'}
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
                      {statistics && (
                        <div style={{
                          marginTop: '10px',
                          padding: '8px',
                          backgroundColor: '#1a1a1a',
                          borderRadius: '6px',
                          fontSize: '12px',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '5px'
                        }}>
                          <div><strong>Goals:</strong> {statistics.goals || 0}</div>
                          <div><strong>Assists:</strong> {statistics.assists || 0}</div>
                          <div><strong>Games:</strong> {statistics.games || 0}</div>
                          {statistics.rating && (
                            <div><strong>Rating:</strong> {parseFloat(statistics.rating).toFixed(1)}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMorePlayers && (
              <div style={{
                textAlign: 'center',
                marginTop: '40px'
              }}>
                <button 
                  onClick={handleNextPage}
                  style={{
                    backgroundColor: '#00ff88',
                    color: '#000',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
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
                  Load More Players ({filteredPlayers.length - displayedPlayers.length} remaining)
                </button>
              </div>
            )}

            {/* Stats Summary */}
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
                Tournament Overview
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                    {allPlayers.length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888' }}>Total Players</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0099ff' }}>
                    {teams.length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888' }}>Teams</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b35' }}>
                    {allPlayers.filter(p => p.player?.position === 'Goalkeeper').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888' }}>Goalkeepers</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                    {allPlayers.filter(p => p.player?.position === 'Attacker').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888' }}>Attackers</div>
                </div>
              </div>
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