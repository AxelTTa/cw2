import { supabase } from '../../../utils/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('🎯 [PLACE-BET-API] Received bet placement request')
    
    const requestBody = await request.json()
    const { marketId, selectedOption, stakeAmount } = requestBody
    
    console.log('📋 [PLACE-BET-API] Request data:', {
      marketId,
      selectedOption,
      stakeAmount,
      fullBody: requestBody
    })

    // Validate input
    if (!marketId || !selectedOption || !stakeAmount || stakeAmount <= 0) {
      console.log('❌ [PLACE-BET-API] Validation failed:', {
        hasMarketId: !!marketId,
        hasSelectedOption: !!selectedOption,
        hasStakeAmount: !!stakeAmount,
        stakeAmountValid: stakeAmount > 0
      })
      
      return NextResponse.json({
        success: false,
        error: 'Invalid bet parameters'
      }, { status: 400 })
    }
    
    console.log('✅ [PLACE-BET-API] Input validation passed')


    // Get authenticated user
    console.log('🔐 [PLACE-BET-API] Checking authentication...')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔐 [PLACE-BET-API] Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
      userEmail: user?.email
    })
    
    if (authError || !user) {
      console.log('❌ [PLACE-BET-API] Authentication failed')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    console.log('✅ [PLACE-BET-API] User authenticated successfully')

    // Call the database function to place the bet
    console.log('💾 [PLACE-BET-API] Calling database function with params:', {
      p_user_id: user.id,
      p_market_id: marketId,
      p_selected_option: selectedOption,
      p_stake_amount: stakeAmount
    })
    
    const { data, error } = await supabase.rpc('place_prediction_bet', {
      p_user_id: user.id,
      p_market_id: marketId,
      p_selected_option: selectedOption,
      p_stake_amount: stakeAmount
    })

    if (error) {
      console.error('❌ [PLACE-BET-API] Database error placing bet:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      return NextResponse.json({
        success: false,
        error: 'Failed to place bet: ' + error.message
      }, { status: 500 })
    }
    
    console.log('✅ [PLACE-BET-API] Bet placed successfully:', data)

    // Return the result from the database function
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [PLACE-BET-API] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}