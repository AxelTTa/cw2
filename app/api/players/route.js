import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

// Focus on only the most prestigious international competitions to reduce load
const INTERNATIONAL_COMPETITION_LEAGUE_IDS = [
  15,   // FIFA Club World Cup
  2,    // UEFA Champions League  
  3,    // UEFA Europa League
]

// Remove major teams concept - focus only on actual international competition participants

// Only international competitions for focused, faster loading
const ALL_LEAGUE_IDS = INTERNATIONAL_COMPETITION_LEAGUE_IDS

function getLeagueName(leagueId) {
  const leagueNames = {
    15: 'FIFA Club World Cup',
    537: 'Club World Cup (Alt)',
    960: 'Club World Cup (Alt 2)', 
    1: 'World Cup',
    2: 'UEFA Champions League',
    3: 'UEFA Europa League',
    848: 'UEFA Europa Conference League',
    4: 'UEFA Super Cup',
    531: 'UEFA Nations League'
  }
  return leagueNames[leagueId] || `International Competition ${leagueId}`
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

// Remove major teams fetching - only use actual competition participants

async function fetchInternationalCompetitionTeams() {
  console.log('🔍 Backend Starting teams fetch for international competitions only...')
  const allTeams = []
  const teamIdsSeen = new Set() // To avoid duplicates across leagues
  
  // Fetch teams from international competitions
  for (const leagueId of ALL_LEAGUE_IDS) {
    try {
      console.log(`🎯 Backend Trying League ID: ${leagueId} for teams`)
      
      const response = await fetch(`${BASE_URL}/teams?league=${leagueId}&season=2024`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      const data = await response.json()

      if (response.ok && data.response && data.response.length > 0) {
        console.log(`✅ Backend Found ${data.response.length} teams for League ID ${leagueId}`)
        
        // Process each team and avoid duplicates
        for (const teamData of data.response) {
          const teamId = teamData.team.id
          
          if (!teamIdsSeen.has(teamId)) {
            teamIdsSeen.add(teamId)
            
            // Add league information to team
            const teamWithLeague = {
              ...teamData,
              league: {
                id: leagueId,
                name: getLeagueName(leagueId)
              }
            }
            
            allTeams.push(teamWithLeague)
          }
        }
      }
    } catch (error) {
      console.error(`❌ Backend Error with League ID ${leagueId}:`, error.message)
      continue
    }
  }
  
  console.log(`✅ Backend Total teams collected: ${allTeams.length}`)
  
  // If no teams found, try fallback with 2023 season
  if (allTeams.length === 0) {
    console.log('⚠️ No teams found for 2024, trying 2023 season...')
    for (const leagueId of ALL_LEAGUE_IDS) {
      try {
        const response = await fetch(`${BASE_URL}/teams?league=${leagueId}&season=2023`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          }
        })

        const data = await response.json()
        if (response.ok && data.response && data.response.length > 0) {
          for (const teamData of data.response) {
            const teamId = teamData.team.id
            
            if (!teamIdsSeen.has(teamId)) {
              teamIdsSeen.add(teamId)
              
              const teamWithLeague = {
                ...teamData,
                league: {
                  id: leagueId,
                  name: getLeagueName(leagueId)
                }
              }
              
              allTeams.push(teamWithLeague)
            }
          }
        }
      } catch (error) {
        continue
      }
    }
  }
  
  if (allTeams.length === 0) {
    throw new Error('Unable to fetch teams data from any league')
  }
  
  return allTeams
}

