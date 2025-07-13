'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const XPContext = createContext()

export const useXP = () => {
  const context = useContext(XPContext)
  if (!context) {
    throw new Error('useXP must be used within an XPProvider')
  }
  return context
}

export const XPProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize user profile from localStorage
    loadUserProfile()
    
    // Listen for XP updates from other components
    const handleXPUpdate = (event) => {
      const updatedProfile = event.detail
      setUserProfile(updatedProfile)
      
      // Update localStorage
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile))
    }

    window.addEventListener('userProfileUpdated', handleXPUpdate)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleXPUpdate)
    }
  }, [])

  const loadUserProfile = () => {
    try {
      const userData = localStorage.getItem('user_profile')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUserProfile(parsedUser)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshXP = async (userId) => {
    if (!userId) return

    try {
      const response = await fetch(`/api/dashboard/${userId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const updatedProfile = {
            ...userProfile,
            xp: result.data.xp,
            level: result.data.level,
            total_xp_earned: result.data.total_xp_earned,
            global_rank: result.data.global_rank
          }
          
          setUserProfile(updatedProfile)
          localStorage.setItem('user_profile', JSON.stringify(updatedProfile))
          
          // Dispatch event for other components listening
          window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
            detail: updatedProfile 
          }))
          
          return updatedProfile
        }
      }
    } catch (error) {
      console.error('Error refreshing XP:', error)
    }
  }

  const updateUserProfile = (updates) => {
    const updatedProfile = { ...userProfile, ...updates }
    setUserProfile(updatedProfile)
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile))
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
      detail: updatedProfile 
    }))
  }

  const clearUserProfile = () => {
    setUserProfile(null)
    localStorage.removeItem('user_profile')
    
    // Clear XP cache
    if (userProfile?.id) {
      localStorage.removeItem(`xp_cache_${userProfile.id}`)
    }
  }

  const value = {
    userProfile,
    isLoading,
    refreshXP,
    updateUserProfile,
    clearUserProfile,
    setUserProfile: updateUserProfile
  }

  return (
    <XPContext.Provider value={value}>
      {children}
    </XPContext.Provider>
  )
}