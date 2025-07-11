import { supabase } from '../supabase.js'

export class MatchService {
  
  static async getAllMatches() {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching matches:', error)
      return { success: false, error: error.message }
    }
  }

  static async getMatchById(matchId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching match:', error)
      return { success: false, error: error.message }
    }
  }

  static async getLiveMatches() {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'live')
        .order('match_date', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching live matches:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUpcomingMatches() {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'scheduled')
        .gte('match_date', new Date().toISOString())
        .order('match_date', { ascending: true })
        .limit(10)
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching upcoming matches:', error)
      return { success: false, error: error.message }
    }
  }

  static async createMatch(matchData) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating match:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateMatchScore(matchId, homeScore, awayScore) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({ 
          home_score: homeScore, 
          away_score: awayScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating match score:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateMatchStatus(matchId, status) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating match status:', error)
      return { success: false, error: error.message }
    }
  }
}