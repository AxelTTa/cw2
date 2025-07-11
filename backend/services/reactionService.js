import { supabase } from '../supabase.js'

export class ReactionService {
  
  static async addReaction(userId, commentId, reactionType) {
    try {
      // Check if reaction already exists
      const { data: existingReaction, error: checkError } = await supabase
        .from('reactions')
        .select('id')
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .eq('reaction_type', reactionType)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingReaction) {
        // Remove existing reaction
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id)

        if (deleteError) throw deleteError
        return { success: true, action: 'removed' }
      } else {
        // Add new reaction
        const { data, error } = await supabase
          .from('reactions')
          .insert([{
            user_id: userId,
            comment_id: commentId,
            reaction_type: reactionType,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error
        return { success: true, action: 'added', data }
      }
    } catch (error) {
      console.error('Error managing reaction:', error)
      return { success: false, error: error.message }
    }
  }

  static async getReactionsByCommentId(commentId) {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('comment_id', commentId)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching reactions:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUserReactions(userId, commentId) {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('user_id', userId)
        .eq('comment_id', commentId)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user reactions:', error)
      return { success: false, error: error.message }
    }
  }

  static async removeReaction(userId, commentId, reactionType) {
    try {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .eq('reaction_type', reactionType)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error removing reaction:', error)
      return { success: false, error: error.message }
    }
  }

  static async getReactionCounts(commentId) {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('comment_id', commentId)

      if (error) throw error

      // Count reactions by type
      const reactionCounts = data.reduce((acc, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
        return acc
      }, {})

      return { success: true, data: reactionCounts }
    } catch (error) {
      console.error('Error getting reaction counts:', error)
      return { success: false, error: error.message }
    }
  }
}