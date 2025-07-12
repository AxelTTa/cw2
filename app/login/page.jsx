'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import GoogleAuth from '../components/GoogleAuth'
import SimpleAuth from '../components/SimpleAuth'

export default function LoginPage() {
  const [user, setUser] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setIsVisible(true)
    
    // Check if user is already logged in
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    // Store user data in localStorage
    localStorage.setItem('user_profile', JSON.stringify(userData))
    
    // Redirect to home page or previous page
    const returnUrl = localStorage.getItem('login_return_url') || '/'
    localStorage.removeItem('login_return_url')
    router.push(returnUrl)
  }

  const handleAuthError = (error) => {
    console.error('Auth error:', error)
    alert('Login failed: ' + error)
  }

  const handleLogout = () => {
    localStorage.removeItem('user_profile')
    setUser(null)
    router.push('/')
  }

  if (user) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Header />
        
        <main style={{ 
          padding: isMobile ? '40px 15px' : '80px 20px', 
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '40px',
            animation: isVisible ? 'slideInUp 0.8s ease-out' : 'none'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h1 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#00ff88'
            }}>
              Welcome back!
            </h1>
            <p style={{
              color: '#888',
              marginBottom: '30px',
              fontSize: '16px'
            }}>
              You're successfully logged in as {user.email || user.name || 'User'}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  backgroundColor: '#00ff88',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Go to Homepage
              </button>
              <button
                onClick={() => router.push('/community')}
                style={{
                  backgroundColor: '#0099ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Join Discussions
              </button>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ff6b6b',
                  border: '1px solid #ff6b6b',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </main>

        <style jsx>{`
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header />

      <main style={{ 
        padding: isMobile ? '40px 15px' : '80px 20px', 
        textAlign: 'center' 
      }}>
        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s ease-out'
        }}>
          <h1 style={{
            fontSize: isMobile ? '32px' : '48px',
            fontWeight: '900',
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to Clutch! ⚽
          </h1>
          
          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            color: '#cccccc',
            marginBottom: isMobile ? '30px' : '50px',
            maxWidth: '600px',
            margin: isMobile ? '0 auto 30px' : '0 auto 50px',
            lineHeight: '1.6',
            padding: isMobile ? '0 10px' : '0'
          }}>
            Join the FIFA Club World Cup 2025 community. 
            Comment on matches, share memes, and connect with football fans worldwide.
          </p>
        </div>

        {/* Login Options */}
        <div style={{
          maxWidth: isMobile ? '95%' : '500px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '20px' : '30px'
        }}>
          {/* Google Authentication */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '30px',
            animation: isVisible ? 'slideInUp 0.8s ease-out 0.3s both' : 'none'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#ffffff'
            }}>
              🚀 Quick Sign In
            </h3>
            <p style={{
              color: '#888',
              marginBottom: '20px',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              Sign in with your Google account for instant access
            </p>
            <GoogleAuth 
              onAuthSuccess={handleAuthSuccess}
              onAuthError={handleAuthError}
            />
          </div>

          {/* Simple Email/Password Authentication */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '30px',
            animation: isVisible ? 'slideInUp 0.8s ease-out 0.5s both' : 'none'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#ffffff'
            }}>
              📧 Email & Password
            </h3>
            <p style={{
              color: '#888',
              marginBottom: '20px',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              Create an account or sign in with email and password
            </p>
            <SimpleAuth onAuthSuccess={handleAuthSuccess} />
          </div>

          {/* Benefits Section */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '30px',
            animation: isVisible ? 'slideInUp 0.8s ease-out 0.7s both' : 'none'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#00ff88'
            }}>
              🎯 Why Join Clutch?
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? '15px' : '20px',
              textAlign: 'left'
            }}>
              <div>
                <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>💬</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: isMobile ? '14px' : '16px' }}>Live Discussions</div>
                <div style={{ color: '#888', fontSize: isMobile ? '11px' : '12px' }}>
                  Comment on live matches and share your reactions
                </div>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: isMobile ? '14px' : '16px' }}>Player Stats</div>
                <div style={{ color: '#888', fontSize: isMobile ? '11px' : '12px' }}>
                  Access detailed statistics and analysis
                </div>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>🏆</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: isMobile ? '14px' : '16px' }}>Tournament Updates</div>
                <div style={{ color: '#888', fontSize: isMobile ? '11px' : '12px' }}>
                  Get real-time updates from Club World Cup 2025
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: isMobile ? '40px' : '60px',
          padding: isMobile ? '15px' : '20px',
          color: '#666',
          fontSize: isMobile ? '11px' : '12px'
        }}>
          <p>
            By signing in, you agree to our terms of service and privacy policy.
          </p>
          <p style={{ marginTop: '10px' }}>
            Need help? Contact us at support@clutch.com
          </p>
        </div>
      </main>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}