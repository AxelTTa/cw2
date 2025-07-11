'use client'

import { useState, useEffect } from 'react'
import { MatchService } from '../../backend/services/matchService'
import { CommentService } from '../../backend/services/commentService'
import { ReactionService } from '../../backend/services/reactionService'
import { ProfileService } from '../../backend/services/profileService'
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

  useEffect(() => {
    initializePage()
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
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const profileResult = await ProfileService.getProfile(user.id)
      if (profileResult.success) {
        setUserProfile(profileResult.data)
      }
    }
  }

  const loadMatches = async () => {
    const result = await MatchService.getAllMatches()
    if (result.success) {
      setMatches(result.data)
    }
  }

  const loadComments = async () => {
    if (!selectedMatch) return
    
    setLoading(true)
    const result = await CommentService.getCommentsByMatchId(selectedMatch.id, sortBy)
    if (result.success) {
      setComments(result.data)
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

    const commentData = {
      user_id: user.id,
      match_id: selectedMatch.id,
      parent_id: replyTo,
      content: newComment.trim(),
      comment_type: 'text'
    }

    const result = await CommentService.createComment(commentData)
    if (result.success) {
      setNewComment('')
      setReplyTo(null)
      await loadComments()
      
      // Award XP for posting comment
      if (userProfile) {
        await ProfileService.addXP(user.id, 10)
      }
    }
  }

  const handleUpvote = async (commentId) => {
    if (!user) return
    
    const result = await CommentService.upvoteComment(commentId)
    if (result.success) {
      await loadComments()
    }
  }

  const handleReaction = async (commentId, reactionType) => {
    if (!user) return

    const result = await ReactionService.addReaction(user.id, commentId, reactionType)
    if (result.success) {
      await loadComments()
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

  const signOut = async () => {
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
    <div style={{
      backgroundColor: isReply ? '#0f0f0f' : '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: isReply ? '8px' : '16px',
      marginLeft: isReply ? '32px' : '0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ⬆️ {comment.upvotes || 0}
        </button>
        <button
          onClick={() => handleReaction(comment.id, 'like')}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          👍 {comment.reactions?.filter(r => r.reaction_type === 'like').length || 0}
        </button>
        <button
          onClick={() => handleReaction(comment.id, 'fire')}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '12px'
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00ff88'
        }}>
          Clutch Community
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
          <a href="/stats" style={{ color: '#888', textDecoration: 'none' }}>Stats</a>
          <a href="/teams" style={{ color: '#888', textDecoration: 'none' }}>Teams</a>
          <a href="/community" style={{ color: '#ffffff', textDecoration: 'none' }}>Community</a>
        </nav>
      </header>

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* User Profile Section */}
        {userProfile && (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
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
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#00ff88', marginBottom: '20px' }}>
            🔥 Select a Match to Join the Discussion
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '16px'
          }}>
            {matches.map(match => (
              <div
                key={match.id}
                onClick={() => handleMatchSelect(match)}
                style={{
                  backgroundColor: selectedMatch?.id === match.id ? '#2a2a2a' : '#111',
                  border: `1px solid ${selectedMatch?.id === match.id ? '#00ff88' : '#333'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {match.home_team} vs {match.away_team}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: getMatchStatusColor(match.status),
                    color: '#000',
                    fontWeight: 'bold'
                  }}>
                    {match.status}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {match.league} • {formatTime(match.match_date)}
                  </div>
                  {match.status === 'live' && (
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#00ff88'
                    }}>
                      {match.home_score} - {match.away_score}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discussion Section */}
        {selectedMatch && (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px'
          }}>
            {/* Match Header */}
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h2 style={{ color: '#00ff88', margin: 0 }}>
                  {selectedMatch.home_team} vs {selectedMatch.away_team}
                </h2>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: getMatchStatusColor(selectedMatch.status)
                }}>
                  {selectedMatch.status === 'live' ? 
                    `${selectedMatch.home_score} - ${selectedMatch.away_score}` : 
                    selectedMatch.status}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                {selectedMatch.league} • {formatTime(selectedMatch.match_date)}
              </div>
            </div>

            {/* Discussion Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#ffffff', margin: 0 }}>
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
                  <button
                    onClick={signIn}
                    style={{
                      backgroundColor: '#00ff88',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      color: '#000',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Sign In to Comment
                  </button>
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
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div>
                {comments.map(comment => (
                  <CommentComponent key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}