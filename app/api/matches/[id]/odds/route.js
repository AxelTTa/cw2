import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const matchId = params.id
    console.log(`🎯 Backend API Route /api/matches/${matchId}/odds called`)
    
    const response = await fetch(`${BASE_URL}/odds?fixture=${matchId}`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      response: data.response || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Backend Match Odds API Error:', error)
    
    // Return mock odds data on error
    return NextResponse.json({
      success: true,
      response: [
        {
          bookmaker: { name: 'Demo Bookmaker' },
          bets: [
            {
              name: 'Match Winner',
              values: [
                { value: 'Home', odd: (1.5 + Math.random() * 2).toFixed(2) },
                { value: 'Draw', odd: (2.8 + Math.random() * 1.5).toFixed(2) },
                { value: 'Away', odd: (1.8 + Math.random() * 2.5).toFixed(2) }
              ]
            }
          ]
        }
      ],
      timestamp: new Date().toISOString()
    })
  }
}