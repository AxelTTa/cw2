'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../utils/supabase'
import { apiFootball } from '../utils/api-football'

// UI Components (inline to keep file count low)
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8'
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
)

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

// Match Components
const MatchHeader = ({ match, isLive }) => {
  if (!match) return <Skeleton className="h-32 w-full" />

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {match.league?.name || 'x'} • {match.venue?.name || 'x'}
          </div>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {new Date(match.date).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <img 
            src={match.teams?.home?.logo || '/placeholder.svg'} 
            alt={match.teams?.home?.name || 'Home Team'} 
            className="w-12 h-12"
            onError={(e) => { e.target.src = '/placeholder.svg' }}
          />
          <div className="text-lg font-semibold">
            {match.teams?.home?.name || 'x'}
          </div>
        </div>
        
        <div className="flex items-center gap-6 px-8">
          <div className="text-3xl font-bold">
            {match.goals?.home ?? 'x'}
          </div>
          <div className="text-gray-400">-</div>
          <div className="text-3xl font-bold">
            {match.goals?.away ?? 'x'}
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="text-lg font-semibold text-right">
            {match.teams?.away?.name || 'x'}
          </div>
          <img 
            src={match.teams?.away?.logo || '/placeholder.svg'} 
            alt={match.teams?.away?.name || 'Away Team'} 
            className="w-12 h-12"
            onError={(e) => { e.target.src = '/placeholder.svg' }}
          />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          {match.fixture?.status?.long || 'x'} • {match.fixture?.status?.elapsed || 'x'}'
        </div>
      </div>
    </Card>
  )
}

