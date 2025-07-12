'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GoogleAuth from '../components/GoogleAuth'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchDashboardData(parsedUser.id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true)
      console.log('🎯 Frontend: Fetching dashboard data for user:', userId)
      
      const [dashboardResponse, leaderboardResponse] = await Promise.all([
        fetch(`/api/dashboard/${userId}`),
        fetch('/api/leaderboard?limit=10')
      ])

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json()
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data)
        } else {
          throw new Error(dashboardResult.error || 'Failed to load dashboard data')
        }
      }

      if (leaderboardResponse.ok) {
        const leaderboardResult = await leaderboardResponse.json()
        if (leaderboardResult.success) {
          setLeaderboard(leaderboardResult.leaderboard || [])
        }
      }

    } catch (err) {
      console.error('❌ Frontend: Error loading dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem('user_profile', JSON.stringify(userData))
    fetchDashboardData(userData.id)
  }

  const handleAuthError = (error) => {
    console.error('Auth error:', error)
    setError('Authentication failed')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getLevelColor = (level) => {
    if (level >= 50) return '#FFD700' // Gold
    if (level >= 25) return '#C0C0C0' // Silver  
    if (level >= 10) return '#CD7F32' // Bronze
    return '#00ff88' // Default green
  }

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700' // Gold
    if (rank === 2) return '#C0C0C0' // Silver
    if (rank === 3) return '#CD7F32' // Bronze
    return '#888'
  }

  if (!user) {
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
            <a href="/dashboard" style={{ color: '#00ff88', textDecoration: 'none' }}>Dashboard</a>
          </nav>
        </header>

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
            <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#ffffff' }}>
              Chiliz XP Dashboard
            </h1>
            <p style={{ fontSize: '18px', color: '#888', marginBottom: '40px' }}>
              Track your progress, XP, level, and see how you rank against other users!
            </p>
            <div style={{
              backgroundColor: '#111',
              borderRadius: '16px',
              padding: '40px',
              border: '2px solid #333'
            }}>
              <p style={{ fontSize: '16px', color: '#888', marginBottom: '30px' }}>
                Please sign in to view your XP dashboard
              </p>
              <GoogleAuth 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
            </div>
          </div>
        </main>
      </div>
    )
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
            <a href="/dashboard" style={{ color: '#00ff88', textDecoration: 'none' }}>Dashboard</a>
          </nav>
        </header>

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading your XP dashboard...</div>
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
            <a href="/dashboard" style={{ color: '#00ff88', textDecoration: 'none' }}>Dashboard</a>
          </nav>
        </header>

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '18px', color: '#ef4444', marginBottom: '20px' }}>
            {error}
          </div>
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
            Retry
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
          <a href="/players" style={{ color: '#888', textDecoration: 'none' }}>Players</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/competitions" style={{ color: '#888', textDecoration: 'none' }}>Competitions</a>
          <a href="/dashboard" style={{ color: '#00ff88', textDecoration: 'none' }}>Dashboard</a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* User Header */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
            <h1 style={{ 
              fontSize: '32px', 
              marginBottom: '10px',
              color: '#ffffff'
            }}>
              {dashboardData?.display_name || dashboardData?.username || 'Unknown User'}
            </h1>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '30px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '18px'
              }}>
                <span style={{ 
                  color: getLevelColor(dashboardData?.level || 1),
                  fontWeight: 'bold'
                }}>
                  Level {dashboardData?.level || 1}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '18px'
              }}>
                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                  {(dashboardData?.xp || 0).toLocaleString()} XP
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '18px'
              }}>
                <span style={{ 
                  color: getRankColor(dashboardData?.global_rank),
                  fontWeight: 'bold'
                }}>
                  #{dashboardData?.global_rank || 'N/A'} Global
                </span>
              </div>
            </div>
            
            {/* Level Progress Bar */}
            {dashboardData && (
              <div style={{ marginTop: '20px', maxWidth: '400px', margin: '20px auto 0' }}>
                <div style={{
                  backgroundColor: '#333',
                  borderRadius: '10px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: getLevelColor(dashboardData.level),
                    height: '100%',
                    width: `${dashboardData.level_progress_percent || 0}%`,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  marginTop: '5px',
                  textAlign: 'center'
                }}>
                  {dashboardData.xp_needed_for_next_level || 0} XP to next level
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '30px',
            borderBottom: '2px solid #333',
            paddingBottom: '10px'
          }}>
            {['overview', 'activity', 'leaderboard'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  backgroundColor: activeTab === tab ? '#00ff88' : 'transparent',
                  color: activeTab === tab ? '#000' : '#888',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && dashboardData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* XP Stats */}
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
                  color: '#00ff88',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  ⚡ Chiliz XP Stats
                </h2>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Total XP:</span>
                    <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                      {(dashboardData.total_xp_earned || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Current XP:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                      {(dashboardData.xp || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Weekly XP:</span>
                    <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                      +{(dashboardData.weekly_xp || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Monthly XP:</span>
                    <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                      +{(dashboardData.monthly_xp || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
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
                  color: '#ff6b35',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📊 Activity Stats
                </h2>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Comments Posted:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                      {dashboardData.total_comments || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Likes Received:</span>
                    <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                      {dashboardData.total_likes_received || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Global Rank:</span>
                    <span style={{ 
                      color: getRankColor(dashboardData.global_rank), 
                      fontWeight: 'bold' 
                    }}>
                      #{dashboardData.global_rank || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Member Since:</span>
                    <span style={{ color: '#888', fontSize: '14px' }}>
                      {formatDate(dashboardData.member_since)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Level Information */}
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
                  color: getLevelColor(dashboardData.level),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  🏆 Level Progress
                </h2>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Current Level:</span>
                    <span style={{ 
                      color: getLevelColor(dashboardData.level), 
                      fontWeight: 'bold' 
                    }}>
                      Level {dashboardData.level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Progress:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                      {dashboardData.level_progress_percent || 0}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>XP to Next Level:</span>
                    <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
                      {dashboardData.xp_needed_for_next_level || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && dashboardData && (
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
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📈 Recent XP Activity
              </h2>
              {dashboardData.recent_activities && dashboardData.recent_activities.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {dashboardData.recent_activities.map((activity, index) => (
                    <div key={index} style={{
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                      padding: '15px',
                      border: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ 
                          color: '#fff', 
                          fontWeight: 'bold',
                          marginBottom: '5px'
                        }}>
                          {activity.description || activity.action_type}
                        </div>
                        <div style={{ 
                          color: '#888', 
                          fontSize: '12px'
                        }}>
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                      <div style={{
                        color: activity.xp_change > 0 ? '#00ff88' : '#ff4444',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {activity.xp_change > 0 ? '+' : ''}{activity.xp_change} XP
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#888',
                  padding: '40px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
                  <div>No recent activity yet!</div>
                  <div style={{ fontSize: '14px', marginTop: '10px' }}>
                    Start commenting and engaging to earn XP!
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
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
                color: '#FFD700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🏆 XP Leaderboard
              </h2>
              {leaderboard.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {leaderboard.map((leader, index) => (
                    <div key={leader.user_id} style={{
                      backgroundColor: leader.user_id === user.id ? '#1a2e1a' : '#1a1a1a',
                      borderRadius: '8px',
                      padding: '15px',
                      border: leader.user_id === user.id ? '2px solid #00ff88' : '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: getRankColor(leader.rank),
                          minWidth: '30px'
                        }}>
                          #{leader.rank}
                        </div>
                        <div>
                          <div style={{ 
                            color: '#fff', 
                            fontWeight: 'bold',
                            marginBottom: '5px'
                          }}>
                            {leader.display_name || leader.username}
                            {leader.user_id === user.id && (
                              <span style={{ color: '#00ff88', marginLeft: '8px' }}>
                                (You)
                              </span>
                            )}
                          </div>
                          <div style={{ 
                            color: getLevelColor(leader.level), 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            Level {leader.level} • {leader.total_comments} comments • {leader.total_likes_received} likes
                          </div>
                        </div>
                      </div>
                      <div style={{
                        color: '#00ff88',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {leader.xp.toLocaleString()} XP
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#888',
                  padding: '40px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
                  <div>Leaderboard loading...</div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}