import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

const POTENTIAL_LEAGUE_IDS = [
  537,  // Current ID being used
  15,   // FIFA Club World Cup (historical)
  960,  // Alternative Club World Cup ID
  1    // World Cup ID (different tournament but similar format)
]

const logApiRequest = (endpoint, params) => {
  console.log(`🚀 Backend API Football Request:`, {
    endpoint,
    params,
    timestamp: new Date().toISOString(),
    url: `${BASE_URL}${endpoint}`,
    userAgent: 'ChilizWinner-Backend'
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
    console.log(`📋 Backend Response Items (${data.response.length}):`, data.response)
  }
  
  if (data?.errors && data.errors.length > 0) {
    console.error(`🚨 Backend API ERRORS for ${endpoint}:`, data.errors)
  }
}

const logApiError = (endpoint, error) => {
  console.error(`❌ Backend API Football Error:`, {
    endpoint,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    errorType: error.constructor.name,
    fullError: error
  })
}

async function fetchClubWorldCupPlayers() {
  console.log('🔍 Backend Starting Club World Cup 2025 players fetch...')
  
  // Try multiple league IDs
  for (const leagueId of POTENTIAL_LEAGUE_IDS) {
    const endpoint = '/players'
    const params = { league: leagueId, season: 2025 }
    
    try {
      console.log(`🎯 Backend Trying League ID: ${leagueId} for players`)
      logApiRequest(endpoint, params)
      
      const response = await fetch(`${BASE_URL}/players?league=${leagueId}&season=2025`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      const data = await response.json()
      logApiResponse(endpoint, response, data)

      if (!response.ok) {
        console.error(`🔥 Backend HTTP Error for League ID ${leagueId}:`, {
          status: response.status,
          statusText: response.statusText,
          responseData: data,
          headers: Object.fromEntries(response.headers.entries()),
          leagueId,
          season: 2025
        })
        console.warn(`⚠️ Backend League ID ${leagueId} failed: ${response.status} - ${data.message || 'Unknown error'}`)
        continue
      }

      if (data.response && data.response.length > 0) {
        console.log(`✅ Backend Success with League ID ${leagueId}! Found ${data.response.length} players`)
        console.log('🏃 Backend Players found:', data.response.slice(0, 5).map(p => ({
          name: p.player?.name,
          position: p.player?.position,
          nationality: p.player?.nationality,
          id: p.player?.id
        })))
        return data.response
      } else {
        console.warn(`⚠️ Backend League ID ${leagueId} returned no players`)
      }
    } catch (error) {
      console.error(`❌ Backend Error with League ID ${leagueId}:`, error.message)
      logApiError(endpoint, error)
      continue
    }
  }

  // If no league IDs work for 2025, try different seasons
  console.log('🔄 Backend Trying different seasons for players...')
  const seasons = [2024, 2023]
  
  for (const season of seasons) {
    for (const leagueId of POTENTIAL_LEAGUE_IDS.slice(0, 2)) { // Try only first 2 IDs for other seasons
      const endpoint = '/players'
      const params = { league: leagueId, season }
      
      try {
        console.log(`🎯 Backend Trying League ID: ${leagueId}, Season: ${season} for players`)
        logApiRequest(endpoint, params)
        
        const response = await fetch(`${BASE_URL}/players?league=${leagueId}&season=${season}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          }
        })

        const data = await response.json()
        logApiResponse(endpoint, response, data)

        if (response.ok && data.response && data.response.length > 0) {
          console.log(`✅ Backend Success with League ID ${leagueId}, Season ${season}! Found ${data.response.length} players`)
          return data.response
        } else if (!response.ok) {
          console.error(`🔥 Backend HTTP Error for League ID ${leagueId}, Season ${season}:`, {
            status: response.status,
            statusText: response.statusText,
            responseData: data,
            headers: Object.fromEntries(response.headers.entries()),
            leagueId,
            season
          })
        }
      } catch (error) {
        console.error(`❌ Backend Error with League ID ${leagueId}, Season ${season}:`, error.message)
        continue
      }
    }
  }

  // If all API attempts fail, throw an error instead of using mock data
  console.error('❌ Backend All API requests failed, no real players data available')
  throw new Error('Unable to fetch real players data from Football API. All league IDs and seasons attempted failed.')
}


export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    console.log('🎯 Backend API Route /api/players called')
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    const players = await fetchClubWorldCupPlayers()
    
    console.log('✅ Backend Successfully processed players request:', {
      playersCount: players?.length || 0,
      firstPlayer: players?.[0]?.player?.name || 'None',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      players,
      count: players?.length || 0,
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