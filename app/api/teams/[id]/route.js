import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const teamId = params.id
    console.log(`🎯 Backend API Route /api/teams/${teamId} called`)
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    // Fetch team details and players
    const [teamInfo, teamPlayers] = await Promise.all([
      fetchTeamInfo(teamId),
      fetchTeamPlayers(teamId)
    ])
    
    console.log('✅ Backend Successfully processed team detail request:', {
      teamId,
      teamName: teamInfo?.name || 'Unknown',
      playersCount: teamPlayers?.length || 0,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      team: teamInfo,
      venue: teamInfo?.venue || null,
      players: teamPlayers,
      playersCount: teamPlayers?.length || 0,
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

async function fetchTeamInfo(teamId) {
  console.log(`🏟️ Backend Fetching team info for team ID: ${teamId}`)
  
  try {
    const response = await fetch(`${BASE_URL}/teams?id=${teamId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    const data = await response.json()
    
    if (response.ok && data.response && data.response.length > 0) {
      const teamData = data.response[0]
      console.log(`✅ Backend Found team info for ${teamData.team.name}`)
      
      return {
        id: teamData.team.id,
        name: teamData.team.name,
        logo: teamData.team.logo,
        country: teamData.team.country,
        founded: teamData.team.founded,
        code: teamData.team.code,
        venue: teamData.venue ? {
          id: teamData.venue.id,
          name: teamData.venue.name,
          capacity: teamData.venue.capacity,
          city: teamData.venue.city,
          image: teamData.venue.image,
          address: teamData.venue.address,
          surface: teamData.venue.surface
        } : null
      }
    }
    
    // Return mock data if API fails
    return getMockTeamInfo(teamId)
    
  } catch (error) {
    console.error(`❌ Backend Error fetching team info for ${teamId}:`, error.message)
    return getMockTeamInfo(teamId)
  }
}

async function fetchTeamPlayers(teamId) {
  console.log(`👥 Backend Fetching players for team ID: ${teamId}`)
  
  try {
    const response = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    const data = await response.json()
    
    if (response.ok && data.response && data.response.length > 0) {
      const players = data.response[0].players || []
      console.log(`✅ Backend Found ${players.length} players for team ${teamId}`)
      
      return players.map(player => ({
        id: player.id,
        name: player.name,
        photo: player.photo,
        age: player.age,
        nationality: player.birth?.country || 'Unknown',
        position: player.position,
        height: player.height,
        weight: player.weight,
        number: player.number
      }))
    }
    
    // Return mock data if API fails
    return getMockTeamPlayers(teamId)
    
  } catch (error) {
    console.error(`❌ Backend Error fetching players for team ${teamId}:`, error.message)
    return getMockTeamPlayers(teamId)
  }
}

function getMockTeamInfo(teamId) {
  console.log(`🎭 Backend Generating mock team info for team ID: ${teamId}`)
  
  const mockTeams = {
    49: { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png', country: 'England', founded: 1905, code: 'CHE', venue: { name: 'Stamford Bridge', capacity: 40341, city: 'London', address: 'Fulham Road', surface: 'grass' } },
    50: { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png', country: 'England', founded: 1880, code: 'MCI', venue: { name: 'Etihad Stadium', capacity: 55097, city: 'Manchester', address: 'Rowsley Street', surface: 'grass' } },
    85: { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png', country: 'France', founded: 1970, code: 'PSG', venue: { name: 'Parc des Princes', capacity: 47929, city: 'Paris', address: '24 Rue du Commandant Guilbaud', surface: 'grass' } },
    157: { id: 157, name: 'Bayern München', logo: 'https://media.api-sports.io/football/teams/157.png', country: 'Germany', founded: 1900, code: 'BAY', venue: { name: 'Allianz Arena', capacity: 75000, city: 'Munich', address: 'Werner-Heisenberg-Allee 25', surface: 'grass' } },
    541: { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png', country: 'Spain', founded: 1902, code: 'REA', venue: { name: 'Santiago Bernabéu', capacity: 81044, city: 'Madrid', address: 'Avenida de Concha Espina 1', surface: 'grass' } },
    9568: { id: 9568, name: 'Inter Miami', logo: 'https://media.api-sports.io/football/teams/9568.png', country: 'USA', founded: 2018, code: 'MIA', venue: { name: 'DRV PNK Stadium', capacity: 18000, city: 'Fort Lauderdale', address: '1350 NW 55th Street', surface: 'grass' } }
  }
  
  return mockTeams[teamId] || { id: parseInt(teamId), name: 'Unknown Team', logo: '', country: 'Unknown', founded: null, code: 'UNK', venue: null }
}

function getMockTeamPlayers(teamId) {
  console.log(`🎭 Backend Generating mock players for team ID: ${teamId}`)
  
  // Generate 20-25 mock players for each team
  const players = []
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker']
  const nationalities = ['England', 'France', 'Spain', 'Germany', 'Brazil', 'Argentina', 'Portugal', 'Italy']
  
  for (let i = 1; i <= 23; i++) {
    players.push({
      id: parseInt(teamId) * 1000 + i,
      name: `Player ${i}`,
      photo: `https://media.api-sports.io/football/players/${parseInt(teamId) * 1000 + i}.png`,
      age: 18 + Math.floor(Math.random() * 20),
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      height: `${170 + Math.floor(Math.random() * 25)} cm`,
      weight: `${65 + Math.floor(Math.random() * 25)} kg`,
      number: i
    })
  }
  
  return players
}