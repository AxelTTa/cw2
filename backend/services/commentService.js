import { supabase } from '../supabase.js'

export class CommentService {
  
  static async getCommentsByMatchId(matchId, sortBy = 'newest') {
    try {
      const orderBy = sortBy === 'popular' ? 'upvotes' : 'created_at'
      const ascending = sortBy === 'oldest'

      const { data, error } = await supabase
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
          ),
          reactions (
            id,
            user_id,
            reaction_type
          )
        `)
        .eq('match_id', matchId)
        .is('parent_id', null)
        .order(orderBy, { ascending })

      if (error) throw error

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const replies = await this.getRepliesByCommentId(comment.id)
          return { ...comment, replies: replies.data || [] }
        })
      )

      return { success: true, data: commentsWithReplies }
    } catch (error) {
      console.error('Error fetching comments:', error)
      return { success: false, error: error.message }
    }
  }

  static async getRepliesByCommentId(commentId) {
    try {
      const { data, error } = await supabase
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
          ),
          reactions (
            id,
            user_id,
            reaction_type
          )
        `)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching replies:', error)
      return { success: false, error: error.message }
    }
  }

  static async createComment(commentData) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          ...commentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating comment:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateComment(commentId, updates) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
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

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating comment:', error)
      return { success: false, error: error.message }
    }
  }

  static async deleteComment(commentId, userId) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: error.message }
    }
  }

  static async upvoteComment(commentId) {
    try {
      // First get current upvotes
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('upvotes')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError

      // Update upvotes
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          upvotes: comment.upvotes + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error upvoting comment:', error)
      return { success: false, error: error.message }
    }
  }

  static async downvoteComment(commentId) {
    try {
      // First get current downvotes
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('downvotes')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError

      // Update downvotes
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          downvotes: comment.downvotes + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error downvoting comment:', error)
      return { success: false, error: error.message }
    }
  }
}