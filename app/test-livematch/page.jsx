'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../utils/supabase'
import { apiFootball } from '../utils/api-football'

// Comprehensive logging utility
const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ℹ️ LiveMatch:`, message, data || '')
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] ❌ LiveMatch:`, message, error || '')
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString()
    console.warn(`[${timestamp}] ⚠️ LiveMatch:`, message, data || '')
  },
  debug: (message, data = null) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 🐛 LiveMatch:`, message, data || '')
  },
  component: (componentName, action, data = null) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 🧩 ${componentName}:`, action, data || '')
  }
}

// UI Components (inline to keep file count low) - with inline styles for non-Tailwind compatibility
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none'
  }
  
  const variants = {
    default: { backgroundColor: '#00ff88', color: '#000', padding: '10px 16px' },
    secondary: { backgroundColor: '#333', color: '#ffffff', padding: '10px 16px' },
    outline: { border: '2px solid #00ff88', backgroundColor: 'transparent', color: '#00ff88', padding: '9px 15px' },
    ghost: { backgroundColor: 'transparent', color: '#ffffff', padding: '10px 16px' },
    destructive: { backgroundColor: '#ff4444', color: 'white', padding: '10px 16px' }
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
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }) => {
  const cardStyles = {
    borderRadius: '12px',
    border: '2px solid #333',
    backgroundColor: '#111',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
    padding: '24px'
  }
  
  return (
    <div style={cardStyles}>
      {children}
    </div>
  )
}

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: { backgroundColor: '#0099ff40', color: '#0099ff' },
    secondary: { backgroundColor: '#333', color: '#ffffff' },
    destructive: { backgroundColor: '#ff444440', color: '#ff4444' },
    success: { backgroundColor: '#00ff8840', color: '#00ff88' }
  }
  
  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    ...variants[variant]
  }
  
  return (
    <span style={badgeStyles}>
      {children}
    </span>
  )
}

const Skeleton = ({ className = '', style = {} }) => {
  const skeletonStyles = {
    backgroundColor: '#333',
    borderRadius: '8px',
    ...style
  }
  
  return <div style={skeletonStyles} />
}

