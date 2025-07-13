'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../components/Header'
import GoogleAuth from '../../components/GoogleAuth'
import UniversalComments from '../../components/UniversalComments'
import CommentForm from '../../components/CommentForm'
import { supabase } from '../../utils/supabase'
import { useAutoXPRefresh } from '../../hooks/useAutoXPRefresh'

export default function MatchDetail() {
  const params = useParams()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [replyTo, setReplyTo] = useState(null)
  
  // Enable auto XP refresh for match detail page
  useAutoXPRefresh()
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (params.id) {
      initializePage()
    }
  }, [params.id])


  const initializePage = async () => {
    await getCurrentUser()
    await fetchMatchDetail()
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

  async function fetchMatchDetail() {
    try {
      setLoading(true)
      setError(null)
      
      // First get all matches and find the specific one
      const response = await fetch('/api/matches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`)
      }
      
      const apiData = await response.json()
      const matches = apiData.matches || []
      
      const foundMatch = matches.find(m => m.id.toString() === params.id)
      
      if (!foundMatch) {
        throw new Error('Match not found')
      }
      
      // Try to get additional match details from API Football
      try {
        const detailResponse = await fetch(`/api/matches/${params.id}`)
        if (detailResponse.ok) {
          const detailData = await detailResponse.json()
          if (detailData.success && detailData.match) {
            setMatch({ ...foundMatch, ...detailData.match })
          } else {
            setMatch(foundMatch)
          }
        } else {
          setMatch(foundMatch)
        }
      } catch (detailError) {
        console.log('Could not fetch additional match details, using basic data')
        setMatch(foundMatch)
      }
      
    } catch (err) {
      console.error('Error fetching match detail:', err)
      setError('Failed to load match details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }



  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setUserProfile(userData)
    localStorage.setItem('user_profile', JSON.stringify(userData))
  }

  const handleAuthError = (error) => {
    console.error('Auth error:', error)
  }

  const signOut = async () => {
    // Clear localStorage
    localStorage.removeItem('user_profile')
    
    // Also clear Supabase auth if applicable
    await supabase.auth.signOut()
    
    setUser(null)
    setUserProfile(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return '#00ff88'
      case 'ft': return '#888'
      case 'ns': return '#0099ff'
      default: return '#888'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'live': return 'LIVE'
      case 'ft': return 'FINISHED'
      case 'ns': return 'UPCOMING'
      default: return status.toUpperCase()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleUpvote = async (commentId) => {
    // Placeholder function for upvote functionality
    console.log('Upvote comment:', commentId)
  }

  const handleReaction = async (commentId, reactionType) => {
    // Placeholder function for reaction functionality
    console.log('React to comment:', commentId, reactionType)
  }

  const handleSubmitComment = async (commentData) => {
    // Placeholder function for comment submission
    console.log('Submit comment:', commentData)
  }

  const CommentComponent = ({ comment, isReply = false }) => (
    <div style={{
      backgroundColor: isReply ? '#0f0f0f' : '#1a1a1a',
      border: '2px solid #333',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: isReply ? '12px' : '20px',
      marginLeft: isReply ? '32px' : '0',
      transition: 'all 0.3s ease',
      position: 'relative'
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
            color: '#000'
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
        {comment.is_meme && comment.meme_url && (
          <div style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: '#0a0a0a',
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <img
              src={comment.meme_url}
              alt="Meme"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '6px',
                marginBottom: comment.meme_caption ? '8px' : '0'
              }}
            />
            {comment.meme_caption && (
              <div style={{
                fontSize: '13px',
                color: '#ffdd00',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                "{comment.meme_caption}"
              </div>
            )}
          </div>
        )}
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

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
          <div>Loading match details...</div>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#2d1b1b',
          border: '1px solid #664444',
          borderRadius: '8px',
          padding: '40px',
          color: '#ff6b6b',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Match not found</div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            The match you're looking for doesn't exist or has been removed.
          </div>
          <a href="/matches" style={{
            display: 'inline-block',
            marginTop: '20px',
            backgroundColor: '#00ff88',
            color: '#000',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Back to Matches
          </a>
        </div>
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

      {/* Main Content */}
      <main style={{ padding: isMobile ? '20px 15px' : '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '30px' }}>
          <a href="/matches" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#888',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Back to Matches
          </a>
        </div>

        {/* Match Header */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: isMobile ? '20px' : '30px',
          marginBottom: isMobile ? '20px' : '30px'
        }}>
          {/* Status and Date */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <div style={{
              color: getStatusColor(match.status),
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: `${getStatusColor(match.status)}15`,
              padding: '6px 12px',
              borderRadius: '6px'
            }}>
              {getStatusText(match.status)}
            </div>
            <div style={{
              color: '#888',
              fontSize: '14px'
            }}>
              {formatDate(match.date)}
            </div>
          </div>

          {/* Teams and Score */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
            gap: isMobile ? '20px' : '40px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Home Team */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              alignItems: 'center',
              gap: '15px',
              justifyContent: isMobile ? 'flex-start' : 'center'
            }}>
              <img 
                src={match.homeTeam.logo} 
                alt={match.homeTeam.name}
                style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '60px' : '80px',
                  borderRadius: '8px',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {match.homeTeam.name}
                </div>
                <div style={{
                  color: '#888',
                  fontSize: '14px'
                }}>
                  Home
                </div>
              </div>
            </div>

            {/* Score */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              order: isMobile ? -1 : 0,
              marginBottom: isMobile ? '20px' : '0'
            }}>
              {match.status === 'ns' ? (
                <div style={{
                  fontSize: '18px',
                  color: '#888'
                }}>
                  VS
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '15px' : '20px',
                  fontSize: isMobile ? '32px' : '48px',
                  fontWeight: 'bold',
                  color: '#00ff88'
                }}>
                  <span>{match.score.home}</span>
                  <span style={{ color: '#888', fontSize: '24px' }}>-</span>
                  <span>{match.score.away}</span>
                </div>
              )}
              
              {match.status === 'ns' && (
                <div style={{
                  color: '#0099ff',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {new Date(match.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'row-reverse' : 'column',
              alignItems: 'center',
              gap: '15px',
              justifyContent: isMobile ? 'flex-end' : 'center',
              textAlign: isMobile ? 'right' : 'center'
            }}>
              <img 
                src={match.awayTeam.logo} 
                alt={match.awayTeam.name}
                style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '60px' : '80px',
                  borderRadius: '8px',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {match.awayTeam.name}
                </div>
                <div style={{
                  color: '#888',
                  fontSize: '14px'
                }}>
                  Away
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Information and Odds Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: isMobile ? '20px' : '30px'
        }}>
          {/* Tournament Info */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#00ff88'
            }}>
              Tournament
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Competition:</span>
                <span>{match.league}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Round:</span>
                <span>{match.round}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Season:</span>
                <span>{match.season}</span>
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#00ff88'
            }}>
              Match Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Venue:</span>
                <span>{match.venue}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Status:</span>
                <span style={{ color: getStatusColor(match.status) }}>
                  {match.statusLong}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Match ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  {match.id}
                </span>
              </div>
            </div>
          </div>

          {/* Betting Odds */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#00ff88'
            }}>
              Betting Odds
            </h3>
            {match.odds ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Home Win:</span>
                  <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{match.odds.home || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Draw:</span>
                  <span style={{ color: '#0099ff', fontWeight: 'bold' }}>{match.odds.draw || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Away Win:</span>
                  <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>{match.odds.away || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎲</div>
                <div>Betting odds not available</div>
              </div>
            )}
          </div>
        </div>

        
        {/* Comments Section */}
        {match && (
          <UniversalComments 
            entityType="match"
            entityId={match.id}
            entityName={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
          />
        )}

        {/* Quick Actions */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: isMobile ? '20px' : '30px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <a href={`/teams/${match.homeTeam.id}`} style={{
            backgroundColor: '#00ff88',
            color: '#000',
            padding: '12px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            View {match.homeTeam.name}
          </a>
          <a href={`/teams/${match.awayTeam.id}`} style={{
            backgroundColor: '#0099ff',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            View {match.awayTeam.name}
          </a>
          <a href="/matches" style={{
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #444',
            padding: '12px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            All Matches
          </a>
        </div>
      </main>
    </div>
  )
}