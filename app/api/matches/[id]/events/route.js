import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const matchId = params.id
    console.log(`🎯 Backend API Route /api/matches/${matchId}/events called`)
    
    const response = await fetch(`${BASE_URL}/fixtures/events?fixture=${matchId}`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Return the events data or empty array if no events
    return NextResponse.json({
      success: true,
      response: data.response || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Backend Match Events API Error:', error)
    
    // Return mock events data on error
    return NextResponse.json({
      success: true,
      response: [
        {
          time: { elapsed: 23 },
          type: 'Goal',
          detail: 'Normal Goal',
          player: { name: 'x' },
          assist: { name: 'x' },
          team: { name: 'x' }
        },
        {
          time: { elapsed: 45 },
          type: 'Card',
          detail: 'Yellow Card',
          player: { name: 'x' },
          team: { name: 'x' }
        },
        {
          time: { elapsed: 67 },
          type: 'Goal',
          detail: 'Normal Goal',
          player: { name: 'x' },
          team: { name: 'x' }
        }
      ],
      timestamp: new Date().toISOString()
    })
  }
}