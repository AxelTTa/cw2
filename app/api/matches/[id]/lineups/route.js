import { NextResponse } from 'next/server'

const API_KEY = 'e4af61c0e46b03a5ce54e502c32aa0a5'
const BASE_URL = 'https://v3.football.api-sports.io'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const matchId = params.id
    console.log(`🎯 Backend API Route /api/matches/${matchId}/lineups called`)
    
    const response = await fetch(`${BASE_URL}/fixtures/lineups?fixture=${matchId}`, {
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
    console.error('❌ Backend Match Lineups API Error:', error)
    
    // Return mock lineups data on error
    return NextResponse.json({
      success: true,
      response: [
        {
          team: { name: 'Home Team' },
          formation: '4-3-3',
          startXI: Array.from({ length: 11 }, (_, i) => ({
            player: { 
              name: 'x',
              number: i + 1,
              pos: i === 0 ? 'G' : i < 5 ? 'D' : i < 8 ? 'M' : 'F'
            }
          })),
          substitutes: Array.from({ length: 7 }, (_, i) => ({
            player: { 
              name: 'x',
              number: i + 12,
              pos: 'S'
            }
          }))
        },
        {
          team: { name: 'Away Team' },
          formation: '4-4-2',
          startXI: Array.from({ length: 11 }, (_, i) => ({
            player: { 
              name: 'x',
              number: i + 1,
              pos: i === 0 ? 'G' : i < 5 ? 'D' : i < 9 ? 'M' : 'F'
            }
          })),
          substitutes: Array.from({ length: 7 }, (_, i) => ({
            player: { 
              name: 'x',
              number: i + 12,
              pos: 'S'
            }
          }))
        }
      ],
      timestamp: new Date().toISOString()
    })
  }
}