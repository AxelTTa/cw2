import { supabase } from '../../../utils/supabase'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 })
    }


    // Get current active predictions with pools
    const { data: predictions, error: predictionsError } = await supabase
      .from('prediction_markets')
      .select(`
        *,
        pools:prediction_pools(
          id, option_value, total_stakes, participant_count
        )
      `)
      .eq('match_id', matchId)
      .eq('prediction_type', 'micro')
      .in('status', ['active', 'settled'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (predictionsError) {
      console.error('Error fetching predictions:', predictionsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch predictions'
      }, { status: 500 })
    }

    // Get match status
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, status, minute, home_score, away_score')
      .eq('id', matchId)
      .single()

    if (matchError) {
      console.error('Error fetching match:', matchError)
    }

    // Auto-settle any expired predictions
    try {
      const expiredPredictions = predictions?.filter(p => 
        p.status === 'active' && new Date(p.expires_at) <= new Date()
      ) || []

      if (expiredPredictions.length > 0) {
        // Trigger auto-settlement (fire and forget)
        const headersList = headers()
        const host = headersList.get('host')
        const protocol = headersList.get('x-forwarded-proto') || 'http'
        const baseUrl = `${protocol}://${host}`
        
        fetch(`${baseUrl}/api/predictions/auto-settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId })
        }).catch(error => {
          console.error('Failed to trigger auto-settlement:', error)
        })
      }
    } catch (error) {
      console.error('Error checking for expired predictions:', error)
    }

    return NextResponse.json({
      success: true,
      predictions: predictions || [],
      match: match || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API error in live updates:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}