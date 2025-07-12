import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'
import { ethers } from 'ethers'

// Daily CHZ reward amounts
const DAILY_REWARDS = {
  1: 50, // 1st place
  2: 30, // 2nd place
  3: 20  // 3rd place
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const action = searchParams.get('action')

    if (action === 'calculate') {
      return await calculateDailyRewards(date)
    } else if (action === 'distribute') {
      return await distributeDailyRewards(date)
    } else {
      return await getDailyRewards(date)
    }
  } catch (error) {
    console.error('Daily rewards API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function getDailyRewards(date) {
  try {
    // Get daily rewards for the specified date
    const { data: rewards, error } = await supabaseAdmin
      .from('daily_chz_rewards')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('date', date)
      .order('rank', { ascending: true })

    if (error) {
      throw error
    }

    // Get daily scores for leaderboard
    const { data: scores, error: scoresError } = await supabaseAdmin
      .from('daily_commentator_scores')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('date', date)
      .order('rank', { ascending: true })
      .limit(10)

    if (scoresError) {
      throw scoresError
    }

    return NextResponse.json({
      success: true,
      date,
      rewards: rewards || [],
      leaderboard: scores || []
    })
  } catch (error) {
    console.error('Error fetching daily rewards:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch daily rewards' 
    }, { status: 500 })
  }
}

async function calculateDailyRewards(date) {
  try {
    console.log(`Calculating daily rewards for ${date}`)

    // Call the database function to calculate scores
    const { data: scores, error } = await supabaseAdmin
      .rpc('calculate_daily_commentator_scores', { target_date: date })

    if (error) {
      throw error
    }

    if (!scores || scores.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No activity found for this date',
        date,
        scores: []
      })
    }

    // Store the calculated scores
    for (const score of scores) {
      const { error: insertError } = await supabaseAdmin
        .from('daily_commentator_scores')
        .upsert({
          user_id: score.user_id,
          date: date,
          final_score: score.score,
          rank: score.rank,
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error storing score:', insertError)
      }
    }

    // Create reward entries for top 3
    const topThree = scores.slice(0, 3)
    for (const winner of topThree) {
      const chzAmount = DAILY_REWARDS[winner.rank]
      
      const { error: rewardError } = await supabaseAdmin
        .from('daily_chz_rewards')
        .upsert({
          user_id: winner.user_id,
          date: date,
          rank: winner.rank,
          chz_amount: chzAmount,
          status: 'pending'
        })

      if (rewardError) {
        console.error('Error creating reward entry:', rewardError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Calculated rewards for ${scores.length} users`,
      date,
      topThree: topThree.map(w => ({
        rank: w.rank,
        user_id: w.user_id,
        score: w.score,
        reward: DAILY_REWARDS[w.rank]
      }))
    })
  } catch (error) {
    console.error('Error calculating daily rewards:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to calculate daily rewards' 
    }, { status: 500 })
  }
}

async function distributeDailyRewards(date) {
  try {
    console.log(`Distributing daily rewards for ${date}`)

    // Get pending rewards with user wallet addresses
    const { data: pendingRewards, error } = await supabaseAdmin
      .from('daily_chz_rewards')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          wallet_address
        )
      `)
      .eq('date', date)
      .eq('status', 'pending')
      .not('profiles.wallet_address', 'is', null)

    if (error) {
      throw error
    }

    if (!pendingRewards || pendingRewards.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending rewards to distribute',
        date
      })
    }

    // Setup Web3 provider
    const provider = new ethers.JsonRpcProvider(process.env.CHZ_RPC_URL || 'https://rpc.chiliz.com')
    const adminWallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider)

    const distributionResults = []

    for (const reward of pendingRewards) {
      try {
        const toAddress = reward.profiles.wallet_address
        const amountInWei = ethers.parseEther(reward.chz_amount.toString())

        // Send CHZ transaction
        const tx = await adminWallet.sendTransaction({
          to: toAddress,
          value: amountInWei
        })

        console.log(`Sent ${reward.chz_amount} CHZ to ${toAddress}. TX: ${tx.hash}`)

        // Update reward status
        const { error: updateError } = await supabaseAdmin
          .from('daily_chz_rewards')
          .update({
            status: 'distributed',
            wallet_address: toAddress,
            transaction_hash: tx.hash,
            awarded_at: new Date().toISOString()
          })
          .eq('id', reward.id)

        if (updateError) {
          console.error('Error updating reward status:', updateError)
        }

        distributionResults.push({
          user_id: reward.user_id,
          username: reward.profiles.username,
          rank: reward.rank,
          amount: reward.chz_amount,
          transaction_hash: tx.hash,
          success: true
        })

      } catch (txError) {
        console.error(`Failed to send CHZ to ${reward.profiles.wallet_address}:`, txError)
        
        distributionResults.push({
          user_id: reward.user_id,
          username: reward.profiles.username,
          rank: reward.rank,
          amount: reward.chz_amount,
          error: txError.message,
          success: false
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${distributionResults.length} reward distributions`,
      date,
      results: distributionResults
    })

  } catch (error) {
    console.error('Error distributing daily rewards:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to distribute daily rewards' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { action, date } = await request.json()
    
    if (action === 'calculate') {
      return await calculateDailyRewards(date || new Date().toISOString().split('T')[0])
    } else if (action === 'distribute') {
      return await distributeDailyRewards(date || new Date().toISOString().split('T')[0])
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 })
  } catch (error) {
    console.error('Daily rewards POST API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}