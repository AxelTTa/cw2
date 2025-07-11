import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('match_id')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    let query = supabaseAdmin
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          level,
          xp
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (matchId) {
      // Convert to integer for proper match_id comparison
      const matchIdInt = parseInt(matchId)
      if (isNaN(matchIdInt)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid match_id format' 
        }, { status: 400 })
      }
      query = query.eq('match_id', matchIdInt)
    }

    const { data: comments, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch comments' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comments: comments || []
    })
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      content, 
      match_id, 
      user_id, 
      is_meme = false, 
      meme_url = null, 
      meme_caption = null,
      comment_type = 'text',
      parent_id = null
    } = body

    if (!content && !is_meme) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content is required' 
      }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    // Validate user_id is a proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      console.error('Invalid user_id format:', user_id)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID format. Expected UUID.' 
      }, { status: 400 })
    }

    // Convert match_id to integer for proper database storage
    const matchIdInt = match_id ? parseInt(match_id) : null
    
    if (match_id && isNaN(matchIdInt)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid match_id format' 
      }, { status: 400 })
    }

    console.log('Creating comment with data:', {
      content,
      match_id: matchIdInt,
      user_id,
      parent_id,
      is_meme,
      comment_type
    })

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert([{
        content,
        match_id: matchIdInt,
        user_id,
        parent_id,
        is_meme,
        meme_url,
        meme_caption,
        comment_type,
        upvotes: 0,
        downvotes: 0,
        is_pinned: false
      }])
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          level,
          xp
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create comment' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comment
    })
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    const { comment_id, action, user_id } = body

    if (!comment_id || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Comment ID and action are required' 
      }, { status: 400 })
    }

    // Validate comment_id is a proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(comment_id)) {
      console.error('Invalid comment_id format:', comment_id)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid comment ID format. Expected UUID.' 
      }, { status: 400 })
    }

    let updateData = {}
    
    if (action === 'upvote') {
      // Get current upvotes and increment
      const { data: currentComment } = await supabaseAdmin
        .from('comments')
        .select('upvotes')
        .eq('id', comment_id)
        .single()
      
      updateData.upvotes = (currentComment?.upvotes || 0) + 1
    } else if (action === 'downvote') {
      // Get current downvotes and increment
      const { data: currentComment } = await supabaseAdmin
        .from('comments')
        .select('downvotes')
        .eq('id', comment_id)
        .single()
      
      updateData.downvotes = (currentComment?.downvotes || 0) + 1
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .update(updateData)
      .eq('id', comment_id)
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url,
          level,
          xp
        )
      `)
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update comment' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comment
    })
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}