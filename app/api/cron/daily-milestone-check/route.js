import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../utils/supabase'
import crypto from 'crypto'

// Daily cron job to check for new milestone achievements
export async function POST(request) {
  try {
    // Verify this is a legitimate cron request (optional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('Unauthorized cron request')
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('🕐 Starting daily milestone check...')

    // Run the daily milestone check function
    const { data: result, error } = await supabaseAdmin
      .rpc('process_daily_milestone_checks')

    if (error) {
      console.error('❌ Error running daily milestone check:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    const checkResult = typeof result === 'string' ? JSON.parse(result) : result

    console.log('✅ Daily milestone check completed:', checkResult)

    // Get summary of eligible users for rewards
    const { data: eligibleUsers, error: eligibleError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        level,
        total_comments,
        total_likes_received,
        streak_count,
        wallet_address
      `)
      .gte('level', 5) // Users with level 5+ might have pending rewards

    if (eligibleError) {
      console.error('Error fetching eligible users:', eligibleError)
    }

    // Check how many users have unclaimed rewards
    let usersWithRewards = 0
    let totalUnclaimedCHZ = 0

    if (eligibleUsers) {
      for (const user of eligibleUsers) {
        const { data: pendingRewards, error: rewardsError } = await supabaseAdmin
          .rpc('get_user_pending_rewards', { p_user_id: user.id })

        if (!rewardsError && pendingRewards) {
          const eligibleRewards = pendingRewards.filter(r => r.is_eligible)
          if (eligibleRewards.length > 0) {
            usersWithRewards++
            totalUnclaimedCHZ += eligibleRewards.reduce((sum, reward) => 
              sum + parseFloat(reward.chz_reward || 0), 0)
          }
        }
      }
    }

    // Log the daily summary
    console.log(`📊 Daily Summary:
    - Users checked: ${checkResult.users_checked || 0}
    - New milestones achieved: ${checkResult.new_milestones_achieved || 0}
    - Users with unclaimed rewards: ${usersWithRewards}
    - Total unclaimed CHZ: ${totalUnclaimedCHZ.toFixed(2)}`)

    // Create a daily summary log entry
    const { error: logError } = await supabaseAdmin
      .from('daily_commentator_scores')
      .upsert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user ID
        date: new Date().toISOString().split('T')[0],
        comments_count: checkResult.users_checked || 0,
        total_upvotes: checkResult.new_milestones_achieved || 0,
        final_score: usersWithRewards,
        rank: Math.round(totalUnclaimedCHZ),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })

    if (logError) {
      console.error('Error logging daily summary:', logError)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...checkResult,
        users_with_unclaimed_rewards: usersWithRewards,
        total_unclaimed_chz: totalUnclaimedCHZ.toFixed(2),
        eligible_users_checked: eligibleUsers?.length || 0
      }
    })

  } catch (error) {
    console.error('💥 Daily milestone check API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Manual trigger endpoint (for testing)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    // Simple auth check for manual testing
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('🔧 Manual milestone check triggered')

    // Run the same logic as POST
    const { data: result, error } = await supabaseAdmin
      .rpc('process_daily_milestone_checks')

    if (error) {
      console.error('❌ Error running manual milestone check:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    const checkResult = typeof result === 'string' ? JSON.parse(result) : result

    return NextResponse.json({
      success: true,
      message: 'Manual milestone check completed',
      data: checkResult
    })

  } catch (error) {
    console.error('💥 Manual milestone check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}