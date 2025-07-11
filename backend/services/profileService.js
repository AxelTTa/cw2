import { supabase } from '../supabase.js'

export class ProfileService {
  
  static async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return { success: false, error: error.message }
    }
  }

  static async createProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating profile:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }

  static async addXP(userId, xpAmount) {
    try {
      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      const newXP = profile.xp + xpAmount
      const newLevel = Math.floor(newXP / 1000) + 1 // Level up every 1000 XP

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { 
        success: true, 
        data,
        levelUp: newLevel > profile.level
      }
    } catch (error) {
      console.error('Error adding XP:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateStreak(userId, streakCount) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          streak_count: streakCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating streak:', error)
      return { success: false, error: error.message }
    }
  }

  static async addFanTokens(userId, tokenAmount) {
    try {
      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('fan_tokens')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          fan_tokens: profile.fan_tokens + tokenAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error adding fan tokens:', error)
      return { success: false, error: error.message }
    }
  }

  static async getTopProfiles(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, xp, level, streak_count')
        .order('xp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching top profiles:', error)
      return { success: false, error: error.message }
    }
  }

  static async searchProfiles(searchTerm, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, xp, level')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(limit)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error searching profiles:', error)
      return { success: false, error: error.message }
    }
  }
}