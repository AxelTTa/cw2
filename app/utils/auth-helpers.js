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
    const sessionToken = localStorage.getItem('session_token')
    
    if (userData && sessionToken) {
      try {
        const parsedUser = JSON.parse(userData)
        
        // VALIDATION: Ensure user has required ID field
        if (parsedUser && parsedUser.id) {
          console.log('✅ [AUTH HELPER] Valid user from localStorage:', {
            id: parsedUser.id,
            email: parsedUser.email,
            username: parsedUser.username
          })
          
          // Validate session token is still valid
          try {
            const response = await fetch('/api/dashboard/' + parsedUser.id, {
              method: 'HEAD', // Just check headers, don't need full response
              headers: getAuthHeaders()
            })
            
            if (response.ok) {
              return { ...parsedUser, sessionToken }
            } else {
              console.warn('⚠️ [AUTH HELPER] Session token invalid, clearing data')
              clearAuthData()
            }
          } catch (validationError) {
            console.warn('⚠️ [AUTH HELPER] Session validation failed, clearing data')
            clearAuthData()
          }
        } else {
          console.warn('⚠️ [AUTH HELPER] User data missing ID, clearing localStorage')
          clearAuthData()
        }
      } catch (error) {
        console.error('❌ [AUTH HELPER] Error parsing user data from localStorage:', error)
        clearAuthData() // Clear corrupted data
      }
    }
    
    console.log('❌ [AUTH HELPER] No valid authenticated user found')
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
  const accessToken = localStorage.getItem('access_token')
  
  if (!sessionToken) return {}
  
  return {
    'Authorization': `Bearer ${sessionToken}`,
    'X-Session-Token': sessionToken,
    'X-Access-Token': accessToken || '',
    'Content-Type': 'application/json'
  }
}