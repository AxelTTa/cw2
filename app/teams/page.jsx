'use client'

import { useState, useEffect } from 'react'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [filteredTeams, setFilteredTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConfederation, setSelectedConfederation] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [floatingFlags, setFloatingFlags] = useState([])
  const [searchFocused, setSearchFocused] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    fetchTeams()
    setIsVisible(true)
    
    // Floating flags animation
    const flagsInterval = setInterval(() => {
      const newFlag = {
        id: Date.now(),
        emoji: ['🏆', '⚽', '🥇', '🎯', '🔥', '⭐', '👑', '💎', '🌟', '🏅'][Math.floor(Math.random() * 10)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4,
        speed: 14 + Math.random() * 10
      }
      setFloatingFlags(prev => [...prev.slice(-10), newFlag])
    }, 3200)

    return () => clearInterval(flagsInterval)
  }, [])

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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes floatFlag {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-45px) rotate(120deg); opacity: 0.8; }
          50% { transform: translateY(-35px) rotate(240deg); opacity: 1; }
          75% { transform: translateY(-40px) rotate(360deg); opacity: 0.5; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(70px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-70px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(70px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 35px rgba(0, 255, 136, 0.3); }
          50% { box-shadow: 0 0 55px rgba(0, 255, 136, 0.7); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-25px); }
          60% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.25); }
          28% { transform: scale(1); }
          42% { transform: scale(1.25); }
          70% { transform: scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(720deg); }
        }
        @keyframes teamFloat {
          from { transform: translateY(0px); }
          to { transform: translateY(-8px); }
        }
        
        .floating-flag {
          position: absolute;
          font-size: 35px;
          pointer-events: none;
          animation: floatFlag var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          z-index: 1;
        }
        
        .hero-bg {
          background: linear-gradient(-45deg, #0a0a0a, #111111, #0f0f0f, #0a0a0a);
          background-size: 400% 400%;
          animation: gradientShift 30s ease infinite;
        }
        
        .card-hover {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .card-hover:hover {
          transform: translateY(-18px) scale(1.04);
          box-shadow: 0 35px 70px rgba(0, 255, 136, 0.25);
        }
        
        .card-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
          transition: left 0.8s;
        }
        
        .card-hover:hover::before {
          left: 100%;
        }
        
        .search-focus {
          box-shadow: 0 0 35px rgba(0, 255, 136, 0.5);
          border-color: #00ff88 !important;
        }
        
        .confederation-badge {
          position: relative;
          overflow: hidden;
          animation: pulse 3s ease-in-out infinite;
        }
        
        .confederation-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 4s infinite;
        }
        
        .sparkle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #00ff88;
          border-radius: 50%;
          animation: sparkle 3s infinite;
        }
        
        .team-logo {
          transition: all 0.3s ease;
        }
        
        .team-logo:hover {
          transform: scale(1.2) rotate(5deg);
          filter: brightness(1.2);
        }
      `}</style>

      {/* Floating Flags */}
      {floatingFlags.map(flag => (
        <div
          key={flag.id}
          className="floating-flag"
          style={{
            '--duration': `${flag.speed}s`,
            '--delay': `${flag.delay}s`,
            top: `${flag.y}%`,
            left: `${flag.x}%`
          }}
        >
          {flag.emoji}
        </div>
      ))}

      {/* Sparkles */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            top: `${8 + Math.random() * 84}%`,
            left: `${4 + Math.random() * 92}%`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        animation: isVisible ? 'slideInUp 0.8s ease-out' : 'none'
      }}>
        <div 
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#00ff88',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => window.location.href = '/'}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.15)'
            e.target.style.textShadow = '0 0 25px #00ff88'
            e.target.style.filter = 'brightness(1.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.textShadow = 'none'
            e.target.style.filter = 'brightness(1)'
          }}
        >
          Clutch
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/live', label: 'Live' },
            { href: '/players', label: 'Players' },
            { href: '/stats', label: 'Stats' },
            { href: '/teams', label: 'Teams', active: true },
            { href: '/community', label: 'Community' },
            { href: '/about', label: 'About' },
            { href: '/rewards', label: 'Rewards' }
          ].map((item, index) => (
            <a 
              key={item.href}
              href={item.href} 
              style={{ 
                color: item.active ? '#ffffff' : '#888', 
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                padding: '8px 0'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#00ff88'
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.textShadow = '0 5px 10px rgba(0, 255, 136, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = item.active ? '#ffffff' : '#888'
                e.target.style.transform = 'translateY(0)'
                e.target.style.textShadow = 'none'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Teams Content */}
      <main className="hero-bg" style={{ padding: '60px 20px' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          animation: isVisible ? 'slideInUp 0.8s ease-out 0.2s both' : 'none'
        }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '900',
            marginBottom: '25px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35, #00ff88)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 4s ease infinite',
            textShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
          }}>
            🏆 Club World Cup Teams
          </h1>
          <p style={{
            fontSize: '22px',
            color: '#cccccc',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            animation: 'fadeInScale 1s ease-out 0.4s both'
          }}>
            32 elite clubs from around the world competing for ultimate glory in the USA
          </p>
        </div>

        {/* Search and Filter Controls */}
        {!loading && !error && teams.length > 0 && (
          <div className="card-hover" style={{
            maxWidth: '1200px',
            margin: '0 auto 50px',
            padding: '30px',
            backgroundColor: '#111',
            border: '2px solid #333',
            borderRadius: '16px',
            animation: isVisible ? 'slideInUp 0.8s ease-out 0.6s both' : 'none'
          }}>
            <div style={{
              display: 'flex',
              gap: '25px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Search Input */}
              <div style={{ flex: '1', minWidth: '350px', maxWidth: '450px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search teams or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid #333',
                    backgroundColor: '#0a0a0a',
                    color: '#fff',
                    fontSize: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  className={searchFocused ? 'search-focus' : ''}
                />
              </div>

              {/* Confederation Filter */}
              <div style={{ minWidth: '250px' }}>
                <select
                  value={selectedConfederation}
                  onChange={(e) => setSelectedConfederation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '2px solid #333',
                    backgroundColor: '#0a0a0a',
                    color: '#fff',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#0099ff'
                    e.target.style.backgroundColor = '#1a1a1a'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#333'
                    e.target.style.backgroundColor = '#0a0a0a'
                  }}
                >
                  <option value="">🌍 All Confederations</option>
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
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626'
                    e.target.style.transform = 'translateY(-3px) scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ef4444'
                    e.target.style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  Clear Filters ✨
                </button>
              )}
            </div>

            {/* Results Count */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '16px',
              color: '#00ff88',
              fontWeight: 'bold',
              padding: '10px 15px',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              borderRadius: '25px',
              border: '1px solid #00ff88',
              display: 'inline-block',
              animation: 'glow 4s ease-in-out infinite'
            }}>
              🏟️ Showing {filteredTeams.length} of {teams.length} teams
            </div>
          </div>
        )}

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '30px',
              animation: 'bounce 1.5s infinite'
            }}>🏆</div>
            <div style={{
              fontSize: '28px',
              color: '#00ff88',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}>Loading elite teams...</div>
            <div style={{
              fontSize: '18px',
              color: '#888',
              marginTop: '15px'
            }}>Gathering the world's best clubs</div>
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '30px',
              animation: 'bounce 1s infinite'
            }}>⚠️</div>
            <div style={{
              fontSize: '24px',
              color: '#ef4444',
              marginBottom: '30px',
              fontWeight: 'bold'
            }}>{error}</div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '18px 36px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'glow 2s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a'
                e.target.style.transform = 'translateY(-3px) scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.transform = 'translateY(0) scale(1)'
              }}
            >
              Try Again 🔄
            </button>
          </div>
        )}

        {!loading && !error && filteredTeams.length === 0 && teams.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '30px',
              animation: 'bounce 2s infinite'
            }}>🔍</div>
            <div style={{
              fontSize: '28px',
              color: '#ffffff',
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>No teams found</div>
            <div style={{
              fontSize: '20px',
              color: '#888',
              marginBottom: '40px'
            }}>Try adjusting your search criteria</div>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedConfederation('')
              }}
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '18px 36px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a'
                e.target.style.transform = 'translateY(-3px) scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.transform = 'translateY(0) scale(1)'
              }}
            >
              Clear All Filters ✨
            </button>
          </div>
        )}

        {!loading && !error && teams.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '30px',
              animation: 'bounce 2s infinite'
            }}>🔍</div>
            <div style={{
              fontSize: '24px',
              color: '#888'
            }}>No teams found for Club World Cup 2025</div>
          </div>
        )}

        {!loading && !error && filteredTeams.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '35px',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              {filteredTeams.map((teamData, index) => {
                const team = teamData.team
                const venue = teamData.venue
                const confederationColor = getConfederationColor(team.country)
                return (
                  <div 
                    key={team.id || index} 
                    className="card-hover"
                    style={{
                      backgroundColor: '#111',
                      border: '2px solid #333',
                      borderRadius: '16px',
                      padding: '30px',
                      animation: `fadeInScale 0.8s ease-out ${index * 0.1}s both`,
                      position: 'relative'
                    }}
                    onClick={() => window.location.href = `/teams/${team.id}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = confederationColor
                      e.currentTarget.style.backgroundColor = '#1a1a1a'
                      setHoveredCard(index)
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333'
                      e.currentTarget.style.backgroundColor = '#111'
                      setHoveredCard(null)
                    }}
                  >
                    
                    {/* Confederation Badge */}
                    <div className="confederation-badge" style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      backgroundColor: confederationColor,
                      color: '#000',
                      padding: '8px 16px',
                      borderRadius: '25px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getConfederation(team.country)}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      {team.logo && (
                        <img 
                          src={team.logo} 
                          alt={`${team.name} logo`}
                          className="team-logo"
                          style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '12px',
                            marginRight: '20px',
                            objectFit: 'contain',
                            border: `3px solid ${confederationColor}`,
                            animation: hoveredCard === index ? 'pulse 1s infinite' : 'none'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '22px',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          color: '#ffffff'
                        }}>
                          {team.name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '16px',
                          color: confederationColor,
                          fontWeight: 'bold'
                        }}>
                          <span style={{ marginRight: '12px', fontSize: '24px' }}>
                            {getCountryFlag(team.country)}
                          </span>
                          {team.country}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '16px',
                      color: '#888',
                      lineHeight: '1.6',
                      backgroundColor: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${confederationColor}`
                    }}>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {team.code && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#00ff88' }}>🏷️</span>
                            <strong style={{ color: '#fff' }}>Code:</strong> {team.code}
                          </div>
                        )}
                        {team.founded && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#0099ff' }}>📅</span>
                            <strong style={{ color: '#fff' }}>Founded:</strong> {team.founded}
                          </div>
                        )}
                        {venue && venue.name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#ff6b35' }}>🏟️</span>
                            <strong style={{ color: '#fff' }}>Stadium:</strong> {venue.name}
                            {venue.capacity && (
                              <span style={{ color: '#888', fontSize: '14px' }}>
                                ({venue.capacity.toLocaleString()} capacity)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tournament Format Section */}
            <div className="card-hover" style={{
              textAlign: 'center',
              marginTop: '80px',
              padding: '50px',
              backgroundColor: '#111',
              borderRadius: '20px',
              border: '2px solid #333',
              maxWidth: '1000px',
              margin: '80px auto 0',
              position: 'relative',
              animation: 'slideInUp 0.8s ease-out 1.5s both'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(0,255,136,0.1), rgba(0,153,255,0.1), rgba(255,107,53,0.1))',
                opacity: 0.7,
                borderRadius: '20px'
              }} />
              
              <div style={{ position: 'relative', zIndex: 10 }}>
                <h2 style={{ 
                  marginBottom: '25px', 
                  color: '#ffffff',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  animation: 'glow 4s ease-in-out infinite'
                }}>
                  🏆 Tournament Format
                </h2>
                <p style={{ 
                  color: '#cccccc', 
                  fontSize: '20px', 
                  lineHeight: '1.8',
                  marginBottom: '30px',
                  maxWidth: '800px',
                  margin: '0 auto 30px'
                }}>
                  32 teams divided into 8 groups of 4. Top 2 from each group advance to knockout rounds.
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  marginTop: '40px'
                }}>
                  {[
                    { conf: 'UEFA', region: 'Europe', teams: '12', color: '#0099ff', flag: '🇪🇺' },
                    { conf: 'CONMEBOL', region: 'South America', teams: '6', color: '#00ff88', flag: '🌎' },
                    { conf: 'CONCACAF', region: 'North America', teams: '4', color: '#ff6b35', flag: '🌎' },
                    { conf: 'AFC', region: 'Asia', teams: '4', color: '#8b5cf6', flag: '🌏' },
                    { conf: 'CAF', region: 'Africa', teams: '4', color: '#ef4444', flag: '🌍' },
                    { conf: 'OFC', region: 'Oceania', teams: '1', color: '#fbbf24', flag: '🌊' },
                    { conf: 'Host', region: 'USA', teams: '1', color: '#888', flag: '🏠' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      padding: '20px',
                      backgroundColor: `${item.color}20`,
                      borderRadius: '15px',
                      border: `2px solid ${item.color}`,
                      animation: `pulse 3s ease-in-out infinite ${index * 0.2}s`
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.flag}</div>
                      <div style={{ color: item.color, fontSize: '18px', fontWeight: 'bold' }}>
                        {item.conf}
                      </div>
                      <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>
                        {item.region}
                      </div>
                      <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                        {item.teams} teams
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}