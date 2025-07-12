'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UniversalComments from '../../components/UniversalComments'

export default function TeamDetail() {
  const params = useParams()
  const router = useRouter()
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTeamDetail() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🚀 Frontend: Fetching team detail for ID:', params.id)
        
        const response = await fetch(`/api/teams/${params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch team: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load team data')
        }
        
        setTeamData(data.team)
      } catch (err) {
        console.error('❌ Frontend: Error loading team:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTeamDetail()
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

  const getConfederationColor = (country) => {
    const confederations = {
      // UEFA (Europe) - Blue
      'England': '#0099ff',
      'Spain': '#0099ff',
      'Germany': '#0099ff',
      'France': '#0099ff',
      'Italy': '#0099ff',
      'Portugal': '#0099ff',
      
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
            <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
            <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
            <a href="/competitions" style={{ color: '#888', textDecoration: 'none' }}>Competitions</a>
          </nav>
        </header>

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏟️</div>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading team details...</div>
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
            <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
            <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
            <a href="/competitions" style={{ color: '#888', textDecoration: 'none' }}>Competitions</a>
          </nav>
        </header>

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '18px', color: '#ef4444', marginBottom: '20px' }}>
            {error}
          </div>
          <button 
            onClick={() => router.push('/teams')}
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
            Back to Teams
          </button>
        </main>
      </div>
    )
  }

  const confederationColor = getConfederationColor(teamData.team?.country)

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
          <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/competitions" style={{ color: '#888', textDecoration: 'none' }}>Competitions</a>
        </nav>
      </header>

      {/* Team Content */}
      <main style={{ padding: '40px 20px' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => router.push('/teams')}
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
            ← Back to Teams
          </button>
        </div>

        {/* Team Header */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: '#111',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '30px',
          border: `2px solid ${confederationColor}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            {/* Team Logo */}
            {teamData.team?.logo && (
              <img 
                src={teamData.team.logo} 
                alt={`${teamData.team.name} logo`}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  border: `3px solid ${confederationColor}`
                }}
              />
            )}

            {/* Team Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#ffffff'
              }}>
                {teamData.team?.name}
              </h1>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '18px',
                color: confederationColor,
                marginBottom: '10px'
              }}>
                <span style={{ marginRight: '10px' }}>
                  {getCountryFlag(teamData.team?.country)}
                </span>
                {teamData.team?.country} • {getConfederation(teamData.team?.country)}
              </div>

              {teamData.team?.code && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '16px',
                  color: '#888',
                  marginBottom: '10px'
                }}>
                  <span style={{ marginRight: '10px' }}>🏷️</span>
                  Team Code: {teamData.team.code}
                </div>
              )}

              {teamData.team?.founded && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '16px',
                  color: '#00ff88',
                  fontWeight: 'bold'
                }}>
                  <span style={{ marginRight: '10px' }}>📅</span>
                  Founded: {teamData.team.founded}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Details Grid */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Venue Information */}
          {teamData.venue && (
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
                🏟️ Stadium Information
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Name:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {teamData.venue.name}
                  </span>
                </div>
                {teamData.venue.address && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Address:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                      {teamData.venue.address}
                    </span>
                  </div>
                )}
                {teamData.venue.city && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>City:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                      {teamData.venue.city}
                    </span>
                  </div>
                )}
                {teamData.venue.capacity && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Capacity:</span>
                    <span style={{ color: confederationColor, fontWeight: 'bold' }}>
                      {teamData.venue.capacity.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Statistics */}
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
              📊 Team Information
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Team ID:</span>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  #{teamData.team?.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Competition:</span>
                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                  Club World Cup 2025
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Confederation:</span>
                <span style={{ color: confederationColor, fontWeight: 'bold' }}>
                  {getConfederation(teamData.team?.country)}
                </span>
              </div>
              {teamData.team?.national && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Type:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {teamData.team.national ? 'National Team' : 'Club Team'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <UniversalComments 
            entityType="team"
            entityId={teamData.team?.id}
            entityName={teamData.team?.name}
          />
        </div>
      </main>
    </div>
  )
}