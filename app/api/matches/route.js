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
    // Get real matches from multiple popular leagues - current season first
    const currentYear = new Date().getFullYear()
    const seasons = [currentYear, currentYear - 1]
    
    for (const season of seasons) {
      console.log(`🎯 Backend Trying season ${season} for real matches`)
      
      // Use real popular leagues that actually have data
      const allMatches = []
      const leagueIds = [
        LEAGUE_IDS.PREMIER_LEAGUE,    // Premier League
        LEAGUE_IDS.CHAMPIONS_LEAGUE,  // Champions League
        LEAGUE_IDS.LA_LIGA,          // La Liga
        LEAGUE_IDS.BUNDESLIGA,       // Bundesliga
        LEAGUE_IDS.SERIE_A,          // Serie A
        LEAGUE_IDS.LIGUE_1,          // Ligue 1
        LEAGUE_IDS.UEFA_EUROPA       // Europa League
      ]
      
      for (const leagueId of leagueIds) {
        const endpoint = `/fixtures`
        // Get recent, live, and upcoming matches
        const url = `${BASE_URL}${endpoint}?league=${leagueId}&season=${season}&last=10&next=10`
        
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
            console.log(`✅ Backend Found ${data.response.length} real matches for league ${leagueId} season ${season}`)
            allMatches.push(...data.response)
          } else {
            console.warn(`⚠️ Backend No data for league ${leagueId} season ${season}`)
          }
          
          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (err) {
          console.warn(`⚠️ Backend Failed to fetch from league ${leagueId}:`, err.message)
        }
      }
      
      if (allMatches.length > 0) {
        console.log(`✅ Backend Found total ${allMatches.length} real matches for season ${season}`)
        
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
          isClubWorldCup: false // These are real matches from major leagues
        }))
        
        // Sort by date - most recent/upcoming first
        matches.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date) 
          const now = new Date()
          
          // Prioritize live matches first
          if (a.status === 'live' && b.status !== 'live') return -1
          if (b.status === 'live' && a.status !== 'live') return 1
          
          // Then upcoming matches
          if (a.status === 'ns' && b.status !== 'ns') return -1
          if (b.status === 'ns' && a.status !== 'ns') return 1
          
          // For same status, sort by date
          return Math.abs(dateA - now) - Math.abs(dateB - now)
        })
        
        console.log('📊 Backend Sample real matches:', matches.slice(0, 3).map(m => ({
          id: m.id,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          score: `${m.score.home}-${m.score.away}`,
          status: m.status,
          date: m.date,
          league: m.league
        })))
        
        return matches
      }
    }
    
    // If no real matches found, return empty array instead of fake data
    console.log('⚠️ Backend No real matches found, returning empty array')
    return []
    
  } catch (error) {
    console.error('❌ Backend Error fetching real matches:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Return empty array on error instead of fake data
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
    
    const allMatches = await fetchAllMatches()
    
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
            m.status === 'live' || m.status === '1h' || m.status === '2h' || m.status === 'ht'
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