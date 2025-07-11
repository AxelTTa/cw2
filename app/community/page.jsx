'use client'

import { useState, useEffect } from 'react'
import GoogleAuth from '../components/GoogleAuth'
import PublicComments from '../components/PublicComments'
import { supabase } from '../utils/supabase'

export default function CommunityPage() {
  const [matches, setMatches] = useState([])
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const [userProfile, setUserProfile] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [floatingReactions, setFloatingReactions] = useState([])

  useEffect(() => {
    initializePage()
    setIsVisible(true)
    
    // Floating reactions animation
    const reactionsInterval = setInterval(() => {
      const newReaction = {
        id: Date.now(),
        emoji: ['⚽', '🔥', '💪', '⚡', '🎯', '🏆', '👑', '💎'][Math.floor(Math.random() * 8)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        speed: 8 + Math.random() * 6
      }
      setFloatingReactions(prev => [...prev.slice(-7), newReaction])
    }, 4000)

    return () => clearInterval(reactionsInterval)
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      loadComments()
    }
  }, [selectedMatch, sortBy])

  const initializePage = async () => {
    await getCurrentUser()
    await loadMatches()
    setLoading(false)
  }

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

  const loadMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      const data = await response.json()
      if (data.success) {
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

  const loadComments = async () => {
    if (!selectedMatch) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/comments?match_id=${selectedMatch.id}&limit=100`)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    }
    setLoading(false)
  }

  const handleMatchSelect = async (match) => {
    setSelectedMatch(match)
    setComments([])
    setReplyTo(null)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user || !newComment.trim() || !selectedMatch) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          match_id: selectedMatch.id,
          parent_id: replyTo,
          content: newComment.trim(),
          comment_type: 'text'
        })
      })

      const data = await response.json()
      if (data.success) {
        setNewComment('')
        setReplyTo(null)
        await loadComments()
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
  }

  const handleUpvote = async (commentId) => {
    if (!user) return
    
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: 'upvote',
          user_id: user.id
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadComments()
      }
    } catch (error) {
      console.error('Error upvoting comment:', error)
    }
  }

  const handleReaction = async (commentId, reactionType) => {
    if (!user) return

    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: 'reaction',
          user_id: user.id,
          reaction_type: reactionType
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadComments()
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://cw2-alpha.vercel.app/auth/callback'
      }
    })
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setUserProfile(userData)
    localStorage.setItem('user_profile', JSON.stringify(userData))
  }

  const handleAuthError = (error) => {
    console.error('Auth error:', error)
    // Could show a toast notification here
  }

  const signOut = async () => {
    // Clear localStorage
    localStorage.removeItem('user_profile')
    
    // Also clear Supabase auth if applicable
    await supabase.auth.signOut()
    
    setUser(null)
    setUserProfile(null)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'live': return '#00ff88'
      case 'finished': return '#888'
      case 'scheduled': return '#0099ff'
      default: return '#888'
    }
  }

  const CommentComponent = ({ comment, isReply = false }) => (
    <div className="card-hover" style={{
      backgroundColor: isReply ? '#0f0f0f' : '#1a1a1a',
      border: '2px solid #333',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: isReply ? '12px' : '20px',
      marginLeft: isReply ? '32px' : '0',
      transition: 'all 0.3s ease',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#00ff88'
      e.currentTarget.style.backgroundColor = isReply ? '#1a1a1a' : '#222'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#333'
      e.currentTarget.style.backgroundColor = isReply ? '#0f0f0f' : '#1a1a1a'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#00ff88',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000',
            animation: 'pulse 3s ease-in-out infinite',
            boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)'
          }}>
            {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              {comment.profiles?.display_name || comment.profiles?.username || 'Anonymous'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#888'
            }}>
              Level {comment.profiles?.level || 1} • {comment.profiles?.xp || 0} XP
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#666'
        }}>
          {formatTime(comment.created_at)}
        </div>
      </div>

      <div style={{
        color: '#ffffff',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '12px'
      }}>
        {comment.content}
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <button
          onClick={() => handleUpvote(comment.id)}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: '20px',
            padding: '6px 12px',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#00ff88'
            e.target.style.color = '#00ff88'
            e.target.style.backgroundColor = 'rgba(0, 255, 136, 0.1)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#333'
            e.target.style.color = '#888'
            e.target.style.backgroundColor = 'transparent'
            e.target.style.transform = 'scale(1)'
          }}
        >
          ⬆️ {comment.upvotes || 0}
        </button>
        <button
          onClick={() => handleReaction(comment.id, 'like')}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: '20px',
            padding: '6px 12px',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#0099ff'
            e.target.style.color = '#0099ff'
            e.target.style.backgroundColor = 'rgba(0, 153, 255, 0.1)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#333'
            e.target.style.color = '#888'
            e.target.style.backgroundColor = 'transparent'
            e.target.style.transform = 'scale(1)'
          }}
        >
          👍 {comment.reactions?.filter(r => r.reaction_type === 'like').length || 0}
        </button>
        <button
          onClick={() => handleReaction(comment.id, 'fire')}
          style={{
            background: 'none',
            border: '1px solid #333',
            borderRadius: '20px',
            padding: '6px 12px',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#ff6b35'
            e.target.style.color = '#ff6b35'
            e.target.style.backgroundColor = 'rgba(255, 107, 53, 0.1)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#333'
            e.target.style.color = '#888'
            e.target.style.backgroundColor = 'transparent'
            e.target.style.transform = 'scale(1)'
          }}
        >
          🔥 {comment.reactions?.filter(r => r.reaction_type === 'fire').length || 0}
        </button>
        {!isReply && (
          <button
            onClick={() => setReplyTo(comment.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            💬 Reply
          </button>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {comment.replies.map(reply => (
            <CommentComponent key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes floatReaction {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          25% { transform: translateY(-30px) rotate(90deg); opacity: 0.8; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          75% { transform: translateY(-25px) rotate(270deg); opacity: 0.6; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
          50% { box-shadow: 0 0 35px rgba(0, 255, 136, 0.6); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .floating-reaction {
          position: absolute;
          font-size: 24px;
          pointer-events: none;
          animation: floatReaction var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          z-index: 1;
        }
        
        .hero-bg {
          background: linear-gradient(-45deg, #0a0a0a, #111111, #0f0f0f, #0a0a0a);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
        }
        
        .card-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .card-hover:hover::before {
          left: 100%;
        }
        
        .live-pulse {
          animation: pulse 2s infinite;
        }
        
        .match-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent);
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Floating Reactions */}
      {floatingReactions.map(reaction => (
        <div
          key={reaction.id}
          className="floating-reaction"
          style={{
            '--duration': `${reaction.speed}s`,
            '--delay': `${reaction.delay}s`,
            top: `${reaction.y}%`,
            left: `${reaction.x}%`
          }}
        >
          {reaction.emoji}
        </div>
      ))}
      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        animation: isVisible ? 'slideInUp 0.8s ease-out' : 'none'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00ff88',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.15)'
          e.target.style.textShadow = '0 0 25px #00ff88'
          e.target.style.filter = 'brightness(1.2)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
          e.target.style.textShadow = 'none'
          e.target.style.filter = 'brightness(1)'
        }}
        >
          Clutch Community 💬
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/live', label: 'Live' },
            { href: '/players', label: 'Players' },
            { href: '/stats', label: 'Stats' },
            { href: '/teams', label: 'Teams' },
            { href: '/community', label: 'Community', active: true },
            { href: '/about', label: 'About' },
            { href: '/rewards', label: 'Rewards' }
          ].map((item, index) => (
            <a 
              key={item.href}
              href={item.href} 
              style={{ 
                color: item.active ? '#ffffff' : '#888', 
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                padding: '8px 0'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#00ff88'
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.textShadow = '0 5px 10px rgba(0, 255, 136, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = item.active ? '#ffffff' : '#888'
                e.target.style.transform = 'translateY(0)'
                e.target.style.textShadow = 'none'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="hero-bg" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* User Profile Section */}
        {userProfile && (
          <div className="card-hover" style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #00ff88',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            animation: isVisible ? 'slideInLeft 0.8s ease-out 0.2s both' : 'none',
            position: 'relative'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#00ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#000'
            }}>
              {userProfile.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {userProfile.display_name || userProfile.username}
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                Level {userProfile.level} • {userProfile.xp} XP • {userProfile.fan_tokens} Tokens
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={signOut}
                style={{
                  backgroundColor: '#ff4444',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Match Selection */}
        <div className="card-hover" style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #0099ff',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          animation: isVisible ? 'slideInUp 0.8s ease-out 0.4s both' : 'none',
          position: 'relative'
        }}>
          <h2 style={{ 
            color: '#00ff88', 
            marginBottom: '25px',
            fontSize: '28px',
            fontWeight: 'bold',
            animation: 'glow 3s ease-in-out infinite'
          }}>
            🔥 Select a Match to Join the Discussion
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '16px'
          }}>
            {matches.map((match, index) => (
              <div
                key={match.id}
                className="card-hover"
                onClick={() => handleMatchSelect(match)}
                style={{
                  backgroundColor: selectedMatch?.id === match.id ? '#2a2a2a' : '#111',
                  border: `2px solid ${selectedMatch?.id === match.id ? '#00ff88' : '#333'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: isVisible ? `slideInRight 0.8s ease-out ${index * 0.1 + 0.6}s both` : 'none',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {match.homeTeam?.name || match.home_team} vs {match.awayTeam?.name || match.away_team}
                  </div>
                  <div className={match.status === 'live' ? 'live-pulse' : ''} style={{
                    fontSize: '14px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: getMatchStatusColor(match.status),
                    color: '#000',
                    fontWeight: 'bold',
                    animation: match.status === 'live' ? 'pulse 2s infinite' : 'none'
                  }}>
                    {match.status === 'live' ? '🔴 LIVE' : match.status}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {match.league || match.round} • {formatTime(match.date || match.match_date)}
                  </div>
                  {match.status === 'live' && (
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#00ff88',
                      animation: 'glow 2s ease-in-out infinite',
                      textShadow: '0 0 15px rgba(0, 255, 136, 0.5)'
                    }}>
                      {match.score?.home || match.home_score} - {match.score?.away || match.away_score}
                    </div>
                  )}
                  
                  {/* Live Match Shimmer Effect */}
                  {match.status === 'live' && (
                    <div className="match-shimmer" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discussion Section */}
        {selectedMatch && (
          <div className="card-hover" style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #ff6b35',
            borderRadius: '16px',
            padding: '25px',
            animation: isVisible ? 'slideInUp 0.8s ease-out 1s both' : 'none',
            position: 'relative'
          }}>
            {/* Match Header */}
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '2px solid #00ff88',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px',
              animation: 'glow 4s ease-in-out infinite',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h2 style={{ 
                  color: '#00ff88', 
                  margin: 0,
                  fontSize: '24px',
                  animation: 'bounce 3s ease-in-out infinite'
                }}>
                  ⚽ {selectedMatch.homeTeam?.name || selectedMatch.home_team} vs {selectedMatch.awayTeam?.name || selectedMatch.away_team}
                </h2>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: getMatchStatusColor(selectedMatch.status),
                  animation: selectedMatch.status === 'live' ? 'pulse 2s infinite' : 'none',
                  textShadow: selectedMatch.status === 'live' ? '0 0 20px rgba(0, 255, 136, 0.6)' : 'none'
                }}>
                  {selectedMatch.status === 'live' ? 
                    `🔴 ${selectedMatch.score?.home || selectedMatch.home_score} - ${selectedMatch.score?.away || selectedMatch.away_score}` : 
                    selectedMatch.status}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                {selectedMatch.league || selectedMatch.round} • {formatTime(selectedMatch.date || selectedMatch.match_date)}
              </div>
            </div>

            {/* Discussion Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                color: '#ffffff', 
                margin: 0,
                fontSize: '22px',
                animation: 'glow 3s ease-in-out infinite'
              }}>
                💬 Discussion ({comments.length})
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
                {!user && (
                  <GoogleAuth 
                    onAuthSuccess={handleAuthSuccess}
                    onAuthError={handleAuthError}
                  />
                )}
              </div>
            </div>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleSubmitComment} style={{ marginBottom: '20px' }}>
                {replyTo && (
                  <div style={{
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '8px',
                    marginBottom: '8px',
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    Replying to comment...{' '}
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff4444',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on the match..."
                    style={{
                      flex: 1,
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    style={{
                      backgroundColor: newComment.trim() ? '#00ff88' : '#333',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      color: newComment.trim() ? '#000' : '#666',
                      fontSize: '14px',
                      cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold'
                    }}
                  >
                    Post (+10 XP)
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            {loading ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                <div style={{ 
                  fontSize: '32px', 
                  marginBottom: '15px',
                  animation: 'bounce 1.5s infinite'
                }}>💬</div>
                <div style={{ 
                  fontSize: '18px',
                  animation: 'pulse 2s infinite'
                }}>
                  Loading comments...
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#888', 
                padding: '50px',
                backgroundColor: '#111',
                borderRadius: '12px',
                border: '2px dashed #333'
              }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '20px',
                  animation: 'bounce 2s infinite'
                }}>🎯</div>
                <div style={{ fontSize: '20px', marginBottom: '10px', color: '#fff' }}>
                  No comments yet!
                </div>
                <div style={{ fontSize: '16px' }}>
                  Be the first to share your thoughts on this match!
                </div>
              </div>
            ) : (
              <div>
                {comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    style={{
                      animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <CommentComponent comment={comment} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}