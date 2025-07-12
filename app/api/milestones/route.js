import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🎯 Backend: Fetching milestones for user:', userId)

    // Get user's eligible rewards using database function
    const { data: milestones, error: milestonesError } = await supabaseAdmin
      .rpc('get_eligible_rewards', { p_user_id: userId })

    if (milestonesError) {
      console.error('❌ Error fetching milestones:', milestonesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch milestones' },
        { status: 500 }
      )
    }

    // Get user's pending/completed claims
    const { data: claims, error: claimsError } = await supabaseAdmin
      .from('reward_claims')
      .select(`
        id,
        milestone_id,
        chz_amount,
        status,
        claimed_at,
        transaction_hash,
        reward_milestones (
          title,
          milestone_type,
          threshold_value
        )
      `)
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false })

    if (claimsError) {
      console.error('❌ Error fetching claims:', claimsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch claims' },
        { status: 500 }
      )
    }

    // Organize milestones by type
    const milestonesByType = milestones.reduce((acc, milestone) => {
      if (!acc[milestone.milestone_type]) {
        acc[milestone.milestone_type] = []
      }
      acc[milestone.milestone_type].push(milestone)
      return acc
    }, {})

    // Calculate totals
    const totalEligible = milestones.filter(m => m.is_eligible && !m.already_claimed).length
    const totalClaimed = milestones.filter(m => m.already_claimed).length
    const totalChzAvailable = milestones
      .filter(m => m.is_eligible && !m.already_claimed)
      .reduce((sum, m) => sum + parseFloat(m.chz_reward), 0)

    console.log('✅ Backend: Successfully fetched milestones:', {
      totalMilestones: milestones.length,
      totalEligible,
      totalClaimed,
      totalChzAvailable
    })

    return NextResponse.json({
      success: true,
      data: {
        milestones,
        milestonesByType,
        claims,
        stats: {
          totalEligible,
          totalClaimed,
          totalChzAvailable
        }
      }
    })

  } catch (error) {
    console.error('❌ Backend: Error in milestones API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, milestoneId, walletAddress } = body

    if (!userId || !milestoneId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('🎯 Backend: Creating milestone claim:', {
      userId,
      milestoneId,
      walletAddress
    })

    // Record the claim using database function
    const { data: claimResult, error: claimError } = await supabaseAdmin
      .rpc('record_reward_claim', {
        p_user_id: userId,
        p_milestone_id: milestoneId,
        p_wallet_address: walletAddress
      })

    if (claimError || !claimResult?.success) {
      console.error('❌ Error creating claim:', claimError || claimResult?.error)
      return NextResponse.json(
        { success: false, error: claimResult?.error || 'Failed to create claim' },
        { status: 400 }
      )
    }

    console.log('✅ Backend: Successfully created claim:', claimResult)

    return NextResponse.json({
      success: true,
      data: {
        claimId: claimResult.claim_id,
        chzAmount: claimResult.chz_amount,
        milestoneTitle: claimResult.milestone_title
      }
    })

  } catch (error) {
    console.error('❌ Backend: Error creating milestone claim:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}