import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Get user's eligible rewards
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    // Validate user_id is a proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID format' 
      }, { status: 400 })
    }

    // Get user profile with stats
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        level,
        xp,
        streak_count,
        total_chz_earned,
        wallet_address,
        created_at
      `)
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Get user's comment statistics
    const { data: commentStats, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('id, upvotes')
      .eq('user_id', userId)

    if (commentError) {
      console.error('Error fetching comment stats:', commentError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch user statistics' 
      }, { status: 500 })
    }

    // Calculate totals
    const totalComments = commentStats ? commentStats.length : 0
    const totalUpvotes = commentStats ? commentStats.reduce((sum, comment) => sum + (comment.upvotes || 0), 0) : 0

    // Get eligible rewards using database function
    const { data: eligibleRewards, error: rewardsError } = await supabaseAdmin
      .rpc('get_eligible_rewards', { p_user_id: userId })

    if (rewardsError) {
      console.error('Error fetching eligible rewards:', rewardsError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to calculate rewards' 
      }, { status: 500 })
    }

    // Get user's claim history
    const { data: claimHistory, error: claimError } = await supabaseAdmin
      .from('reward_claims')
      .select(`
        id,
        claim_type,
        xp_threshold,
        chz_amount,
        wallet_address,
        transaction_hash,
        claimed_at
      `)
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false })

    if (claimError) {
      console.error('Error fetching claim history:', claimError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch claim history' 
      }, { status: 500 })
    }

    // Calculate totals
    const totalClaimedCHZ = claimHistory ? 
      claimHistory.reduce((sum, claim) => sum + parseFloat(claim.chz_amount || 0), 0) : 0

    const unclaimedRewards = eligibleRewards ? 
      eligibleRewards.filter(reward => !reward.already_claimed) : []

    const totalUnclaimedCHZ = unclaimedRewards.reduce((sum, reward) => 
      sum + parseFloat(reward.chz_reward || 0), 0)

    // Get all milestones for progress tracking
    const { data: allMilestones, error: milestonesError } = await supabaseAdmin
      .from('reward_milestones')
      .select('*')
      .eq('is_active', true)
      .order('milestone_type')
      .order('threshold_value')

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch milestones' 
      }, { status: 500 })
    }

    // Group milestones by type for easier frontend handling
    const milestonesByType = {
      level: [],
      comments: [],
      upvotes: [],
      streak: []
    }

    allMilestones.forEach(milestone => {
      if (milestonesByType[milestone.milestone_type]) {
        milestonesByType[milestone.milestone_type].push(milestone)
      }
    })

    // Calculate next milestones
    const nextMilestones = {}
    Object.keys(milestonesByType).forEach(type => {
      const currentValue = {
        level: profile.level,
        comments: totalComments,
        upvotes: totalUpvotes,
        streak: profile.streak_count
      }[type]

      const nextMilestone = milestonesByType[type].find(m => 
        m.threshold_value > currentValue
      )

      if (nextMilestone) {
        nextMilestones[type] = {
          ...nextMilestone,
          current_value: currentValue,
          progress: Math.min((currentValue / nextMilestone.threshold_value) * 100, 100)
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          level: profile.level,
          xp: profile.xp,
          streak_count: profile.streak_count,
          total_chz_earned: parseFloat(profile.total_chz_earned || 0),
          wallet_address: profile.wallet_address,
          created_at: profile.created_at
        },
        stats: {
          total_comments: totalComments,
          total_upvotes: totalUpvotes,
          total_claimed_chz: totalClaimedCHZ,
          total_unclaimed_chz: totalUnclaimedCHZ
        },
        eligible_rewards: eligibleRewards || [],
        unclaimed_rewards: unclaimedRewards,
        claim_history: claimHistory || [],
        milestones: {
          by_type: milestonesByType,
          next_milestones: nextMilestones
        }
      }
    })

  } catch (error) {
    console.error('Rewards API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Calculate potential rewards for a user (preview)
export async function POST(request) {
  try {
    const { user_id, simulate_stats } = await request.json()

    if (!user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('level, xp, streak_count')
      .eq('id', user_id)
      .single()

    if (profileError) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Get current comment stats
    const { data: commentStats, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('id, upvotes')
      .eq('user_id', user_id)

    if (commentError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch user statistics' 
      }, { status: 500 })
    }

    const currentStats = {
      level: profile.level,
      comments: commentStats ? commentStats.length : 0,
      upvotes: commentStats ? commentStats.reduce((sum, comment) => sum + (comment.upvotes || 0), 0) : 0,
      streak: profile.streak_count
    }

    // Apply simulated stats if provided
    const simulatedStats = simulate_stats ? { ...currentStats, ...simulate_stats } : currentStats

    // Get all milestones
    const { data: milestones, error: milestonesError } = await supabaseAdmin
      .from('reward_milestones')
      .select('*')
      .eq('is_active', true)
      .order('milestone_type')
      .order('threshold_value')

    if (milestonesError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch milestones' 
      }, { status: 500 })
    }

    // Calculate potential rewards
    const potentialRewards = milestones.filter(milestone => {
      const currentValue = simulatedStats[milestone.milestone_type]
      return currentValue >= milestone.threshold_value
    })

    const totalPotentialCHZ = potentialRewards.reduce((sum, reward) => 
      sum + parseFloat(reward.chz_reward || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        current_stats: currentStats,
        simulated_stats: simulatedStats,
        potential_rewards: potentialRewards,
        total_potential_chz: totalPotentialCHZ
      }
    })

  } catch (error) {
    console.error('Rewards simulation API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}