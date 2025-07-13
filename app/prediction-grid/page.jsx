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
      await checkUser()
      await loadMatches()
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session) {
        setUser(null)
        setUserBalance(0)
        return
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      setUser(user)

      // Get user balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('fan_tokens, wallet_address')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setUserBalance(parseFloat(profile.fan_tokens || 0))
      
      if (profile.wallet_address) {
        setWalletAddress(profile.wallet_address)
        setWalletConnected(true)
      }

    } catch (error) {
      console.error('Auth error:', error)
      setUser(null)
      setUserBalance(0)
    }
  }

  const loadMatches = async () => {
    try {
      console.log('🔍 Loading matches...')
      
      // Fetch upcoming matches using the same API as matches page
      const response = await fetch('/api/matches?status=upcoming&limit=20')
      const data = await response.json()
      
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
        
        setMatches(formattedMatches)

        // Load existing bets if user is logged in
        if (user) {
          const matchIds = formattedMatches.map(m => m.fixture.id)
          await loadUserBets(matchIds)
        }
      } else {
        setMatches([])
      }

    } catch (error) {
      console.error('Failed to load matches:', error)
      setMatches([])
    }
  }

  const loadUserBets = async (matchIds) => {
    if (!user || matchIds.length === 0) return

    try {
      const { data: betsData, error } = await supabase
        .from('match_bets')
        .select('*')
        .eq('user_id', user.id)
        .in('match_id', matchIds)

      if (error) throw error

      const betsMap = {}
      betsData?.forEach(bet => {
        betsMap[bet.match_id] = bet
      })
      setUserBets(betsMap)

    } catch (error) {
      console.error('Failed to load user bets:', error)
    }
  }

  const placeBet = async (matchId, teamBet, amount) => {
    try {
      // Insert bet into database
      const { data, error } = await supabase
        .from('match_bets')
        .insert({
          user_id: user.id,
          match_id: matchId,
          team_bet: teamBet,
          amount: amount,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ fan_tokens: userBalance - amount })
        .eq('id', user.id)

      if (balanceError) throw balanceError

      // Refresh data
      await checkUser()
      await loadUserBets([matchId])

      alert(`✅ Bet placed successfully! You bet ${amount} CHZ on ${teamBet}`)

    } catch (error) {
      console.error('Failed to place bet:', error)
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
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '2px solid #333'
      }}>
        <h1 style={{
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
        <p style={{
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
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
      `}</style>
    </div>
  )
}

// Match Betting Card Component
function MatchBettingCard({ match, user, userBalance, existingBet, onPlaceBet, formatDate, getCountryFlag }) {
  const [selectedTeam, setSelectedTeam] = useState('')
  const [betAmount, setBetAmount] = useState(10)
  const [isPlacing, setIsPlacing] = useState(false)

  const handlePlaceBet = async () => {
    if (!selectedTeam || !user || isPlacing || betAmount > userBalance) return
    
    setIsPlacing(true)
    try {
      await onPlaceBet(match.fixture.id, selectedTeam, betAmount)
      setSelectedTeam('')
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setIsPlacing(false)
    }
  }

  const canBet = user && userBalance >= betAmount && !existingBet

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
              max={userBalance}
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
            disabled={!selectedTeam || isPlacing || betAmount > userBalance}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: selectedTeam && !isPlacing && betAmount <= userBalance ? '#00ff88' : '#444',
              color: selectedTeam && !isPlacing && betAmount <= userBalance ? '#000' : '#888',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: selectedTeam && !isPlacing && betAmount <= userBalance ? 'pointer' : 'not-allowed',
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
      ) : userBalance < betAmount ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#2d1b1b',
          border: '1px solid #664444',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#ff6b6b', marginBottom: '8px' }}>
            ⚠️ Insufficient CHZ balance
          </p>
          <p style={{ color: '#888', fontSize: '14px' }}>
            You have {userBalance} CHZ, need {betAmount} CHZ
          </p>
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