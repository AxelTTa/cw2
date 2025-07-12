'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    // Check localStorage for user data
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setUserProfile(parsedUser)
      return
    }
    
    // Fallback to Supabase auth (for existing users)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setUserProfile(user)
    }
  }

  const signOut = async () => {
    // Clear localStorage
    localStorage.removeItem('user_profile')
    
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
    { href: '/community', label: 'Community', paths: ['/community'] }
  ]

  const isActivePath = (item) => {
    if (item.paths.includes(pathname)) return true
    return item.paths.some(path => pathname.startsWith(path) && pathname !== '/')
  }

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      padding: '20px 40px',
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
          fontSize: '28px',
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

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        gap: '0px',
        alignItems: 'center'
      }}>
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

      {/* User Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
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
      `}</style>
    </header>
  )
}