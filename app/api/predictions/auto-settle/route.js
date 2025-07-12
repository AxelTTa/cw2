import { supabase } from '../../../utils/supabase'
import { NextResponse } from 'next/server'

// Simple event detection for auto-settlement
const detectWinningOption = (prediction, matchEvents) => {
  const question = prediction.question.toLowerCase()
  const recentEvents = matchEvents.filter(event => 
    new Date(event.timestamp || event.time) > new Date(prediction.created_at)
  )

  // Foul detection
  if (question.includes('foul')) {
    const hasFoul = recentEvents.some(event => 
      event.type?.toLowerCase().includes('foul') ||
      event.detail?.toLowerCase().includes('foul') ||
      event.type?.toLowerCase().includes('card')
    )
    return hasFoul ? 'Yes' : 'No'
  }

  // Shot detection
  if (question.includes('shot')) {
    const hasShot = recentEvents.some(event => 
      event.type?.toLowerCase().includes('shot') ||
      event.detail?.toLowerCase().includes('shot')
    )
    return hasShot ? 'Yes' : 'No'
  }

  // Corner detection
  if (question.includes('corner')) {
    const hasCorner = recentEvents.some(event => 
      event.type?.toLowerCase().includes('corner')
    )
    return hasCorner ? 'Yes' : 'No'
  }

  // Goal detection
  if (question.includes('goal')) {
    const hasGoal = recentEvents.some(event => 
      event.type?.toLowerCase().includes('goal')
    )
    return hasGoal ? 'Yes' : 'No'
  }

  // Card detection
  if (question.includes('card') || question.includes('yellow')) {
    const hasCard = recentEvents.some(event => 
      event.type?.toLowerCase().includes('card')
    )
    return hasCard ? 'Yes' : 'No'
  }

  // Substitution detection
  if (question.includes('substitution')) {
    const hasSubstitution = recentEvents.some(event => 
      event.type?.toLowerCase().includes('substitution') ||
      event.type?.toLowerCase().includes('subst')
    )
    return hasSubstitution ? 'Yes' : 'No'
  }

  // Team action detection (more complex)
  if (question.includes('team will have the next')) {
    if (recentEvents.length > 0) {
      const lastEvent = recentEvents[recentEvents.length - 1]
      const homeTeam = prediction.context_data?.home_team
      const awayTeam = prediction.context_data?.away_team
      
      if (lastEvent.team?.name === homeTeam) return homeTeam
      if (lastEvent.team?.name === awayTeam) return awayTeam
    }
  }

  return null // Cannot determine winner automatically
}

export async function POST(request) {
  try {
    const { matchId } = await request.json()

    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 })
    }


    // Get expired but unsettled predictions for this match
    const { data: expiredPredictions, error: predictionsError } = await supabase
      .from('prediction_markets')
      .select('*')
      .eq('match_id', matchId)
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())

    if (predictionsError) {
      console.error('Error fetching expired predictions:', predictionsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch predictions'
      }, { status: 500 })
    }

    if (!expiredPredictions || expiredPredictions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired predictions to settle',
        settled: 0
      })
    }

    // Get recent match events (last 10 minutes)
    const { data: matchEvents, error: eventsError } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', matchId)
      .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })

    if (eventsError) {
      console.error('Error fetching match events:', eventsError)
    }

    let settledCount = 0
    const settlementResults = []

    // Process each expired prediction
    for (const prediction of expiredPredictions) {
      try {
        // Try to auto-detect winner
        const winningOption = detectWinningOption(prediction, matchEvents || [])

        if (winningOption && prediction.options.includes(winningOption)) {
          // Auto-settle with detected winner
          const { data: settlementResult, error: settleError } = await supabase.rpc('settle_prediction_market', {
            p_market_id: prediction.id,
            p_winning_option: winningOption
          })

          if (settleError) {
            console.error(`Error settling prediction ${prediction.id}:`, settleError)
            settlementResults.push({
              predictionId: prediction.id,
              success: false,
              error: settleError.message
            })
          } else {
            settledCount++
            settlementResults.push({
              predictionId: prediction.id,
              success: true,
              winningOption,
              result: settlementResult
            })
          }
        } else {
          // Cannot auto-detect, refund all bets
          const { data: refundResult, error: refundError } = await supabase.rpc('settle_prediction_market', {
            p_market_id: prediction.id,
            p_winning_option: 'refund'
          })

          if (refundError) {
            console.error(`Error refunding prediction ${prediction.id}:`, refundError)
            settlementResults.push({
              predictionId: prediction.id,
              success: false,
              error: refundError.message
            })
          } else {
            settledCount++
            settlementResults.push({
              predictionId: prediction.id,
              success: true,
              winningOption: 'refund',
              result: refundResult
            })
          }
        }
      } catch (error) {
        console.error(`Error processing prediction ${prediction.id}:`, error)
        settlementResults.push({
          predictionId: prediction.id,
          success: false,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Settled ${settledCount} predictions`,
      settled: settledCount,
      total: expiredPredictions.length,
      results: settlementResults
    })

  } catch (error) {
    console.error('API error in auto-settle:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}