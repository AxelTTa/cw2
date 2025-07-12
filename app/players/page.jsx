'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function Players() {
  const [allPlayers, setAllPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [displayedPlayers, setDisplayedPlayers] = useState([])
  const [loadedPlayers, setLoadedPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [backgroundLoading, setBackgroundLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [playersPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [teams, setTeams] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [floatingTrophies, setFloatingTrophies] = useState([])
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    fetchPlayers()
    setIsVisible(true)
    
    // Floating trophies animation
    const trophiesInterval = setInterval(() => {
      const newTrophy = {
        id: Date.now(),
        emoji: ['⚽', '🏆', '⭐', '🔥', '💎', '👑', '🥇', '🎯'][Math.floor(Math.random() * 8)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4,
        speed: 10 + Math.random() * 8
      }
      setFloatingTrophies(prev => [...prev.slice(-8), newTrophy])
    }, 3500)

    return () => clearInterval(trophiesInterval)
  }, [])

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

  // Filter and search functionality
  useEffect(() => {
    // Determine which dataset to use for filtering
    const datasetToFilter = allPlayers.length > 0 ? allPlayers : loadedPlayers
    let filtered = datasetToFilter

    // Check if we're searching for something not in loaded players
    if (searchTerm && allPlayers.length === 0) {
      setSearchLoading(true)
    } else {
      setSearchLoading(false)
    }

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

    // Apply sorting
    filtered = sortPlayers(filtered, sortBy)

    setFilteredPlayers(filtered)
    setCurrentPage(1)
    setDisplayedPlayers(filtered.slice(0, playersPerPage))
  }, [searchTerm, selectedTeam, selectedPosition, sortBy, allPlayers, loadedPlayers, playersPerPage])

  const sortPlayers = (players, sortCriteria) => {
    return [...players].sort((a, b) => {
      const playerA = a.player
      const playerB = b.player
      const statsA = a.statistics
      const statsB = b.statistics

      switch (sortCriteria) {
        case 'name':
          return (playerA?.name || '').localeCompare(playerB?.name || '')
        case 'age':
          return (playerB?.age || 0) - (playerA?.age || 0)
        case 'goals':
          return (statsB?.goals || 0) - (statsA?.goals || 0)
        case 'assists':
          return (statsB?.assists || 0) - (statsA?.assists || 0)
        case 'rating':
          return (parseFloat(statsB?.rating) || 0) - (parseFloat(statsA?.rating) || 0)
        case 'games':
          return (statsB?.games || 0) - (statsA?.games || 0)
        case 'team':
          return (a.team?.name || '').localeCompare(b.team?.name || '')
        default:
          return 0
      }
    })
  }

  // Load more players
  const handleLoadMore = async () => {
    if (allPlayers.length > 0) {
      // If all players are already loaded, just show more from filtered results
      const startIndex = displayedPlayers.length
      const endIndex = startIndex + playersPerPage
      const newPlayers = filteredPlayers.slice(startIndex, endIndex)
      setDisplayedPlayers(prev => [...prev, ...newPlayers])
    } else {
      // Load more from API
      try {
        const offset = loadedPlayers.length
        const response = await fetch(`/api/players?limit=${playersPerPage}&offset=${offset}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const apiData = await response.json()
          const newPlayersData = apiData.players
          
          if (newPlayersData && newPlayersData.length > 0) {
            const updatedLoadedPlayers = [...loadedPlayers, ...newPlayersData]
            setLoadedPlayers(updatedLoadedPlayers)
            
            // Apply current filters to the new combined dataset
            let filtered = updatedLoadedPlayers
            
            if (searchTerm) {
              filtered = filtered.filter(playerData => 
                playerData.player?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                playerData.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                playerData.player?.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
              )
            }
            if (selectedTeam) {
              filtered = filtered.filter(playerData => playerData.team?.name === selectedTeam)
            }
            if (selectedPosition) {
              filtered = filtered.filter(playerData => playerData.player?.position === selectedPosition)
            }
            
            // Apply sorting to filtered results
            filtered = sortPlayers(filtered, sortBy)
            
            setFilteredPlayers(filtered)
            setDisplayedPlayers(filtered.slice(0, displayedPlayers.length + playersPerPage))
          }
        }
      } catch (err) {
        console.error('Error loading more players:', err)
      }
    }
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes floatTrophy {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-35px) rotate(120deg); opacity: 0.7; }
          50% { transform: translateY(-25px) rotate(240deg); opacity: 1; }
          75% { transform: translateY(-30px) rotate(360deg); opacity: 0.5; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 25px rgba(0, 255, 136, 0.3); }
          50% { box-shadow: 0 0 45px rgba(0, 255, 136, 0.6); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-8px); }
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
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        .floating-trophy {
          position: absolute;
          font-size: 28px;
          pointer-events: none;
          animation: floatTrophy var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          z-index: 1;
        }
        
        .hero-bg {
          background: linear-gradient(-45deg, #0a0a0a, #111111, #0f0f0f, #0a0a0a);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .card-hover:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 25px 50px rgba(0, 255, 136, 0.3);
        }
        
        .card-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.6s;
        }
        
        .card-hover:hover::before {
          left: 100%;
        }
        
        .search-focus {
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
          border-color: #00ff88 !important;
        }
        
        .position-badge {
          position: relative;
          overflow: hidden;
        }
        
        .position-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 3s infinite;
        }
        
        .sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #00ff88;
          border-radius: 50%;
          animation: sparkle 2s infinite;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .floating-trophy {
            font-size: 20px !important;
          }
          
          .mobile-menu-btn {
            display: block !important;
          }
          
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-nav {
            flex-direction: column;
            gap: 15px !important;
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(20px);
            padding: 20px;
            transition: left 0.3s ease;
            z-index: 99;
            border-bottom: 1px solid #333;
          }
          
          .mobile-nav.open {
            left: 0;
          }
          
          .mobile-header {
            padding: 15px !important;
            flex-wrap: wrap;
          }
          
          .mobile-title {
            font-size: 20px !important;
          }
          
          .mobile-hero {
            padding: 30px 15px !important;
          }
          
          .mobile-hero-title {
            font-size: 36px !important;
            line-height: 1.2 !important;
          }
          
          .mobile-hero-text {
            font-size: 16px !important;
            margin: 0 auto 25px !important;
          }
          
          .mobile-filters {
            flex-direction: column !important;
            gap: 15px !important;
            align-items: stretch !important;
          }
          
          .mobile-search {
            width: 100% !important;
            margin-bottom: 15px !important;
          }
          
          .mobile-filter-row {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .mobile-filter-row select {
            width: 100% !important;
            font-size: 16px !important;
            padding: 12px !important;
          }
          
          .mobile-players-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
            padding: 0 15px !important;
          }
          
          .mobile-player-card {
            padding: 20px !important;
            margin: 0 !important;
          }
          
          .mobile-player-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 15px !important;
          }
          
          .mobile-player-stats {
            flex-direction: column !important;
            gap: 10px !important;
            text-align: center !important;
          }
          
          .mobile-pagination {
            flex-direction: column !important;
            gap: 15px !important;
            text-align: center !important;
          }
          
          .mobile-pagination-buttons {
            display: flex !important;
            justify-content: center !important;
            gap: 10px !important;
            flex-wrap: wrap !important;
          }
          
          .mobile-pagination button {
            padding: 8px 12px !important;
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-hero-title {
            font-size: 28px !important;
          }
          
          .mobile-hero-text {
            font-size: 15px !important;
          }
          
          .mobile-player-card {
            padding: 15px !important;
          }
          
          .mobile-title {
            font-size: 18px !important;
          }
        }
      `}</style>

      {/* Floating Trophies */}
      {floatingTrophies.map(trophy => (
        <div
          key={trophy.id}
          className="floating-trophy"
          style={{
            '--duration': `${trophy.speed}s`,
            '--delay': `${trophy.delay}s`,
            top: `${trophy.y}%`,
            left: `${trophy.x}%`
          }}
        >
          {trophy.emoji}
        </div>
      ))}

      {/* Sparkles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      ))}

      {/* Header */}
      <header className="mobile-header" style={{
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
          className="mobile-title"
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

        {/* Mobile Menu Button */}
        <button
          style={{
            display: 'none',
            background: 'none',
            border: '2px solid #00ff88',
            borderRadius: '8px',
            color: '#00ff88',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.3s ease'
          }}
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '30px' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/live', label: 'Live' },
            { href: '/players', label: 'Players', active: true },
            { href: '/stats', label: 'Stats' },
            { href: '/teams', label: 'Teams' },
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

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {[
            { href: '/', label: 'Home' },
            { href: '/live', label: 'Live' },
            { href: '/players', label: 'Players', active: true },
            { href: '/stats', label: 'Stats' },
            { href: '/teams', label: 'Teams' },
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
                padding: '12px 0',
                fontSize: '18px',
                borderBottom: '1px solid #333'
              }}
              onClick={() => setMobileMenuOpen(false)}
              onMouseEnter={(e) => {
                e.target.style.color = '#00ff88'
                e.target.style.transform = 'translateX(10px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = item.active ? '#ffffff' : '#888'
                e.target.style.transform = 'translateX(0)'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Players Content */}
      <main className="hero-bg" style={{ padding: '60px 20px' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
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
            ⭐ Club World Cup Players
          </h1>
          <p style={{
            fontSize: '22px',
            color: '#cccccc',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            animation: 'fadeInScale 1s ease-out 0.4s both'
          }}>
            Meet the world's best players from 32 elite clubs competing for ultimate glory
          </p>
        </div>

        {/* Search and Filter Controls */}
        {!loading && !error && (
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto 50px',
            display: 'flex',
            gap: '25px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            animation: isVisible ? 'slideInUp 0.8s ease-out 0.6s both' : 'none'
          }}>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="🔍 Search players, teams, or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #333',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '16px',
                minWidth: '350px',
                flex: '1',
                transition: 'all 0.3s ease'
              }}
              className={searchFocused ? 'search-focus' : ''}
            />
            
            {/* Team Filter */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #333',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '16px',
                minWidth: '220px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#0099ff'
                e.target.style.backgroundColor = '#1a1a1a'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#333'
                e.target.style.backgroundColor = '#111'
              }}
            >
              <option value="">🏟️ All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            
            {/* Position Filter */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #333',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '16px',
                minWidth: '180px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#ff6b35'
                e.target.style.backgroundColor = '#1a1a1a'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#333'
                e.target.style.backgroundColor = '#111'
              }}
            >
              <option value="">🏃 All Positions</option>
              <option value="Goalkeeper">🥅 Goalkeeper</option>
              <option value="Defender">🛡️ Defender</option>
              <option value="Midfielder">⚡ Midfielder</option>
              <option value="Attacker">⚽ Attacker</option>
            </select>
            
            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #333',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '16px',
                minWidth: '180px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#ffdd00'
                e.target.style.backgroundColor = '#1a1a1a'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#333'
                e.target.style.backgroundColor = '#111'
              }}
            >
              <option value="name">📝 Sort by Name</option>
              <option value="goals">⚽ Sort by Goals</option>
              <option value="assists">🎯 Sort by Assists</option>
              <option value="rating">⭐ Sort by Rating</option>
              <option value="games">🏃 Sort by Games</option>
              <option value="age">🎂 Sort by Age</option>
              <option value="team">🏟️ Sort by Team</option>
            </select>
            
            {/* Results Count */}
            <div style={{
              color: '#00ff88',
              fontSize: '16px',
              fontWeight: 'bold',
              minWidth: '150px',
              padding: '10px 15px',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              borderRadius: '25px',
              border: '1px solid #00ff88',
              animation: 'glow 4s ease-in-out infinite'
            }}>
              👥 {filteredPlayers.length} players
            </div>
          </div>
        )}

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
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}>Loading world-class players...</div>
            <div style={{
              fontSize: '16px',
              color: '#888',
              marginTop: '10px'
            }}>Gathering stars from across the globe</div>
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '25px',
              animation: 'bounce 1s infinite'
            }}>⚠️</div>
            <div style={{
              fontSize: '22px',
              color: '#ef4444',
              marginBottom: '25px',
              fontWeight: 'bold'
            }}>{error}</div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '18px',
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

        {!loading && !error && filteredPlayers.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '25px',
              animation: 'bounce 2s infinite'
            }}>🔍</div>
            <div style={{
              fontSize: '24px',
              color: '#ffffff',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>No players found</div>
            <div style={{
              fontSize: '18px',
              color: '#888',
              marginBottom: '30px'
            }}>Try adjusting your search criteria</div>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedTeam('')
                setSelectedPosition('')
                setSortBy('name')
              }}
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '18px',
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

        {!loading && !error && displayedPlayers.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '30px',
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
                    className="card-hover"
                    style={{
                      backgroundColor: '#111',
                      border: '2px solid #333',
                      borderRadius: '16px',
                      padding: '25px',
                      animation: `fadeInScale 0.8s ease-out ${index * 0.1}s both`,
                      position: 'relative'
                    }}
                    onClick={() => window.location.href = `/players/${player.id}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = getPositionColor(player.position)
                      e.currentTarget.style.backgroundColor = '#1a1a1a'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333'
                      e.currentTarget.style.backgroundColor = '#111'
                    }}>
                    
                    {/* Position Badge */}
                    <div className="position-badge" style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      backgroundColor: getPositionColor(player.position),
                      color: '#000',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {getPositionEmoji(player.position)} {player.position}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      {player.photo && (
                        <img 
                          src={player.photo} 
                          alt={`${player.name} photo`}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            marginRight: '20px',
                            objectFit: 'cover',
                            border: `3px solid ${getPositionColor(player.position)}`,
                            animation: 'pulse 3s ease-in-out infinite'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          marginBottom: '8px',
                          color: '#ffffff'
                        }}>
                          {player.name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '8px'
                        }}>
                          <span style={{ marginRight: '10px', fontSize: '18px' }}>
                            {getCountryFlag(player.nationality)}
                          </span>
                          {player.nationality}
                          {player.age && <span style={{ marginLeft: '10px' }}>• {player.age}y</span>}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          color: '#00ff88',
                          fontWeight: 'bold'
                        }}>
                          <span style={{ marginRight: '10px' }}>⚽</span>
                          {team?.name || 'Unknown Team'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Player Details */}
                    <div style={{
                      fontSize: '14px',
                      color: '#888',
                      lineHeight: '1.5',
                      marginBottom: '15px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {player.height && (
                          <div>
                            <strong style={{ color: '#fff' }}>Height:</strong> {player.height}
                          </div>
                        )}
                        {player.weight && (
                          <div>
                            <strong style={{ color: '#fff' }}>Weight:</strong> {player.weight}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Statistics */}
                    {statistics && (
                      <div style={{
                        padding: '15px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                        border: `1px solid ${getPositionColor(player.position)}`,
                        fontSize: '13px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: '#00ff88' }}>⚽</span>
                          <strong style={{ color: '#fff' }}>Goals:</strong> {statistics.goals || 0}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: '#0099ff' }}>🎯</span>
                          <strong style={{ color: '#fff' }}>Assists:</strong> {statistics.assists || 0}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: '#ff6b35' }}>🏃</span>
                          <strong style={{ color: '#fff' }}>Games:</strong> {statistics.games || 0}
                        </div>
                        {statistics.rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#ffdd00' }}>⭐</span>
                            <strong style={{ color: '#fff' }}>Rating:</strong> {parseFloat(statistics.rating).toFixed(1)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMorePlayers && (
              <div style={{
                textAlign: 'center',
                marginTop: '50px'
              }}>
                <button 
                  onClick={handleLoadMore}
                  style={{
                    backgroundColor: '#00ff88',
                    color: '#000',
                    border: 'none',
                    padding: '18px 40px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    animation: 'glow 3s ease-in-out infinite'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#00cc6a'
                    e.target.style.transform = 'translateY(-5px) scale(1.05)'
                    e.target.style.boxShadow = '0 15px 35px rgba(0, 255, 136, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#00ff88'
                    e.target.style.transform = 'translateY(0) scale(1)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  Load More Stars ⭐ ({filteredPlayers.length - displayedPlayers.length} remaining)
                </button>
                {backgroundLoading && (
                  <div style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#888'
                  }}>
                    Loading all players in background...
                  </div>
                )}
              </div>
            )}

            {/* Stats Summary */}
            <div className="card-hover" style={{
              textAlign: 'center',
              marginTop: '80px',
              padding: '40px',
              backgroundColor: '#111',
              borderRadius: '20px',
              border: '2px solid #333',
              maxWidth: '900px',
              margin: '80px auto 0',
              position: 'relative',
              animation: 'slideInUp 0.8s ease-out 1.2s both'
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
                  fontSize: '32px',
                  fontWeight: 'bold',
                  animation: 'glow 4s ease-in-out infinite'
                }}>
                  🏆 Tournament Overview
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '25px',
                  marginBottom: '25px'
                }}>
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderRadius: '15px',
                    border: '2px solid #00ff88'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ff88' }}>
                      {allPlayers.length}
                    </div>
                    <div style={{ fontSize: '16px', color: '#888' }}>Total Players</div>
                  </div>
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(0, 153, 255, 0.1)',
                    borderRadius: '15px',
                    border: '2px solid #0099ff'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0099ff' }}>
                      {teams.length}
                    </div>
                    <div style={{ fontSize: '16px', color: '#888' }}>Elite Teams</div>
                  </div>
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderRadius: '15px',
                    border: '2px solid #ff6b35'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b35' }}>
                      {allPlayers.filter(p => p.player?.position === 'Goalkeeper').length}
                    </div>
                    <div style={{ fontSize: '16px', color: '#888' }}>Goalkeepers</div>
                  </div>
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '15px',
                    border: '2px solid #ef4444'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                      {allPlayers.filter(p => p.player?.position === 'Attacker').length}
                    </div>
                    <div style={{ fontSize: '16px', color: '#888' }}>Attackers</div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '40px',
                  flexWrap: 'wrap',
                  fontSize: '16px'
                }}>
                  <div style={{ color: '#ff6b35', fontWeight: 'bold' }}>🥅 Goalkeeper</div>
                  <div style={{ color: '#0099ff', fontWeight: 'bold' }}>🛡️ Defender</div>
                  <div style={{ color: '#00ff88', fontWeight: 'bold' }}>⚡ Midfielder</div>
                  <div style={{ color: '#ef4444', fontWeight: 'bold' }}>⚽ Attacker</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}