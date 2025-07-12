import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../utils/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const userId = params.userId
    console.log(`🎯 Backend API Route /api/dashboard/${userId} called`)
    console.log('📅 Backend Current time:', new Date().toISOString())
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    console.log('🔍 Backend: Getting dashboard data for user:', userId)
    
    // Use the SQL function to get dashboard data
    const { data: dashboardData, error: dashboardError } = await supabaseAdmin
      .rpc('get_user_xp_dashboard', { p_user_id: userId })

    if (dashboardError) {
      console.error('❌ Backend Error calling get_user_xp_dashboard:', dashboardError)
      // Fallback to manual query if function doesn't exist
      return await getFallbackDashboardData(userId)
    }

    if (!dashboardData) {
      console.warn('⚠️ Backend: No dashboard data returned for user:', userId)
      return NextResponse.json({
        success: false,
        error: 'User not found or no data available'
      }, { status: 404 })
    }

    console.log('✅ Backend Successfully processed dashboard request:', {
      userId,
      userXp: dashboardData.xp,
      userLevel: dashboardData.level,
      globalRank: dashboardData.global_rank,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Backend Dashboard API Route Error:', {
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

// Fallback function for manual data gathering
async function getFallbackDashboardData(userId) {
  try {
    console.log('🔄 Backend: Using fallback dashboard data gathering for user:', userId)
    
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Backend Error fetching user profile:', profileError)
      return NextResponse.json({
        success: false,
        error: 'User profile not found'
      }, { status: 404 })
    }

    // Calculate global rank
    const { count: higherRankUsers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact' })
      .gt('xp', profile.xp || 0)

    const globalRank = (higherRankUsers || 0) + 1

    // Get recent activities
    const { data: recentActivities } = await supabaseAdmin
      .from('xp_logs')
      .select('action_type, xp_change, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate weekly and monthly XP
    const { data: weeklyXpData } = await supabaseAdmin
      .from('xp_logs')
      .select('xp_change')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .gt('xp_change', 0)

    const { data: monthlyXpData } = await supabaseAdmin
      .from('xp_logs')
      .select('xp_change')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .gt('xp_change', 0)

    const weeklyXp = weeklyXpData?.reduce((sum, log) => sum + log.xp_change, 0) || 0
    const monthlyXp = monthlyXpData?.reduce((sum, log) => sum + log.xp_change, 0) || 0

    // Calculate total XP earned
    const { data: totalXpData } = await supabaseAdmin
      .from('xp_logs')
      .select('xp_change')
      .eq('user_id', userId)
      .gt('xp_change', 0)

    const totalXpEarned = totalXpData?.reduce((sum, log) => sum + log.xp_change, 0) || 0

    // Calculate level progress
    const currentXp = profile.xp || 0
    const currentLevel = profile.level || 1
    const currentLevelMinXp = (currentLevel - 1) * 1000
    const nextLevelMinXp = currentLevel * 1000
    const xpNeededForNextLevel = nextLevelMinXp - currentXp
    const levelProgressPercent = Math.round(((currentXp - currentLevelMinXp) / 1000) * 100)

    const dashboardData = {
      user_id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      xp: currentXp,
      level: currentLevel,
      global_rank: globalRank,
      total_likes_received: profile.total_likes_received || 0,
      total_comments: profile.total_comments || 0,
      xp_needed_for_next_level: Math.max(0, xpNeededForNextLevel),
      level_progress_percent: Math.max(0, Math.min(100, levelProgressPercent)),
      weekly_xp: weeklyXp,
      monthly_xp: monthlyXp,
      total_xp_earned: totalXpEarned,
      member_since: profile.created_at,
      recent_activities: recentActivities || []
    }

    console.log('✅ Backend Fallback dashboard data compiled:', {
      userId,
      xp: dashboardData.xp,
      level: dashboardData.level,
      globalRank: dashboardData.global_rank
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
      fallback: true,
      timestamp: new Date().toISOString()
    })

  } catch (fallbackError) {
    console.error('❌ Backend Fallback dashboard error:', fallbackError)
    return NextResponse.json({
      success: false,
      error: 'Failed to load dashboard data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}