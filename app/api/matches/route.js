import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

// Club World Cup League ID (from logs: League ID 15 is working)
const CLUB_WORLD_CUP_LEAGUE_ID = 15

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

async function fetchClubWorldCupMatches() {
  console.log('🏆 Backend Starting Club World Cup 2025 matches fetch...')
  
  try {
    // Try to get recent/current matches for 2025 season
    const seasons = [2025, 2024, 2023]
    
    for (const season of seasons) {
      console.log(`🎯 Backend Trying season ${season} for Club World Cup matches`)
      
      const endpoint = `/fixtures`
      const url = `${BASE_URL}${endpoint}?league=${CLUB_WORLD_CUP_LEAGUE_ID}&season=${season}`
      
      logApiRequest(endpoint, { league: CLUB_WORLD_CUP_LEAGUE_ID, season })
      
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
        console.log(`✅ Backend Found ${data.response.length} matches for season ${season}`)
        
        // Transform the matches data
        const matches = data.response.map(match => ({
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
          season: match.league.season
        }))
        
        // Sort by date (most recent first)
        matches.sort((a, b) => new Date(b.date) - new Date(a.date))
        
        console.log('📊 Backend Sample matches:', matches.slice(0, 3).map(m => ({
          id: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          score: `${m.score.home}-${m.score.away}`,
          status: m.status,
          date: m.date
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
    { id: 9568, name: 'Inter Miami', logo: 'https://media.api-sports.io/football/teams/9568.png' }
  ]
  
  const statuses = ['ft', 'live', 'ns']
  const rounds = ['Group Stage', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Final']
  
  const matches = []
  
  for (let i = 0; i < 12; i++) {
    const homeTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)]
    let awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)]
    while (awayTeam.id === homeTeam.id) {
      awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)]
    }
    
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const homeScore = status === 'ns' ? null : Math.floor(Math.random() * 4)
    const awayScore = status === 'ns' ? null : Math.floor(Math.random() * 4)
    
    // Create dates ranging from 3 days ago to 7 days in the future
    const baseDate = new Date()
    const daysOffset = Math.floor(Math.random() * 11) - 3 // -3 to +7 days
    const matchDate = new Date(baseDate.getTime() + (daysOffset * 24 * 60 * 60 * 1000))
    
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
      venue: 'Mercedes-Benz Stadium',
      round: rounds[Math.floor(Math.random() * rounds.length)],
      league: 'FIFA Club World Cup',
      season: 2025
    })
  }
  
  // Sort by date (most recent first)
  matches.sort((a, b) => new Date(b.date) - new Date(a.date))
  
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
    
    const allMatches = await fetchClubWorldCupMatches()
    
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