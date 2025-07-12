'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    getCurrentUser()
    
    // Listen for user profile updates from other pages
    const handleUserProfileUpdate = (event) => {
      setUserProfile(event.detail)
    }
    
    window.addEventListener('userProfileUpdated', handleUserProfileUpdate)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate)
    }
  }, [])

  const getCurrentUser = async () => {
    // Check localStorage for user data
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setUserProfile(parsedUser)
      
      // Check if XP data is stale and refresh if needed
      await refreshXPDataIfNeeded(parsedUser)
      return
    }
    
    // Fallback to Supabase auth (for existing users)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setUserProfile(user)
    }
  }

  const refreshXPDataIfNeeded = async (user) => {
    if (!user?.id) return

    const XP_CACHE_KEY = `xp_cache_${user.id}`
    const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

    try {
      const cached = localStorage.getItem(XP_CACHE_KEY)
      let shouldRefresh = true

      if (cached) {
        const { timestamp } = JSON.parse(cached)
        shouldRefresh = Date.now() - timestamp > CACHE_DURATION
      }

      if (shouldRefresh) {
        const response = await fetch(`/api/dashboard/${user.id}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Update user profile with fresh XP data
            const updatedUser = {
              ...user,
              xp: result.data.xp,
              level: result.data.level
            }
            
            // Update cache
            localStorage.setItem(XP_CACHE_KEY, JSON.stringify({
              data: result.data,
              timestamp: Date.now()
            }))
            
            // Update localStorage user profile
            localStorage.setItem('user_profile', JSON.stringify(updatedUser))
            
            // Update state
            setUserProfile(updatedUser)
            
            // Dispatch update event
            window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
              detail: updatedUser 
            }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh XP data:', error)
    }
  }

  const signOut = async () => {
    // Clear localStorage and XP cache
    const userId = user?.id
    localStorage.removeItem('user_profile')
    if (userId) {
      localStorage.removeItem(`xp_cache_${userId}`)
    }
    
    // Also clear Supabase auth if applicable
    await supabase.auth.signOut()
    
    setUser(null)
    setUserProfile(null)
  }

  const navItems = [
    { href: '/', label: 'Home', paths: ['/'] },
    { href: '/competitions', label: 'Competitions', paths: ['/competitions'] },
    { href: '/teams', label: 'Teams', paths: ['/teams'] },
    { href: '/players', label: 'Players', paths: ['/players'] },
    { href: '/matches', label: 'Matches', paths: ['/matches'] },
    { href: '/live', label: 'Live', paths: ['/live'] },
    { href: '/prediction-grid', label: '🎯 Prediction Grid', paths: ['/prediction-grid'] },
    { href: '/test-livematch', label: 'Test Live Match', paths: ['/test-livematch'] },
    { href: '/rewards', label: 'Rewards', paths: ['/rewards'] },
    { href: '/daily-leaderboard', label: 'Daily Leaderboard', paths: ['/daily-leaderboard'] }
  ]

  const isActivePath = (item) => {
    if (item.paths.includes(pathname)) return true
    return item.paths.some(path => pathname.startsWith(path) && pathname !== '/')
  }

  return (
    <>
      <header style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '15px 20px',
        borderBottom: '2px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}>
        {/* Logo */}
        <a 
          href="/"
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#00ff88',
            textDecoration: 'none',
            background: 'linear-gradient(45deg, #00ff88, #00cc6a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
          }}
        >
          Clutch
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: '2px solid #00ff88',
            borderRadius: '8px',
            color: '#00ff88',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'all 0.3s ease'
          }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation */}
        <nav style={{ 
          display: 'flex', 
          gap: '0px',
          alignItems: 'center'
        }} className="desktop-nav">
          {navItems.map((item) => {
            const isActive = isActivePath(item)
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: isActive ? '#00ff88' : '#999',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '500',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  background: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#fff'
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.target.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#999'
                    e.target.style.background = 'transparent'
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {item.label}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    background: '#00ff88',
                    borderRadius: '50%'
                  }} />
                )}
              </a>
            )
          })}
        </nav>

        {/* Desktop User Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }} className="desktop-user-actions">
          {userProfile ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#00ff88',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#000'
              }}>
                {userProfile.username?.[0]?.toUpperCase() || userProfile.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffffff'
                }}>
                  {userProfile.display_name || userProfile.username || userProfile.email?.split('@')[0]}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#888'
                }}>
                  Level {userProfile.level || 1} • {userProfile.xp || 0} XP
                </div>
              </div>
              <button
                onClick={signOut}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #444',
                  color: '#888',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#ff4444'
                  e.target.style.color = '#ff4444'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#444'
                  e.target.style.color = '#888'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <a
              href="/login"
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Login
            </a>
          )}
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <nav style={{
        position: 'fixed',
        top: '70px',
        left: mobileMenuOpen ? '0' : '-100%',
        width: '100%',
        height: 'calc(100vh - 70px)',
        background: 'rgba(10, 10, 10, 0.98)',
        backdropFilter: 'blur(20px)',
        padding: '20px',
        transition: 'left 0.3s ease',
        zIndex: 999,
        display: mobileMenuOpen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: '10px',
        visibility: mobileMenuOpen ? 'visible' : 'hidden',
        opacity: mobileMenuOpen ? 1 : 0
      }} className="mobile-nav">
        {navItems.map((item) => {
          const isActive = isActivePath(item)
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isActive ? '#00ff88' : '#999',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: isActive ? '600' : '500',
                padding: '15px 20px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                background: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                borderBottom: '1px solid #333'
              }}
            >
              {item.label}
            </a>
          )
        })}
        
        {/* Mobile User Actions */}
        <div style={{
          marginTop: '20px',
          padding: '20px',
          borderTop: '1px solid #333'
        }}>
          {userProfile ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#00ff88',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#000'
                }}>
                  {userProfile.username?.[0]?.toUpperCase() || userProfile.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#ffffff'
                  }}>
                    {userProfile.display_name || userProfile.username || userProfile.email?.split('@')[0]}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#888'
                  }}>
                    Level {userProfile.level || 1} • {userProfile.xp || 0} XP
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #ff4444',
                  color: '#ff4444',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                padding: '15px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                display: 'block'
              }}
            >
              Login
            </a>
          )}
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 255, 136, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 255, 136, 0);
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .desktop-nav {
            display: none !important;
          }
          
          .desktop-user-actions {
            display: none !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
            visibility: hidden !important;
          }
        }
        
        @media (max-width: 768px) {
          .mobile-nav {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}