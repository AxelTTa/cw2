import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    
    console.log(`🎯 Backend API Route /api/leaderboard called with limit: ${limit}, offset: ${offset}`)
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    console.log('🔍 Backend: Getting leaderboard data')
    
    // Try to use the SQL function first
    const { data: leaderboardData, error: leaderboardError } = await supabaseAdmin
      .rpc('get_xp_leaderboard', { 
        p_limit: limit, 
        p_offset: offset 
      })

    if (leaderboardError) {
      console.error('❌ Backend Error calling get_xp_leaderboard:', leaderboardError)
      // Fallback to manual query
      return await getFallbackLeaderboard(limit, offset)
    }

    console.log('✅ Backend Successfully processed leaderboard request:', {
      resultsCount: leaderboardData?.length || 0,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      leaderboard: leaderboardData || [],
      count: leaderboardData?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Backend Leaderboard API Route Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name
    })
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Fallback function for manual leaderboard gathering
async function getFallbackLeaderboard(limit, offset) {
  try {
    console.log('🔄 Backend: Using fallback leaderboard data gathering')
    
    // Get top users by XP
    const { data: topUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        xp,
        level,
        total_likes_received,
        total_comments,
        created_at
      `)
      .gt('xp', 0)
      .order('xp', { ascending: false })
      .order('level', { ascending: false })
      .order('total_likes_received', { ascending: false })
      .range(offset, offset + limit - 1)

    if (usersError) {
      console.error('❌ Backend Error fetching top users:', usersError)
      throw usersError
    }

    // Add rank to each user
    const leaderboard = (topUsers || []).map((user, index) => ({
      rank: offset + index + 1,
      user_id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      xp: user.xp,
      level: user.level,
      total_likes_received: user.total_likes_received || 0,
      total_comments: user.total_comments || 0,
      created_at: user.created_at
    }))

    console.log('✅ Backend Fallback leaderboard data compiled:', {
      resultsCount: leaderboard.length
    })

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard,
      count: leaderboard.length,
      fallback: true,
      timestamp: new Date().toISOString()
    })

  } catch (fallbackError) {
    console.error('❌ Backend Fallback leaderboard error:', fallbackError)
    return NextResponse.json({
      success: false,
      error: 'Failed to load leaderboard data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}