// Match Components
const MatchHeader = ({ match, isLive }) => {
  logger.component('MatchHeader', 'render', { hasMatch: !!match, isLive })
  
  if (!match) {
    logger.component('MatchHeader', 'no match data - showing skeleton')
    return <Skeleton className="h-32 w-full" />
  }

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
  logger.component('GameFeed', 'render', { eventsCount: events?.length || 0 })
  
  if (!events || events.length === 0) {
    logger.component('GameFeed', 'no events available')
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
  logger.component('Lineups', 'render', { hasLineup: !!lineup, hasTeam: !!team, teamName: team?.name })
  
  if (!lineup || !team) {
    logger.component('Lineups', 'missing data - showing fallback')
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
  logger.component('BettingOdds', 'render', { hasOdds: !!odds, bookmakerCount: odds?.bookmakers?.length || 0 })
  
  if (!odds || !odds.bookmakers || odds.bookmakers.length === 0) {
    logger.component('BettingOdds', 'no odds data available')
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
  logger.component('UserPrediction', 'render', { matchId })
  
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
  logger.component('LiveTicker', 'render', { totalEvents: events?.length || 0, recentEvents: recentEvents.length, isLive })

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
  logger.info('TestLiveMatchContent component initializing')
  
  const searchParams = useSearchParams()
  const matchId = searchParams.get('id') || '1035011' // Default match ID
  
  logger.info('Component params', { matchId, searchParamsId: searchParams.get('id') })
  
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  // Component mount/unmount tracking
  useEffect(() => {
    logger.info('🚀 TestLiveMatchContent mounted', { matchId })
    
    return () => {
      logger.info('🔥 TestLiveMatchContent unmounting')
    }
  }, [])

  // Load match data
  useEffect(() => {
    logger.info('useEffect triggered for data loading', { matchId, isLive })
    loadMatchData()
    
    // Set up live updates if match is live
    const interval = setInterval(() => {
      if (isLive) {
        logger.info('Live update interval triggered')
        loadMatchData()
      }
    }, 30000) // Update every 30 seconds

    return () => {
      logger.debug('Cleaning up live update interval')
      clearInterval(interval)
    }
  }, [matchId, isLive])

  const loadMatchData = async () => {
    logger.info('loadMatchData started', { matchId })
    
    try {
      setLoading(true)
      logger.debug('Setting loading state to true')
      
      // Fetch from our API routes which use API Football
      logger.info('Fetching data from API routes')
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
      logger.debug('Parsing API responses')
      
      if (fixtureRes?.ok) {
        const fixtureData = await fixtureRes.json()
        match = fixtureData.response?.[0]
        logger.debug('Fixture data received', { hasMatch: !!match, status: fixtureRes.status })
      } else {
        logger.warn('Fixture request failed', { status: fixtureRes?.status, ok: fixtureRes?.ok })
      }

      if (eventsRes?.ok) {
        const eventsData = await eventsRes.json()
        events = eventsData.response || []
        logger.debug('Events data received', { eventsCount: events.length, status: eventsRes.status })
      } else {
        logger.warn('Events request failed', { status: eventsRes?.status, ok: eventsRes?.ok })
      }

      if (oddsRes?.ok) {
        const oddsData = await oddsRes.json()
        odds = oddsData.response?.[0]
        logger.debug('Odds data received', { hasOdds: !!odds, status: oddsRes.status })
      } else {
        logger.warn('Odds request failed', { status: oddsRes?.status, ok: oddsRes?.ok })
      }

      if (lineupsRes?.ok) {
        const lineupsData = await lineupsRes.json()
        const lineupsArray = lineupsData.response || []
        lineups = {
          home: lineupsArray.find(l => l.team.name === match?.teams?.home?.name),
          away: lineupsArray.find(l => l.team.name === match?.teams?.away?.name)
        }
        logger.debug('Lineups data received', { 
          lineupsCount: lineupsArray.length, 
          hasHome: !!lineups.home, 
          hasAway: !!lineups.away, 
          status: lineupsRes.status 
        })
      } else {
        logger.warn('Lineups request failed', { status: lineupsRes?.status, ok: lineupsRes?.ok })
      }

      // If API routes fail, create mock data for demonstration
      if (!match) {
        logger.info('API routes failed, creating mock data for demonstration')
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

      const matchDataObj = {
        match,
        events,
        odds,
        lineups
      }
      
      logger.info('Setting match data', {
        hasMatch: !!match,
        eventsCount: events.length,
        hasOdds: !!odds,
        hasHomeLineup: !!lineups.home,
        hasAwayLineup: !!lineups.away,
        matchStatus: match?.fixture?.status?.long
      })
      
      setMatchData(matchDataObj)

      const isLiveStatus = match?.fixture?.status?.long === 'In Play'
      setIsLive(isLiveStatus)
      setError(null)
      
      logger.info('Data loading completed successfully', { isLive: isLiveStatus })

    } catch (err) {
      logger.error('Error loading match data', err)
      setError(err.message)
    } finally {
      setLoading(false)
      logger.debug('Setting loading state to false')
    }
  }

  const handlePrediction = async (prediction, confidence) => {
    logger.info('Handling prediction', { prediction, confidence, matchId })
    
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

        if (error) {
          logger.error('Supabase prediction save error', error)
          throw error
        }
        
        logger.info('Prediction saved successfully to Supabase')
      } else {
        logger.warn('No authenticated user for prediction save')
      }
    } catch (err) {
      logger.error('Error saving prediction', err)
    }
  }

  const handleRefresh = () => {
    logger.info('Manual refresh triggered')
    loadMatchData()
  }

  logger.debug('Render state check', { loading, error: !!error, hasMatchData: !!matchData })
  
  // Force re-render check - if we're seeing raw HTML, this should help debug
  if (typeof window !== 'undefined') {
    logger.debug('Client-side rendering confirmed')
  } else {
    logger.debug('Server-side rendering detected')
  }
  
  if (loading) {
    logger.info('Rendering loading state')
    return (
      <div style={{ minHeight: '100vh', padding: '16px', backgroundColor: '#0a0a0a' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <Skeleton style={{ height: '32px', width: '256px', marginBottom: '24px' }} />
          <Skeleton style={{ height: '256px', width: '100%', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Skeleton style={{ height: '384px', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Skeleton style={{ height: '256px', width: '100%' }} />
              <Skeleton style={{ height: '192px', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    logger.info('Rendering error state', { error })
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#ffffff'
          }}>Unable to load match</h1>
          <p style={{
            color: '#cccccc',
            marginBottom: '24px'
          }}>{error}</p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <Button onClick={handleRefresh}>
              🔄 Retry
            </Button>
            <Button variant="outline">
              <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>← Go Back</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  logger.info('Rendering main match interface')
  
  const containerStyles = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
  
  return (
    <div style={containerStyles}>
      {/* Header Navigation */}
      <div style={{
        borderBottom: '1px solid #333',
        backgroundColor: '#111',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Button variant="ghost" size="sm">
                <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>← Back to Matches</a>
              </Button>
              
              {isLive && (
                <Badge variant="destructive">
                  🔴 LIVE
                </Badge>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
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
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '16px'
      }}>
        {/* Match Header */}
        <MatchHeader match={matchData?.match} isLive={isLive} />

        {/* Debug Information Panel */}
        <div style={{
          backgroundColor: '#111',
          border: '2px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#00ff88',
            marginBottom: '8px'
          }}>🐛 Debug Information</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            fontSize: '14px'
          }}>
            <div>
              <strong>Match ID:</strong> {matchId}
            </div>
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Error:</strong> {error ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Is Live:</strong> {isLive ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Match Data:</strong> {matchData ? 'Loaded' : 'None'}
            </div>
            <div>
              <strong>Events Count:</strong> {matchData?.events?.length || 0}
            </div>
            <div>
              <strong>Match Status:</strong> {matchData?.match?.fixture?.status?.long || 'Unknown'}
            </div>
            <div>
              <strong>Component:</strong> TestLiveMatch
            </div>
          </div>
          {error && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#ff444440',
              color: '#ff4444',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>Error Details:</strong> {error}
            </div>
          )}
        </div>

        {/* Main Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          '@media (min-width: 1024px)': {
            gridTemplateColumns: '2fr 1fr'
          }
        }}>
          {/* Left Column - Main Content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Game Feed */}
            <GameFeed
              events={matchData?.events}
              onEventClick={setSelectedEvent}
            />

            {/* Team Lineups */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '24px'
            }}>
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
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
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div style={{
            maxWidth: '28rem',
            margin: '16px',
            ...{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              padding: '24px'
            }
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>Match Event</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div><strong>Time:</strong> {selectedEvent.time?.elapsed || 'x'}'</div>
              <div><strong>Type:</strong> {selectedEvent.type || 'x'}</div>
              <div><strong>Detail:</strong> {selectedEvent.detail || 'x'}</div>
              <div><strong>Player:</strong> {selectedEvent.player?.name || 'x'}</div>
              <div><strong>Team:</strong> {selectedEvent.team?.name || 'x'}</div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Button onClick={() => setSelectedEvent(null)} style={{ width: '100%' }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error', { error: error.message, errorInfo })
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          backgroundColor: '#0a0a0a'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '32rem' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>💥</div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '8px',
              color: '#ffffff'
            }}>Component Error</h1>
            <p style={{
              color: '#cccccc',
              marginBottom: '16px'
            }}>The test-livematch component encountered an error.</p>
            <div style={{
              backgroundColor: '#ff444420',
              border: '2px solid #ff4444',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontWeight: '600',
                color: '#ff4444',
                marginBottom: '8px'
              }}>Error Details:</h3>
              <pre style={{
                fontSize: '14px',
                color: '#ff8888',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#00ff88',
                color: '#000',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Export with Suspense wrapper and Error Boundary
export default function TestLiveMatch() {
  logger.info('TestLiveMatch wrapper component rendering')
  
  const suspenseFallback = (
    <div style={{ minHeight: '100vh', padding: '16px', backgroundColor: '#0a0a0a' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#111',
          border: '2px solid #ffdd00',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffdd00',
            marginBottom: '8px'
          }}>⏳ Loading Test LiveMatch...</h3>
          <p style={{ color: '#cccccc' }}>Initializing component and fetching match data...</p>
        </div>
        <Skeleton style={{ height: '32px', width: '256px', marginBottom: '24px' }} />
        <Skeleton style={{ height: '256px', width: '100%', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Skeleton style={{ height: '384px', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Skeleton style={{ height: '256px', width: '100%' }} />
            <Skeleton style={{ height: '192px', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <ErrorBoundary>
      <Suspense fallback={suspenseFallback}>
        <TestLiveMatchContent />
      </Suspense>
    </ErrorBoundary>
  )
}