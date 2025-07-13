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
    
    // Return error response instead of mock data
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch match odds',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}