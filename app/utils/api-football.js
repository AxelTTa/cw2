const API_KEY = '5988d0cb597f14f527539f90330aee32'
const BASE_URL = 'https://v3.football.api-sports.io'

// Multiple potential league IDs for Club World Cup 2025
const POTENTIAL_LEAGUE_IDS = [
  537,  // Current ID being used
  15,   // FIFA Club World Cup (historical)
  960,  // Alternative Club World Cup ID
  1    // World Cup ID (different tournament but similar format)
]

const logApiRequest = (endpoint, params) => {
  console.log(`🚀 API Football Request:`, {
    endpoint,
    params,
    timestamp: new Date().toISOString(),
    url: `${BASE_URL}${endpoint}`
  })
}

const logApiResponse = (endpoint, response, data) => {
  console.log(`📥 API Football Response:`, {
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
  
  console.log(`🔍 FULL API Response Data for ${endpoint}:`, {
    fullResponse: data,
    responseKeys: data ? Object.keys(data) : [],
    errors: data?.errors || null,
    results: data?.results || 0,
    paging: data?.paging || null,
    parameters: data?.parameters || null
  })
  
  if (data?.response) {
    console.log(`📋 Response Items (${data.response.length}):`, data.response)
  }
  
  if (data?.errors && data.errors.length > 0) {
    console.error(`🚨 API ERRORS for ${endpoint}:`, data.errors)
  }
}

const logApiError = (endpoint, error) => {
  console.error(`❌ API Football Error:`, {
    endpoint,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    errorType: error.constructor.name,
    fullError: error
  })
}

export const apiFootball = {
  async fetchLeagues() {
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
        console.error(`🔥 HTTP Error for ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          responseData: data,
          headers: Object.fromEntries(response.headers.entries())
        })
        throw new Error(`HTTP error! status: ${response.status} - ${data.message || 'Unknown error'}`)
      }

      console.log('🏆 Available Club World Cup Leagues:', data.response)
      return data.response || []
    } catch (error) {
      logApiError(endpoint, error)
      throw error
    }
  },

  async fetchClubWorldCupTeams() {
    console.log('🔍 Starting Club World Cup 2025 teams fetch...')
    
    // First, try to find the correct league
    try {
      const leagues = await this.fetchLeagues()
      console.log('📋 Found leagues:', leagues)
    } catch (error) {
      console.warn('⚠️ Could not fetch leagues list, proceeding with known IDs')
    }

    // Try multiple league IDs
    for (const leagueId of POTENTIAL_LEAGUE_IDS) {
      const endpoint = '/teams'
      const params = { league: leagueId, season: 2025 }
      
      try {
        console.log(`🎯 Trying League ID: ${leagueId}`)
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
          console.error(`🔥 HTTP Error for League ID ${leagueId}:`, {
            status: response.status,
            statusText: response.statusText,
            responseData: data,
            headers: Object.fromEntries(response.headers.entries()),
            leagueId,
            season: 2025
          })
          console.warn(`⚠️ League ID ${leagueId} failed: ${response.status} - ${data.message || 'Unknown error'}`)
          continue
        }

        if (data.response && data.response.length > 0) {
          console.log(`✅ Success with League ID ${leagueId}! Found ${data.response.length} teams`)
          console.log('🏟️ Teams found:', data.response.map(t => ({
            name: t.team?.name,
            country: t.team?.country,
            id: t.team?.id
          })))
          return data.response
        } else {
          console.warn(`⚠️ League ID ${leagueId} returned no teams`)
        }
      } catch (error) {
        console.error(`❌ Error with League ID ${leagueId}:`, error.message)
        logApiError(endpoint, error)
        continue
      }
    }

    // If no league IDs work, try different seasons
    console.log('🔄 Trying different seasons...')
    const seasons = [2025, 2024, 2023]
    
    for (const season of seasons) {
      for (const leagueId of POTENTIAL_LEAGUE_IDS.slice(0, 2)) { // Try only first 2 IDs for other seasons
        const endpoint = '/teams'
        const params = { league: leagueId, season }
        
        try {
          console.log(`🎯 Trying League ID: ${leagueId}, Season: ${season}`)
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
            console.log(`✅ Success with League ID ${leagueId}, Season ${season}! Found ${data.response.length} teams`)
            return data.response
          } else if (!response.ok) {
            console.error(`🔥 HTTP Error for League ID ${leagueId}, Season ${season}:`, {
              status: response.status,
              statusText: response.statusText,
              responseData: data,
              headers: Object.fromEntries(response.headers.entries()),
              leagueId,
              season
            })
          }
        } catch (error) {
          console.error(`❌ Error with League ID ${leagueId}, Season ${season}:`, error.message)
          continue
        }
      }
    }

    // If all API attempts fail, return empty array instead of mock data
    console.log('🔄 API requests failed, returning empty array')
    return []
  },

  getClubWorldCup2025MockData() {
    console.log('📋 Using Club World Cup 2025 mock data (32 teams)')
    
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
  },

  async fetchTeamDetails(teamId) {
    try {
      const response = await fetch(`${BASE_URL}/teams?id=${teamId}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response?.[0] || null
    } catch (error) {
      console.error('Error fetching team details:', error)
      throw error
    }
  },

  async fetchClubWorldCupMatches() {
    console.log('🔍 Fetching Club World Cup 2025 matches...')
    
    // Try to get matches from API first
    for (const leagueId of POTENTIAL_LEAGUE_IDS) {
      const endpoint = '/fixtures'
      const params = { league: leagueId, season: 2025 }
      
      try {
        console.log(`🎯 Trying to fetch matches for League ID: ${leagueId}`)
        logApiRequest(endpoint, params)
        
        const response = await fetch(`${BASE_URL}/fixtures?league=${leagueId}&season=2025`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          }
        })

        const data = await response.json()
        logApiResponse(endpoint, response, data)

        if (!response.ok) {
          console.warn(`⚠️ League ID ${leagueId} failed: ${response.status} - ${data.message || 'Unknown error'}`)
          continue
        }

        if (data.response && data.response.length > 0) {
          console.log(`✅ Success with League ID ${leagueId}! Found ${data.response.length} matches`)
          const upcomingMatches = data.response.filter(match => {
            const matchDate = new Date(match.fixture.date)
            const now = new Date()
            return matchDate > now && match.fixture.status.short === 'NS'
          })
          
          console.log(`📅 Found ${upcomingMatches.length} upcoming matches`)
          return upcomingMatches
        } else {
          console.warn(`⚠️ League ID ${leagueId} returned no matches`)
        }
      } catch (error) {
        console.error(`❌ Error with League ID ${leagueId}:`, error.message)
        continue
      }
    }

    // If API fails, return empty array instead of mock data
    console.log('🔄 API failed, returning empty array')
    return []
  },

  getClubWorldCup2025MockMatches() {
    console.log('📋 Using Club World Cup 2025 mock matches')
    
    const now = new Date()
    const teams = this.getClubWorldCup2025MockData()
    
    return [
      {
        fixture: {
          id: 1001,
          date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          status: { short: 'NS', long: 'Not Started' },
          venue: { name: 'Mercedes-Benz Stadium', city: 'Atlanta' }
        },
        league: { 
          id: 537,
          name: 'FIFA Club World Cup',
          country: 'World',
          season: 2025
        },
        teams: {
          home: teams[0].team, // Real Madrid
          away: teams[12].team  // Palmeiras
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null }
        }
      },
      {
        fixture: {
          id: 1002,
          date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          status: { short: 'NS', long: 'Not Started' },
          venue: { name: 'MetLife Stadium', city: 'New York' }
        },
        league: { 
          id: 537,
          name: 'FIFA Club World Cup',
          country: 'World',
          season: 2025
        },
        teams: {
          home: teams[1].team, // Manchester City
          away: teams[22].team  // Al Hilal
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null }
        }
      },
      {
        fixture: {
          id: 1003,
          date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
          status: { short: 'NS', long: 'Not Started' },
          venue: { name: 'Rose Bowl', city: 'Los Angeles' }
        },
        league: { 
          id: 537,
          name: 'FIFA Club World Cup',
          country: 'World',
          season: 2025
        },
        teams: {
          home: teams[2].team, // Bayern Munich
          away: teams[18].team  // Monterrey
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null }
        }
      },
      {
        fixture: {
          id: 1004,
          date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          status: { short: 'NS', long: 'Not Started' },
          venue: { name: 'Hard Rock Stadium', city: 'Miami' }
        },
        league: { 
          id: 537,
          name: 'FIFA Club World Cup',
          country: 'World',
          season: 2025
        },
        teams: {
          home: teams[3].team, // PSG
          away: teams[26].team  // Wydad Casablanca
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null }
        }
      }
    ]
  }
}