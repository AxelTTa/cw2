import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Claim CHZ rewards
export async function POST(request) {
  try {
    const { user_id, milestone_id, wallet_address, signature } = await request.json()

    if (!user_id || !milestone_id || !wallet_address) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID, milestone ID, and wallet address are required' 
      }, { status: 400 })
    }

    // Validate user_id is a proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID format' 
      }, { status: 400 })
    }

    // Validate milestone_id is a proper UUID format
    if (!uuidRegex.test(milestone_id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid milestone ID format' 
      }, { status: 400 })
    }

    // Validate wallet address format
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(wallet_address)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      }, { status: 400 })
    }

    // Verify that the wallet belongs to the user
    const { data: walletConnection, error: walletError } = await supabaseAdmin
      .from('wallet_connections')
      .select('id')
      .eq('user_id', user_id)
      .eq('wallet_address', wallet_address.toLowerCase())
      .single()

    if (walletError || !walletConnection) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet address not connected to this user account' 
      }, { status: 400 })
    }

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabaseAdmin
      .from('reward_milestones')
      .select('*')
      .eq('id', milestone_id)
      .eq('is_active', true)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or inactive milestone' 
      }, { status: 400 })
    }

    // Check if user is eligible for this reward
    const { data: eligibleRewards, error: eligibilityError } = await supabaseAdmin
      .rpc('get_eligible_rewards', { p_user_id: user_id })

    if (eligibilityError) {
      console.error('Error checking eligibility:', eligibilityError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to verify eligibility' 
      }, { status: 500 })
    }

    const eligibleReward = eligibleRewards.find(reward => 
      reward.milestone_id === milestone_id
    )

    if (!eligibleReward) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not eligible for this reward' 
      }, { status: 400 })
    }

    if (eligibleReward.already_claimed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Reward already claimed' 
      }, { status: 400 })
    }

    // Generate claim signature for smart contract interaction
    const claimData = {
      user_id,
      milestone_id,
      wallet_address: wallet_address.toLowerCase(),
      chz_amount: milestone.chz_reward,
      timestamp: Date.now()
    }

    const claimSignature = generateClaimSignature(claimData)

    // Record the claim using the database function
    const { data: claimResult, error: claimError } = await supabaseAdmin
      .rpc('record_reward_claim', {
        p_user_id: user_id,
        p_milestone_id: milestone_id,
        p_wallet_address: wallet_address.toLowerCase(),
        p_claim_signature: claimSignature
      })

    if (claimError) {
      console.error('Error recording claim:', claimError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to record claim' 
      }, { status: 500 })
    }

    // Parse the JSON result from the database function
    const claim = typeof claimResult === 'string' ? JSON.parse(claimResult) : claimResult

    if (!claim.success) {
      return NextResponse.json({ 
        success: false, 
        error: claim.error 
      }, { status: 400 })
    }

    // In a real implementation, you would interact with the smart contract here
    // For now, we'll simulate the transaction
    const mockTransactionHash = generateMockTransactionHash()

    // Update the claim with the transaction hash
    const { error: updateError } = await supabaseAdmin
      .from('reward_claims')
      .update({
        transaction_hash: mockTransactionHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', claim.claim_id)

    if (updateError) {
      console.error('Error updating claim with transaction hash:', updateError)
      // Don't fail the request, just log the error
    }

    // Get updated user profile
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('total_chz_earned, wallet_address')
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching updated profile:', profileError)
    }

    return NextResponse.json({
      success: true,
      data: {
        claim_id: claim.claim_id,
        milestone: {
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          icon: milestone.icon,
          milestone_type: milestone.milestone_type,
          threshold_value: milestone.threshold_value
        },
        chz_amount: parseFloat(claim.chz_amount),
        wallet_address: wallet_address.toLowerCase(),
        transaction_hash: mockTransactionHash,
        claim_signature: claimSignature,
        total_chz_earned: updatedProfile ? parseFloat(updatedProfile.total_chz_earned || 0) : 0,
        claimed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Reward claim API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Get claim signature for smart contract interaction
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const milestoneId = searchParams.get('milestone_id')
    const walletAddress = searchParams.get('wallet_address')

    if (!userId || !milestoneId || !walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID, milestone ID, and wallet address are required' 
      }, { status: 400 })
    }

    // Validate inputs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId) || !uuidRegex.test(milestoneId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid ID format' 
      }, { status: 400 })
    }

    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(walletAddress)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      }, { status: 400 })
    }

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabaseAdmin
      .from('reward_milestones')
      .select('chz_reward')
      .eq('id', milestoneId)
      .eq('is_active', true)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid milestone' 
      }, { status: 400 })
    }

    // Generate claim signature
    const claimData = {
      user_id: userId,
      milestone_id: milestoneId,
      wallet_address: walletAddress.toLowerCase(),
      chz_amount: milestone.chz_reward,
      timestamp: Date.now()
    }

    const claimSignature = generateClaimSignature(claimData)

    return NextResponse.json({
      success: true,
      data: {
        claim_signature: claimSignature,
        claim_data: claimData
      }
    })

  } catch (error) {
    console.error('Claim signature API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Helper function to generate claim signature
function generateClaimSignature(claimData) {
  const message = `${claimData.user_id}:${claimData.milestone_id}:${claimData.wallet_address}:${claimData.chz_amount}:${claimData.timestamp}`
  const secret = process.env.CLAIM_SIGNATURE_SECRET || 'default-secret-key'
  
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex')
}

// Helper function to generate mock transaction hash
function generateMockTransactionHash() {
  return '0x' + crypto.randomBytes(32).toString('hex')
}

// Verify claim signature
export async function PUT(request) {
  try {
    const { claim_id, transaction_hash } = await request.json()

    if (!claim_id || !transaction_hash) {
      return NextResponse.json({ 
        success: false, 
        error: 'Claim ID and transaction hash are required' 
      }, { status: 400 })
    }

    // Validate transaction hash format
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/
    if (!txHashRegex.test(transaction_hash)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid transaction hash format' 
      }, { status: 400 })
    }

    // Update claim with transaction hash
    const { data: claim, error: updateError } = await supabaseAdmin
      .from('reward_claims')
      .update({
        transaction_hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', claim_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating claim with transaction hash:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update claim' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        claim_id: claim.id,
        transaction_hash: claim.transaction_hash,
        updated_at: claim.updated_at
      }
    })

  } catch (error) {
    console.error('Claim verification API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}