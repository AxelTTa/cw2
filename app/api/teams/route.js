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

  // If all API attempts fail, provide fallback mock data for Club World Cup 2025
  console.log('🔄 Backend API requests failed, using fallback Club World Cup 2025 data...')
  return getClubWorldCup2025MockData()
}

function getClubWorldCup2025MockData() {
  console.log('📋 Backend Using Club World Cup 2025 mock data (32 teams)')
  
  return [
    // UEFA (Europe) - 12 teams
    { team: { id: 1, name: "Real Madrid", country: "Spain", logo: "https://media.api-sports.io/football/teams/541.png", code: "RMA", founded: 1902 }, venue: { name: "Santiago Bernabéu", capacity: 81044 } },
    { team: { id: 2, name: "Manchester City", country: "England", logo: "https://media.api-sports.io/football/teams/50.png", code: "MCI", founded: 1880 }, venue: { name: "Etihad Stadium", capacity: 55017 } },
    { team: { id: 3, name: "Bayern Munich", country: "Germany", logo: "https://media.api-sports.io/football/teams/157.png", code: "BAY", founded: 1900 }, venue: { name: "Allianz Arena", capacity: 75000 } },
    { team: { id: 4, name: "Paris Saint-Germain", country: "France", logo: "https://media.api-sports.io/football/teams/85.png", code: "PSG", founded: 1970 }, venue: { name: "Parc des Princes", capacity: 47929 } },
    { team: { id: 5, name: "Chelsea", country: "England", logo: "https://media.api-sports.io/football/teams/49.png", code: "CHE", founded: 1905 }, venue: { name: "Stamford Bridge", capacity: 40341 } },
    { team: { id: 6, name: "Juventus", country: "Italy", logo: "https://media.api-sports.io/football/teams/496.png", code: "JUV", founded: 1897 }, venue: { name: "Allianz Stadium", capacity: 41507 } },
    { team: { id: 7, name: "Borussia Dortmund", country: "Germany", logo: "https://media.api-sports.io/football/teams/165.png", code: "BVB", founded: 1909 }, venue: { name: "Signal Iduna Park", capacity: 81365 } },
    { team: { id: 8, name: "Atlético Madrid", country: "Spain", logo: "https://media.api-sports.io/football/teams/530.png", code: "ATM", founded: 1903 }, venue: { name: "Cívitas Metropolitano", capacity: 68456 } },
    { team: { id: 9, name: "Inter Milan", country: "Italy", logo: "https://media.api-sports.io/football/teams/505.png", code: "INT", founded: 1908 }, venue: { name: "San Siro", capacity: 80018 } },
    { team: { id: 10, name: "Porto", country: "Portugal", logo: "https://media.api-sports.io/football/teams/236.png", code: "POR", founded: 1893 }, venue: { name: "Estádio do Dragão", capacity: 50033 } },
    { team: { id: 11, name: "Benfica", country: "Portugal", logo: "https://media.api-sports.io/football/teams/211.png", code: "BEN", founded: 1904 }, venue: { name: "Estádio da Luz", capacity: 64642 } },
    { team: { id: 12, name: "RB Salzburg", country: "Austria", logo: "https://media.api-sports.io/football/teams/564.png", code: "SAL", founded: 1933 }, venue: { name: "Red Bull Arena", capacity: 31895 } },

    // CONMEBOL (South America) - 6 teams
    { team: { id: 13, name: "Palmeiras", country: "Brazil", logo: "https://media.api-sports.io/football/teams/1372.png", code: "PAL", founded: 1914 }, venue: { name: "Allianz Parque", capacity: 43713 } },
    { team: { id: 14, name: "Flamengo", country: "Brazil", logo: "https://media.api-sports.io/football/teams/1371.png", code: "FLA", founded: 1895 }, venue: { name: "Maracanã", capacity: 78838 } },
    { team: { id: 15, name: "River Plate", country: "Argentina", logo: "https://media.api-sports.io/football/teams/435.png", code: "RIV", founded: 1901 }, venue: { name: "Estadio Monumental", capacity: 70074 } },
    { team: { id: 16, name: "Boca Juniors", country: "Argentina", logo: "https://media.api-sports.io/football/teams/451.png", code: "BOC", founded: 1905 }, venue: { name: "La Bombonera", capacity: 54000 } },
    { team: { id: 17, name: "Fluminense", country: "Brazil", logo: "https://media.api-sports.io/football/teams/1368.png", code: "FLU", founded: 1902 }, venue: { name: "Maracanã", capacity: 78838 } },
    { team: { id: 18, name: "Nacional", country: "Uruguay", logo: "https://media.api-sports.io/football/teams/773.png", code: "NAC", founded: 1899 }, venue: { name: "Estadio Gran Parque Central", capacity: 34000 } },

    // CONCACAF (North/Central America) - 4 teams
    { team: { id: 19, name: "Monterrey", country: "Mexico", logo: "https://media.api-sports.io/football/teams/2274.png", code: "MTY", founded: 1945 }, venue: { name: "Estadio BBVA", capacity: 53500 } },
    { team: { id: 20, name: "Club León", country: "Mexico", logo: "https://media.api-sports.io/football/teams/2275.png", code: "LEO", founded: 1944 }, venue: { name: "Estadio León", capacity: 31297 } },
    { team: { id: 21, name: "Seattle Sounders", country: "USA", logo: "https://media.api-sports.io/football/teams/1609.png", code: "SEA", founded: 2007 }, venue: { name: "Lumen Field", capacity: 37722 } },
    { team: { id: 22, name: "LAFC", country: "USA", logo: "https://media.api-sports.io/football/teams/1613.png", code: "LAFC", founded: 2014 }, venue: { name: "BMO Stadium", capacity: 22000 } },

    // AFC (Asia) - 4 teams  
    { team: { id: 23, name: "Al Hilal", country: "Saudi Arabia", logo: "https://media.api-sports.io/football/teams/2819.png", code: "HIL", founded: 1957 }, venue: { name: "Kingdom Arena", capacity: 68000 } },
    { team: { id: 24, name: "Urawa Red Diamonds", country: "Japan", logo: "https://media.api-sports.io/football/teams/285.png", code: "URD", founded: 1950 }, venue: { name: "Saitama Stadium", capacity: 63700 } },
    { team: { id: 25, name: "Jeonbuk Hyundai Motors", country: "South Korea", logo: "https://media.api-sports.io/football/teams/296.png", code: "JEO", founded: 1994 }, venue: { name: "Jeonju World Cup Stadium", capacity: 42477 } },
    { team: { id: 26, name: "Al-Ain", country: "UAE", logo: "https://media.api-sports.io/football/teams/2817.png", code: "AIN", founded: 1968 }, venue: { name: "Hazza bin Zayed Stadium", capacity: 25000 } },

    // CAF (Africa) - 4 teams
    { team: { id: 27, name: "Wydad Casablanca", country: "Morocco", logo: "https://media.api-sports.io/football/teams/976.png", code: "WAC", founded: 1937 }, venue: { name: "Stade Mohammed V", capacity: 45891 } },
    { team: { id: 28, name: "Al Ahly", country: "Egypt", logo: "https://media.api-sports.io/football/teams/1028.png", code: "AHL", founded: 1907 }, venue: { name: "Cairo International Stadium", capacity: 75000 } },
    { team: { id: 29, name: "Mamelodi Sundowns", country: "South Africa", logo: "https://media.api-sports.io/football/teams/1148.png", code: "SUN", founded: 1970 }, venue: { name: "Loftus Versfeld Stadium", capacity: 51762 } },
    { team: { id: 30, name: "ES Tunis", country: "Tunisia", logo: "https://media.api-sports.io/football/teams/1065.png", code: "EST", founded: 1919 }, venue: { name: "Stade Olympique de Radès", capacity: 60000 } },

    // OFC (Oceania) - 1 team
    { team: { id: 31, name: "Auckland City", country: "New Zealand", logo: "https://media.api-sports.io/football/teams/390.png", code: "AUC", founded: 2004 }, venue: { name: "Kiwitea Street", capacity: 3500 } },

    // Host Nation (USA) - 1 team
    { team: { id: 32, name: "Inter Miami", country: "USA", logo: "https://media.api-sports.io/football/teams/1614.png", code: "MIA", founded: 2018 }, venue: { name: "DRV PNK Stadium", capacity: 18000 } }
  ]
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