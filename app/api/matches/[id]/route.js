import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const matchId = params.id
    console.log(`🎯 Backend API Route /api/matches/${matchId} called`)
    
    // Try to get additional match details including odds from API Football
    const promises = [
      // Get match details
      fetch(`${BASE_URL}/fixtures?id=${matchId}`, {
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      }),
      // Get betting odds
      fetch(`${BASE_URL}/odds?fixture=${matchId}`, {
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      }),
      // Get match statistics
      fetch(`${BASE_URL}/fixtures/statistics?fixture=${matchId}`, {
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'v3.football.api-sports.io'
        }
      })
    ]

    const [fixtureResponse, oddsResponse, statsResponse] = await Promise.allSettled(promises)
    
    let matchDetails = {}
    let bettingOdds = null
    let matchStats = null

    // Process fixture details
    if (fixtureResponse.status === 'fulfilled' && fixtureResponse.value.ok) {
      const fixtureData = await fixtureResponse.value.json()
      if (fixtureData.response && fixtureData.response.length > 0) {
        const fixture = fixtureData.response[0]
        matchDetails = {
          referee: fixture.fixture.referee,
          weather: fixture.fixture.weather,
          lineups: fixture.lineups,
          events: fixture.events,
          players: fixture.players
        }
      }
    }

    // Process betting odds
    if (oddsResponse.status === 'fulfilled' && oddsResponse.value.ok) {
      const oddsData = await oddsResponse.value.json()
      if (oddsData.response && oddsData.response.length > 0) {
        // Find the main betting odds (1X2)
        const mainOdds = oddsData.response.find(odd => 
          odd.bookmaker.name === 'Bet365' || odd.bookmaker.name === 'William Hill'
        ) || oddsData.response[0]

        if (mainOdds && mainOdds.bets) {
          const matchWinnerBet = mainOdds.bets.find(bet => bet.name === 'Match Winner')
          if (matchWinnerBet && matchWinnerBet.values) {
            bettingOdds = {
              home: matchWinnerBet.values.find(v => v.value === 'Home')?.odd,
              draw: matchWinnerBet.values.find(v => v.value === 'Draw')?.odd,
              away: matchWinnerBet.values.find(v => v.value === 'Away')?.odd,
              bookmaker: mainOdds.bookmaker.name
            }
          }
        }
      }
    }

    // Process match statistics
    if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
      const statsData = await statsResponse.value.json()
      if (statsData.response && statsData.response.length > 0) {
        matchStats = statsData.response
      }
    }

    // If no real data found, provide mock betting odds for demo
    if (!bettingOdds) {
      bettingOdds = {
        home: (1.5 + Math.random() * 2).toFixed(2),
        draw: (2.8 + Math.random() * 1.5).toFixed(2), 
        away: (1.8 + Math.random() * 2.5).toFixed(2),
        bookmaker: 'Demo Odds'
      }
    }

    const enrichedMatch = {
      ...matchDetails,
      odds: bettingOdds,
      statistics: matchStats
    }

    console.log('✅ Backend Successfully processed match details request:', {
      matchId,
      hasOdds: !!bettingOdds,
      hasStats: !!matchStats,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      match: enrichedMatch,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Backend Match Details API Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Return mock data on error
    return NextResponse.json({
      success: true,
      match: {
        odds: {
          home: (1.5 + Math.random() * 2).toFixed(2),
          draw: (2.8 + Math.random() * 1.5).toFixed(2), 
          away: (1.8 + Math.random() * 2.5).toFixed(2),
          bookmaker: 'Mock Odds'
        }
      },
      timestamp: new Date().toISOString()
    })
  }
}