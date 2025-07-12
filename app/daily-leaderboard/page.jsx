'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function DailyLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [calculating, setCalculating] = useState(false)
  const [distributing, setDistributing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin (you can implement your own admin check logic)
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      const user = JSON.parse(userData)
      // For demo purposes, you can set admin status here
      // setIsAdmin(user.email === 'admin@yourapp.com')
    }
    
    loadDailyData()
  }, [selectedDate])

  const loadDailyData = async () => {
    try {
      setLoading(true)
      
      // Load daily leaderboard
      const leaderboardResponse = await fetch(`/api/leaderboard?type=daily&date=${selectedDate}`)
      const leaderboardData = await leaderboardResponse.json()
      
      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard || [])
      }

      // Load daily rewards
      const rewardsResponse = await fetch(`/api/daily-rewards?date=${selectedDate}`)
      const rewardsData = await rewardsResponse.json()
      
      if (rewardsData.success) {
        setRewards(rewardsData.rewards || [])
      }

    } catch (error) {
      console.error('Error loading daily data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRewards = async () => {
    setCalculating(true)
    try {
      const response = await fetch('/api/daily-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calculate', date: selectedDate })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(`Calculated rewards for ${data.topThree?.length || 0} winners!`)
        loadDailyData()
      } else {
        alert('Error calculating rewards: ' + data.error)
      }
    } catch (error) {
      alert('Error calculating rewards: ' + error.message)
    } finally {
      setCalculating(false)
    }
  }

  const distributeRewards = async () => {
    setDistributing(true)
    try {
      const response = await fetch('/api/daily-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'distribute', date: selectedDate })
      })
      
      const data = await response.json()
      if (data.success) {
        const successful = data.results?.filter(r => r.success).length || 0
        alert(`Successfully distributed rewards to ${successful} winners!`)
        loadDailyData()
      } else {
        alert('Error distributing rewards: ' + data.error)
      }
    } catch (error) {
      alert('Error distributing rewards: ' + error.message)
    } finally {
      setDistributing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRankEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700'
      case 2: return '#C0C0C0'
      case 3: return '#CD7F32'
      default: return '#00ff88'
    }
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Header />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 80px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏅</div>
            <div style={{ fontSize: '24px' }}>Loading daily leaderboard...</div>
          </div>
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
      <Header />
      
      {/* Hero Section */}
      <section style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏅 Daily Leaderboard
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#888',
          marginBottom: '30px'
        }}>
          Top commentators compete daily for CHZ rewards!
        </p>

        {/* Date Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <label style={{ color: '#fff', fontSize: '16px' }}>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              backgroundColor: '#111',
              border: '2px solid #333',
              borderRadius: '8px',
              color: '#fff',
              padding: '8px 12px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 'bold' }}>
          {formatDate(selectedDate)}
        </div>
      </section>

      {/* Admin Controls */}
      {isAdmin && (
        <section style={{
          padding: '20px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#111',
            border: '2px solid #ff6b35',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>Admin Controls</h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={calculateRewards}
                disabled={calculating}
                style={{
                  backgroundColor: calculating ? '#666' : '#00ff88',
                  color: calculating ? '#ccc' : '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: calculating ? 'not-allowed' : 'pointer'
                }}
              >
                {calculating ? 'Calculating...' : 'Calculate Rewards'}
              </button>
              
              <button
                onClick={distributeRewards}
                disabled={distributing || rewards.length === 0}
                style={{
                  backgroundColor: distributing || rewards.length === 0 ? '#666' : '#0099ff',
                  color: distributing || rewards.length === 0 ? '#ccc' : '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: distributing || rewards.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {distributing ? 'Distributing...' : 'Distribute Rewards'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Daily Rewards Winners */}
      {rewards.length > 0 && (
        <section style={{
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '32px',
            textAlign: 'center',
            marginBottom: '30px',
            color: '#ffffff'
          }}>
            🎉 Daily CHZ Winners
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {rewards.map((reward) => (
              <div
                key={reward.id}
                style={{
                  backgroundColor: '#111',
                  border: `2px solid ${getRankColor(reward.rank)}`,
                  borderRadius: '15px',
                  padding: '25px',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '15px'
                }}>
                  {getRankEmoji(reward.rank)}
                </div>
                
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#fff',
                  marginBottom: '10px'
                }}>
                  {reward.profiles?.display_name || reward.profiles?.username}
                </div>
                
                <div style={{
                  backgroundColor: getRankColor(reward.rank),
                  color: '#000',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '15px'
                }}>
                  {reward.chz_amount} CHZ
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: reward.status === 'distributed' ? '#00ff88' : '#ff6b35'
                }}>
                  {reward.status === 'distributed' ? '✅ Distributed' : '⏳ Pending'}
                </div>
                
                {reward.transaction_hash && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '10px',
                    fontFamily: 'monospace'
                  }}>
                    TX: {reward.transaction_hash.slice(0, 8)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Leaderboard */}
      <section style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '32px',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#ffffff'
        }}>
          📊 Daily Rankings
        </h2>

        {leaderboard.length === 0 ? (
          <div style={{
            backgroundColor: '#111',
            border: '2px solid #333',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
            <div style={{ fontSize: '24px', color: '#888' }}>
              No activity found for {formatDate(selectedDate)}
            </div>
            <div style={{ fontSize: '16px', color: '#666', marginTop: '10px' }}>
              Be the first to comment and claim the top spot!
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#111',
            borderRadius: '15px',
            overflow: 'hidden'
          }}>
            {leaderboard.map((user, index) => (
              <div
                key={user.user_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  borderBottom: index < leaderboard.length - 1 ? '1px solid #333' : 'none',
                  backgroundColor: user.rank <= 3 ? `${getRankColor(user.rank)}10` : 'transparent'
                }}
              >
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: getRankColor(user.rank),
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {getRankEmoji(user.rank)}
                </div>
                
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#00ff88',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#000',
                  marginRight: '15px'
                }}>
                  {(user.display_name || user.username)?.[0]?.toUpperCase() || '?'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '5px'
                  }}>
                    {user.display_name || user.username}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#888'
                  }}>
                    Level {user.level} • {user.comments_count} comments • {user.upvotes_received} upvotes
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#00ff88'
                  }}>
                    {user.daily_score} pts
                  </div>
                  {user.rank <= 3 && (
                    <div style={{
                      fontSize: '14px',
                      color: getRankColor(user.rank),
                      fontWeight: 'bold'
                    }}>
                      {user.rank === 1 ? '50 CHZ' : user.rank === 2 ? '30 CHZ' : '20 CHZ'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section style={{
        padding: '40px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: '#111',
          border: '2px solid #00ff88',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '24px',
            color: '#00ff88',
            marginBottom: '20px'
          }}>
            How Daily Rewards Work
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>Comment</div>
              <div style={{ color: '#888', fontSize: '14px' }}>+10 points per comment</div>
            </div>
            
            <div>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>👍</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>Get Upvotes</div>
              <div style={{ color: '#888', fontSize: '14px' }}>+5 points per upvote</div>
            </div>
            
            <div>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏆</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>Win CHZ</div>
              <div style={{ color: '#888', fontSize: '14px' }}>Top 3 get rewards</div>
            </div>
          </div>
          
          <div style={{
            color: '#888',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Rankings reset daily at midnight. Connect your wallet to receive CHZ rewards automatically!
          </div>
        </div>
      </section>
    </div>
  )
}