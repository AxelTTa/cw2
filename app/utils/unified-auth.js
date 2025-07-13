'use client'

/**
 * Unified Authentication Service
 * Consolidates all authentication logic into one place
 */

import { getAuthHeaders, clearAuthData } from './auth-helpers'

class UnifiedAuth {
  constructor() {
    this.user = null
    this.isAuthenticated = false
    this.sessionToken = null
    this.accessToken = null
  }

  /**
   * Initialize authentication state
   */
  async init() {
    try {
      console.log('🔐 [UNIFIED-AUTH] Initializing...')
      
      // Check for existing session data
      const userData = localStorage.getItem('user_profile')
      const sessionToken = localStorage.getItem('session_token')
      const accessToken = localStorage.getItem('access_token')
      
      if (userData && sessionToken) {
        const user = JSON.parse(userData)
        
        // Validate session
        const isValid = await this.validateSession(sessionToken, user.id)
        
        if (isValid) {
          this.user = user
          this.sessionToken = sessionToken
          this.accessToken = accessToken
          this.isAuthenticated = true
          
          console.log('✅ [UNIFIED-AUTH] Restored authenticated session')
          return { success: true, user }
        }
      }
      
      console.log('❌ [UNIFIED-AUTH] No valid session found')
      this.clearAuth()
      return { success: false, error: 'No valid session' }
      
    } catch (error) {
      console.error('❌ [UNIFIED-AUTH] Initialization error:', error)
      this.clearAuth()
      return { success: false, error: error.message }
    }
  }

  /**
   * Validate session token with backend
   */
  async validateSession(sessionToken, userId) {
    try {
      const response = await fetch('/api/dashboard/' + userId, {
        method: 'HEAD',
        headers: {
          'X-Session-Token': sessionToken,
          'Authorization': `Bearer ${sessionToken}`
        }
      })
      
      return response.ok
    } catch (error) {
      console.error('❌ [UNIFIED-AUTH] Session validation failed:', error)
      return false
    }
  }

  /**
   * Authenticate with Google OAuth
   */
  async authenticateWithGoogle(authCode) {
    try {
      console.log('🔐 [UNIFIED-AUTH] Exchanging Google auth code...')
      
      const response = await fetch('/api/exchange-google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Authentication failed')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Authentication failed')
      }
      
      // Store authentication data
      this.user = data.user
      this.sessionToken = data.session_token
      this.accessToken = data.tokens.access_token
      this.isAuthenticated = true
      
      localStorage.setItem('user_profile', JSON.stringify(data.user))
      localStorage.setItem('session_token', data.session_token)
      localStorage.setItem('access_token', data.tokens.access_token)
      
      console.log('✅ [UNIFIED-AUTH] Authentication successful')
      return { success: true, user: data.user }
      
    } catch (error) {
      console.error('❌ [UNIFIED-AUTH] Google authentication failed:', error)
      this.clearAuth()
      return { success: false, error: error.message }
    }
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders() {
    if (!this.isAuthenticated || !this.sessionToken) {
      return getAuthHeaders()
    }
    
    return {
      'Authorization': `Bearer ${this.sessionToken}`,
      'X-Session-Token': this.sessionToken,
      'X-Access-Token': this.accessToken || '',
      'Content-Type': 'application/json'
    }
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(url, options = {}) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated')
    }
    
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    if (response.status === 401 || response.status === 403) {
      console.warn('🔐 [UNIFIED-AUTH] Authentication failed, clearing session')
      this.clearAuth()
      throw new Error('Authentication required')
    }
    
    return response
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    return this.isAuthenticated ? this.user : null
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated() {
    return this.isAuthenticated && this.user && this.sessionToken
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.user = null
    this.sessionToken = null
    this.accessToken = null
    this.isAuthenticated = false
    
    clearAuthData()
    console.log('🔐 [UNIFIED-AUTH] Authentication data cleared')
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Optionally call logout endpoint
      if (this.sessionToken) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: this.getAuthHeaders()
        }).catch(() => {
          // Ignore logout API errors
        })
      }
    } finally {
      this.clearAuth()
      console.log('🔐 [UNIFIED-AUTH] User logged out')
    }
  }

  /**
   * Refresh user data
   */
  async refreshUserData() {
    if (!this.isAuthenticated || !this.user) {
      throw new Error('Not authenticated')
    }
    
    try {
      const response = await this.apiRequest('/api/dashboard/' + this.user.id)
      
      if (!response.ok) {
        throw new Error('Failed to refresh user data')
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        // Update user data
        const updatedUser = {
          ...this.user,
          xp: data.data.xp,
          level: data.data.level,
          total_xp_earned: data.data.total_xp_earned,
          global_rank: data.data.global_rank
        }
        
        this.user = updatedUser
        localStorage.setItem('user_profile', JSON.stringify(updatedUser))
        
        console.log('✅ [UNIFIED-AUTH] User data refreshed')
        return { success: true, user: updatedUser }
      }
      
      throw new Error('Invalid response format')
      
    } catch (error) {
      console.error('❌ [UNIFIED-AUTH] Failed to refresh user data:', error)
      throw error
    }
  }
}

// Create singleton instance
const unifiedAuth = new UnifiedAuth()

export default unifiedAuth