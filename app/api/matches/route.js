import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

// Popular league IDs for fetching matches from multiple competitions
const LEAGUE_IDS = {
  CLUB_WORLD_CUP: 15,
  CHAMPIONS_LEAGUE: 2,
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGUE_1: 61,
  UEFA_EUROPA: 3,
  COPA_LIBERTADORES: 13,
  AFC_CHAMPIONS: 1,
  CAF_CHAMPIONS: 12
}

const logApiRequest = (endpoint, params) => {
  console.log(`🚀 Backend API Football Request:`, {
    endpoint,
    params,
    timestamp: new Date().toISOString(),
    url: `${BASE_URL}${endpoint}`,
    userAgent: 'Clutch-Backend'
  })
}

const logApiResponse = (endpoint, response, data) => {
  console.log(`📥 Backend API Football Response:`, {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    timestamp: new Date().toISOString(),
    dataLength: data?.response?.length || 0,
    headers: {
      'x-requests-remaining': response.headers.get('x-requests-remaining'),
      'x-requests-limit': response.headers.get('x-requests-limit')
    }
  })
  
  console.log(`🔍 Backend FULL API Response Data for ${endpoint}:`, {
    fullResponse: data,
    responseKeys: data ? Object.keys(data) : [],
    errors: data?.errors || null,
    results: data?.results || 0,
    paging: data?.paging || null,
    parameters: data?.parameters || null
  })
  
  if (data?.response) {
    console.log(`📋 Backend Response Items (${data.response.length}):`, data.response.slice(0, 5))
  }
  
  if (data?.errors && data.errors.length > 0) {
    console.error(`🚨 Backend API ERRORS for ${endpoint}:`, data.errors)
  }
}

async function fetchAllMatches() {
  console.log('🏆 Backend Starting matches fetch from multiple competitions...')
  
  try {
    // Prioritize Club World Cup for 2025 season
    const seasons = [2025, 2024, 2023]
    
    for (const season of seasons) {
      console.log(`🎯 Backend Trying season ${season} for Club World Cup matches`)
      
      // Try Club World Cup first, then other competitions
      const allMatches = []
      const prioritizedLeagueIds = [
        LEAGUE_IDS.CLUB_WORLD_CUP,
        LEAGUE_IDS.CHAMPIONS_LEAGUE,
        LEAGUE_IDS.PREMIER_LEAGUE,
        LEAGUE_IDS.LA_LIGA,
        LEAGUE_IDS.BUNDESLIGA
      ]
      
      for (const leagueId of prioritizedLeagueIds) {
        const endpoint = `/fixtures`
        // For Club World Cup, get more matches; for others, get recent and upcoming
        const url = leagueId === LEAGUE_IDS.CLUB_WORLD_CUP 
          ? `${BASE_URL}${endpoint}?league=${leagueId}&season=${season}&next=20`
          : `${BASE_URL}${endpoint}?league=${leagueId}&season=${season}&last=5&next=5`
        
        logApiRequest(endpoint, { league: leagueId, season })
        
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': API_KEY,
              'X-RapidAPI-Host': 'v3.football.api-sports.io'
            }
          })

          const data = await response.json()
          logApiResponse(endpoint, response, data)

          if (response.ok && data.response && data.response.length > 0) {
            console.log(`✅ Backend Found ${data.response.length} matches for league ${leagueId} season ${season}`)
            allMatches.push(...data.response)
          }
          
          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 150))
        } catch (err) {
          console.warn(`⚠️ Backend Failed to fetch from league ${leagueId}:`, err.message)
        }
      }
      
      if (allMatches.length > 0) {
        console.log(`✅ Backend Found total ${allMatches.length} matches from all leagues for season ${season}`)
        
        // Transform the matches data
        const matches = allMatches.map(match => ({
          id: match.fixture.id,
          homeTeam: {
            id: match.teams.home.id,
            name: match.teams.home.name,
            logo: match.teams.home.logo
          },
          awayTeam: {
            id: match.teams.away.id,
            name: match.teams.away.name,
            logo: match.teams.away.logo
          },
          score: {
            home: match.goals.home,
            away: match.goals.away
          },
          status: match.fixture.status.short.toLowerCase(),
          statusLong: match.fixture.status.long,
          date: match.fixture.date,
          venue: match.fixture.venue?.name || 'Unknown Venue',
          round: match.league.round,
          league: match.league.name,
          season: match.league.season,
          isClubWorldCup: match.league.id === LEAGUE_IDS.CLUB_WORLD_CUP
        }))
        
        // Sort by priority: Club World Cup first, then by date
        matches.sort((a, b) => {
          if (a.isClubWorldCup && !b.isClubWorldCup) return -1
          if (!a.isClubWorldCup && b.isClubWorldCup) return 1
          return new Date(b.date) - new Date(a.date)
        })
        
        console.log('📊 Backend Sample matches:', matches.slice(0, 3).map(m => ({
          id: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          score: `${m.score.home}-${m.score.away}`,
          status: m.status,
          date: m.date,
          league: m.league,
          isClubWorldCup: m.isClubWorldCup
        })))
        
        return matches
      }
    }
    
    // If no real matches found, return mock data for demo
    console.log('⚠️ Backend No real matches found, returning mock data')
    return getMockMatches()
    
  } catch (error) {
    console.error('❌ Backend Error fetching Club World Cup matches:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Return mock data on error
    return getMockMatches()
  }
}

