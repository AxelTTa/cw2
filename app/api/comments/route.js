import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entity_type') || 'match'
    const entityId = searchParams.get('entity_id') || searchParams.get('match_id') // backwards compatibility
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    const sortBy = searchParams.get('sort_by') || 'newest'

    if (!entityId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Entity ID is required' 
      }, { status: 400 })
    }

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
          xp,
          fan_tokens
        )
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId.toString())
      .is('parent_id', null) // Only get top-level comments
      .range(offset, offset + limit - 1)

    // Apply sorting
    if (sortBy === 'popular') {
      query = query.order('upvotes', { ascending: false })
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    }

    const { data: comments, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch comments' 
      }, { status: 500 })
    }

    // Get replies for each comment and user votes
    const userId = searchParams.get('user_id') // Optional user ID for vote tracking
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        // Get replies recursively
        const { data: replies } = await supabaseAdmin
          .from('comments')
          .select(`
            *,
            profiles:user_id (
              id,
              username,
              display_name,
              avatar_url,
              level,
              xp,
              fan_tokens
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        // Get replies with their nested replies (up to a reasonable depth)
        const repliesWithNested = await Promise.all(
          (replies || []).map(async (reply) => {
            const { data: nestedReplies } = await supabaseAdmin
              .from('comments')
              .select(`
                *,
                profiles:user_id (
                  id,
                  username,
                  display_name,
                  avatar_url,
                  level,
                  xp,
                  fan_tokens
                )
              `)
              .eq('parent_id', reply.id)
              .order('created_at', { ascending: true })

            return {
              ...reply,
              replies: nestedReplies || []
            }
          })
        )

        // Get reactions for this comment
        const { data: reactions } = await supabaseAdmin
          .from('reactions')
          .select('*')
          .eq('comment_id', comment.id)

        return {
          ...comment,
          replies: repliesWithNested || [],
          reactions: reactions || []
        }
      })
    )

    // Get user votes if user ID is provided
    let userVotes = {}
    if (userId) {
      const allCommentIds = []
      const collectCommentIds = (comments) => {
        comments.forEach(comment => {
          allCommentIds.push(comment.id)
          if (comment.replies) {
            collectCommentIds(comment.replies)
          }
        })
      }
      collectCommentIds(commentsWithReplies)

      if (allCommentIds.length > 0) {
        const { data: votes } = await supabaseAdmin
          .from('reactions')
          .select('comment_id, reaction_type')
          .eq('user_id', userId)
          .in('comment_id', allCommentIds)
          .in('reaction_type', ['like', 'dislike'])

        if (votes) {
          votes.forEach(vote => {
            userVotes[vote.comment_id] = vote.reaction_type === 'like' ? 'upvote' : 'downvote'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
      user_votes: userVotes,
      entity_type: entityType,
      entity_id: entityId
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
    
    console.log('📝 [COMMENTS API] Received comment submission:', {
      bodyKeys: Object.keys(body),
      hasUserId: !!body.user_id,
      userIdValue: body.user_id,
      hasContent: !!body.content,
      entityType: body.entity_type,
      entityId: body.entity_id
    })
    
    const { 
      content, 
      entity_type = 'match',
      entity_id,
      match_id, // backwards compatibility
      user_id, 
      is_meme = false, 
      meme_url = null, 
      meme_caption = null,
      image_url = null,
      comment_type = 'text',
      parent_id = null
    } = body

    // Use entity_id or fallback to match_id for backwards compatibility
    const finalEntityId = entity_id || match_id

    if (!content && !is_meme && !image_url) {
      console.log('❌ [COMMENTS API] Missing content')
      return NextResponse.json({ 
        success: false, 
        error: 'Content, meme, or image is required' 
      }, { status: 400 })
    }

    if (!user_id) {
      console.log('❌ [COMMENTS API] Missing user_id - Request details:', {
        body: body,
        user_id: user_id,
        typeof_user_id: typeof user_id
      })
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    if (!finalEntityId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Entity ID is required' 
      }, { status: 400 })
    }

    // Validate entity_type
    if (!['match', 'player', 'team', 'competition'].includes(entity_type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid entity type' 
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

    console.log('Creating comment with data:', {
      content,
      entity_type,
      entity_id: finalEntityId,
      user_id,
      parent_id,
      is_meme,
      meme_url,
      meme_caption,
      image_url,
      comment_type
    })

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert([{
        content,
        entity_type,
        entity_id: finalEntityId.toString(),
        user_id,
        parent_id,
        is_meme,
        meme_url,
        meme_caption,
        image_url,
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
          xp,
          fan_tokens
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

    // Award XP to user (this will be handled by database triggers for consistency)
    const xpReward = is_meme || image_url ? 15 : 10
    
    console.log(`⚡ Backend: Comment created successfully, XP award will be handled by database trigger`, {
      commentId: comment.id,
      userId: user_id,
      expectedXpReward: xpReward,
      commentType: comment_type,
      isMeme: is_meme,
      hasImage: !!image_url,
      entityType: entity_type,
      entityId: finalEntityId
    })

    return NextResponse.json({
      success: true,
      comment,
      xp_awarded: xpReward
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
    const { comment_id, action, user_id, reaction_type } = body

    if (!comment_id || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Comment ID and action are required' 
      }, { status: 400 })
    }

    if (action === 'reaction' && (!user_id || !reaction_type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and reaction type are required for reactions' 
      }, { status: 400 })
    }

    let result = {}
    
    if (action === 'upvote' || action === 'downvote') {
      if (!user_id) {
        return NextResponse.json({ 
          success: false, 
          error: 'User ID is required for voting' 
        }, { status: 400 })
      }

      // Use a database transaction to prevent race conditions
      const { data: voteResult, error: voteError } = await supabaseAdmin.rpc('handle_comment_vote', {
        p_user_id: user_id,
        p_comment_id: comment_id,
        p_vote_type: action === 'upvote' ? 'like' : 'dislike'
      })

      if (voteError) {
        console.error('Vote error:', voteError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to process vote' 
        }, { status: 500 })
      }

      console.log('Vote result:', voteResult)

      // Get updated comment with profile data
      const { data: comment, error } = await supabaseAdmin
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url,
            level,
            xp,
            fan_tokens
          )
        `)
        .eq('id', comment_id)
        .single()

      if (error) throw error
      result = { 
        comment,
        action: voteResult?.action || 'processed',
        vote_type: action,
        message: voteResult?.message || 'Vote processed'
      }

    } else if (action === 'reaction') {
      // Add or toggle reaction
      const { data: existingReaction } = await supabaseAdmin
        .from('reactions')
        .select('id')
        .eq('user_id', user_id)
        .eq('comment_id', comment_id)
        .eq('reaction_type', reaction_type)
        .single()

      let reactionAction = 'added'
      
      if (existingReaction) {
        // Remove reaction if it exists
        const { error: deleteError } = await supabaseAdmin
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id)
          
        if (deleteError) {
          console.error('Error removing reaction:', deleteError)
          throw deleteError
        }
        
        reactionAction = 'removed'
        console.log(`🔥 Backend: Removed ${reaction_type} reaction from comment ${comment_id} by user ${user_id}`)
      } else {
        // Add new reaction
        const { error: insertError } = await supabaseAdmin
          .from('reactions')
          .insert({
            user_id,
            comment_id,
            reaction_type
          })
          
        if (insertError) {
          console.error('Error adding reaction:', insertError)
          throw insertError
        }
        
        console.log(`👍 Backend: Added ${reaction_type} reaction to comment ${comment_id} by user ${user_id}`)
      }

      // Award/remove XP for likes (handled by database triggers)
      if (reaction_type === 'like') {
        const { data: commentAuthor } = await supabaseAdmin
          .from('comments')
          .select('user_id')
          .eq('id', comment_id)
          .single()
          
        if (commentAuthor && commentAuthor.user_id !== user_id) {
          const xpChange = reactionAction === 'added' ? 2 : -2
          console.log(`⚡ Backend: ${reactionAction === 'added' ? 'Awarding' : 'Removing'} ${Math.abs(xpChange)} XP to comment author for like ${reactionAction}`)
        }
      }

      result = { 
        message: `Reaction ${reactionAction}`,
        action: reactionAction,
        reaction_type
      }
    }

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}