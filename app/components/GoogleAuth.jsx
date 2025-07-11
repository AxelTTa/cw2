'use client'

import { useState, useEffect } from 'react'

export default function GoogleAuth({ onAuthSuccess, onAuthError }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cw2-alpha.vercel.app'}/auth/callback`
  const SCOPES = 'email profile openid'

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    setError('')

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    googleAuthUrl.searchParams.append('response_type', 'code')
    googleAuthUrl.searchParams.append('scope', SCOPES)
    googleAuthUrl.searchParams.append('access_type', 'offline')
    googleAuthUrl.searchParams.append('prompt', 'consent')
    googleAuthUrl.searchParams.append('state', generateState())

    // Store state in localStorage for verification
    localStorage.setItem('oauth_state', googleAuthUrl.searchParams.get('state'))

    // Redirect to Google OAuth
    window.location.href = googleAuthUrl.toString()
  }

  const generateState = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // Handle popup-based OAuth (alternative approach)
  const handleGoogleSignInPopup = () => {
    setIsLoading(true)
    setError('')

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    googleAuthUrl.searchParams.append('response_type', 'code')
    googleAuthUrl.searchParams.append('scope', SCOPES)
    googleAuthUrl.searchParams.append('access_type', 'offline')
    googleAuthUrl.searchParams.append('prompt', 'consent')
    googleAuthUrl.searchParams.append('state', generateState())

    // Open popup window
    const popup = window.open(
      googleAuthUrl.toString(),
      'googleAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    // Listen for popup close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        setIsLoading(false)
        
        // Check if authentication was successful
        const authData = localStorage.getItem('google_auth_success')
        if (authData) {
          const userData = JSON.parse(authData)
          localStorage.removeItem('google_auth_success')
          onAuthSuccess?.(userData)
        }
      }
    }, 1000)

    // Listen for messages from popup
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        popup.close()
        setIsLoading(false)
        onAuthSuccess?.(event.data.user)
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        popup.close()
        setIsLoading(false)
        setError(event.data.error)
        onAuthError?.(event.data.error)
      }
    }

    window.addEventListener('message', handleMessage)

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(checkClosed)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#3c4043',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          minWidth: '200px',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = '#f8f9fa'
            e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = '#ffffff'
            e.target.style.boxShadow = 'none'
          }
        }}
      >
        {isLoading ? (
          <>
            <div style={{
              width: '18px',
              height: '18px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #4285f4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Signing in...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </>
        )}
      </button>

      {error && (
        <div style={{
          color: '#d93025',
          fontSize: '12px',
          textAlign: 'center',
          padding: '8px',
          backgroundColor: '#fce8e6',
          border: '1px solid #f9ab9d',
          borderRadius: '4px',
          maxWidth: '300px'
        }}>
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}