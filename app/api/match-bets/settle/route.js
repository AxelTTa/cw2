import { NextResponse } from 'next/server'
import { supabase } from '../../../utils/supabase'
import { sendChzFromAdmin } from '../../../utils/chiliz-token'

export async function POST(request) {
  try {
    console.log('🚀 [BET-SETTLE] Starting bet settlement request...')
    
    const requestData = await request.json()
    const { matchId, winningTeam } = requestData
    
    console.log('📥 [BET-SETTLE] Request data:', {
      matchId,
      winningTeam,
      requestData,
      timestamp: new Date().toISOString()
    })

    if (!matchId || !winningTeam) {
      console.log('❌ [BET-SETTLE] Invalid request - missing required fields:', {
        hasMatchId: !!matchId,
        hasWinningTeam: !!winningTeam,
        receivedData: requestData
      })
      
      return NextResponse.json({ 
        success: false, 
        error: 'Missing matchId or winningTeam' 
      }, { status: 400 })
    }

    console.log(`🏆 [BET-SETTLE] Settling bets for match ${matchId}, winner: ${winningTeam}`)

    // Get all active bets for this match
    console.log('🔍 [BET-SETTLE] Fetching active bets from database...')
    
    const { data: bets, error: betsError } = await supabase
      .from('match_bets')
      .select('*')
      .eq('match_id', matchId)
      .eq('status', 'active')

    if (betsError) {
      console.error('❌ [BET-SETTLE] Database error fetching bets:', betsError)
      throw new Error('Failed to fetch bets: ' + betsError.message)
    }

    console.log('📊 [BET-SETTLE] Database query result:', {
      betsFound: bets?.length || 0,
      bets: bets?.map(bet => ({
        id: bet.id,
        userId: bet.user_id,
        teamBet: bet.team_bet,
        amount: bet.amount,
        status: bet.status
      })) || []
    })

    if (!bets || bets.length === 0) {
      console.log('⚠️ [BET-SETTLE] No active bets found for match:', matchId)
      
      return NextResponse.json({
        success: true,
        message: 'No active bets found for this match',
        settled: 0
      })
    }

    console.log(`📊 [BET-SETTLE] Found ${bets.length} active bets to settle`)

    // Separate winning and losing bets
    const winningBets = bets.filter(bet => bet.team_bet === winningTeam)
    const losingBets = bets.filter(bet => bet.team_bet !== winningTeam)

    console.log('🏆 [BET-SETTLE] Bet categorization:', {
      winningBets: winningBets.length,
      losingBets: losingBets.length,
      winningTeam,
      winningBetDetails: winningBets.map(bet => ({
        id: bet.id,
        userId: bet.user_id,
        teamBet: bet.team_bet,
        amount: bet.amount
      })),
      losingBetDetails: losingBets.map(bet => ({
        id: bet.id,
        userId: bet.user_id,
        teamBet: bet.team_bet,
        amount: bet.amount
      }))
    })

    // Calculate total pool and payouts
    const totalPool = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0)
    const winningPool = winningBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0)
    
    console.log('💰 [BET-SETTLE] Pool calculations:', {
      totalPool,
      winningPool,
      losingPool: totalPool - winningPool,
      averageBet: totalPool / bets.length
    })
    
    let results = []

    // Process winning bets
    for (const bet of winningBets) {
      try {
        // Calculate payout: get back original bet + share of losing bets proportional to bet size
        const betShare = parseFloat(bet.amount) / winningPool
        const losingBetsTotal = totalPool - winningPool
        const bonus = losingBetsTotal * betShare
        const totalPayout = parseFloat(bet.amount) + bonus

        // Update bet status in database
        const { error: updateError } = await supabase
          .from('match_bets')
          .update({
            status: 'won',
            result: winningTeam,
            actual_return: totalPayout,
            settled_at: new Date().toISOString()
          })
          .eq('id', bet.id)

        if (updateError) {
          throw new Error(`Failed to update bet ${bet.id}: ${updateError.message}`)
        }

        // Update user balance
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('fan_tokens')
          .eq('id', bet.user_id)
          .single()

        if (profileError) {
          throw new Error(`Failed to get user profile: ${profileError.message}`)
        }

        const newBalance = parseFloat(profile.fan_tokens || 0) + totalPayout

        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ fan_tokens: newBalance })
          .eq('id', bet.user_id)

        if (balanceError) {
          throw new Error(`Failed to update user balance: ${balanceError.message}`)
        }

        results.push({
          userId: bet.user_id,
          betAmount: bet.amount,
          payout: totalPayout,
          status: 'won'
        })

        console.log(`✅ Paid out ${totalPayout} CHZ to user ${bet.user_id}`)

      } catch (error) {
        console.error(`❌ Error processing winning bet ${bet.id}:`, error)
        results.push({
          userId: bet.user_id,
          betAmount: bet.amount,
          payout: 0,
          status: 'error',
          error: error.message
        })
      }
    }

    // Process losing bets
    for (const bet of losingBets) {
      try {
        // Update bet status in database
        const { error: updateError } = await supabase
          .from('match_bets')
          .update({
            status: 'lost',
            result: winningTeam,
            actual_return: 0,
            settled_at: new Date().toISOString()
          })
          .eq('id', bet.id)

        if (updateError) {
          throw new Error(`Failed to update bet ${bet.id}: ${updateError.message}`)
        }

        results.push({
          userId: bet.user_id,
          betAmount: bet.amount,
          payout: 0,
          status: 'lost'
        })

        console.log(`❌ Marked bet ${bet.id} as lost`)

      } catch (error) {
        console.error(`❌ Error processing losing bet ${bet.id}:`, error)
        results.push({
          userId: bet.user_id,
          betAmount: bet.amount,
          payout: 0,
          status: 'error',
          error: error.message
        })
      }
    }

    const totalPayouts = results
      .filter(r => r.status === 'won')
      .reduce((sum, r) => sum + r.payout, 0)

    return NextResponse.json({
      success: true,
      message: `Match ${matchId} settled successfully`,
      matchId,
      winningTeam,
      totalBets: bets.length,
      winningBets: winningBets.length,
      losingBets: losingBets.length,
      totalPool,
      totalPayouts,
      results
    })

  } catch (error) {
    console.error('❌ Error settling match bets:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}