'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GoogleAuth from '../components/GoogleAuth'
import Header from '../components/Header'
import { sendChzFromAdmin, formatChzAmount } from '../utils/chiliz-token'

export default function Rewards() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [milestones, setMilestones] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [claiming, setClaiming] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchDashboardData(parsedUser.id)
      
      // Check for existing wallet connection from daily leaderboard
      const savedWalletConnection = localStorage.getItem('wallet_connection')
      if (savedWalletConnection) {
        try {
          const connection = JSON.parse(savedWalletConnection)
          setWalletAddress(connection.address)
          console.log('🎯 Frontend: Using saved wallet from daily leaderboard:', connection.address)
        } catch (error) {
          console.error('Error parsing saved wallet connection:', error)
          // Fallback to old method
          const savedWallet = localStorage.getItem('wallet_address')
          if (savedWallet) {
            setWalletAddress(savedWallet)
          }
        }
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true)
      console.log('🎯 Frontend: Fetching dashboard data for user:', userId)
      
      const [dashboardResponse, leaderboardResponse, milestonesResponse] = await Promise.all([
        fetch(`/api/dashboard/${userId}`),
        fetch('/api/leaderboard?limit=10'),
        fetch(`/api/milestones?userId=${userId}`)
      ])

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json()
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data)
          
          // Update localStorage with fresh XP and level data
          const updatedUser = {
            ...JSON.parse(localStorage.getItem('user_profile')),
            xp: dashboardResult.data.xp,
            level: dashboardResult.data.level
          }
          localStorage.setItem('user_profile', JSON.stringify(updatedUser))
          
          // Dispatch custom event to update header
          window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
            detail: updatedUser 
          }))
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

      if (milestonesResponse.ok) {
        const milestonesResult = await milestonesResponse.json()
        if (milestonesResult.success) {
          setMilestones(milestonesResult.data)
          console.log('🎯 Frontend: Milestones loaded:', milestonesResult.data.stats)
          console.log('🎯 Frontend: Available milestones:', milestonesResult.data.milestones.filter(m => m.is_eligible && !m.already_claimed))
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


  const handleClaimMilestone = async (milestone) => {
    if (!walletAddress) {
      alert('Please connect your wallet on the Daily Leaderboard page first!')
      return
    }

    if (!milestone.is_eligible || milestone.already_claimed) {
      alert('This milestone is not eligible for claiming!')
      return
    }

    try {
      setClaiming(milestone.milestone_id)
      console.log('🎯 Frontend: Claiming milestone:', milestone.title)

      // Step 1: Create the claim record
      const claimResponse = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          milestoneId: milestone.milestone_id,
          walletAddress: walletAddress
        })
      })

      const claimResult = await claimResponse.json()
      if (!claimResult.success) {
        throw new Error(claimResult.error || 'Failed to create claim')
      }

      // Step 2: Send CHZ tokens using admin wallet
      const sendResponse = await fetch('/api/daily-rewards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientAddress: walletAddress,
          amount: milestone.chz_reward,
          description: `Milestone reward: ${milestone.title}`
        })
      })

      const sendResult = await sendResponse.json()
      if (!sendResult.success) {
        throw new Error(sendResult.error || 'Failed to send CHZ tokens')
      }

      // Step 3: Update claim with transaction hash
      const updateResponse = await fetch('/api/rewards/claim', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: claimResult.data.claimId,
          transactionHash: sendResult.transactionHash,
          status: 'completed'
        })
      })

      const updateResult = await updateResponse.json()
      if (!updateResult.success) {
        console.error('Failed to update claim record:', updateResult.error)
      }

      alert(`🎉 Successfully claimed ${milestone.chz_reward} CHZ!\nTransaction: ${sendResult.transactionHash}`)
      
      // Refresh milestones data
      fetchDashboardData(user.id)

    } catch (error) {
      console.error('❌ Frontend: Error claiming milestone:', error)
      alert(`Failed to claim milestone: ${error.message}`)
    } finally {
      setClaiming(null)
    }
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
        <Header />

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
            <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#ffffff' }}>
              Chiliz XP Rewards
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
                Please sign in to view your XP rewards
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
        <Header />

        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading your XP rewards...</div>
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
        <Header />

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
      <Header />

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
            {['overview', 'milestones', 'activity', 'leaderboard'].map(tab => (
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

          {activeTab === 'milestones' && milestones && (
            <div style={{ display: 'grid', gap: '30px' }}>
              {/* Wallet Status Section */}
              <div style={{
                backgroundColor: '#111',
                borderRadius: '12px',
                padding: '25px',
                border: walletAddress ? '2px solid #00ff88' : '2px solid #ff6b35'
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
                  🔗 Wallet Status
                </h2>
                {walletAddress ? (
                  <div style={{
                    backgroundColor: '#1a2e1a',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #00ff88'
                  }}>
                    <div style={{ color: '#00ff88', fontWeight: 'bold', marginBottom: '5px' }}>
                      ✅ Wallet Connected (from Daily Leaderboard)
                    </div>
                    <div style={{ color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
                      {walletAddress}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#2e1a1a',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid #ff6b35'
                  }}>
                    <div style={{ color: '#ff6b35', fontWeight: 'bold', marginBottom: '10px' }}>
                      ⚠️ Wallet Not Connected
                    </div>
                    <div style={{ color: '#888', marginBottom: '15px' }}>
                      To claim CHZ milestone rewards, please connect your wallet on the Daily Leaderboard page first.
                    </div>
                    <a
                      href="/daily-leaderboard"
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#00ff88',
                        color: '#000',
                        textDecoration: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Go to Daily Leaderboard →
                    </a>
                  </div>
                )}
              </div>

              {/* Milestone Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  backgroundColor: '#111',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #333',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', color: '#00ff88', fontWeight: 'bold' }}>
                    {milestones.stats.totalEligible}
                  </div>
                  <div style={{ color: '#888', fontSize: '14px' }}>Available to Claim</div>
                </div>
                <div style={{
                  backgroundColor: '#111',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #333',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', color: '#FFD700', fontWeight: 'bold' }}>
                    {milestones.stats.totalChzAvailable.toFixed(1)}
                  </div>
                  <div style={{ color: '#888', fontSize: '14px' }}>CHZ Available</div>
                </div>
                <div style={{
                  backgroundColor: '#111',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #333',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', color: '#888', fontWeight: 'bold' }}>
                    {milestones.stats.totalClaimed}
                  </div>
                  <div style={{ color: '#888', fontSize: '14px' }}>Already Claimed</div>
                </div>
              </div>

              {/* Milestone Categories */}
              {Object.entries(milestones.milestonesByType).map(([type, typeMilestones]) => (
                <div key={type} style={{
                  backgroundColor: '#111',
                  borderRadius: '12px',
                  padding: '25px',
                  border: '1px solid #333'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#fff',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {type === 'level' && '🏆'} 
                    {type === 'comments' && '💬'} 
                    {type === 'upvotes' && '👍'} 
                    {type === 'streak' && '🔥'} 
                    {type.replace('_', ' ')} Milestones
                  </h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {typeMilestones.map((milestone) => (
                      <div key={milestone.milestone_id} style={{
                        backgroundColor: milestone.is_eligible && !milestone.already_claimed ? '#1a2e1a' : '#1a1a1a',
                        borderRadius: '8px',
                        padding: '20px',
                        border: milestone.is_eligible && !milestone.already_claimed ? '2px solid #00ff88' : '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '10px'
                          }}>
                            <div style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              {milestone.title}
                            </div>
                            <div style={{
                              backgroundColor: milestone.already_claimed ? '#888' : '#00ff88',
                              color: milestone.already_claimed ? '#fff' : '#000',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {milestone.chz_reward} CHZ
                            </div>
                          </div>
                          <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>
                            {milestone.description}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            fontSize: '12px'
                          }}>
                            <div style={{ color: '#888' }}>
                              Progress: {milestone.current_value} / {milestone.threshold_value}
                              {milestone.milestone_type === 'comments' && (
                                <span style={{ color: '#00ff88', marginLeft: '10px' }}>
                                  ({milestone.is_eligible ? '✅ Eligible' : '❌ Not Eligible'})
                                </span>
                              )}
                            </div>
                            <div style={{
                              backgroundColor: '#333',
                              borderRadius: '10px',
                              height: '6px',
                              width: '100px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                backgroundColor: milestone.is_eligible ? '#00ff88' : '#666',
                                height: '100%',
                                width: `${Math.min(100, (milestone.current_value / milestone.threshold_value) * 100)}%`,
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                          {milestone.already_claimed ? (
                            <div style={{
                              backgroundColor: '#888',
                              color: '#fff',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              ✅ Claimed
                            </div>
                          ) : milestone.is_eligible ? (
                            <button
                              onClick={() => handleClaimMilestone(milestone)}
                              disabled={!walletAddress || claiming === milestone.milestone_id}
                              style={{
                                backgroundColor: !walletAddress ? '#666' : '#00ff88',
                                color: !walletAddress ? '#888' : '#000',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: !walletAddress ? 'not-allowed' : 'pointer',
                                opacity: claiming === milestone.milestone_id ? 0.7 : 1
                              }}
                            >
                              {claiming === milestone.milestone_id ? '⏳ Claiming...' : '🎁 Claim CHZ'}
                            </button>
                          ) : (
                            <div style={{
                              backgroundColor: '#333',
                              color: '#888',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              Not Eligible
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Recent Claims */}
              {milestones.claims && milestones.claims.length > 0 && (
                <div style={{
                  backgroundColor: '#111',
                  borderRadius: '12px',
                  padding: '25px',
                  border: '1px solid #333'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📋 Recent Claims
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {milestones.claims.slice(0, 5).map((claim) => (
                      <div key={claim.id} style={{
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
                            {claim.reward_milestones?.title || 'Milestone Reward'}
                          </div>
                          <div style={{
                            color: '#888',
                            fontSize: '12px'
                          }}>
                            {new Date(claim.claimed_at).toLocaleDateString()}
                            {claim.transaction_hash && (
                              <span style={{ marginLeft: '10px' }}>
                                • TX: {claim.transaction_hash.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <div style={{
                            color: '#00ff88',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            +{claim.chz_amount} CHZ
                          </div>
                          <div style={{
                            backgroundColor: claim.status === 'completed' ? '#00ff88' : claim.status === 'pending' ? '#ff6b35' : '#666',
                            color: claim.status === 'completed' ? '#000' : '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {claim.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && dashboardData && (
            <>
              {/* Daily Rewards Section */}
              <section style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '36px',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#ffffff'
        }}>
          🏅 Daily Top Commentator Rewards
        </h2>
        
        <div style={{
          backgroundColor: '#111',
          border: '2px solid #00ff88',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🥇</div>
              <div style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>1st Place</div>
              <div style={{ color: '#888', fontSize: '18px' }}>10 CHZ Daily</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🥈</div>
              <div style={{ color: '#C0C0C0', fontSize: '24px', fontWeight: 'bold' }}>2nd Place</div>
              <div style={{ color: '#888', fontSize: '18px' }}>10 CHZ Daily</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🥉</div>
              <div style={{ color: '#CD7F32', fontSize: '24px', fontWeight: 'bold' }}>3rd Place</div>
              <div style={{ color: '#888', fontSize: '18px' }}>10 CHZ Daily</div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '16px',
            lineHeight: '1.5',
            marginBottom: '20px'
          }}>
            Be the top commentator of the day! Rankings based on comments posted + upvotes received.
            <br />
            Rewards distributed automatically at midnight to connected wallets.
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <a
              href="/daily-leaderboard"
              style={{
                display: 'inline-block',
                backgroundColor: '#00ff88',
                color: '#000',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              View Daily Leaderboard 📊
            </a>
          </div>
        </div>
      </section>

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
            </>
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