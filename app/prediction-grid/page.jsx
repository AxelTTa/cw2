'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { supabase } from '../utils/supabase'
import { switchToChilizChain, getChzBalance, isValidChilizAddress } from '../utils/chiliz-token'

export default function PredictionGrid() {
  const [user, setUser] = useState(null)
  const [matches, setMatches] = useState([])
  const [userBets, setUserBets] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeApp()
    setIsVisible(true)
  }, [])

  const initializeApp = async () => {
    try {
      console.log('🚀 [PREDICTION-GRID] Starting app initialization...')
      
      // Check user first, then load matches - this ensures user state is set before UI renders
      const userResult = await checkUser()
      console.log('👤 [PREDICTION-GRID] User check completed, now loading matches...')
      
      // Pass user state to loadMatches to avoid race condition
      await loadMatches(userResult)
    } catch (error) {
      console.error('❌ [PREDICTION-GRID] Failed to initialize app:', error)
      setError(error.message)
    } finally {
      setLoading(false)
      console.log('✅ [PREDICTION-GRID] App initialization completed')
    }
  }

  const checkUser = async () => {
    let authenticatedUser = null;
    
    try {
      console.log('🔍 [PREDICTION-GRID] Checking user authentication...')
      
      // First check localStorage for stored user profile and tokens
      const storedProfile = localStorage.getItem('user_profile')
      const sessionToken = localStorage.getItem('session_token')
      const accessToken = localStorage.getItem('access_token')
      
      console.log('🔍 [PREDICTION-GRID] LocalStorage check:', {
        hasProfile: !!storedProfile,
        hasSessionToken: !!sessionToken,
        hasAccessToken: !!accessToken
      })
      
      // If we have stored auth data, use it
      if (storedProfile && (sessionToken || accessToken)) {
        const userProfile = JSON.parse(storedProfile)
        console.log('✅ [PREDICTION-GRID] Found stored user profile:', {
          id: userProfile.id,
          email: userProfile.email,
          fanTokens: userProfile.fan_tokens
        })
        
        // Validate that user profile has required fields and is not undefined
        if (userProfile.id && userProfile.id !== 'undefined' && userProfile.id !== undefined) {
          const userObj = {
            id: userProfile.id,
            email: userProfile.email,
            user_metadata: {
              display_name: userProfile.display_name,
              avatar_url: userProfile.avatar_url
            }
          }
          
          setUser(userObj)
          authenticatedUser = userObj
        } else {
          console.log('❌ [PREDICTION-GRID] Stored profile has invalid ID, falling back to Supabase auth')
          // Clear invalid data and fall through to Supabase auth
          localStorage.removeItem('user_profile')
          localStorage.removeItem('session_token')
          localStorage.removeItem('access_token')
        }
          
          // Get fresh user balance from database only if we have a valid user
          if (authenticatedUser) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('fan_tokens, wallet_address')
              .eq('id', userProfile.id)
              .single()
            
            if (profileError) {
              console.error('❌ [PREDICTION-GRID] Error fetching profile:', profileError)
              // Fall back to stored balance
              setUserBalance(parseFloat(userProfile.fan_tokens || 0))
            } else {
              console.log('📊 [PREDICTION-GRID] Fresh profile data:', profile)
              setUserBalance(parseFloat(profile.fan_tokens || 0))
              
              if (profile.wallet_address) {
                setWalletAddress(profile.wallet_address)
                setWalletConnected(true)
              }
            }
            
            console.log('✅ [PREDICTION-GRID] User authenticated via localStorage')
            return authenticatedUser
          }
        }
      }
      
      // Fall back to Supabase auth session check
      console.log('🔍 [PREDICTION-GRID] Checking Supabase auth session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('❌ [PREDICTION-GRID] Supabase session error:', sessionError)
        throw sessionError
      }

      if (!session) {
        console.log('❌ [PREDICTION-GRID] No active session found')
        setUser(null)
        setUserBalance(0)
        return null
      }
      
      console.log('✅ [PREDICTION-GRID] Found Supabase session:', {
        userId: session.user.id,
        email: session.user.email
      })

      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('❌ [PREDICTION-GRID] Error getting user:', error)
        throw error
      }

      setUser(user)
      authenticatedUser = user

      // Get user balance
      console.log('📊 [PREDICTION-GRID] Fetching user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('fan_tokens, wallet_address')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ [PREDICTION-GRID] Profile error:', profileError)
        throw profileError
      }
      
      console.log('📊 [PREDICTION-GRID] User profile loaded:', {
        fanTokens: profile.fan_tokens,
        hasWallet: !!profile.wallet_address
      })
      
      setUserBalance(parseFloat(profile.fan_tokens || 0))
      
      if (profile.wallet_address) {
        setWalletAddress(profile.wallet_address)
        setWalletConnected(true)
        console.log('🔗 [PREDICTION-GRID] Wallet connected:', profile.wallet_address.slice(0, 6) + '...')
      }

      console.log('✅ [PREDICTION-GRID] User authenticated via Supabase')
      return authenticatedUser

    } catch (error) {
      console.error('❌ [PREDICTION-GRID] Auth error:', error)
      setUser(null)
      setUserBalance(0)
      return null
    }
  }

  const loadMatches = async (authenticatedUser = null) => {
    try {
      console.log('🔍 [PREDICTION-GRID] Loading matches...', {
        hasUserFromParam: !!authenticatedUser,
        hasUserFromState: !!user,
        userId: authenticatedUser?.id || user?.id
      })
      
      // Fetch upcoming matches using the same API as matches page
      const response = await fetch('/api/matches?status=upcoming&limit=20')
      const data = await response.json()
      
      console.log('📡 [PREDICTION-GRID] Matches API response:', {
        success: !!data.matches,
        count: data.matches?.length || 0,
        error: data.error
      })
      
      if (data.matches && data.matches.length > 0) {
        // Convert API response to format expected by betting card
        const formattedMatches = data.matches.map(match => ({
          fixture: {
            id: match.id,
            date: match.date || match.match_date,
            venue: {
              name: match.venue || 'TBA'
            }
          },
          teams: {
            home: {
              name: match.homeTeam?.name || match.home_team,
              logo: match.homeTeam?.logo || match.home_team_logo,
              country: match.homeTeam?.country || 'Unknown'
            },
            away: {
              name: match.awayTeam?.name || match.away_team,
              logo: match.awayTeam?.logo || match.away_team_logo,
              country: match.awayTeam?.country || 'Unknown'
            }
          }
        }))
        
        console.log('⚽ [PREDICTION-GRID] Matches loaded:', {
          count: formattedMatches.length,
          matches: formattedMatches.map(m => ({
            id: m.fixture.id,
            homeTeam: m.teams.home.name,
            awayTeam: m.teams.away.name,
            date: m.fixture.date
          }))
        })
        
        setMatches(formattedMatches)

        // Load existing bets if user is logged in (use parameter to avoid race condition)
        const currentUser = authenticatedUser || user
        if (currentUser) {
          console.log('🎯 [PREDICTION-GRID] User is logged in, loading bets for user:', currentUser.id)
          const matchIds = formattedMatches.map(m => m.fixture.id)
          await loadUserBets(matchIds, currentUser)
        } else {
          console.log('❌ [PREDICTION-GRID] No user logged in, skipping bet loading')
          setUserBets({}) // Clear any existing bets
        }
      } else {
        console.log('❌ [PREDICTION-GRID] No matches found in API response')
        setMatches([])
      }

    } catch (error) {
      console.error('❌ [PREDICTION-GRID] Failed to load matches:', error)
      setMatches([])
    }
  }

  const loadUserBets = async (matchIds, currentUser = null) => {
    const userToCheck = currentUser || user
    
    if (!userToCheck || matchIds.length === 0) {
      console.log('⚠️ [PREDICTION-GRID] Cannot load user bets:', {
        hasUser: !!userToCheck,
        matchCount: matchIds.length,
        userId: userToCheck?.id
      })
      return
    }

    try {
      console.log('🎯 [PREDICTION-GRID] Loading user bets for matches:', {
        userId: userToCheck.id,
        matchIds: matchIds,
        matchCount: matchIds.length
      })
      
      const { data: betsData, error } = await supabase
        .from('match_bets')
        .select('*')
        .eq('user_id', userToCheck.id)
        .in('match_id', matchIds)

      if (error) {
        console.error('❌ [PREDICTION-GRID] Error loading bets:', error)
        throw error
      }

      console.log('🎯 [PREDICTION-GRID] Bets loaded from database:', {
        count: betsData?.length || 0,
        bets: betsData?.map(bet => ({
          id: bet.id,
          matchId: bet.match_id,
          teamBet: bet.team_bet,
          amount: bet.amount,
          status: bet.status,
          createdAt: bet.created_at
        })) || []
      })

      const betsMap = {}
      betsData?.forEach(bet => {
        betsMap[bet.match_id] = bet
      })
      
      console.log('🎯 [PREDICTION-GRID] Bets mapped to state:', {
        mapKeys: Object.keys(betsMap),
        mapEntries: Object.entries(betsMap).map(([matchId, bet]) => ({
          matchId,
          teamBet: bet.team_bet,
          amount: bet.amount
        }))
      })
      
      setUserBets(betsMap)

    } catch (error) {
      console.error('❌ [PREDICTION-GRID] Failed to load user bets:', error)
      setUserBets({}) // Clear bets on error
    }
  }

  const placeBet = async (matchId, teamBet, amount) => {
    try {
      console.log('💰 [PREDICTION-GRID] Starting bet placement process...', {
        matchId,
        teamBet,
        amount,
        userId: user?.id,
        currentBalance: userBalance,
        hasUser: !!user,
        timestamp: new Date().toISOString()
      })
      
      // Validation checks
      if (!user) {
        console.error('❌ [PREDICTION-GRID] Cannot place bet - no user logged in')
        throw new Error('User not authenticated')
      }
      
      // Allow betting any amount, even more than current balance
      
      if (amount <= 0) {
        console.error('❌ [PREDICTION-GRID] Cannot place bet - invalid amount:', amount)
        throw new Error('Invalid bet amount')
      }
      
      console.log('✅ [PREDICTION-GRID] Validation passed, inserting bet into database...')
      
      // Insert bet into database
      const betData = {
        user_id: user.id,
        match_id: matchId,
        team_bet: teamBet,
        amount: amount,
        status: 'active',
        created_at: new Date().toISOString()
      }
      
      console.log('📝 [PREDICTION-GRID] Bet data to insert:', betData)
      
      const { data, error } = await supabase
        .from('match_bets')
        .insert(betData)
        .select()
        .single()

      if (error) {
        console.error('❌ [PREDICTION-GRID] Database error inserting bet:', {
          error,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          betData
        })
        throw error
      }
      
      console.log('✅ [PREDICTION-GRID] Bet inserted successfully:', {
        insertedBet: data,
        betId: data.id,
        insertedAt: data.created_at
      })

      // Update user balance
      const newBalance = userBalance - amount
      console.log('💰 [PREDICTION-GRID] Updating user balance...', {
        userId: user.id,
        oldBalance: userBalance,
        newBalance,
        betAmount: amount,
        operation: 'subtract'
      })
      
      const { error: balanceError, data: balanceData } = await supabase
        .from('profiles')
        .update({ fan_tokens: newBalance })
        .eq('id', user.id)
        .select()

      if (balanceError) {
        console.error('❌ [PREDICTION-GRID] Database error updating balance:', {
          error: balanceError,
          errorMessage: balanceError.message,
          userId: user.id,
          attemptedBalance: newBalance
        })
        throw balanceError
      }
      
      console.log('💰 [PREDICTION-GRID] Balance updated successfully:', {
        updatedProfile: balanceData,
        newBalance,
        balanceConfirmed: balanceData?.[0]?.fan_tokens
      })

      // Refresh data to ensure UI consistency
      console.log('🔄 [PREDICTION-GRID] Refreshing user data and bets...')
      await checkUser()
      await loadUserBets([matchId])
      
      console.log('✅ [PREDICTION-GRID] Bet placement completed successfully - all data refreshed')
      alert(`✅ Bet placed successfully! You bet ${amount} CHZ on ${teamBet}`)

    } catch (error) {
      console.error('❌ [PREDICTION-GRID] Failed to place bet - complete error details:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        matchId,
        teamBet,
        amount,
        userId: user?.id,
        userBalance,
        timestamp: new Date().toISOString()
      })
      
      alert(`❌ Failed to place bet: ${error.message}`)
      throw error
    }
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('❌ MetaMask not found. Please install MetaMask to connect your Chiliz wallet.')
        return
      }

      // Switch to Chiliz Chain
      await switchToChilizChain()
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      
      // Get CHZ balance
      const balance = await getChzBalance(address)
      
      setWalletAddress(address)
      setWalletBalance(parseFloat(balance))
      setWalletConnected(true)
      
      // Save wallet address to user profile
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ wallet_address: address })
          .eq('id', user.id)

        if (error) {
          console.error('Failed to save wallet address:', error)
        }
      }
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('❌ Failed to connect wallet: ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCountryFlag = (country) => {
    const flagMap = {
      'Spain': '🇪🇸',
      'Brazil': '🇧🇷',
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Saudi Arabia': '🇸🇦',
      'Germany': '🇩🇪',
      'Mexico': '🇲🇽',
      'France': '🇫🇷',
      'Morocco': '🇲🇦'
    }
    return flagMap[country] || '🌍'
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
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '2px solid #333'
      }}>
        <h1 className="hero-title" style={{
          fontSize: '48px',
          fontWeight: '800',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏆 Club World Cup 2025 Betting
        </h1>
        <p className="hero-subtitle" style={{
          fontSize: '20px',
          color: '#cccccc',
          maxWidth: '600px',
          margin: '0 auto 30px',
          lineHeight: '1.6'
        }}>
          Bet CHZ on your favorite teams to win upcoming matches
        </p>
        
        {user ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#00ff88',
            color: '#000',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            💰 {userBalance.toFixed(2)} CHZ Available
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            style={{
              backgroundColor: '#0099ff',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔐 Login to Start Betting
          </button>
        )}
      </section>

      {/* Main Content */}
      <main style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
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
              fontWeight: 'bold'
            }}>Loading Club World Cup matches...</div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#2d1b1b',
            border: '1px solid #664444',
            borderRadius: '8px',
            padding: '20px',
            color: '#ff6b6b',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'grid', gap: '50px' }}>
            
            {/* Wallet Connection Section */}
            {user && (
              <section>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                  margin: '0 0 30px 0'
                }}>
                  🔗 Chiliz Wallet
                </h2>
                
                {walletConnected ? (
                  <div style={{
                    backgroundColor: '#111',
                    border: '2px solid #00ff88',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '500px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#00ff88',
                          marginBottom: '8px'
                        }}>
                          ✅ Wallet Connected
                        </h3>
                        <p style={{
                          color: '#888',
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}>
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                        <p style={{
                          color: '#00ff88',
                          fontWeight: 'bold'
                        }}>
                          💰 {walletBalance.toFixed(4)} CHZ on-chain
                        </p>
                      </div>
                      <button
                        onClick={() => setWalletConnected(false)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #666',
                          color: '#666',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#111',
                    border: '2px solid #333',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    maxWidth: '500px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '12px'
                    }}>
                      Connect Your MetaMask Wallet
                    </h3>
                    <p style={{
                      color: '#888',
                      marginBottom: '20px'
                    }}>
                      Connect to Chiliz Chain for enhanced betting rewards
                    </p>
                    <button
                      onClick={connectWallet}
                      style={{
                        backgroundColor: '#ff6b35',
                        color: '#000',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🦊 Connect MetaMask
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Matches Section */}
            <section>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#0099ff',
                  margin: 0
                }}>
                  ⚽ Upcoming Matches
                </h2>
                <button
                  onClick={loadMatches}
                  style={{
                    backgroundColor: '#0099ff',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🔄 Refresh Matches
                </button>
              </div>

              {matches.length === 0 ? (
                <div style={{
                  backgroundColor: '#111',
                  border: '2px solid #333',
                  borderRadius: '12px',
                  padding: '60px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏟️</div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '12px'
                  }}>
                    No Upcoming Matches
                  </h3>
                  <p style={{ color: '#888', marginBottom: '30px' }}>
                    No Club World Cup matches found. Check back soon!
                  </p>
                  <button
                    onClick={loadMatches}
                    style={{
                      backgroundColor: '#00ff88',
                      color: '#000',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Try Again
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {matches.map((match) => (
                    <MatchBettingCard
                      key={match.fixture.id}
                      match={match}
                      user={user}
                      userBalance={userBalance}
                      existingBet={userBets[match.fixture.id]}
                      onPlaceBet={placeBet}
                      formatDate={formatDate}
                      getCountryFlag={getCountryFlag}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Test Section */}
            {user && (
              <TestSection user={user} />
            )}

            {/* How It Works Section */}
            <section>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#00ff88',
                margin: '0 0 30px 0',
                textAlign: 'center'
              }}>
                🎯 How Betting Works
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px'
              }}>
                {[
                  {
                    icon: '💰',
                    title: 'Simple Win/Loss',
                    description: 'Choose which team will win the match and bet your CHZ',
                    color: '#00ff88'
                  },
                  {
                    icon: '⚡',
                    title: 'CHZ Rewards',
                    description: 'Win CHZ tokens based on match outcomes and betting pools',
                    color: '#0099ff'
                  },
                  {
                    icon: '🏆',
                    title: 'Club World Cup',
                    description: 'Bet on the biggest club tournament featuring top teams worldwide',
                    color: '#ff6b35'
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#111',
                      border: '2px solid #333',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                      {item.icon}
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: item.color,
                      marginBottom: '12px'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{ color: '#888', lineHeight: '1.6' }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 30px 10px 20px !important;
            overflow: hidden;
          }
          
          .hero-title {
            font-size: 22px !important;
            margin-bottom: 10px !important;
            line-height: 1.2;
            word-wrap: break-word;
            padding: 0 5px;
          }
          
          .hero-subtitle {
            font-size: 14px !important;
            margin-bottom: 20px !important;
            padding: 0 10px;
            line-height: 1.3;
          }
          
          .user-stats {
            flex-direction: column !important;
            gap: 10px !important;
            align-items: center !important;
          }
          
          .wallet-card {
            max-width: 100% !important;
            padding: 20px 15px !important;
          }
          
          .wallet-connect-btn {
            width: 100% !important;
            padding: 15px 20px !important;
          }
          
          .matches-header {
            flex-direction: column !important;
            gap: 15px !important;
            align-items: center !important;
          }
          
          .matches-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .match-card {
            padding: 20px 15px !important;
          }
          
          .match-teams {
            gap: 10px !important;
          }
          
          .team-info {
            min-width: auto !important;
            text-align: center !important;
          }
          
          .team-logo {
            width: 40px !important;
            height: 40px !important;
          }
          
          .betting-options {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .bet-button {
            width: 100% !important;
            padding: 12px 15px !important;
            font-size: 14px !important;
          }
          
          .bet-input {
            width: 100% !important;
          }
          
          section h2 {
            font-size: 24px !important;
          }
          
          section > div:first-child {
            flex-direction: column !important;
            gap: 15px !important;
            align-items: flex-start !important;
          }
          
          section > div:first-child button {
            align-self: center !important;
          }
        }
        
        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px !important;
          }
          
          .hero-subtitle {
            font-size: 14px !important;
          }
          
          .wallet-card {
            padding: 15px 10px !important;
          }
          
          .match-card {
            padding: 15px 10px !important;
          }
          
          .team-logo {
            width: 35px !important;
            height: 35px !important;
          }
          
          .bet-button {
            padding: 10px 12px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  )
}

// Test Section Component
function TestSection({ user }) {
  const [testResults, setTestResults] = useState([])
  const [testing, setTesting] = useState(false)

  const addResult = (test, result, details) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      result,
      details,
      time: new Date().toLocaleTimeString()
    }])
  }

  const testExtremeAmounts = async () => {
    setTesting(true)
    
    const testCases = [
      { amount: 1000000, label: "1M CHZ" },
      { amount: 50000000, label: "50M CHZ" },
      { amount: 999999999, label: "999M CHZ" },
      { amount: 0.00001, label: "0.00001 CHZ" },
      { amount: 123.456789, label: "123.456789 CHZ" }
    ]

    for (const testCase of testCases) {
      try {
        const { data, error } = await supabase
          .from('match_bets')
          .insert({
            user_id: user.id,
            match_id: 999999,
            team_bet: 'Test Team',
            amount: testCase.amount,
            status: 'test'
          })
          .select()
          .single()

        if (error) throw error
        addResult(`Bet ${testCase.label}`, 'PASS', `Stored as: ${data.amount}`)
        
        // Clean up immediately
        await supabase.from('match_bets').delete().eq('id', data.id)
      } catch (error) {
        addResult(`Bet ${testCase.label}`, 'FAIL', error.message)
      }
    }
    
    setTesting(false)
  }

  const testBetWithdrawBalance = async () => {
    setTesting(true)
    
    try {
      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('fan_tokens')
        .eq('id', user.id)
        .single()
      
      const currentBalance = profile?.fan_tokens || 0
      const testAmount = currentBalance + 10000 // Bet more than balance
      
      const { data, error } = await supabase
        .from('match_bets')
        .insert({
          user_id: user.id,
          match_id: 999998,
          team_bet: 'Over-Balance Team',
          amount: testAmount,
          status: 'test'
        })
        .select()
        .single()

      if (error) throw error
      
      addResult('Over-Balance Bet', 'PASS', `Bet ${testAmount} CHZ when balance was ${currentBalance} CHZ`)
      
      // Test balance update (should go negative)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ fan_tokens: currentBalance - testAmount })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      addResult('Negative Balance', 'PASS', `Balance can go negative: ${currentBalance - testAmount} CHZ`)
      
      // Restore balance and clean up
      await supabase.from('profiles').update({ fan_tokens: currentBalance }).eq('id', user.id)
      await supabase.from('match_bets').delete().eq('id', data.id)
      
    } catch (error) {
      addResult('Over-Balance Test', 'FAIL', error.message)
    }
    
    setTesting(false)
  }

  const runAllTests = async () => {
    setTestResults([])
    await testExtremeAmounts()
    await testBetWithdrawBalance()
  }

  return (
    <section>
      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#ff6b35',
        margin: '0 0 30px 0',
        textAlign: 'center'
      }}>
        🧪 Betting System Tests
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '30px'
      }}>
        <button
          onClick={testExtremeAmounts}
          disabled={testing}
          style={{
            backgroundColor: '#00ff88',
            color: '#000',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          🚀 Test Extreme Amounts
        </button>

        <button
          onClick={testBetWithdrawBalance}
          disabled={testing}
          style={{
            backgroundColor: '#0099ff',
            color: '#000',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          💰 Test Over-Balance Betting
        </button>

        <button
          onClick={runAllTests}
          disabled={testing}
          style={{
            backgroundColor: '#ff6b35',
            color: '#000',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          🎯 Run All Tests
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{
          backgroundColor: '#111',
          border: '2px solid #333',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ color: '#0099ff', marginBottom: '20px' }}>Test Results</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {testResults.map((result) => (
              <div
                key={result.id}
                style={{
                  backgroundColor: '#222',
                  border: `2px solid ${result.result === 'PASS' ? '#00ff88' : '#ef4444'}`,
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <strong style={{ color: '#fff' }}>{result.test}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      backgroundColor: result.result === 'PASS' ? '#00ff88' : '#ef4444',
                      color: result.result === 'PASS' ? '#000' : '#fff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {result.result}
                    </span>
                    <span style={{ color: '#888', fontSize: '14px' }}>
                      {result.time}
                    </span>
                  </div>
                </div>
                <p style={{ color: '#ccc', fontSize: '14px', margin: 0 }}>
                  {result.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// Match Betting Card Component
function MatchBettingCard({ match, user, userBalance, existingBet, onPlaceBet, formatDate, getCountryFlag }) {
  const [selectedTeam, setSelectedTeam] = useState('')
  const [betAmount, setBetAmount] = useState(10)
  const [isPlacing, setIsPlacing] = useState(false)

  const handlePlaceBet = async () => {
    console.log('🎯 [MATCH-CARD] Attempting to place bet:', {
      matchId: match.fixture.id,
      selectedTeam,
      betAmount,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      isPlacing,
      userBalance,
      canAfford: betAmount <= userBalance,
      hasExistingBet: !!existingBet,
      existingBetDetails: existingBet ? {
        teamBet: existingBet.team_bet,
        amount: existingBet.amount,
        status: existingBet.status
      } : null,
      timestamp: new Date().toISOString()
    })
    
    // Detailed validation logging
    const validationResults = {
      hasSelectedTeam: !!selectedTeam,
      hasUser: !!user,
      isNotPlacing: !isPlacing,
      noExistingBet: !existingBet,
      betAmountValid: betAmount > 0
    }
    
    console.log('🔍 [MATCH-CARD] Bet validation results:', validationResults)
    
    if (!selectedTeam || !user || isPlacing) {
      console.log('❌ [MATCH-CARD] Cannot place bet - validation failed:', {
        failureReasons: {
          noTeamSelected: !selectedTeam,
          noUser: !user,
          alreadyPlacing: isPlacing
        },
        validationResults
      })
      return
    }
    
    setIsPlacing(true)
    try {
      console.log('🎯 [MATCH-CARD] Starting bet placement for match:', {
        matchId: match.fixture.id,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        selectedTeam,
        betAmount,
        userBalance
      })
      
      await onPlaceBet(match.fixture.id, selectedTeam, betAmount)
      setSelectedTeam('')
      console.log('✅ [MATCH-CARD] Bet placed successfully - clearing form')
    } catch (error) {
      console.error('❌ [MATCH-CARD] Failed to place bet:', {
        error,
        errorMessage: error.message,
        matchId: match.fixture.id,
        selectedTeam,
        betAmount,
        userId: user?.id
      })
    } finally {
      console.log('🔄 [MATCH-CARD] Resetting placing state')
      setIsPlacing(false)
    }
  }

  const canBet = user && !existingBet
  
  console.log('🎮 [MATCH-CARD] Match card render state:', {
    matchId: match.fixture.id,
    homeTeam: match.teams.home.name,
    awayTeam: match.teams.away.name,
    hasUser: !!user,
    userId: user?.id,
    userBalance,
    betAmount,
    canBet,
    hasExistingBet: !!existingBet,
    existingBetTeam: existingBet?.team_bet,
    selectedTeam,
    isPlacing
  })

  return (
    <div style={{
      backgroundColor: '#111',
      border: '2px solid #333',
      borderRadius: '12px',
      padding: '24px',
      transition: 'all 0.3s ease'
    }}>
      {/* Match Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <span style={{
          backgroundColor: '#0099ff',
          color: '#000',
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          📅 {formatDate(match.fixture.date)}
        </span>
        <span style={{ color: '#888', fontSize: '14px' }}>
          {match.fixture.venue?.name}
        </span>
      </div>

      {/* Teams */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <img 
            src={match.teams.home.logo} 
            alt={match.teams.home.name}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              marginRight: '12px',
              objectFit: 'contain'
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '4px'
            }}>
              {match.teams.home.name}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#888',
              fontSize: '14px'
            }}>
              <span style={{ marginRight: '6px' }}>
                {getCountryFlag(match.teams.home.country)}
              </span>
              {match.teams.home.country}
            </div>
          </div>
        </div>
        
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#666',
          margin: '0 20px'
        }}>
          VS
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right', marginRight: '12px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '4px'
            }}>
              {match.teams.away.name}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              color: '#888',
              fontSize: '14px'
            }}>
              {match.teams.away.country}
              <span style={{ marginLeft: '6px' }}>
                {getCountryFlag(match.teams.away.country)}
              </span>
            </div>
          </div>
          <img 
            src={match.teams.away.logo} 
            alt={match.teams.away.name}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              objectFit: 'contain'
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      </div>

      {/* Existing Bet Display */}
      {existingBet && (
        <div style={{
          backgroundColor: '#0099ff20',
          border: '1px solid #0099ff',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{
                color: '#0099ff',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>
                Your Bet: {existingBet.team_bet}
              </p>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Amount: {existingBet.amount} CHZ
              </p>
            </div>
            <span style={{
              backgroundColor: '#0099ff',
              color: '#000',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              PLACED
            </span>
          </div>
        </div>
      )}

      {/* Betting Interface */}
      {canBet ? (
        <div>
          {/* Bet Amount */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#888',
              fontSize: '14px',
              marginBottom: '8px'
            }}>
              Bet Amount (CHZ)
            </label>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '16px'
              }}
              placeholder="Enter any amount"
            />
          </div>

          {/* Team Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => setSelectedTeam(match.teams.home.name)}
              style={{
                padding: '16px',
                backgroundColor: selectedTeam === match.teams.home.name ? '#00ff88' : 'transparent',
                color: selectedTeam === match.teams.home.name ? '#000' : '#ffffff',
                border: `2px solid ${selectedTeam === match.teams.home.name ? '#00ff88' : '#444'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {match.teams.home.name} Win
            </button>
            
            <button
              onClick={() => setSelectedTeam(match.teams.away.name)}
              style={{
                padding: '16px',
                backgroundColor: selectedTeam === match.teams.away.name ? '#00ff88' : 'transparent',
                color: selectedTeam === match.teams.away.name ? '#000' : '#ffffff',
                border: `2px solid ${selectedTeam === match.teams.away.name ? '#00ff88' : '#444'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {match.teams.away.name} Win
            </button>
          </div>

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={!selectedTeam || isPlacing || betAmount <= 0}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: selectedTeam && !isPlacing && betAmount > 0 ? '#00ff88' : '#444',
              color: selectedTeam && !isPlacing && betAmount > 0 ? '#000' : '#888',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: selectedTeam && !isPlacing && betAmount > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            {isPlacing ? (
              '🔄 Placing Bet...'
            ) : selectedTeam ? (
              `🎯 Bet ${betAmount} CHZ on ${selectedTeam}`
            ) : (
              'Select a team to bet'
            )}
          </button>
        </div>
      ) : !user ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#222',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#888', marginBottom: '16px' }}>
            🔐 Login required to place bets
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: '#0099ff',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Login to Bet
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#222',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#888' }}>
            ✅ Bet already placed for this match
          </p>
        </div>
      )}
    </div>
  )
}