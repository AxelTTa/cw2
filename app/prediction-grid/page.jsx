'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation'

// UI Components
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1
  }
  
  const variants = {
    default: { backgroundColor: '#2563eb', color: 'white', padding: '10px 16px' },
    secondary: { backgroundColor: '#e5e7eb', color: '#111827', padding: '10px 16px' },
    outline: { border: '1px solid #d1d5db', backgroundColor: 'transparent', padding: '9px 15px' },
    ghost: { backgroundColor: 'transparent', padding: '10px 16px' },
    destructive: { backgroundColor: '#dc2626', color: 'white', padding: '10px 16px' },
    success: { backgroundColor: '#16a34a', color: 'white', padding: '10px 16px' },
    chz: { backgroundColor: '#FF6B35', color: 'white', padding: '10px 16px' }
  }
  
  const sizes = {
    default: { height: '40px', padding: '10px 16px' },
    sm: { height: '36px', padding: '8px 12px', fontSize: '14px' },
    lg: { height: '44px', padding: '12px 32px' }
  }
  
  const combinedStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  }
  
  return (
    <button
      style={combinedStyles}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }) => {
  const cardStyles = {
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '20px'
  }
  
  return (
    <div style={cardStyles}>
      {children}
    </div>
  )
}

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { backgroundColor: '#dbeafe', color: '#1e40af' },
    secondary: { backgroundColor: '#f3f4f6', color: '#374151' },
    destructive: { backgroundColor: '#fecaca', color: '#dc2626' },
    success: { backgroundColor: '#dcfce7', color: '#16a34a' },
    warning: { backgroundColor: '#fef3c7', color: '#92400e' },
    live: { backgroundColor: '#ff4444', color: 'white' }
  }
  
  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    ...variants[variant]
  }
  
  return (
    <span style={badgeStyles}>
      {children}
    </span>
  )
}

// Countdown Timer Component
const CountdownTimer = ({ expiresAt, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const difference = expiry - now

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000))
      } else {
        setTimeLeft(0)
        onExpired && onExpired()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isUrgent = timeLeft <= 30 && timeLeft > 0

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: isUrgent ? '#dc2626' : timeLeft === 0 ? '#6b7280' : '#16a34a',
      fontWeight: '600',
      fontSize: '14px'
    }}>
      <span>{timeLeft === 0 ? '⏰' : '⏱️'}</span>
      <span>{timeLeft === 0 ? 'EXPIRED' : formatTime(timeLeft)}</span>
    </div>
  )
}

