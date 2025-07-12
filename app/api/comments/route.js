import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'

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
      // Convert to string to handle both integers and UUIDs
      query = query.eq('match_id', matchId.toString())
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

    // Ensure user profile exists before creating comment
    try {
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', user_id)
        .single()

      if (profileCheckError || !existingProfile) {
        // Create profile if it doesn't exist using the SQL function
        const { error: profileCreateError } = await supabaseAdmin
          .rpc('create_profile_if_not_exists', {
            p_user_id: user_id,
            p_email: `${user_id}@tempuser.com`
          })

        if (profileCreateError) {
          console.error('Error creating profile:', profileCreateError)
        }
      }
    } catch (profileError) {
      console.error('Profile check/creation error:', profileError)
    }

    // Convert match_id to string to handle both integers and UUIDs
    const matchIdString = match_id ? match_id.toString() : null

    console.log('Creating comment with data:', {
      content,
      match_id,
      user_id,
      parent_id,
      is_meme,
      comment_type
    })

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert([{
        content,
        match_id: matchIdString,
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