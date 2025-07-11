'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../utils/supabase'
import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL parameters manually
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth error:', error)
            router.push('/')
          } else {
            // Successful authentication - redirect to community page
            router.push('/community')
          }
        } else {
          // No code parameter - redirect to home
          router.push('/')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🔄
        </div>
        <h2 style={{
          color: '#00ff88',
          marginBottom: '16px'
        }}>
          Completing Sign In...
        </h2>
        <p style={{
          color: '#888',
          fontSize: '14px'
        }}>
          Please wait while we redirect you to the community page.
        </p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}