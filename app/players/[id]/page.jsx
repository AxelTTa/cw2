'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UniversalComments from '../../components/UniversalComments'

export default function PlayerDetail() {
  const params = useParams()
  const router = useRouter()
  const [playerData, setPlayerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPlayerDetail() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🚀 Frontend: Fetching player detail for ID:', params.id)
        
        const response = await fetch(`/api/players/${params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch player: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load player data')
        }
        
        setPlayerData(data.player)
      } catch (err) {
        console.error('❌ Frontend: Error loading player:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlayerDetail()
    }
  }, [params.id])

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

  if (loading) {
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
            Clutch
          </div>
          <nav style={{ display: 'flex', gap: '30px' }}>
            <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
            <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
            <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
            <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
            <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
          </nav>
        </header>

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading player details...</div>
        </main>
      </div>
    )
  }

  if (error) {
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
            Clutch
          </div>
          <nav style={{ display: 'flex', gap: '30px' }}>
            <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
            <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
            <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
            <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
            <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
          </nav>
        </header>

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '18px', color: '#ef4444', marginBottom: '20px' }}>
            {error}
          </div>
          <button 
            onClick={() => router.push('/players')}
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
            Back to Players
          </button>
        </main>
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
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00ff88'
        }}>
          Clutch
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
          <a href="/community" style={{ color: '#888', textDecoration: 'none' }}>Community</a>
        </nav>
      </header>

      {/* Player Content */}
      <main style={{ padding: '40px 20px' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => router.push('/players')}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Players
          </button>
        </div>

        {/* Player Header */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: '#111',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '30px',
          border: `2px solid ${getPositionColor(playerData.player?.position)}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            {/* Player Photo */}
            {playerData.player?.photo && (
              <img 
                src={playerData.player.photo} 
                alt={`${playerData.player.name} photo`}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3px solid ${getPositionColor(playerData.player?.position)}`
                }}
              />
            )}

            {/* Player Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#ffffff'
              }}>
                {playerData.player?.name}
              </h1>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '18px',
                color: getPositionColor(playerData.player?.position),
                marginBottom: '10px'
              }}>
                <span style={{ marginRight: '10px' }}>
                  {getPositionEmoji(playerData.player?.position)}
                </span>
                {playerData.player?.position}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: '#888',
                marginBottom: '10px'
              }}>
                <span style={{ marginRight: '10px' }}>
                  {getCountryFlag(playerData.player?.nationality)}
                </span>
                {playerData.player?.nationality}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: '#00ff88',
                fontWeight: 'bold'
              }}>
                <span style={{ marginRight: '10px' }}>⚽</span>
                {playerData.team?.name}
              </div>
            </div>

            {/* Team Logo */}
            {playerData.team?.logo && (
              <img 
                src={playerData.team.logo} 
                alt={`${playerData.team.name} logo`}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Basic Info */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #333'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📋 Basic Information
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {playerData.player?.age && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Age:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {playerData.player.age} years
                  </span>
                </div>
              )}
              {playerData.player?.height && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Height:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {playerData.player.height}
                  </span>
                </div>
              )}
              {playerData.player?.weight && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Weight:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {playerData.player.weight}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Player ID:</span>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  #{playerData.player?.id}
                </span>
              </div>
            </div>
          </div>

          {/* Competition Stats */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #333'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🏆 Competition Stats
            </h2>
            {playerData.allStatistics && playerData.allStatistics.length > 0 ? (
              <div>
                {playerData.allStatistics.map((stat, index) => (
                  <div key={index} style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#00ff88',
                      fontWeight: 'bold',
                      marginBottom: '10px'
                    }}>
                      {stat.league?.name || 'Unknown League'} ({stat.league?.season || 'Unknown'})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#888' }}>Games:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>
                          {stat.games?.appearences || 0}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#888' }}>Goals:</span>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                          {stat.goals?.total || 0}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#888' }}>Assists:</span>
                        <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                          {stat.goals?.assists || 0}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#888' }}>Minutes:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>
                          {stat.games?.minutes || 0}
                        </span>
                      </div>
                      {stat.games?.rating && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gridColumn: '1 / -1' }}>
                          <span style={{ color: '#888' }}>Rating:</span>
                          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                            {parseFloat(stat.games.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', fontSize: '14px' }}>
                No detailed statistics available
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '25px',
            border: '1px solid #333'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📊 Performance Summary
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '6px'
              }}>
                <span style={{ color: '#888' }}>Total Goals:</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '18px' }}>
                  {playerData.statistics?.goals || 0}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '6px'
              }}>
                <span style={{ color: '#888' }}>Total Assists:</span>
                <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '18px' }}>
                  {playerData.statistics?.assists || 0}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '6px'
              }}>
                <span style={{ color: '#888' }}>Total Games:</span>
                <span style={{ color: '#0099ff', fontWeight: 'bold', fontSize: '18px' }}>
                  {playerData.statistics?.games || 0}
                </span>
              </div>
              {playerData.statistics?.rating && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '6px'
                }}>
                  <span style={{ color: '#888' }}>Average Rating:</span>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>
                    {parseFloat(playerData.statistics.rating).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <UniversalComments 
            entityType="player"
            entityId={playerData.player?.id}
            entityName={playerData.player?.name}
          />
        </div>
      </main>
    </div>
  )
}