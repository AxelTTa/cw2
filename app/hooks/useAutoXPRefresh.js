'use client'

import { useEffect } from 'react'
import { useXP } from '../contexts/XPContext'

export const useAutoXPRefresh = () => {
  const { refreshXP, userProfile } = useXP()

  useEffect(() => {
    // Listen for various XP-earning events
    const handleXPEarningEvent = async (event) => {
      if (userProfile?.id) {
        // Small delay to allow backend to process
        setTimeout(() => {
          refreshXP(userProfile.id)
        }, 1000)
      }
    }

    // Listen for comment-related events
    window.addEventListener('commentPosted', handleXPEarningEvent)
    window.addEventListener('commentLiked', handleXPEarningEvent)
    window.addEventListener('predictionMade', handleXPEarningEvent)
    window.addEventListener('milestoneAchieved', handleXPEarningEvent)
    
    return () => {
      window.removeEventListener('commentPosted', handleXPEarningEvent)
      window.removeEventListener('commentLiked', handleXPEarningEvent)
      window.removeEventListener('predictionMade', handleXPEarningEvent)
      window.removeEventListener('milestoneAchieved', handleXPEarningEvent)
    }
  }, [userProfile?.id, refreshXP])

  return { refreshXP }
}