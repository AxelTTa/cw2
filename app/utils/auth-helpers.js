// Authentication helper utilities
import { supabase } from './supabase'

/**
 * Get current authenticated user with validation
 * Ensures user has required ID field and cleans up invalid data
 */
export const getCurrentUser = async () => {
  try {
    // First check localStorage for user data
    const userData = localStorage.getItem('user_profile')
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        
        // VALIDATION: Ensure user has required ID field
        if (parsedUser && parsedUser.id) {
          console.log('✅ [AUTH HELPER] Valid user from localStorage:', {
            id: parsedUser.id,
            email: parsedUser.email,
            username: parsedUser.username
          })
          return parsedUser
        } else {
          console.warn('⚠️ [AUTH HELPER] User data missing ID, clearing localStorage')
          localStorage.removeItem('user_profile')
        }
      } catch (error) {
        console.error('❌ [AUTH HELPER] Error parsing user data from localStorage:', error)
        localStorage.removeItem('user_profile') // Clear corrupted data
      }
    }
    
    // Fallback to Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ [AUTH HELPER] Supabase auth error:', error)
      return null
    }
    
    if (user && user.id) {
      console.log('✅ [AUTH HELPER] Valid user from Supabase:', {
        id: user.id,
        email: user.email
      })
      
      // Save valid user to localStorage for future use
      localStorage.setItem('user_profile', JSON.stringify(user))
      return user
    }
    
    console.log('❌ [AUTH HELPER] No valid user found')
    return null
    
  } catch (error) {
    console.error('❌ [AUTH HELPER] Error getting current user:', error)
    return null
  }
}

/**
 * Get session token for API requests
 */
export const getSessionToken = () => {
  return localStorage.getItem('session_token')
}

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('user_profile')
  localStorage.removeItem('access_token')
  localStorage.removeItem('session_token')
  localStorage.removeItem('token_expires_at')
  localStorage.removeItem('oauth_state')
}

/**
 * Validate user object has required fields
 */
export const validateUser = (user) => {
  if (!user) return false
  if (!user.id) return false
  return true
}

/**
 * Get authenticated headers for API requests
 */
export const getAuthHeaders = () => {
  const sessionToken = getSessionToken()
  if (!sessionToken) return {}
  
  return {
    'Authorization': `Bearer ${sessionToken}`,
    'x-session-token': sessionToken,
    'Content-Type': 'application/json'
  }
}