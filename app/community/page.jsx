'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function MatchDiscussion({ matchId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [matches, setMatches] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    getUser()
    getMatches()
  }, [])

  useEffect(() => {
    if (matchId) {
      getComments()
      getMatchDetails()
    }
  }, [matchId, sortBy])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const getMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false })
      .limit(10)

    if (data) setMatches(data)
  }

  const getMatchDetails = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (data) setSelectedMatch(data)
  }

  const getComments = async () => {
    setLoading(true)
    const orderBy = sortBy === 'popular' ? 'upvotes' : 'created_at'
    const ascending = sortBy === 'oldest'

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          username,
          display_name,
          avatar_url,
          level,
          xp
        ),
        reactions (
          id,
          user_id,
          reaction_type
        )
      `)
      .eq('match_id', matchId)
      .is('parent_id', null)
      .order(orderBy, { ascending })

    if (data) {
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url,
                level,
                xp
              ),
              reactions (
                id,
                user_id,
                reaction_type
              )
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true })

          return { ...comment, replies: replies || [] }
        })
      )
      setComments(commentsWithReplies)
    }
    setLoading(false)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          user_id: user.id,
          match_id: matchId,
          parent_id: replyTo,
          content: newComment.trim(),
          comment_type: 'text'
        }
      ])

    if (!error) {
      setNewComment('')
      setReplyTo(null)
      getComments()
    }
  }

  const handleReaction = async (commentId, reactionType) => {
    if (!user) return

    const existingReaction = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .eq('reaction_type', reactionType)
      .single()

    if (existingReaction.data) {
      await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.data.id)
    } else {
      await supabase
        .from('reactions')
        .insert([
          {
            user_id: user.id,
            comment_id: commentId,
            reaction_type: reactionType
          }
        ])
    }

    getComments()
  }

  const handleUpvote = async (commentId) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    const { error } = await supabase
      .from('comments')
      .update({ upvotes: comment.upvotes + 1 })
      .eq('id', commentId)

    if (!error) {
      getComments()
    }
  }

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
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
          ⬆️ {comment.upvotes}
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

  if (!matchId) {
    return (
      <div style={{
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#00ff88' }}>🔥 Live Match Discussions</h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>
          Select a match to join the discussion and earn XP for your contributions!
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {matches.map(match => (
            <div
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#00ff88'}
              onMouseLeave={(e) => e.target.style.borderColor = '#333'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {match.home_team} vs {match.away_team}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {match.league} • {formatTime(match.match_date)}
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: match.status === 'live' ? '#00ff88' : '#888'
                }}>
                  {match.status === 'live' ? `${match.home_score} - ${match.away_score}` : match.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #333',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {selectedMatch && (
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
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
              color: selectedMatch.status === 'live' ? '#00ff88' : '#888'
            }}>
              {selectedMatch.status === 'live' ? `${selectedMatch.home_score} - ${selectedMatch.away_score}` : selectedMatch.status}
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            {selectedMatch.league} • {formatTime(selectedMatch.match_date)}
          </div>
        </div>
      )}

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
              backgroundColor: '#1a1a1a',
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
          {user ? (
            <button
              onClick={signOut}
              style={{
                backgroundColor: '#ff4444',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#ffffff',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          ) : (
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
              Sign In
            </button>
          )}
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmitComment} style={{ marginBottom: '20px' }}>
          {replyTo && (
            <div style={{
              backgroundColor: '#1a1a1a',
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
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                color: '#ffffff',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '60px'
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
              Post
            </button>
          </div>
        </form>
      )}

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
  )
}