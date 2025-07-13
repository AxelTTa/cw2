import { supabase } from '../supabase.js'

export class AuthService {
  
  static async getUserBySessionToken(sessionToken) {
    try {
      const { data, error } = await supabase
        .from('oauth_sessions')
        .select(`
          *,
          profiles:user_id (
            id,
            google_id,
            username,
            display_name,
            email,
            avatar_url,
            xp,
            level,
            fan_tokens,
            streak_count,
            bio,
            google_profile_data
          )
        `)
        .eq('session_token', sessionToken)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user by session token:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUserByGoogleId(googleId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('google_id', googleId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user by Google ID:', error)
      return { success: false, error: error.message }
    }
  }

  static async refreshGoogleToken(refreshToken) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const tokens = await response.json()
      return { success: true, tokens }
    } catch (error) {
      console.error('Error refreshing Google token:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateUserTokens(userId, tokens) {
    try {
      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

      const { data, error } = await supabase
        .from('profiles')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_id_token: tokens.id_token,
          token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      // Also update the session
      await supabase
        .from('oauth_sessions')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_id_token: tokens.id_token,
          token_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return { success: true, data }
    } catch (error) {
      console.error('Error updating user tokens:', error)
      return { success: false, error: error.message }
    }
  }

  static async validateSession(sessionToken) {
    try {
      const { data: session, error } = await supabase
        .from('oauth_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single()

      if (error) throw error

      const now = new Date()
      const expiresAt = new Date(session.token_expires_at)

      if (now > expiresAt) {
        // Token expired, try to refresh
        const refreshResult = await this.refreshGoogleToken(session.google_refresh_token)
        
        if (refreshResult.success) {
          // Update tokens
          await this.updateUserTokens(session.user_id, refreshResult.tokens)
          return { success: true, valid: true, refreshed: true }
        } else {
          return { success: true, valid: false, expired: true }
        }
      }

      // Update last used timestamp
      await supabase
        .from('oauth_sessions')
        .update({ last_used_at: now.toISOString() })
        .eq('session_token', sessionToken)

      return { success: true, valid: true }
    } catch (error) {
      console.error('Error validating session:', error)
      return { success: false, error: error.message }
    }
  }

  static async revokeSession(sessionToken) {
    try {
      const { error } = await supabase
        .from('oauth_sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error revoking session:', error)
      return { success: false, error: error.message }
    }
  }

  static async revokeAllUserSessions(userId) {
    try {
      const { error } = await supabase
        .from('oauth_sessions')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error revoking all user sessions:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUserSessions(userId) {
    try {
      const { data, error } = await supabase
        .from('oauth_sessions')
        .select('id, session_token, created_at, last_used_at, token_expires_at')
        .eq('user_id', userId)
        .order('last_used_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      return { success: false, error: error.message }
    }
  }

  // Local storage helpers
  static storeUserData(userData) {
    localStorage.setItem('user_profile', JSON.stringify(userData.user))
    localStorage.setItem('access_token', userData.tokens.access_token)
    localStorage.setItem('session_token', userData.session_token)
    localStorage.setItem('token_expires_at', userData.tokens.expires_in)
  }

  static getUserFromStorage() {
    try {
      const userProfile = localStorage.getItem('user_profile')
      const accessToken = localStorage.getItem('access_token')
      const sessionToken = localStorage.getItem('session_token')

      if (!userProfile || !accessToken || !sessionToken) {
        return null
      }

      return {
        user: JSON.parse(userProfile),
        access_token: accessToken,
        session_token: sessionToken
      }
    } catch (error) {
      console.error('Error getting user from storage:', error)
      return null
    }
  }

  static clearUserData() {
    localStorage.removeItem('user_profile')
    localStorage.removeItem('access_token')
    localStorage.removeItem('session_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('oauth_state')
  }

  // Server-side authentication helper
  static async authenticateRequest(request) {
    try {
      // Try to get session token from different sources
      const authHeader = request.headers.get('authorization')
      const sessionToken = authHeader?.replace('Bearer ', '') || 
                          request.headers.get('x-session-token') ||
                          request.cookies?.get('session_token')?.value

      if (!sessionToken) {
        return { success: false, error: 'No session token provided' }
      }

      // Validate session
      const sessionResult = await this.validateSession(sessionToken)
      if (!sessionResult.success || !sessionResult.valid) {
        return { success: false, error: 'Invalid or expired session' }
      }

      // Get user data
      const userResult = await this.getUserBySessionToken(sessionToken)
      if (!userResult.success) {
        return { success: false, error: 'Failed to get user data' }
      }

      return { 
        success: true, 
        user: userResult.data.profiles,
        session: userResult.data
      }
    } catch (error) {
      console.error('Error authenticating request:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }
}