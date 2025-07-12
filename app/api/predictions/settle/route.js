import { supabase } from '../../../utils/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { marketId, winningOption } = await request.json()

    // Validate input
    if (!marketId || !winningOption) {
      return NextResponse.json({
        success: false,
        error: 'Market ID and winning option are required'
      }, { status: 400 })
    }


    // Get authenticated user (admin check could be added here)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Call the database function to settle the market
    const { data, error } = await supabase.rpc('settle_prediction_market', {
      p_market_id: marketId,
      p_winning_option: winningOption
    })

    if (error) {
      console.error('Database error settling market:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to settle market: ' + error.message
      }, { status: 500 })
    }

    // Return the settlement result
    return NextResponse.json(data)

  } catch (error) {
    console.error('API error settling market:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}