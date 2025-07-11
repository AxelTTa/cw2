import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

const POTENTIAL_LEAGUE_IDS = [
  15,   // FIFA Club World Cup - WORKING ✅
  537,  // Alternative ID
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

  // If all API attempts fail, return mock data for demo
  console.log('⚠️ Backend All API requests failed, returning mock data for demo')
  return getMockTeamsData()
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
      teams: teams,
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

function getMockTeamsData() {
  console.log('🎭 Backend Generating mock Club World Cup teams for demo')
  
  const mockTeams = [
    { team: { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png', country: 'England', founded: 1905 }, venue: { name: 'Stamford Bridge', capacity: 40341, city: 'London' } },
    { team: { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png', country: 'England', founded: 1880 }, venue: { name: 'Etihad Stadium', capacity: 55017, city: 'Manchester' } },
    { team: { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png', country: 'France', founded: 1970 }, venue: { name: 'Parc des Princes', capacity: 47929, city: 'Paris' } },
    { team: { id: 157, name: 'Bayern München', logo: 'https://media.api-sports.io/football/teams/157.png', country: 'Germany', founded: 1900 }, venue: { name: 'Allianz Arena', capacity: 75000, city: 'Munich' } },
    { team: { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png', country: 'Spain', founded: 1902 }, venue: { name: 'Santiago Bernabéu', capacity: 81044, city: 'Madrid' } },
    { team: { id: 496, name: 'Juventus', logo: 'https://media.api-sports.io/football/teams/496.png', country: 'Italy', founded: 1897 }, venue: { name: 'Allianz Stadium', capacity: 41507, city: 'Turin' } },
    { team: { id: 127, name: 'Flamengo', logo: 'https://media.api-sports.io/football/teams/127.png', country: 'Brazil', founded: 1895 }, venue: { name: 'Maracanã', capacity: 78838, city: 'Rio de Janeiro' } },
    { team: { id: 9568, name: 'Inter Miami', logo: 'https://media.api-sports.io/football/teams/9568.png', country: 'USA', founded: 2018 }, venue: { name: 'DRV PNK Stadium', capacity: 18000, city: 'Fort Lauderdale' } },
    { team: { id: 120, name: 'Botafogo', logo: 'https://media.api-sports.io/football/teams/120.png', country: 'Brazil', founded: 1904 }, venue: { name: 'Estádio Nilton Santos', capacity: 46831, city: 'Rio de Janeiro' } },
    { team: { id: 121, name: 'Palmeiras', logo: 'https://media.api-sports.io/football/teams/121.png', country: 'Brazil', founded: 1914 }, venue: { name: 'Allianz Parque', capacity: 43713, city: 'São Paulo' } },
    { team: { id: 165, name: 'Borussia Dortmund', logo: 'https://media.api-sports.io/football/teams/165.png', country: 'Germany', founded: 1909 }, venue: { name: 'Signal Iduna Park', capacity: 81365, city: 'Dortmund' } },
    { team: { id: 211, name: 'Benfica', logo: 'https://media.api-sports.io/football/teams/211.png', country: 'Portugal', founded: 1904 }, venue: { name: 'Estádio da Luz', capacity: 64642, city: 'Lisbon' } },
    { team: { id: 435, name: 'River Plate', logo: 'https://media.api-sports.io/football/teams/435.png', country: 'Argentina', founded: 1901 }, venue: { name: 'Estadio Monumental', capacity: 70074, city: 'Buenos Aires' } },
    { team: { id: 451, name: 'Boca Juniors', logo: 'https://media.api-sports.io/football/teams/451.png', country: 'Argentina', founded: 1905 }, venue: { name: 'La Bombonera', capacity: 54000, city: 'Buenos Aires' } },
    { team: { id: 505, name: 'Inter', logo: 'https://media.api-sports.io/football/teams/505.png', country: 'Italy', founded: 1908 }, venue: { name: 'San Siro', capacity: 75923, city: 'Milan' } },
    { team: { id: 530, name: 'Atletico Madrid', logo: 'https://media.api-sports.io/football/teams/530.png', country: 'Spain', founded: 1903 }, venue: { name: 'Cívitas Metropolitano', capacity: 68456, city: 'Madrid' } },
    { team: { id: 1577, name: 'Al Ahly', logo: 'https://media.api-sports.io/football/teams/1577.png', country: 'Egypt', founded: 1907 }, venue: { name: 'Cairo International Stadium', capacity: 75000, city: 'Cairo' } },
    { team: { id: 1595, name: 'Seattle Sounders', logo: 'https://media.api-sports.io/football/teams/1595.png', country: 'USA', founded: 2007 }, venue: { name: 'Lumen Field', capacity: 37722, city: 'Seattle' } },
    { team: { id: 1616, name: 'Los Angeles FC', logo: 'https://media.api-sports.io/football/teams/1616.png', country: 'USA', founded: 2014 }, venue: { name: 'BMO Stadium', capacity: 22000, city: 'Los Angeles' } },
    { team: { id: 2282, name: 'Monterrey', logo: 'https://media.api-sports.io/football/teams/2282.png', country: 'Mexico', founded: 1945 }, venue: { name: 'Estadio BBVA', capacity: 51000, city: 'Guadalupe' } },
    { team: { id: 2292, name: 'Pachuca', logo: 'https://media.api-sports.io/football/teams/2292.png', country: 'Mexico', founded: 1901 }, venue: { name: 'Estadio Hidalgo', capacity: 30000, city: 'Pachuca' } },
    { team: { id: 2537, name: 'Auckland City', logo: 'https://media.api-sports.io/football/teams/2537.png', country: 'New Zealand', founded: 2004 }, venue: { name: 'Kiwitea Street', capacity: 3500, city: 'Auckland' } },
    { team: { id: 2699, name: 'Mamelodi Sundowns', logo: 'https://media.api-sports.io/football/teams/2699.png', country: 'South Africa', founded: 1970 }, venue: { name: 'Loftus Versfeld Stadium', capacity: 51762, city: 'Pretoria' } },
    { team: { id: 2767, name: 'Ulsan Hyundai FC', logo: 'https://media.api-sports.io/football/teams/2767.png', country: 'South Korea', founded: 1983 }, venue: { name: 'Ulsan Munsu Football Stadium', capacity: 44466, city: 'Ulsan' } },
    { team: { id: 2865, name: 'Al Ain', logo: 'https://media.api-sports.io/football/teams/2865.png', country: 'United Arab Emirates', founded: 1968 }, venue: { name: 'Hazza bin Zayed Stadium', capacity: 25000, city: 'Al Ain' } },
    { team: { id: 2932, name: 'Al-Hilal Saudi FC', logo: 'https://media.api-sports.io/football/teams/2932.png', country: 'Saudi Arabia', founded: 1957 }, venue: { name: 'King Fahd Stadium', capacity: 67000, city: 'Riyadh' } }
  ]
  
  console.log('📊 Backend Generated mock teams:', mockTeams.slice(0, 3).map(t => t.team.name))
  
  return mockTeams
}