// Pool Display Component
const PoolDisplay = ({ pools, totalStakes }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      marginTop: '12px'
    }}>
      {pools.map((pool) => {
        const percentage = totalStakes > 0 ? (pool.total_stakes / totalStakes) * 100 : 0
        const odds = pool.total_stakes > 0 ? (totalStakes / pool.total_stakes).toFixed(2) : '1.00'
        
        return (
          <div key={pool.option_value} style={{
            padding: '8px 12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
              {pool.option_value}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {pool.participant_count} bets
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {percentage.toFixed(1)}% pool
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
              {odds}x odds
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Individual Prediction Card
const PredictionCard = ({ prediction, onPlaceBet, userBalance, existingBet }) => {
  const [selectedOption, setSelectedOption] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)

  const totalStakes = prediction.pools?.reduce((sum, pool) => sum + parseFloat(pool.total_stakes || 0), 0) || 0
  const isExpired = new Date(prediction.expires_at) <= new Date()
  const isSettled = prediction.status === 'settled'
  const canBet = !isExpired && !isSettled && !existingBet && userBalance >= parseFloat(prediction.stake_amount)

  const handlePlaceBet = async () => {
    if (!selectedOption || !canBet || isPlacing) return

    setIsPlacing(true)
    try {
      await onPlaceBet(prediction.id, selectedOption, parseFloat(prediction.stake_amount))
      setSelectedOption('')
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setIsPlacing(false)
    }
  }

  const getBetStatusDisplay = () => {
    if (existingBet) {
      const statusColors = {
        active: '#3b82f6',
        won: '#16a34a',
        lost: '#dc2626',
        refunded: '#92400e'
      }
      return (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #bae6fd',
          marginTop: '12px'
        }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
            Your Bet: {existingBet.selected_option}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Stake: {existingBet.stake_amount} CHZ
          </div>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600',
            color: statusColors[existingBet.status] || '#6b7280'
          }}>
            Status: {existingBet.status.toUpperCase()}
            {existingBet.actual_return > 0 && (
              <span> (+{existingBet.actual_return} CHZ)</span>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: 0,
            flex: 1
          }}>
            {prediction.question}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {isSettled ? (
              <Badge variant="success">SETTLED</Badge>
            ) : isExpired ? (
              <Badge variant="warning">EXPIRED</Badge>
            ) : (
              <CountdownTimer 
                expiresAt={prediction.expires_at} 
                onExpired={() => window.location.reload()}
              />
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '12px'
        }}>
          <span>🎯 Stake: {prediction.stake_amount} CHZ</span>
          <span>💰 Total Pool: {totalStakes.toFixed(2)} CHZ</span>
          <span>👥 {prediction.pools?.reduce((sum, p) => sum + (p.participant_count || 0), 0) || 0} participants</span>
        </div>

        {isSettled && prediction.winning_option && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#dcfce7',
            borderRadius: '6px',
            border: '1px solid #bbf7d0',
            marginBottom: '12px'
          }}>
            <span style={{ fontWeight: '600', color: '#16a34a' }}>
              ✅ Winner: {prediction.winning_option}
            </span>
          </div>
        )}
      </div>

      {prediction.pools && (
        <PoolDisplay pools={prediction.pools} totalStakes={totalStakes} />
      )}

      {getBetStatusDisplay()}

      {canBet && !existingBet && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {prediction.options?.map((option) => (
              <Button
                key={option}
                variant={selectedOption === option ? 'chz' : 'outline'}
                size="sm"
                onClick={() => setSelectedOption(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          <Button
            variant="chz"
            disabled={!selectedOption || isPlacing}
            onClick={handlePlaceBet}
            style={{ width: '100%' }}
          >
            {isPlacing ? '🔄 Placing Bet...' : `🎯 Bet ${prediction.stake_amount} CHZ on ${selectedOption || '...'}`}
          </Button>
        </div>
      )}

      {!canBet && !existingBet && !isSettled && !isExpired && (
        <div style={{
          marginTop: '16px',
          padding: '8px 12px',
          backgroundColor: '#fef2f2',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#991b1b'
        }}>
          ⚠️ Insufficient CHZ balance ({userBalance} CHZ available)
        </div>
      )}
    </Card>
  )
}

// Main Prediction Grid Component
export default function PredictionGrid() {
  const [user, setUser] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [userBets, setUserBets] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [liveMatches, setLiveMatches] = useState([])
  const [userBalance, setUserBalance] = useState(0)
  const router = useRouter()

  // Initialize user and data
  useEffect(() => {
    const initializeApp = async () => {
      await checkUser()
      await loadLiveMatches()
    }
    initializeApp()
  }, [])

  // Auto-refresh predictions every 10 seconds
  useEffect(() => {
    if (selectedMatch) {
      loadPredictions()
      const interval = setInterval(loadPredictions, 10000)
      return () => clearInterval(interval)
    }
  }, [selectedMatch])

  const checkUser = async () => {
    try {
      console.log('🔍 Checking user authentication...')
      
      // Try to get user session, but don't redirect if not found
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        // Don't throw error, just continue without auth
      }
      
      if (!session) {
        console.log('⚠️ No active session found, continuing as guest')
        setUser(null)
        setUserBalance(0)
        return
      }
      
      console.log('✅ Session found, getting user details')
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('❌ User error:', error)
        setUser(null)
        setUserBalance(0)
        return
      }

      if (!user) {
        console.log('⚠️ No user found, continuing as guest')
        setUser(null)
        setUserBalance(0)
        return
      }

      console.log('✅ User authenticated:', user.email)
      setUser(user)
      
      // Get user profile and balance
      console.log('🔍 Fetching user profile and balance...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('fan_tokens, username')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ Profile error:', profileError)
        setUserBalance(0)
        return
      }
      
      console.log('✅ User profile loaded, balance:', profile.fan_tokens)
      setUserBalance(parseFloat(profile.fan_tokens || 0))

    } catch (error) {
      console.error('❌ Auth error:', error)
      setUser(null)
      setUserBalance(0)
    }
  }

  const loadLiveMatches = async () => {
    try {
      console.log('🔍 Loading matches for predictions...')
      
      // Get live matches first
      const { data: liveMatches, error: liveError } = await supabase
        .from('matches')
        .select(`
          id, home_team, away_team, match_date, status, home_team_id, away_team_id,
          home_team_logo, away_team_logo, league
        `)
        .in('status', ['1H', '2H', 'HT', 'ET', 'P'])
        .order('match_date', { ascending: true })
        .limit(5)

      // Get upcoming matches (next 7 days) 
      const { data: upcomingMatches, error: upcomingError } = await supabase
        .from('matches')
        .select(`
          id, home_team, away_team, match_date, status, home_team_id, away_team_id,
          home_team_logo, away_team_logo, league
        `)
        .eq('status', 'ns')
        .gte('match_date', new Date().toISOString())
        .lte('match_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('match_date', { ascending: true })
        .limit(5)

      // Get recent finished matches as backup
      const { data: recentMatches, error: recentError } = await supabase
        .from('matches')
        .select(`
          id, home_team, away_team, match_date, status, home_team_id, away_team_id,
          home_team_logo, away_team_logo, league
        `)
        .eq('status', 'ft')
        .order('match_date', { ascending: false })
        .limit(3)

      if (liveError && upcomingError && recentError) {
        console.error('❌ All match queries failed')
        throw new Error('Failed to load any matches')
      }
      
      // Combine all matches with priority: live > upcoming > recent
      const allMatches = [
        ...(liveMatches || []),
        ...(upcomingMatches || []),
        ...(recentMatches || [])
      ]
      
      console.log('✅ Matches loaded:', {
        live: liveMatches?.length || 0,
        upcoming: upcomingMatches?.length || 0,
        recent: recentMatches?.length || 0,
        total: allMatches.length
      })
      
      setLiveMatches(allMatches)
      
      // Auto-select first match
      if (allMatches && allMatches.length > 0 && !selectedMatch) {
        console.log('🎯 Auto-selecting first match:', allMatches[0].home_team, 'vs', allMatches[0].away_team)
        setSelectedMatch(allMatches[0])
      }
      
      // Always set loading to false after loading matches
      setLoading(false)
      
    } catch (error) {
      console.error('❌ Failed to load matches:', error)
      setLoading(false)
      setError(error.message)
    }
  }

  const loadPredictions = async () => {
    if (!selectedMatch || !user) return

    try {
      setLoading(true)

      // Load active predictions for the match
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('prediction_markets')
        .select(`
          *,
          pools:prediction_pools(
            id, option_value, total_stakes, participant_count
          )
        `)
        .eq('match_id', selectedMatch.id)
        .eq('prediction_type', 'micro')
        .in('status', ['active', 'settled'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (predictionsError) throw predictionsError

      setPredictions(predictionsData || [])

      // Load user's existing bets
      const { data: betsData, error: betsError } = await supabase
        .from('prediction_stakes')
        .select('*')
        .eq('user_id', user.id)
        .in('market_id', (predictionsData || []).map(p => p.id))

      if (betsError) throw betsError

      // Create map of market_id -> bet
      const betsMap = {}
      betsData?.forEach(bet => {
        betsMap[bet.market_id] = bet
      })
      setUserBets(betsMap)

    } catch (error) {
      console.error('Failed to load predictions:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const placeBet = async (marketId, selectedOption, stakeAmount) => {
    try {
      const response = await fetch('/api/predictions/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId,
          selectedOption,
          stakeAmount
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Refresh data
      await loadPredictions()
      await checkUser() // Refresh balance

      // Show success message
      alert(`✅ Bet placed successfully! ${result.message}`)

    } catch (error) {
      console.error('Failed to place bet:', error)
      alert(`❌ Failed to place bet: ${error.message}`)
      throw error
    }
  }

  const generateNewPrediction = async () => {
    if (!selectedMatch) return

    try {
      const response = await fetch('/api/predictions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch.id
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await loadPredictions()
        alert('🎯 New prediction generated!')
      } else {
        alert(`⚠️ ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to generate prediction:', error)
      alert('❌ Failed to generate new prediction')
    }
  }

  const createTestMatch = async () => {
    try {
      console.log('🧪 Creating test match...')
      const { data: testMatch, error } = await supabase
        .from('matches')
        .insert({
          home_team: 'Test FC',
          away_team: 'Demo United',
          league: 'Test League',
          match_date: new Date().toISOString(),
          status: '1H', // First half
          home_score: 1,
          away_score: 0
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to create test match:', error)
        alert('❌ Failed to create test match: ' + error.message)
        return
      }

      console.log('✅ Test match created:', testMatch)
      await loadLiveMatches()
      alert('🧪 Test match created successfully!')
    } catch (error) {
      console.error('❌ Error creating test match:', error)
      alert('❌ Error creating test match')
    }
  }

  if (loading && !predictions.length) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        padding: '20px',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🎯</div>
            <h2>Loading Prediction Grid...</h2>
            {error && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                color: '#991b1b'
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        padding: '20px',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>❌</div>
            <h2>Error Loading Prediction Grid</h2>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              borderRadius: '6px',
              color: '#991b1b'
            }}>
              {error}
            </div>
            <Button 
              variant="chz" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '16px' }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
                marginBottom: '4px'
              }}>
                🎯 Prediction Grid
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '14px'
              }}>
                Bet CHZ on live match micro-events
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#FF6B35',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                💰 {userBalance.toFixed(2)} CHZ
              </div>
              <Button variant="outline" onClick={() => router.push('/')}>
                ← Back to Matches
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Match Selection */}
        <Card style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>🔴 Live Matches</h3>
          
          {liveMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏟️</div>
              <h3 style={{ marginBottom: '8px', color: '#111827' }}>No Live Matches</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                There are currently no live matches available for predictions.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button variant="outline" onClick={loadLiveMatches}>
                  🔄 Refresh Matches
                </Button>
                <Button variant="chz" onClick={createTestMatch}>
                  🧪 Create Test Match
                </Button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px'
            }}>
              {liveMatches.map((match) => (
                <Button
                  key={match.id}
                  variant={selectedMatch?.id === match.id ? 'chz' : 'outline'}
                  onClick={() => setSelectedMatch(match)}
                  style={{
                    padding: '12px',
                    height: 'auto',
                    textAlign: 'left',
                    justifyContent: 'flex-start'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {match.home_team} vs {match.away_team}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      <Badge variant="live">🔴 {match.status}</Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </Card>

        {selectedMatch && (
          <>
            {/* Match Info & Controls */}
            <Card style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: '8px' }}>
                    {selectedMatch.home_team} vs {selectedMatch.away_team}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Badge variant="live">🔴 LIVE</Badge>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {predictions.length} active predictions
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="outline" onClick={loadPredictions}>
                    🔄 Refresh
                  </Button>
                  <Button variant="chz" onClick={generateNewPrediction}>
                    ⚡ Generate Prediction
                  </Button>
                </div>
              </div>
            </Card>

            {/* Predictions Grid */}
            {predictions.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                  <h3 style={{ marginBottom: '8px' }}>No Active Predictions</h3>
                  <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                    Generate a new prediction to start betting on this match
                  </p>
                  <Button variant="chz" onClick={generateNewPrediction}>
                    ⚡ Generate First Prediction
                  </Button>
                </div>
              </Card>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '20px'
              }}>
                {predictions.map((prediction) => (
                  <PredictionCard
                    key={prediction.id}
                    prediction={prediction}
                    onPlaceBet={placeBet}
                    userBalance={userBalance}
                    existingBet={userBets[prediction.id]}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}