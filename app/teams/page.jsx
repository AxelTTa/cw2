'use client'

import { useState, useEffect } from 'react'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [filteredTeams, setFilteredTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConfederation, setSelectedConfederation] = useState('')

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🚀 Frontend: Starting teams fetch from API...')
        console.log('📅 Frontend: Current time:', new Date().toISOString())
        
        const response = await fetch('/api/teams', {
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
          teamsCount: apiData.count,
          dataKeys: Object.keys(apiData),
          timestamp: apiData.timestamp,
          fullApiData: apiData
        })
        
        const teamsData = apiData.teams
        
        console.log('✅ Frontend: Successfully received teams data:', {
          teamsCount: teamsData?.length || 0,
          firstTeam: teamsData?.[0]?.team?.name || 'None',
          timestamp: new Date().toISOString(),
          fullTeamsData: teamsData,
          teamsDataStructure: teamsData?.length > 0 ? Object.keys(teamsData[0]) : [],
          firstFewTeams: teamsData?.slice(0, 3)
        })
        
        if (!teamsData || teamsData.length === 0) {
          console.warn('⚠️ Frontend: No teams data received')
          setError('No teams found for Club World Cup 2025. The tournament data may not be available yet.')
          return
        }
        
        setTeams(teamsData)
        setFilteredTeams(teamsData)
      } catch (err) {
        console.error('❌ Frontend: Error loading teams:', {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
          errorType: err.constructor.name,
          fullError: err,
          errorString: err.toString()
        })
        
        let errorMessage = 'Failed to load teams. '
        
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
        console.log('🏁 Frontend: Teams fetch completed')
      }
    }

    fetchTeams()
  }, [])

  // Filter teams based on search term and confederation
  useEffect(() => {
    let filtered = teams

    if (searchTerm) {
      filtered = filtered.filter(teamData => 
        teamData.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teamData.team.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedConfederation) {
      filtered = filtered.filter(teamData => {
        const confederation = getConfederation(teamData.team.country)
        return confederation === selectedConfederation
      })
    }

    setFilteredTeams(filtered)
  }, [teams, searchTerm, selectedConfederation])

  const getConfederation = (country) => {
    const confederations = {
      'England': 'UEFA',
      'Spain': 'UEFA',
      'Germany': 'UEFA',
      'France': 'UEFA',
      'Italy': 'UEFA',
      'Portugal': 'UEFA',
      'Netherlands': 'UEFA',
      'Belgium': 'UEFA',
      'Austria': 'UEFA',
      'Norway': 'UEFA',
      'Switzerland': 'UEFA',
      'Turkey': 'UEFA',
      
      'Brazil': 'CONMEBOL',
      'Argentina': 'CONMEBOL',
      'Uruguay': 'CONMEBOL',
      'Colombia': 'CONMEBOL',
      'Chile': 'CONMEBOL',
      'Peru': 'CONMEBOL',
      'Ecuador': 'CONMEBOL',
      
      'USA': 'CONCACAF',
      'Mexico': 'CONCACAF',
      
      'Japan': 'AFC',
      'South Korea': 'AFC',
      'South-Korea': 'AFC',
      'Saudi Arabia': 'AFC',
      'Saudi-Arabia': 'AFC',
      'UAE': 'AFC',
      'United-Arab-Emirates': 'AFC',
      
      'Morocco': 'CAF',
      'Egypt': 'CAF',
      'Tunisia': 'CAF',
      'Algeria': 'CAF',
      'South-Africa': 'CAF',
      
      'Australia': 'OFC',
      'New-Zealand': 'OFC'
    }
    return confederations[country] || 'Other'
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
      'New-Zealand': '🇳🇿',
      'South-Africa': '🇿🇦',
      'United-Arab-Emirates': '🇦🇪'
    }
    return flagMap[country] || '🏳️'
  }

  const getConfederationColor = (country) => {
    const confederations = {
      // UEFA (Europe) - Blue
      'England': '#0099ff',
      'Spain': '#0099ff',
      'Germany': '#0099ff',
      'France': '#0099ff',
      'Italy': '#0099ff',
      'Portugal': '#0099ff',
      'Netherlands': '#0099ff',
      'Belgium': '#0099ff',
      'Austria': '#0099ff',
      'Norway': '#0099ff',
      'Switzerland': '#0099ff',
      'Turkey': '#0099ff',
      
      // CONMEBOL (South America) - Green
      'Brazil': '#00ff88',
      'Argentina': '#00ff88',
      'Uruguay': '#00ff88',
      'Colombia': '#00ff88',
      'Chile': '#00ff88',
      'Peru': '#00ff88',
      'Ecuador': '#00ff88',
      
      // CONCACAF (North/Central America) - Orange
      'USA': '#ff6b35',
      'Mexico': '#ff6b35',
      
      // AFC (Asia) - Purple
      'Japan': '#8b5cf6',
      'South Korea': '#8b5cf6',
      'South-Korea': '#8b5cf6',
      'Saudi Arabia': '#8b5cf6',
      'Saudi-Arabia': '#8b5cf6',
      'UAE': '#8b5cf6',
      'United-Arab-Emirates': '#8b5cf6',
      
      // CAF (Africa) - Red
      'Morocco': '#ef4444',
      'Egypt': '#ef4444',
      'Tunisia': '#ef4444',
      'Algeria': '#ef4444',
      'South-Africa': '#ef4444',
      
      // OFC (Oceania) - Yellow
      'Australia': '#fbbf24',
      'New-Zealand': '#fbbf24'
    }
    return confederations[country] || '#888'
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

      {/* Teams Content */}
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
            FIFA Club World Cup 2025 🏆
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#888',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            All 32 teams competing in the expanded Club World Cup tournament in the USA
          </p>
        </div>

        {/* Search and Filter Controls */}
        {!loading && !error && teams.length > 0 && (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto 40px',
            padding: '20px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px'
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Search Input */}
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Search teams or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    backgroundColor: '#0a0a0a',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Confederation Filter */}
              <div style={{ minWidth: '200px' }}>
                <select
                  value={selectedConfederation}
                  onChange={(e) => setSelectedConfederation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    backgroundColor: '#0a0a0a',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                >
                  <option value="">All Confederations</option>
                  <option value="UEFA">🇪🇺 UEFA (Europe)</option>
                  <option value="CONMEBOL">🌎 CONMEBOL (South America)</option>
                  <option value="CONCACAF">🌎 CONCACAF (North America)</option>
                  <option value="AFC">🌏 AFC (Asia)</option>
                  <option value="CAF">🌍 CAF (Africa)</option>
                  <option value="OFC">🌊 OFC (Oceania)</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedConfederation) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedConfederation('')
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Count */}
            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#888'
            }}>
              Showing {filteredTeams.length} of {teams.length} teams
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
            }}>Loading teams...</div>
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

        {!loading && !error && filteredTeams.length === 0 && teams.length > 0 && (
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
            }}>No teams match your search criteria</div>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedConfederation('')
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

        {!loading && !error && teams.length === 0 && (
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
            }}>No teams found for Club World Cup 2025</div>
          </div>
        )}

        {!loading && !error && filteredTeams.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              {filteredTeams.map((teamData, index) => {
                const team = teamData.team
                const venue = teamData.venue
                return (
                  <div key={team.id || index} style={{
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.location.href = `/teams/${team.id}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = getConfederationColor(team.country)
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
                      {team.logo && (
                        <img 
                          src={team.logo} 
                          alt={`${team.name} logo`}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            marginRight: '15px',
                            objectFit: 'contain'
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
                          {team.name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          color: getConfederationColor(team.country)
                        }}>
                          <span style={{ marginRight: '8px' }}>
                            {getCountryFlag(team.country)}
                          </span>
                          {team.country}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '14px',
                      color: '#888',
                      lineHeight: '1.4'
                    }}>
                      {team.code && (
                        <div style={{ marginBottom: '5px' }}>
                          <strong>Code:</strong> {team.code}
                        </div>
                      )}
                      {team.founded && (
                        <div style={{ marginBottom: '5px' }}>
                          <strong>Founded:</strong> {team.founded}
                        </div>
                      )}
                      {venue && venue.name && (
                        <div>
                          <strong>Stadium:</strong> {venue.name}
                          {venue.capacity && ` (${venue.capacity.toLocaleString()})`}
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
                Tournament Format
              </h2>
              <p style={{ 
                color: '#888', 
                fontSize: '16px', 
                lineHeight: '1.6',
                marginBottom: '15px'
              }}>
                32 teams divided into 8 groups of 4. Top 2 from each group advance to knockout rounds.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                flexWrap: 'wrap',
                fontSize: '14px'
              }}>
                <div style={{ color: '#0099ff' }}>🇪🇺 UEFA: 12 teams</div>
                <div style={{ color: '#00ff88' }}>🌎 CONMEBOL: 6 teams</div>
                <div style={{ color: '#ff6b35' }}>🌎 CONCACAF: 4 teams</div>
                <div style={{ color: '#8b5cf6' }}>🌏 AFC: 4 teams</div>
                <div style={{ color: '#ef4444' }}>🌍 CAF: 4 teams</div>
                <div style={{ color: '#fbbf24' }}>🌊 OFC: 1 team</div>
                <div style={{ color: '#888' }}>🏠 Host: 1 team</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}