const GameFeed = ({ events, onEventClick }) => {
  if (!events || events.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Match Events</h3>
        <div className="text-center py-8 text-gray-500">
          No events available - live updates will appear here
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Match Events</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.map((event, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={() => onEventClick && onEventClick(event)}
          >
            <div className="w-12 text-center font-semibold text-blue-600">
              {event.time?.elapsed || 'x'}'
            </div>
            <div className="flex-1">
              <div className="font-medium">
                {event.type || 'x'} - {event.detail || 'x'}
              </div>
              <div className="text-sm text-gray-600">
                {event.player?.name || 'x'} {event.assist?.name && `(Assist: ${event.assist.name})`}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {event.team?.name || 'x'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

const Lineups = ({ lineup, team }) => {
  if (!lineup || !team) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{team?.name || 'Team'} Lineup</h3>
        <div className="text-center py-4 text-gray-500">
          Lineup data not available
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={team.logo || '/placeholder.svg'} 
          alt={team.name} 
          className="w-8 h-8"
          onError={(e) => { e.target.src = '/placeholder.svg' }}
        />
        <h3 className="text-lg font-semibold">{team.name}</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-green-700 mb-2">Starting XI</h4>
          <div className="grid grid-cols-1 gap-2">
            {(lineup.startXI || []).map((player, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-green-50 rounded">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {player.player?.number || 'x'}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{player.player?.name || 'x'}</div>
                  <div className="text-sm text-gray-600">{player.player?.pos || 'x'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {lineup.substitutes && lineup.substitutes.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Substitutes</h4>
            <div className="grid grid-cols-1 gap-2">
              {lineup.substitutes.map((player, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {player.player?.number || 'x'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{player.player?.name || 'x'}</div>
                    <div className="text-sm text-gray-600">{player.player?.pos || 'x'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

const BettingOdds = ({ odds }) => {
  if (!odds || !odds.bookmakers || odds.bookmakers.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Betting Odds</h3>
        <div className="text-center py-4 text-gray-500">
          Betting odds not available
        </div>
      </Card>
    )
  }

  const mainBookmaker = odds.bookmakers[0]
  const mainBet = mainBookmaker.bets?.find(bet => bet.name === 'Match Winner') || mainBookmaker.bets?.[0]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Betting Odds</h3>
      
      {mainBet && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            {mainBookmaker.name} • {mainBet.name}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {mainBet.values?.map((value, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="flex flex-col p-3 h-auto"
              >
                <div className="text-xs text-gray-600 mb-1">{value.value}</div>
                <div className="font-semibold">{value.odd || 'x'}</div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

const UserPrediction = ({ matchId, onPredict }) => {
  const [selectedPrediction, setSelectedPrediction] = useState(null)
  const [confidence, setConfidence] = useState(75)

  const handlePredict = async (prediction) => {
    setSelectedPrediction(prediction)
    if (onPredict) {
      await onPredict(prediction, confidence)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Your Prediction</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={selectedPrediction === '1' ? 'default' : 'outline'}
            onClick={() => handlePredict('1')}
            className="flex flex-col p-3 h-auto"
          >
            <div className="text-xs mb-1">Home Win</div>
            <div className="font-semibold">1</div>
          </Button>
          <Button 
            variant={selectedPrediction === 'X' ? 'default' : 'outline'}
            onClick={() => handlePredict('X')}
            className="flex flex-col p-3 h-auto"
          >
            <div className="text-xs mb-1">Draw</div>
            <div className="font-semibold">X</div>
          </Button>
          <Button 
            variant={selectedPrediction === '2' ? 'default' : 'outline'}
            onClick={() => handlePredict('2')}
            className="flex flex-col p-3 h-auto"
          >
            <div className="text-xs mb-1">Away Win</div>
            <div className="font-semibold">2</div>
          </Button>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Confidence: {confidence}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {selectedPrediction && (
          <div className="text-sm text-green-600 text-center">
            Prediction submitted: {selectedPrediction === '1' ? 'Home Win' : selectedPrediction === 'X' ? 'Draw' : 'Away Win'}
          </div>
        )}
      </div>
    </Card>
  )
}

const LiveTicker = ({ events, isLive }) => {
  const recentEvents = events?.slice(-5) || []

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Live Ticker {isLive && <span className="text-red-500">🔴</span>}
      </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recentEvents.length > 0 ? (
          recentEvents.map((event, index) => (
            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
              <div className="font-medium">
                {event.time?.elapsed || 'x'}' - {event.type || 'x'}
              </div>
              <div className="text-gray-600">
                {event.player?.name || 'x'} ({event.team?.name || 'x'})
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Waiting for match events...
          </div>
        )}
      </div>
    </Card>
  )
}

// Main Component with Search Params
function TestLiveMatchContent() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get('id') || '1035011' // Default match ID
  
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Load match data
  useEffect(() => {
    loadMatchData()
    
    // Set up live updates if match is live
    const interval = setInterval(() => {
      if (isLive) {
        loadMatchData()
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [matchId, isLive])

  const loadMatchData = async () => {
    try {
      setLoading(true)
      
      // Fetch from our API routes which use API Football
      const [fixtureRes, eventsRes, oddsRes, lineupsRes] = await Promise.all([
        fetch(`/api/matches/${matchId}`).catch(() => null),
        fetch(`/api/matches/${matchId}/events`).catch(() => null),
        fetch(`/api/matches/${matchId}/odds`).catch(() => null),
        fetch(`/api/matches/${matchId}/lineups`).catch(() => null)
      ])

      let match = null
      let events = []
      let odds = null
      let lineups = { home: null, away: null }

      // Parse responses
      if (fixtureRes?.ok) {
        const fixtureData = await fixtureRes.json()
        match = fixtureData.response?.[0]
      }

      if (eventsRes?.ok) {
        const eventsData = await eventsRes.json()
        events = eventsData.response || []
      }

      if (oddsRes?.ok) {
        const oddsData = await oddsRes.json()
        odds = oddsData.response?.[0]
      }

      if (lineupsRes?.ok) {
        const lineupsData = await lineupsRes.json()
        const lineupsArray = lineupsData.response || []
        lineups = {
          home: lineupsArray.find(l => l.team.name === match?.teams?.home?.name),
          away: lineupsArray.find(l => l.team.name === match?.teams?.away?.name)
        }
      }

      // If API routes fail, create mock data for demonstration
      if (!match) {
        const teams = await apiFootball.fetchClubWorldCupTeams()
        const homeTeam = teams[0]?.team || { id: 1, name: 'Real Madrid', logo: 'x' }
        const awayTeam = teams[1]?.team || { id: 2, name: 'Manchester City', logo: 'x' }

        match = {
          fixture: {
            id: matchId,
            date: new Date().toISOString(),
            status: { long: 'Match Finished', elapsed: 90 },
            venue: { name: 'x' }
          },
          league: { name: 'Club World Cup 2025' },
          teams: { home: homeTeam, away: awayTeam },
          goals: { home: 2, away: 1 }
        }

        events = [
          {
            time: { elapsed: 23 },
            type: 'Goal',
            detail: 'Normal Goal',
            player: { name: 'x' },
            team: homeTeam
          },
          {
            time: { elapsed: 67 },
            type: 'Goal', 
            detail: 'Normal Goal',
            player: { name: 'x' },
            team: awayTeam
          },
          {
            time: { elapsed: 89 },
            type: 'Goal',
            detail: 'Normal Goal', 
            player: { name: 'x' },
            team: homeTeam
          }
        ]

        lineups = {
          home: {
            startXI: Array.from({ length: 11 }, (_, i) => ({
              player: { name: 'x', number: i + 1, pos: 'x' }
            })),
            substitutes: Array.from({ length: 7 }, (_, i) => ({
              player: { name: 'x', number: i + 12, pos: 'x' }
            }))
          },
          away: {
            startXI: Array.from({ length: 11 }, (_, i) => ({
              player: { name: 'x', number: i + 1, pos: 'x' }
            })),
            substitutes: Array.from({ length: 7 }, (_, i) => ({
              player: { name: 'x', number: i + 12, pos: 'x' }
            }))
          }
        }
      }

      setMatchData({
        match,
        events,
        odds,
        lineups
      })

      setIsLive(match?.fixture?.status?.long === 'In Play')
      setError(null)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrediction = async (prediction, confidence) => {
    try {
      // Save prediction to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('predictions')
          .insert([
            {
              user_id: user.id,
              match_id: matchId,
              prediction,
              confidence,
              created_at: new Date().toISOString()
            }
          ])

        if (error) throw error
      }
    } catch (err) {
      console.error('Error saving prediction:', err)
    }
  }

  const handleRefresh = () => {
    loadMatchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Unable to load match</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRefresh}>
              🔄 Retry
            </Button>
            <Button variant="outline">
              <Link href="/">← Go Back</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Link href="/">← Back to Matches</Link>
              </Button>
              
              {isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                🔄
              </Button>
              <Button variant="ghost" size="sm">
                📤
              </Button>
              <Button variant="ghost" size="sm">
                📖
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Match Header */}
        <MatchHeader match={matchData?.match} isLive={isLive} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Feed */}
            <GameFeed
              events={matchData?.events}
              onEventClick={setSelectedEvent}
            />

            {/* Team Lineups */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Lineups 
                lineup={matchData?.lineups?.home} 
                team={matchData?.match?.teams?.home} 
              />
              <Lineups 
                lineup={matchData?.lineups?.away} 
                team={matchData?.match?.teams?.away} 
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Betting Odds */}
            <BettingOdds odds={matchData?.odds} />

            {/* User Predictions */}
            <UserPrediction
              matchId={matchId}
              onPredict={handlePrediction}
            />

            {/* Live Ticker */}
            <LiveTicker
              events={matchData?.events}
              isLive={isLive}
            />
          </div>
        </div>
      </div>

      {/* Selected Event Modal (simple implementation) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <Card className="p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Match Event</h3>
            <div className="space-y-2">
              <div><strong>Time:</strong> {selectedEvent.time?.elapsed || 'x'}'</div>
              <div><strong>Type:</strong> {selectedEvent.type || 'x'}</div>
              <div><strong>Detail:</strong> {selectedEvent.detail || 'x'}</div>
              <div><strong>Player:</strong> {selectedEvent.player?.name || 'x'}</div>
              <div><strong>Team:</strong> {selectedEvent.team?.name || 'x'}</div>
            </div>
            <Button onClick={() => setSelectedEvent(null)} className="w-full mt-4">
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}

// Export with Suspense wrapper
export default function TestLiveMatch() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse bg-gray-200 rounded h-8 w-64" />
          <div className="animate-pulse bg-gray-200 rounded h-64 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="animate-pulse bg-gray-200 rounded h-96 w-full" />
            </div>
            <div className="space-y-6">
              <div className="animate-pulse bg-gray-200 rounded h-64 w-full" />
              <div className="animate-pulse bg-gray-200 rounded h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    }>
      <TestLiveMatchContent />
    </Suspense>
  )
}