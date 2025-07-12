import { supabase } from '../../../utils/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { marketId, selectedOption, stakeAmount } = await request.json()

    // Validate input
    if (!marketId || !selectedOption || !stakeAmount || stakeAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bet parameters'
      }, { status: 400 })
    }


    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Call the database function to place the bet
    const { data, error } = await supabase.rpc('place_prediction_bet', {
      p_user_id: user.id,
      p_market_id: marketId,
      p_selected_option: selectedOption,
      p_stake_amount: stakeAmount
    })

    if (error) {
      console.error('Database error placing bet:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to place bet: ' + error.message
      }, { status: 500 })
    }

    // Return the result from the database function
    return NextResponse.json(data)

  } catch (error) {
    console.error('API error placing bet:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}