function getMockMatches() {
  console.log('🎭 Backend Generating mock Club World Cup matches for demo')
  
  const mockTeams = [
    { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
    { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
    { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png' },
    { id: 157, name: 'Bayern München', logo: 'https://media.api-sports.io/football/teams/157.png' },
    { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
    { id: 496, name: 'Juventus', logo: 'https://media.api-sports.io/football/teams/496.png' },
    { id: 127, name: 'Flamengo', logo: 'https://media.api-sports.io/football/teams/127.png' },
    { id: 9568, name: 'Inter Miami', logo: 'https://media.api-sports.io/football/teams/9568.png' },
    { id: 128, name: 'River Plate', logo: 'https://media.api-sports.io/football/teams/128.png' },
    { id: 131, name: 'Boca Juniors', logo: 'https://media.api-sports.io/football/teams/131.png' },
    { id: 2274, name: 'Al Hilal', logo: 'https://media.api-sports.io/football/teams/2274.png' },
    { id: 2281, name: 'Al Nassr', logo: 'https://media.api-sports.io/football/teams/2281.png' }
  ]
  
  const rounds = ['Group Stage', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Final']
  const competitions = [
    { name: 'FIFA Club World Cup', isClubWorldCup: true, weight: 0.6 },
    { name: 'UEFA Champions League', isClubWorldCup: false, weight: 0.2 },
    { name: 'Premier League', isClubWorldCup: false, weight: 0.1 },
    { name: 'La Liga', isClubWorldCup: false, weight: 0.05 },
    { name: 'Bundesliga', isClubWorldCup: false, weight: 0.05 }
  ]
  
  const matches = []
  
  for (let i = 0; i < 20; i++) {
    const homeTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)]
    let awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)]
    while (awayTeam.id === homeTeam.id) {
      awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)]
    }
    
    // Weight towards upcoming matches and Club World Cup
    const isUpcoming = Math.random() < 0.7 // 70% chance of upcoming matches
    const status = isUpcoming ? 'ns' : (Math.random() < 0.8 ? 'ft' : 'live')
    const homeScore = status === 'ns' ? null : Math.floor(Math.random() * 4)
    const awayScore = status === 'ns' ? null : Math.floor(Math.random() * 4)
    
    // Weight competition selection towards Club World Cup
    const randomValue = Math.random()
    let selectedCompetition = competitions[competitions.length - 1] // default
    let cumulativeWeight = 0
    for (const comp of competitions) {
      cumulativeWeight += comp.weight
      if (randomValue <= cumulativeWeight) {
        selectedCompetition = comp
        break
      }
    }
    
    // Create dates based on status
    const baseDate = new Date()
    let matchDate
    if (status === 'ns') {
      // Upcoming matches: 1 to 30 days in the future
      const daysOffset = Math.floor(Math.random() * 30) + 1
      matchDate = new Date(baseDate.getTime() + (daysOffset * 24 * 60 * 60 * 1000))
    } else if (status === 'live') {
      // Live matches: happening now (within last hour)
      const minutesOffset = Math.floor(Math.random() * 60) - 30
      matchDate = new Date(baseDate.getTime() + (minutesOffset * 60 * 1000))
    } else {
      // Recent matches: 1 to 7 days ago
      const daysOffset = -(Math.floor(Math.random() * 7) + 1)
      matchDate = new Date(baseDate.getTime() + (daysOffset * 24 * 60 * 60 * 1000))
    }
    
    matches.push({
      id: 1000000 + i,
      homeTeam,
      awayTeam,
      score: {
        home: homeScore,
        away: awayScore
      },
      status,
      statusLong: status === 'ft' ? 'Match Finished' : status === 'live' ? 'In Play' : 'Not Started',
      date: matchDate.toISOString(),
      venue: selectedCompetition.isClubWorldCup ? 'Mercedes-Benz Stadium' : 'Stadium',
      round: rounds[Math.floor(Math.random() * rounds.length)],
      league: selectedCompetition.name,
      season: 2025,
      isClubWorldCup: selectedCompetition.isClubWorldCup
    })
  }
  
  // Sort by priority: Club World Cup first, then by date (upcoming first for ns status)
  matches.sort((a, b) => {
    // Prioritize Club World Cup
    if (a.isClubWorldCup && !b.isClubWorldCup) return -1
    if (!a.isClubWorldCup && b.isClubWorldCup) return 1
    
    // For same competition type, sort by date appropriately
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    
    // For upcoming matches, sort by earliest first
    if (a.status === 'ns' && b.status === 'ns') {
      return dateA - dateB
    }
    
    // For non-upcoming, sort by most recent first
    return dateB - dateA
  })
  
  return matches
}

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    console.log('🎯 Backend API Route /api/matches called')
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10
    const status = searchParams.get('status') // 'recent', 'live', 'upcoming'
    
    console.log('🔍 Backend Query parameters:', { limit, status })
    
    const allMatches = await fetchAllMatches()
    
    // Filter by status if requested
    let filteredMatches = allMatches
    if (status) {
      const now = new Date()
      switch (status) {
        case 'recent':
          filteredMatches = allMatches.filter(m => 
            m.status === 'ft' && new Date(m.date) <= now
          ).slice(0, limit)
          break
        case 'live':
          filteredMatches = allMatches.filter(m => m.status === 'live')
          break
        case 'upcoming':
          filteredMatches = allMatches.filter(m => 
            m.status === 'ns' && new Date(m.date) > now
          ).slice(0, limit)
          break
        default:
          filteredMatches = allMatches.slice(0, limit)
      }
    } else {
      filteredMatches = allMatches.slice(0, limit)
    }
    
    console.log('✅ Backend Successfully processed matches request:', {
      totalMatches: allMatches.length,
      filteredMatches: filteredMatches.length,
      status,
      limit,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      count: filteredMatches.length,
      totalCount: allMatches.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Backend API Route Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name
    })
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}