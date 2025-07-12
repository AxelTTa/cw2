import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'
import { ethers } from 'ethers'

// Daily CHZ reward amounts
const DAILY_REWARDS = {
  1: 10, // 1st place
  2: 10, // 2nd place
  3: 10  // 3rd place
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

    // First, calculate scores from real comment data
    const { data: commentData, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('user_id, upvotes')
      .gte('created_at', `${date}T00:00:00Z`)
      .lt('created_at', `${date}T23:59:59Z`)
      .not('user_id', 'is', null)

    if (commentError) {
      throw commentError
    }

    if (!commentData || commentData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No comments found for this date',
        date,
        scores: []
      })
    }

    // Calculate user scores
    const userScores = {}
    commentData.forEach(comment => {
      if (!userScores[comment.user_id]) {
        userScores[comment.user_id] = {
          user_id: comment.user_id,
          comments_count: 0,
          total_upvotes: 0,
          final_score: 0
        }
      }
      userScores[comment.user_id].comments_count += 1
      userScores[comment.user_id].total_upvotes += comment.upvotes || 0
    })

    // Calculate final scores and rank
    const scores = Object.values(userScores).map(user => ({
      ...user,
      final_score: (user.comments_count * 10) + (user.total_upvotes * 5)
    })).sort((a, b) => b.final_score - a.final_score)
    .map((user, index) => ({ ...user, rank: index + 1 }))

    if (scores.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid scores calculated for this date',
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
          comments_count: score.comments_count,
          total_upvotes: score.total_upvotes,
          final_score: score.final_score,
          rank: score.rank,
          created_at: new Date().toISOString(),
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
        score: w.final_score,
        comments: w.comments_count,
        upvotes: w.total_upvotes,
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

// PUT endpoint for milestone rewards
export async function PUT(request) {
  try {
    const { recipientAddress, amount, description } = await request.json()
    
    console.log('🎁 Processing milestone reward:', {
      recipient: recipientAddress ? `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}` : 'Not provided',
      amount: amount,
      description: description
    })
    
    // Validate required parameters
    if (!recipientAddress) {
      console.error('❌ Milestone reward failed: Missing recipient address')
      return NextResponse.json({ 
        success: false, 
        error: 'Recipient address is required' 
      }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      console.error('❌ Milestone reward failed: Invalid amount')
      return NextResponse.json({ 
        success: false, 
        error: 'Valid amount is required' 
      }, { status: 400 })
    }

    // Validate wallet address format (Ethereum address)
    if (!ethers.isAddress(recipientAddress)) {
      console.error('❌ Milestone reward failed: Invalid wallet address format:', recipientAddress)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      }, { status: 400 })
    }

    console.log(`🔗 Setting up CHZ blockchain connection...`)
    
    // Send CHZ reward
    const provider = new ethers.JsonRpcProvider(process.env.CHZ_RPC_URL || 'https://rpc.chiliz.com')
    const adminWallet = new ethers.Wallet(process.env.ADMIN_WALLET_PRIVATE_KEY, provider)
    
    console.log(`💰 Admin wallet address: ${adminWallet.address}`)
    console.log(`🎯 Recipient address: ${recipientAddress}`)
    console.log(`💵 Reward amount: ${amount} CHZ`)
    
    // Check admin wallet balance
    const balance = await provider.getBalance(adminWallet.address)
    const balanceInChz = ethers.formatEther(balance)
    console.log(`💳 Admin wallet balance: ${balanceInChz} CHZ`)
    
    // Convert amount to Wei
    const amountInWei = ethers.parseEther(amount.toString())
    console.log(`⚖️ Amount in Wei: ${amountInWei.toString()}`)
    
    // Check if admin has enough balance
    if (balance < amountInWei) {
      console.error('❌ Insufficient balance in admin wallet:', {
        required: `${amount} CHZ`,
        available: `${balanceInChz} CHZ`
      })
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient balance. Required: ${amount} CHZ, Available: ${balanceInChz} CHZ` 
      }, { status: 400 })
    }

    console.log(`📡 Sending reward transaction on Chiliz Chain...`)
    
    // Send CHZ to the recipient's wallet
    const tx = await adminWallet.sendTransaction({
      to: recipientAddress,
      value: amountInWei
    })
    
    console.log(`✅ Reward transaction sent successfully!`, {
      transaction_hash: tx.hash,
      from: adminWallet.address,
      to: recipientAddress,
      amount: `${amount} CHZ`,
      description: description
    })

    // Wait for transaction confirmation
    console.log(`⏳ Waiting for transaction confirmation...`)
    try {
      const receipt = await tx.wait(1) // Wait for 1 confirmation
      console.log(`🎉 Reward transaction confirmed!`, {
        block_number: receipt.blockNumber,
        gas_used: receipt.gasUsed?.toString(),
        status: receipt.status === 1 ? 'Success' : 'Failed'
      })
    } catch (confirmError) {
      console.warn('⚠️ Transaction sent but confirmation failed:', confirmError.message)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Milestone reward sent successfully',
      transactionHash: tx.hash,
      amount: amount,
      recipient: recipientAddress,
      description: description,
      blockExplorerUrl: `https://chiliscan.com/tx/${tx.hash}`
    })
    
  } catch (error) {
    console.error('❌ Milestone reward error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      reason: error.reason
    })
    
    return NextResponse.json({ 
      success: false, 
      error: `Milestone reward failed: ${error.message}` 
    }, { status: 500 })
  }
}