// Rate limiting helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchPlayersForTeam(teamId, season = 2025, retryCount = 0) {
  const endpoint = '/players/squads'
  const maxRetries = 2 // Reduce retries since we have better initial delays
  const baseDelay = 5000 // 5 seconds base delay for more conservative approach
  
  try {
    console.log(`🏃 Backend Fetching players for team: ${teamId} (attempt ${retryCount + 1})`)
    
    // Add delay between requests to respect rate limits
    if (retryCount > 0) {
      const delay = baseDelay * Math.pow(2, retryCount) // Exponential backoff
      console.log(`⏳ Backend Waiting ${delay}ms before retry for team ${teamId}`)
      await sleep(delay)
    }
    
    const response = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    const data = await response.json()
    
    // Check for rate limiting error specifically
    if (data.errors && data.errors.rateLimit) {
      console.log(`🚫 Backend Rate limit hit for team ${teamId}, retry ${retryCount + 1}/${maxRetries}`)
      
      if (retryCount < maxRetries) {
        return await fetchPlayersForTeam(teamId, season, retryCount + 1)
      } else {
        console.error(`❌ Backend Max retries exceeded for team ${teamId} due to rate limiting`)
        return []
      }
    }
    
    if (!response.ok) {
      console.error(`❌ Squad API Error for team ${teamId}:`, {
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      return []
    }
    
    if (data.response && data.response.length > 0) {
      const players = data.response[0].players || []
      console.log(`🔍 Squad API response for team ${teamId}:`, {
        responseLength: data.response.length,
        playersCount: players.length,
        firstPlayer: players[0]?.name || 'None'
      })
      return players
    } else {
      console.log(`⚠️ No squad data for team ${teamId}:`, {
        hasResponse: !!data.response,
        responseLength: data.response?.length || 0,
        fullData: data
      })
      return []
    }
  } catch (error) {
    console.error(`❌ Backend Error fetching players for team ${teamId}:`, error.message)
    
    // Retry on network errors too
    if (retryCount < maxRetries) {
      console.log(`🔄 Backend Retrying team ${teamId} due to network error, attempt ${retryCount + 2}`)
      return await fetchPlayersForTeam(teamId, season, retryCount + 1)
    }
    
    return []
  }
}

async function fetchPlayerStatistics(playerId, leagueId, season = 2025) {
  try {
    // Try multiple season/league combinations for better stats
    const attempts = [
      { season: 2025, league: leagueId },
      { season: 2024, league: leagueId },
      { season: 2024, league: null }, // Latest season stats overall
      { season: 2023, league: null }
    ]
    
    for (const attempt of attempts) {
      let url = `${BASE_URL}/players?id=${playerId}&season=${attempt.season}`
      if (attempt.league) {
        url += `&league=${attempt.league}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      const data = await response.json()
      
      if (response.ok && data.response && data.response.length > 0) {
        const playerStats = data.response[0].statistics || []
        
        // Find stats with actual data (goals > 0 or games > 0)
        const meaningfulStats = playerStats.find(stat => 
          (stat.goals?.total > 0) || 
          (stat.games?.appearences > 0) ||
          (stat.goals?.assists > 0)
        )
        
        if (meaningfulStats) {
          console.log(`📊 Found meaningful stats for player ${playerId}:`, {
            goals: meaningfulStats.goals?.total,
            assists: meaningfulStats.goals?.assists,
            games: meaningfulStats.games?.appearences,
            season: attempt.season,
            league: meaningfulStats.league?.name
          })
          return playerStats
        }
      }
    }
    
    return []
  } catch (error) {
    console.error(`❌ Backend Error fetching stats for player ${playerId}:`, error.message)
    return []
  }
}

async function fetchInternationalCompetitionPlayers(limit = null) {
  console.log('🔍 Backend Starting international competition players fetch...')
  console.log(`🎯 Backend Player limit requested: ${limit || 'No limit'}`)
  
  // First, get all teams from international competitions
  const teams = await fetchInternationalCompetitionTeams()
  console.log(`📋 Backend Found ${teams.length} teams, now fetching players...`)
  
  const allPlayers = []
  
  // Process all teams sequentially with rate limiting to avoid API issues
  console.log(`🎯 Backend Processing ${teams.length} international competition teams`)
  
  const playerPromises = []
  
  for (const teamData of teams) {
    const teamId = teamData.team.id
    const teamName = teamData.team.name
    const teamLogo = teamData.team.logo
    const leagueInfo = teamData.league
    
    console.log(`🔍 Processing team: ${teamName} (ID: ${teamId}) from ${leagueInfo.name}`)
    
    playerPromises.push(
      fetchPlayersForTeam(teamId).then(async (players) => {
        console.log(`📋 Found ${players.length} players for ${teamName}`)
        const teamPlayers = []
        
        // Process all players to get complete squad data
        for (const player of players) {
          // Fetch detailed stats for each player using their league
          const stats = await fetchPlayerStatistics(player.id, leagueInfo.id, 2024)
          
          // Find the best available stat and extract player details
          let relevantStat = null
          let playerDetails = null
          
          if (stats.length > 0) {
            // Priority: Stats with goals > 0, then games > 0, then any stat
            relevantStat = stats.find(s => s.goals?.total > 0) ||
                         stats.find(s => s.games?.appearences > 0) ||
                         stats.find(s => s.goals?.assists > 0) ||
                         stats[0] // fallback to first stat
                         
            // Get player details from the statistics response (contains full player info)
            playerDetails = stats[0]?.player
          }
          
          
          teamPlayers.push({
            player: {
              id: player.id,
              name: player.name,
              photo: player.photo,
              age: player.age,
              // Use detailed player info from statistics API for nationality
              nationality: playerDetails?.birth?.country || playerDetails?.nationality || 'Unknown',
              position: player.position,
              height: playerDetails?.height || player.height,
              weight: playerDetails?.weight || player.weight
            },
            team: {
              id: teamId,
              name: teamName,
              logo: teamLogo
            },
            league: leagueInfo,
            statistics: relevantStat ? {
              games: relevantStat.games?.appearences || 0,
              goals: relevantStat.goals?.total || 0,
              assists: relevantStat.goals?.assists || 0,
              minutes: relevantStat.games?.minutes || 0,
              rating: relevantStat.games?.rating || null,
              yellow_cards: relevantStat.cards?.yellow || 0,
              red_cards: relevantStat.cards?.red || 0,
              league: relevantStat.league?.name || 'Unknown',
              season: relevantStat.league?.season || 'Unknown'
            } : {
              games: 0,
              goals: 0,
              assists: 0,
              minutes: 0,
              rating: null,
              yellow_cards: 0,
              red_cards: 0,
              league: 'No data',
              season: 'No data'
            }
          })
        }
        
        console.log(`✅ Processed ${teamPlayers.length} players for ${teamName}`)
        return teamPlayers
      })
    )
  }
  
  // Wait for all team player fetches to complete
  const teamPlayersArrays = await Promise.all(playerPromises)
  
  // Flatten all team players into the main array
  for (const teamPlayers of teamPlayersArrays) {
    allPlayers.push(...teamPlayers)
  }
  
  console.log(`✅ Backend Successfully fetched ${allPlayers.length} total players from ${teams.length} teams`)
  console.log('📊 Backend Sample players:', allPlayers.slice(0, 3).map(p => ({
    name: p.player?.name,
    team: p.team?.name,
    position: p.player?.position,
    goals: p.statistics?.goals
  })))
  
  // Apply limit if requested (for pagination)
  if (limit && limit > 0) {
    console.log(`🔄 Backend Applying limit of ${limit} players`)
    return allPlayers.slice(0, limit)
  }
  
  return allPlayers
}


export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    console.log('🎯 Backend API Route /api/players called')
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : null
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0
    const sort = searchParams.get('sort') || null
    
    console.log('🔍 Backend Query parameters:', { limit, offset, sort })
    
    const players = await fetchInternationalCompetitionPlayers()
    
    // Apply sorting if requested
    let sortedPlayers = players
    if (sort) {
      switch (sort) {
        case 'goals_desc':
          sortedPlayers = players.sort((a, b) => (b.statistics?.goals || 0) - (a.statistics?.goals || 0))
          break
        case 'assists_desc':
          sortedPlayers = players.sort((a, b) => (b.statistics?.assists || 0) - (a.statistics?.assists || 0))
          break
        case 'games_desc':
          sortedPlayers = players.sort((a, b) => (b.statistics?.games || 0) - (a.statistics?.games || 0))
          break
        default:
          sortedPlayers = players
      }
      console.log(`🔃 Backend Sorting applied: ${sort}`)
    }
    
    // Apply pagination if requested
    let paginatedPlayers = sortedPlayers
    if (limit && limit > 0) {
      paginatedPlayers = sortedPlayers.slice(offset, offset + limit)
      console.log(`📊 Backend Pagination applied: ${paginatedPlayers.length} players (offset: ${offset}, limit: ${limit})`)
    }
    
    console.log('✅ Backend Successfully processed players request:', {
      totalPlayersCount: players?.length || 0,
      returnedPlayersCount: paginatedPlayers?.length || 0,
      firstPlayer: paginatedPlayers?.[0]?.player?.name || 'None',
      timestamp: new Date().toISOString(),
      pagination: { limit, offset },
      sort
    })
    
    return NextResponse.json({
      success: true,
      players: paginatedPlayers,
      count: paginatedPlayers?.length || 0,
      totalCount: sortedPlayers?.length || 0,
      pagination: {
        offset,
        limit,
        hasMore: limit ? (offset + limit) < (sortedPlayers?.length || 0) : false
      },
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