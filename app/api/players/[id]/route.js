import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

// Simple in-memory cache
const cache = new Map()

const POTENTIAL_LEAGUE_IDS = [
  537,  // Current ID being used
  15,   // FIFA Club World Cup (historical)
  960,  // Alternative Club World Cup ID
  1    // World Cup ID (different tournament but similar format)
]

async function fetchPlayerDetails(playerId) {
  console.log(`🔍 Backend: Fetching detailed stats for player ${playerId}`)
  
  // Start with current season first for faster response
  const seasons = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]
  let allStatistics = []
  let playerInfo = null
  
  // Try to get player info and stats from seasons
  for (const season of seasons) {
    try {
      const response = await fetch(`${BASE_URL}/players?id=${playerId}&season=${season}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error(`❌ API Error for player ${playerId}, season ${season}:`, {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        continue
      }
      
      console.log(`🔍 Checking player ${playerId} for season ${season}:`, {
        hasResponse: !!data.response,
        responseLength: data.response?.length || 0
      })
      
      if (data.response && data.response.length > 0) {
        const playerData = data.response[0]
        
        // Store player info from first successful response
        if (!playerInfo) {
          playerInfo = playerData.player
        }
        
        // Collect all statistics
        if (playerData.statistics && playerData.statistics.length > 0) {
          allStatistics.push(...playerData.statistics)
        }
        
        console.log(`📊 Found data for player ${playerId} in season ${season}:`, {
          stats: playerData.statistics?.length || 0,
          leagues: playerData.statistics?.map(s => s.league?.name) || []
        })
        
        // If we have player info and some stats, we can break early
        if (playerInfo && allStatistics.length > 0) {
          console.log(`✅ Early return for player ${playerId} - sufficient data found`)
          break
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching player ${playerId} for season ${season}:`, error.message)
      continue
    }
  }
  
  // If no player found in specific seasons, try current season as fallback
  if (!playerInfo) {
    console.log(`⚠️ Player ${playerId} not found in specific seasons, trying current season fallback...`)
    
    try {
      const currentSeason = new Date().getFullYear()
      const response = await fetch(`${BASE_URL}/players?id=${playerId}&season=${currentSeason}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      const data = await response.json()
      
      if (response.ok && data.response && data.response.length > 0) {
        const playerData = data.response[0]
        playerInfo = playerData.player
        
        // Collect any available statistics
        if (playerData.statistics && playerData.statistics.length > 0) {
          allStatistics.push(...playerData.statistics)
        }
        
        console.log(`✅ Found player ${playerId} via current season search:`, {
          name: playerInfo.name,
          stats: playerData.statistics?.length || 0,
          season: currentSeason
        })
      } else {
        console.log(`⚠️ Player ${playerId} not found in current season ${currentSeason}`)
      }
    } catch (error) {
      console.error(`❌ Current season search failed for player ${playerId}:`, error.message)
    }
  }
  
  if (!playerInfo) {
    console.log(`⚠️ Player ${playerId} not found in any search method`)
    return null
  }
  
  // Calculate summary statistics
  const summaryStats = {
    games: 0,
    goals: 0,
    assists: 0,
    minutes: 0,
    rating: null,
    yellow_cards: 0,
    red_cards: 0
  }
  
  let ratingSum = 0
  let ratingCount = 0
  
  allStatistics.forEach(stat => {
    summaryStats.games += stat.games?.appearances || 0
    summaryStats.goals += stat.goals?.total || 0
    summaryStats.assists += stat.goals?.assists || 0
    summaryStats.minutes += stat.games?.minutes || 0
    summaryStats.yellow_cards += stat.cards?.yellow || 0
    summaryStats.red_cards += stat.cards?.red || 0
    
    if (stat.games?.rating) {
      ratingSum += parseFloat(stat.games.rating)
      ratingCount++
    }
  })
  
  if (ratingCount > 0) {
    summaryStats.rating = (ratingSum / ratingCount).toFixed(2)
  }
  
  return {
    player: playerInfo,
    statistics: summaryStats,
    allStatistics: allStatistics,
    team: null // Will be filled if we can find team info
  }
}

async function findPlayerTeam(playerId) {
  // Try to find which Club World Cup team this player belongs to
  for (const leagueId of POTENTIAL_LEAGUE_IDS) {
    try {
      const teamsResponse = await fetch(`${BASE_URL}/teams?league=${leagueId}&season=2025`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })

      const teamsData = await teamsResponse.json()
      
      if (!teamsResponse.ok) {
        console.error(`❌ Teams API Error for league ${leagueId}:`, {
          status: teamsResponse.status,
          data: teamsData
        })
        continue
      }
      
      if (teamsData.response) {
        for (const teamData of teamsData.response) {
          const teamId = teamData.team.id
          
          try {
            const squadResponse = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'v3.football.api-sports.io'
              }
            })

            const squadData = await squadResponse.json()
            
            if (!squadResponse.ok) {
              console.error(`❌ Squad API Error for team ${teamId}:`, squadData)
              continue
            }
            
            if (squadData.response && squadData.response.length > 0) {
              const players = squadData.response[0].players || []
              const foundPlayer = players.find(p => p.id == playerId)
              
              if (foundPlayer) {
                console.log(`✅ Found player ${playerId} in team ${teamData.team.name}`)
                return {
                  team: {
                    id: teamData.team.id,
                    name: teamData.team.name,
                    logo: teamData.team.logo
                  },
                  player: foundPlayer // Include the player data from squad
                }
              }
            }
          } catch (error) {
            continue
          }
        }
      }
    } catch (error) {
      continue
    }
  }
  
  return null
}

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const playerId = params.id
    console.log('🎯 Backend API Route /api/players/[id] called for player:', playerId)
    
    if (!playerId) {
      return NextResponse.json({
        success: false,
        error: 'Player ID is required'
      }, { status: 400 })
    }
    
    // Check cache first (5 minute TTL)
    const cacheKey = `player_${playerId}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      console.log(`🚀 Cache hit for player ${playerId}`)
      return NextResponse.json(cached.data)
    }
    
    // Fetch player details and team info in parallel
    const [playerDetails, teamInfo] = await Promise.all([
      fetchPlayerDetails(playerId),
      findPlayerTeam(playerId)
    ])
    
    // Check if player was found in stats or team squad
    if (!playerDetails && !teamInfo?.player) {
      return NextResponse.json({
        success: false,
        error: `Player with ID ${playerId} not found in any available season`,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
    // If player details not found but player exists in team, create basic player object
    let finalPlayerDetails = playerDetails
    if (!playerDetails && teamInfo?.player) {
      console.log(`🔄 Using basic player info from team squad for player ${playerId}`)
      finalPlayerDetails = {
        player: {
          id: teamInfo.player.id,
          name: teamInfo.player.name,
          firstname: teamInfo.player.firstname || null,
          lastname: teamInfo.player.lastname || null,
          age: teamInfo.player.age || null,
          birth: teamInfo.player.birth || null,
          nationality: teamInfo.player.nationality || null,
          height: teamInfo.player.height || null,
          weight: teamInfo.player.weight || null,
          injured: teamInfo.player.injured || false,
          photo: teamInfo.player.photo || null
        },
        statistics: {
          games: 0,
          goals: 0,
          assists: 0,
          minutes: 0,
          rating: null,
          yellow_cards: 0,
          red_cards: 0
        },
        allStatistics: [],
        team: null
      }
    }
    
    finalPlayerDetails.team = teamInfo?.team || null
    
    const result = {
      success: true,
      player: finalPlayerDetails,
      timestamp: new Date().toISOString()
    }
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })
    
    console.log('✅ Backend Successfully processed player detail request:', {
      playerId,
      playerName: finalPlayerDetails.player?.name,
      team: teamInfo?.team?.name,
      totalStats: finalPlayerDetails.allStatistics?.length || 0,
      goals: finalPlayerDetails.statistics?.goals,
      games: finalPlayerDetails.statistics?.games
    })
    
    return NextResponse.json(result)
    
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