import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    const type = searchParams.get('type') || 'overall' // 'overall' or 'daily'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    console.log(`🎯 Backend API Route /api/leaderboard called with limit: ${limit}, offset: ${offset}, type: ${type}`)
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    if (type === 'daily') {
      return await getDailyLeaderboard(date, limit, offset)
    }
    
    console.log('🔍 Backend: Getting overall leaderboard data')
    
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
      type: 'overall',
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

// Get daily leaderboard from daily_commentator_scores
async function getDailyLeaderboard(date, limit, offset) {
  try {
    console.log(`🔄 Backend: Getting daily leaderboard for ${date}`)
    
    const { data: dailyScores, error } = await supabaseAdmin
      .from('daily_commentator_scores')
      .select(`
        rank,
        user_id,
        final_score,
        comments_count,
        total_upvotes,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          level
        )
      `)
      .eq('date', date)
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Backend Error fetching daily leaderboard:', error)
      throw error
    }

    const leaderboard = (dailyScores || []).map(score => ({
      rank: score.rank,
      user_id: score.user_id,
      username: score.profiles?.username,
      display_name: score.profiles?.display_name,
      avatar_url: score.profiles?.avatar_url,
      level: score.profiles?.level,
      daily_score: score.final_score,
      comments_count: score.comments_count,
      upvotes_received: score.total_upvotes
    }))

    console.log('✅ Backend Daily leaderboard data compiled:', {
      resultsCount: leaderboard.length,
      date
    })

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard,
      count: leaderboard.length,
      type: 'daily',
      date: date,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Backend Daily leaderboard error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load daily leaderboard',
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