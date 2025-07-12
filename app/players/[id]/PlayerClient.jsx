'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UniversalComments from '../../components/UniversalComments'

export default function PlayerClient() {
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
      <main style={{ padding: '40px 20px' }}>
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