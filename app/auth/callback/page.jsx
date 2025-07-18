'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('Authorization code not found')
        }

        // Verify state parameter
        const storedState = localStorage.getItem('oauth_state')
        if (state !== storedState) {
          throw new Error('Invalid state parameter')
        }

        // Clear stored state
        localStorage.removeItem('oauth_state')

        setStatus('exchanging')

        // Exchange code for tokens using unified auth
        const unifiedAuth = (await import('../../utils/unified-auth')).default
        const authResult = await unifiedAuth.authenticateWithGoogle(code)

        if (!authResult.success) {
          throw new Error(authResult.error || 'Authentication failed')
        }

        setStatus('success')

        // Check if this is a popup callback
        if (window.opener) {
          // Send success message to parent window
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            user: authResult.user
          }, window.location.origin)
          
          // Mark success in localStorage for parent to check
          localStorage.setItem('google_auth_success', JSON.stringify(authResult.user))
          
          window.close()
        } else {
          // Redirect to rewards page
          setTimeout(() => {
            router.push('/rewards')
          }, 1500)
        }

      } catch (error) {
        console.error('OAuth callback error:', error)
        setError(error.message)
        setStatus('error')

        if (window.opener) {
          // Send error message to parent window
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error.message
          }, window.location.origin)
          
          setTimeout(() => window.close(), 3000)
        } else {
          // Redirect to home page after delay
          setTimeout(() => {
            router.push('/')
          }, 3000)
        }
      }
    }

    handleCallback()
  }, [router])

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return {
          icon: '🔄',
          title: 'Processing...',
          message: 'Please wait while we process your authentication.'
        }
      case 'exchanging':
        return {
          icon: '🔑',
          title: 'Exchanging Tokens...',
          message: 'Securely exchanging your authorization code for access tokens.'
        }
      case 'success':
        return {
          icon: '✅',
          title: 'Success!',
          message: 'Authentication successful. Redirecting you to the rewards page.'
        }
      case 'error':
        return {
          icon: '❌',
          title: 'Authentication Error',
          message: error || 'An error occurred during authentication.'
        }
      default:
        return {
          icon: '🔄',
          title: 'Loading...',
          message: 'Please wait...'
        }
    }
  }

  const statusInfo = getStatusMessage()

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
        maxWidth: '400px',
        width: '90%'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: status === 'processing' || status === 'exchanging' ? 'pulse 2s infinite' : 'none'
        }}>
          {statusInfo.icon}
        </div>
        
        <h2 style={{
          color: status === 'error' ? '#ff4444' : '#00ff88',
          marginBottom: '16px',
          fontSize: '20px'
        }}>
          {statusInfo.title}
        </h2>
        
        <p style={{
          color: '#888',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '20px'
        }}>
          {statusInfo.message}
        </p>

        {status === 'processing' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#00ff88',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite both',
              animationDelay: '0s'
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#00ff88',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite both',
              animationDelay: '0.2s'
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#00ff88',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite both',
              animationDelay: '0.4s'
            }} />
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#333',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}</style>
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