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

async function fetchLeagues() {
  const endpoint = '/leagues'
  const params = { search: 'Club World Cup' }
  
  try {
    logApiRequest(endpoint, params)
    
    const response = await fetch(`${BASE_URL}/leagues?search=Club%20World%20Cup`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    const data = await response.json()
    logApiResponse(endpoint, response, data)

    if (!response.ok) {
      console.error(`🔥 Backend HTTP Error for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        responseData: data,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`HTTP error! status: ${response.status} - ${data.message || 'Unknown error'}`)
    }

    console.log('🏆 Backend Available Club World Cup Leagues:', data.response)
    return data.response || []
  } catch (error) {
    logApiError(endpoint, error)
    throw error
  }
}

async function fetchClubWorldCupTeams() {
  console.log('🔍 Backend Starting Club World Cup 2025 teams fetch...')
  
  // First, try to find the correct league
  try {
    const leagues = await fetchLeagues()
    console.log('📋 Backend Found leagues:', leagues)
  } catch (error) {
    console.warn('⚠️ Backend Could not fetch leagues list, proceeding with known IDs')
  }

  // Try multiple league IDs
  for (const leagueId of POTENTIAL_LEAGUE_IDS) {
    const endpoint = '/teams'
    const params = { league: leagueId, season: 2025 }
    
    try {
      console.log(`🎯 Backend Trying League ID: ${leagueId}`)
      logApiRequest(endpoint, params)
      
      const response = await fetch(`${BASE_URL}/teams?league=${leagueId}&season=2025`, {
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
        console.log(`✅ Backend Success with League ID ${leagueId}! Found ${data.response.length} teams`)
        console.log('🏟️ Backend Teams found:', data.response.map(t => ({
          name: t.team?.name,
          country: t.team?.country,
          id: t.team?.id
        })))
        return data.response
      } else {
        console.warn(`⚠️ Backend League ID ${leagueId} returned no teams`)
      }
    } catch (error) {
      console.error(`❌ Backend Error with League ID ${leagueId}:`, error.message)
      logApiError(endpoint, error)
      continue
    }
  }

  // If no league IDs work, try different seasons
  console.log('🔄 Backend Trying different seasons...')
  const seasons = [2025, 2024, 2023]
  
  for (const season of seasons) {
    for (const leagueId of POTENTIAL_LEAGUE_IDS.slice(0, 2)) { // Try only first 2 IDs for other seasons
      const endpoint = '/teams'
      const params = { league: leagueId, season }
      
      try {
        console.log(`🎯 Backend Trying League ID: ${leagueId}, Season: ${season}`)
        logApiRequest(endpoint, params)
        
        const response = await fetch(`${BASE_URL}/teams?league=${leagueId}&season=${season}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          }
        })

        const data = await response.json()
        logApiResponse(endpoint, response, data)

        if (response.ok && data.response && data.response.length > 0) {
          console.log(`✅ Backend Success with League ID ${leagueId}, Season ${season}! Found ${data.response.length} teams`)
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
  console.error('❌ Backend All API requests failed, no real data available')
  throw new Error('Unable to fetch real teams data from Football API. All league IDs and seasons attempted failed.')
}


export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    console.log('🎯 Backend API Route /api/teams called')
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    const teams = await fetchClubWorldCupTeams()
    
    console.log('✅ Backend Successfully processed teams request:', {
      teamsCount: teams?.length || 0,
      firstTeam: teams?.[0]?.team?.name || 'None',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      teams,
      count: teams?.length || 0,
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