'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function Stats() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timePeriod, setTimePeriod] = useState('all')
  const [sortBy, setSortBy] = useState('goals')

  useEffect(() => {
    fetchPlayersStats()
  }, [timePeriod, sortBy])

  async function fetchPlayersStats() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/players', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.status}`)
      }
      
      const apiData = await response.json()
      let playersData = apiData.players || []
      
      // Sort players based on selected criteria
      playersData.sort((a, b) => {
        let aValue, bValue
        
        if (sortBy === 'goals') {
          aValue = a.statistics?.goals?.total || 0
          bValue = b.statistics?.goals?.total || 0
        } else if (sortBy === 'assists') {
          aValue = a.statistics?.goals?.assists || 0
          bValue = b.statistics?.goals?.assists || 0
        } else if (sortBy === 'games') {
          aValue = a.statistics?.games?.appearences || 0
          bValue = b.statistics?.games?.appearences || 0
        } else if (sortBy === 'rating') {
          aValue = parseFloat(a.statistics?.games?.rating || 0)
          bValue = parseFloat(b.statistics?.games?.rating || 0)
        }
        
        return bValue - aValue
      })
      
      // Take top 100 players for rankings
      setPlayers(playersData.slice(0, 100))
      
    } catch (err) {
      console.error('Error fetching player stats:', err)
      setError('Failed to load player statistics. Please try again later.')
    } finally {
      setLoading(false)
    }
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
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#00ff88'
        }}>
          Player Rankings 📊
        </h1>

        {/* Filter Controls */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ color: '#888', fontSize: '14px', marginBottom: '5px', display: 'block' }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundColor: '#222',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px'
              }}
            >
              <option value="goals">Goals</option>
              <option value="assists">Assists</option>
              <option value="games">Games Played</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div>
            <label style={{ color: '#888', fontSize: '14px', marginBottom: '5px', display: 'block' }}>
              Time Period
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              style={{
                backgroundColor: '#222',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Time</option>
              <option value="2024">2024 Season</option>
              <option value="2023">2023 Season</option>
              <option value="cwc2025">Club World Cup 2025</option>
            </select>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
          }}>
            Loading player rankings...
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#2d1b1b',
            border: '1px solid #664444',
            borderRadius: '8px',
            padding: '20px',
            color: '#ff6b6b',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Rankings Table */}
        {!loading && !error && (
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px 80px 80px 80px 80px',
              padding: '20px',
              borderBottom: '1px solid #333',
              backgroundColor: '#161616',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#888'
            }}>
              <div>RANK</div>
              <div>PLAYER</div>
              <div>TEAM</div>
              <div>GOALS</div>
              <div>ASSISTS</div>
              <div>GAMES</div>
              <div>RATING</div>
            </div>

            {/* Table Body */}
            {players.map((playerData, index) => (
              <div
                key={playerData.player?.id || index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 80px 80px 80px 80px',
                  padding: '20px',
                  borderBottom: index < players.length - 1 ? '1px solid #333' : 'none',
                  alignItems: 'center',
                  fontSize: '14px'
                }}
              >
                {/* Rank */}
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#888'
                }}>
                  {index + 1}
                </div>

                {/* Player Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {playerData.player?.name || 'Unknown Player'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginTop: '4px'
                    }}>
                      <span style={{ fontSize: '12px' }}>
                        {getCountryFlag(playerData.player?.nationality)}
                      </span>
                      <span style={{ 
                        color: getPositionColor(playerData.player?.position),
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {playerData.player?.position || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div style={{ fontSize: '14px', color: '#888' }}>
                  {playerData.team?.name || 'N/A'}
                </div>

                {/* Goals */}
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: '#00ff88'
                }}>
                  {playerData.statistics?.goals?.total || 0}
                </div>

                {/* Assists */}
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: '#0099ff'
                }}>
                  {playerData.statistics?.goals?.assists || 0}
                </div>

                {/* Games */}
                <div style={{ 
                  fontSize: '16px',
                  color: '#ff6b35'
                }}>
                  {playerData.statistics?.games?.appearences || 0}
                </div>

                {/* Rating */}
                <div style={{ 
                  fontSize: '16px',
                  color: '#ffffff'
                }}>
                  {playerData.statistics?.games?.rating || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {!loading && !error && players.length > 0 && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#888'
          }}>
            Showing top {players.length} players ranked by {sortBy}
          </div>
        )}
      </main>
    </div>
  )
}