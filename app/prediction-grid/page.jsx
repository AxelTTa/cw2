'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { supabase } from '../utils/supabase'
import { apiFootball } from '../utils/api-football'
import { switchToChilizChain, getChzBalance, isValidChilizAddress } from '../utils/chiliz-token'

// Simple UI Components with homepage color scheme
const Button = ({ children, onClick, variant = 'default', disabled = false, className = '' }) => {
  const variants = {
    default: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
    chz: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  )
}

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-600 text-white',
    upcoming: 'bg-yellow-600 text-white',
    live: 'bg-red-600 text-white animate-pulse'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}

// Simple Betting Card for Win/Loss
const BettingCard = ({ match, onPlaceBet, userBalance, user, existingBet }) => {
  const [selectedTeam, setSelectedTeam] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [betAmount, setBetAmount] = useState(10)

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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canBet = user && userBalance >= betAmount && !existingBet

  return (
    <Card className="relative overflow-hidden">
      {/* Match Header */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant="upcoming">📅 {formatDate(match.fixture.date)}</Badge>
        <div className="text-sm text-gray-400">
          {match.fixture.venue?.name}, {match.fixture.venue?.city}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <img 
            src={match.teams.home.logo} 
            alt={match.teams.home.name}
            className="w-12 h-12 rounded-full"
            onError={(e) => e.target.src = '/default-team-logo.png'}
          />
          <div>
            <h3 className="font-bold text-white">{match.teams.home.name}</h3>
            <p className="text-sm text-gray-400">{match.teams.home.country}</p>
          </div>
        </div>
        
        <div className="text-2xl font-bold text-gray-400">VS</div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <h3 className="font-bold text-white">{match.teams.away.name}</h3>
            <p className="text-sm text-gray-400">{match.teams.away.country}</p>
          </div>
          <img 
            src={match.teams.away.logo} 
            alt={match.teams.away.name}
            className="w-12 h-12 rounded-full"
            onError={(e) => e.target.src = '/default-team-logo.png'}
          />
        </div>
      </div>

      {/* Existing Bet Display */}
      {existingBet && (
        <div className="mb-4 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-300 font-semibold">Your Bet: {existingBet.team_bet}</p>
              <p className="text-sm text-gray-400">Amount: {existingBet.amount} CHZ</p>
            </div>
            <Badge variant="default">PLACED</Badge>
          </div>
        </div>
      )}

      {/* Betting Interface */}
      {canBet ? (
        <div className="space-y-4">
          {/* Bet Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount (CHZ)
            </label>
            <input
              type="number"
              min="1"
              max={userBalance}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Team Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedTeam === match.teams.home.name ? 'chz' : 'secondary'}
              onClick={() => setSelectedTeam(match.teams.home.name)}
              className="p-4"
            >
              <div className="text-center">
                <div className="font-semibold">{match.teams.home.name}</div>
                <div className="text-sm opacity-75">Win</div>
              </div>
            </Button>
            
            <Button
              variant={selectedTeam === match.teams.away.name ? 'chz' : 'secondary'}
              onClick={() => setSelectedTeam(match.teams.away.name)}
              className="p-4"
            >
              <div className="text-center">
                <div className="font-semibold">{match.teams.away.name}</div>
                <div className="text-sm opacity-75">Win</div>
              </div>
            </Button>
          </div>

          {/* Place Bet Button */}
          <Button
            variant="success"
            onClick={handlePlaceBet}
            disabled={!selectedTeam || isPlacing || betAmount > userBalance}
            className="w-full"
          >
            {isPlacing ? (
              '🔄 Placing Bet...'
            ) : selectedTeam ? (
              `🎯 Bet ${betAmount} CHZ on ${selectedTeam}`
            ) : (
              'Select a team to bet'
            )}
          </Button>
        </div>
      ) : !user ? (
        <div className="text-center p-6 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400 mb-4">🔐 Login required to place bets</p>
          <Button variant="chz" onClick={() => window.location.href = '/login'}>
            Login to Bet
          </Button>
        </div>
      ) : userBalance < betAmount ? (
        <div className="text-center p-6 bg-red-900/30 border border-red-600/50 rounded-lg">
          <p className="text-red-300">⚠️ Insufficient CHZ balance</p>
          <p className="text-sm text-gray-400">You have {userBalance} CHZ, need {betAmount} CHZ</p>
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">✅ Bet already placed for this match</p>
        </div>
      )}
    </Card>
  )
}

// Wallet Connection Component
const WalletConnector = ({ user, onWalletConnect }) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState(0)
  const [connecting, setConnecting] = useState(false)

  const connectWallet = async () => {
    try {
      setConnecting(true)
      
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
      
      onWalletConnect(address, balance)
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('❌ Failed to connect wallet: ' + error.message)
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress('')
    setWalletBalance(0)
    onWalletConnect('', 0)
  }

  if (walletAddress) {
    return (
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">🔗 Chiliz Wallet Connected</h3>
            <p className="text-sm text-gray-400">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <p className="text-green-400 font-semibold">
              💰 {walletBalance.toFixed(4)} CHZ on-chain
            </p>
          </div>
          <Button variant="secondary" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">🔗 Connect Chiliz Wallet</h3>
        <p className="text-gray-400 mb-4">
          Connect your MetaMask wallet to Chiliz Chain for enhanced betting rewards
        </p>
        <Button 
          variant="chz" 
          onClick={connectWallet}
          disabled={connecting}
        >
          {connecting ? '🔄 Connecting...' : '🦊 Connect MetaMask'}
        </Button>
      </div>
    </Card>
  )
}

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
  const router = useRouter()

  useEffect(() => {
    initializeApp()
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
        .select('fan_tokens')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setUserBalance(parseFloat(profile.fan_tokens || 0))

    } catch (error) {
      console.error('Auth error:', error)
      setUser(null)
      setUserBalance(0)
    }
  }

  const loadMatches = async () => {
    try {
      console.log('🔍 Loading Club World Cup matches...')
      const clubWorldCupMatches = await apiFootball.fetchClubWorldCupMatches()
      
      console.log('✅ Loaded matches:', clubWorldCupMatches.length)
      setMatches(clubWorldCupMatches)

      // Load existing bets if user is logged in
      if (user) {
        await loadUserBets(clubWorldCupMatches.map(m => m.fixture.id))
      }

    } catch (error) {
      console.error('Failed to load matches:', error)
      setError('Failed to load matches: ' + error.message)
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

      // Show enhanced message if wallet is connected
      const successMessage = walletConnected 
        ? `✅ Bet placed successfully! You bet ${amount} CHZ on ${teamBet}. Rewards will be distributed to your connected Chiliz wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : `✅ Bet placed successfully! You bet ${amount} CHZ on ${teamBet}`

      alert(successMessage)

    } catch (error) {
      console.error('Failed to place bet:', error)
      alert(`❌ Failed to place bet: ${error.message}`)
      throw error
    }
  }

  const handleWalletConnect = (address, balance) => {
    setWalletConnected(!!address)
    setWalletAddress(address)
    setWalletBalance(parseFloat(balance))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="text-6xl mb-6">⚽</div>
            <h2 className="text-2xl font-bold text-white mb-4">Loading Club World Cup...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Matches</h2>
            <p className="text-red-400 mb-8">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              🏆 <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Club World Cup 2025
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Bet CHZ on your favorite teams to win upcoming matches
            </p>
            
            {user ? (
              <div className="inline-flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-6 py-3">
                <span className="text-green-400 font-semibold text-lg">
                  💰 {userBalance.toFixed(2)} CHZ Available
                </span>
              </div>
            ) : (
              <Button variant="chz" onClick={() => router.push('/login')}>
                🔐 Login to Start Betting
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Connector */}
      {user && (
        <div className="container mx-auto px-6 py-6">
          <WalletConnector 
            user={user} 
            onWalletConnect={handleWalletConnect}
          />
        </div>
      )}

      {/* Matches Grid */}
      <div className="container mx-auto px-6 py-12">
        {matches.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-6">🏟️</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Upcoming Matches</h3>
            <p className="text-gray-400 mb-8">
              No Club World Cup matches found. The tournament will begin soon!
            </p>
            <Button onClick={loadMatches}>
              🔄 Refresh Matches
            </Button>
          </Card>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                📅 Upcoming Matches
              </h2>
              <p className="text-gray-400">
                {matches.length} matches available for betting
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {matches.map((match) => (
                <BettingCard
                  key={match.fixture.id}
                  match={match}
                  onPlaceBet={placeBet}
                  userBalance={userBalance}
                  user={user}
                  existingBet={userBets[match.fixture.id]}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="container mx-auto px-6 py-12">
        <Card className="text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            🎯 How Betting Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold mb-2">Simple Win/Loss</h4>
              <p className="text-sm">Choose which team will win the match and bet your CHZ</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">CHZ Rewards</h4>
              <p className="text-sm">Win CHZ tokens based on match outcomes and odds</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-semibold mb-2">Club World Cup</h4>
              <p className="text-sm">Bet on the biggest club tournament featuring top teams worldwide</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}