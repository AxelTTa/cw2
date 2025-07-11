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

async function fetchAllClubWorldCupTeams() {
  console.log('🔍 Backend Starting teams fetch to get ALL players...')
  
  for (const leagueId of POTENTIAL_LEAGUE_IDS) {
    try {
      console.log(`🎯 Backend Trying League ID: ${leagueId} for teams`)
      
      const response = await fetch(`${BASE_URL}/teams?league=${leagueId}&season=2025`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      const data = await response.json()

      if (response.ok && data.response && data.response.length > 0) {
        console.log(`✅ Backend Found ${data.response.length} teams for League ID ${leagueId}`)
        return data.response
      }
    } catch (error) {
      console.error(`❌ Backend Error with League ID ${leagueId}:`, error.message)
      continue
    }
  }

  const seasons = [2024, 2023]
  for (const season of seasons) {
    for (const leagueId of POTENTIAL_LEAGUE_IDS.slice(0, 2)) {
      try {
        const response = await fetch(`${BASE_URL}/teams?league=${leagueId}&season=${season}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          }
        })

        const data = await response.json()
        if (response.ok && data.response && data.response.length > 0) {
          console.log(`✅ Backend Found ${data.response.length} teams for League ID ${leagueId}, Season ${season}`)
          return data.response
        }
      } catch (error) {
        continue
      }
    }
  }

  throw new Error('Unable to fetch teams data')
}

async function fetchPlayersForTeam(teamId, season = 2025) {
  const endpoint = '/players/squads'
  
  try {
    console.log(`🏃 Backend Fetching players for team: ${teamId}`)
    
    const response = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    const data = await response.json()
    
    if (response.ok && data.response && data.response.length > 0) {
      return data.response[0].players || []
    }
    
    return []
  } catch (error) {
    console.error(`❌ Backend Error fetching players for team ${teamId}:`, error.message)
    return []
  }
}

async function fetchPlayerStatistics(playerId, season = 2025) {
  try {
    const response = await fetch(`${BASE_URL}/players?id=${playerId}&season=${season}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    const data = await response.json()
    
    if (response.ok && data.response && data.response.length > 0) {
      return data.response[0].statistics || []
    }
    
    return []
  } catch (error) {
    console.error(`❌ Backend Error fetching stats for player ${playerId}:`, error.message)
    return []
  }
}

async function fetchClubWorldCupPlayers() {
  console.log('🔍 Backend Starting Club World Cup 2025 ALL players fetch...')
  
  // First, get all teams
  const teams = await fetchAllClubWorldCupTeams()
  console.log(`📋 Backend Found ${teams.length} teams, now fetching ALL players...`)
  
  const allPlayers = []
  const playerPromises = []
  
  // Fetch players for each team
  for (const teamData of teams) {
    const teamId = teamData.team.id
    const teamName = teamData.team.name
    const teamLogo = teamData.team.logo
    
    playerPromises.push(
      fetchPlayersForTeam(teamId).then(async (players) => {
        const teamPlayers = []
        
        for (const player of players) {
          // Fetch detailed stats for each player
          const stats = await fetchPlayerStatistics(player.id, 2025)
          
          // Find the most relevant stat (usually the league/competition stat)
          const relevantStat = stats.find(s => s.league?.name?.toLowerCase().includes('world')) || 
                              stats.find(s => s.league?.name?.toLowerCase().includes('cup')) || 
                              stats[0] // fallback to first stat
          
          teamPlayers.push({
            player: {
              id: player.id,
              name: player.name,
              photo: player.photo,
              age: player.age,
              nationality: player.birth?.country || 'Unknown',
              position: player.position,
              height: player.height,
              weight: player.weight
            },
            team: {
              id: teamId,
              name: teamName,
              logo: teamLogo
            },
            statistics: relevantStat ? {
              games: relevantStat.games?.appearences || 0,
              goals: relevantStat.goals?.total || 0,
              assists: relevantStat.goals?.assists || 0,
              minutes: relevantStat.games?.minutes || 0,
              rating: relevantStat.games?.rating || null,
              yellow_cards: relevantStat.cards?.yellow || 0,
              red_cards: relevantStat.cards?.red || 0
            } : {
              games: 0,
              goals: 0,
              assists: 0,
              minutes: 0,
              rating: null,
              yellow_cards: 0,
              red_cards: 0
            }
          })
        }
        
        return teamPlayers
      })
    )
  }
  
  // Wait for all player fetches to complete
  const teamPlayersArrays = await Promise.all(playerPromises)
  
  // Flatten all players into one array
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
  
  return allPlayers
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