import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

// FIFA Club World Cup 2025 - League ID confirmed from API
const FIFA_CLUB_WORLD_CUP_2025 = {
  LEAGUE_ID: 15,
  SEASON: 2025,
  NAME: 'FIFA Club World Cup',
  START_DATE: '2025-06-15',
  END_DATE: '2025-07-13'
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

async function fetchClubWorldCupMatches() {
  console.log('🏆 Backend Starting FIFA Club World Cup 2025 matches fetch...')
  
  try {
    const endpoint = `/fixtures`
    const url = `${BASE_URL}${endpoint}?league=${FIFA_CLUB_WORLD_CUP_2025.LEAGUE_ID}&season=${FIFA_CLUB_WORLD_CUP_2025.SEASON}`
    
    logApiRequest(endpoint, { 
      league: FIFA_CLUB_WORLD_CUP_2025.LEAGUE_ID, 
      season: FIFA_CLUB_WORLD_CUP_2025.SEASON,
      tournament: FIFA_CLUB_WORLD_CUP_2025.NAME 
    })
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    const data = await response.json()
    logApiResponse(endpoint, response, data)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${data.message || 'Unknown error'}`)
    }

    if (data.response && data.response.length > 0) {
      console.log(`✅ Backend Found ${data.response.length} FIFA Club World Cup 2025 matches`)
      
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
        season: match.league.season,
        referee: match.fixture.referee,
        elapsed: match.fixture.status.elapsed,
        isClubWorldCup: true // All matches are Club World Cup
      }))
      
      // Sort by date - most recent first, then upcoming
      matches.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        const now = new Date()
        
        // Prioritize live matches first
        if (a.status === 'live' && b.status !== 'live') return -1
        if (b.status === 'live' && a.status !== 'live') return 1
        
        // Then sort by date (closest to now first)
        return Math.abs(dateA - now) - Math.abs(dateB - now)
      })
      
      console.log('📊 Backend Sample FIFA Club World Cup matches:', matches.slice(0, 3).map(m => ({
        id: m.id,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        score: `${m.score.home}-${m.score.away}`,
        status: m.status,
        date: m.date,
        round: m.round,
        venue: m.venue
      })))
      
      return matches
    } else {
      console.log('⚠️ Backend No FIFA Club World Cup matches found in API response')
      return []
    }
    
  } catch (error) {
    console.error('❌ Backend Error fetching FIFA Club World Cup matches:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Return empty array on error - no fake data
    return []
  }
}

// Mock data function removed - we only use real API data now

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
    if (status && allMatches.length > 0) {
      const now = new Date()
      switch (status) {
        case 'recent':
          filteredMatches = allMatches.filter(m => 
            m.status === 'ft' && new Date(m.date) <= now
          ).slice(0, limit)
          break
        case 'live':
          filteredMatches = allMatches.filter(m => 
            m.status === 'live' || m.status === '1h' || m.status === '2h' || m.status === 'ht' || m.status.includes('h')
          )
          break
        case 'upcoming':
          filteredMatches = allMatches.filter(m => 
            m.status === 'ns' && new Date(m.date) > now
          ).slice(0, limit)
          break
        default:
          filteredMatches = allMatches.slice(0, limit)
      }
    } else if (allMatches.length > 0) {
      filteredMatches = allMatches.slice(0, limit)
    } else {
      filteredMatches = []
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