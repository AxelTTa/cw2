'use client'

import { useState, useEffect } from 'react'
import GoogleAuth from './GoogleAuth'
import MemeSelector from './MemeSelector'

export default function UniversalComments({ entityType, entityId, entityName }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const [commentType, setCommentType] = useState('text')
  const [selectedMeme, setSelectedMeme] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    getCurrentUser()
    loadComments()
  }, [entityType, entityId, sortBy])

  const getCurrentUser = async () => {
    // Check localStorage for user data
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      return
    }
  }

  const loadComments = async () => {
    if (!entityId) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/comments?entity_type=${entityType}&entity_id=${entityId}&sort_by=${sortBy}&limit=100`)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments || [])
      } else {
        setError(data.error || 'Failed to load comments')
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      setError('Failed to load comments')
    }
    setLoading(false)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user || (!newComment.trim() && !selectedMeme && !imageUrl)) return

    try {
      const commentData = {
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        parent_id: replyTo,
        content: newComment.trim(),
        comment_type: commentType
      }

      // Add meme data if selected
      if (selectedMeme) {
        commentData.is_meme = true
        commentData.meme_url = selectedMeme.template_url
        commentData.meme_caption = newComment.trim() || selectedMeme.caption
        commentData.comment_type = 'meme'
      }

      // Add image data if provided
      if (imageUrl) {
        commentData.image_url = imageUrl
        commentData.comment_type = 'image'
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      })

      const data = await response.json()
      if (data.success) {
        setNewComment('')
        setReplyTo(null)
        setCommentType('text')
        setSelectedMeme(null)
        setImageUrl('')
        await loadComments()
      } else {
        setError(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      setError('Failed to post comment')
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

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem('user_profile', JSON.stringify(userData))
  }

  const handleAuthError = (error) => {
    console.error('Auth error:', error)
    setError('Authentication failed')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getEntityIcon = (type) => {
    switch (type) {
      case 'player': return '⚽'
      case 'team': return '🏟️'
      case 'competition': return '🏆'
      case 'match': return '⚡'
      default: return '💬'
    }
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

      {/* Content */}
      <div style={{
        color: '#ffffff',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '12px'
      }}>
        {comment.content}
      </div>

      {/* Meme content */}
      {comment.is_meme && comment.meme_url && (
        <div style={{
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          <img 
            src={comment.meme_url} 
            alt={comment.meme_caption || 'Meme'}
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px'
            }}
          />
          {comment.meme_caption && (
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#888',
              fontStyle: 'italic'
            }}>
              {comment.meme_caption}
            </div>
          )}
        </div>
      )}

      {/* Image content */}
      {comment.image_url && (
        <div style={{
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          <img 
            src={comment.image_url} 
            alt="User uploaded image"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
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
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#333'
            e.target.style.color = '#888'
            e.target.style.backgroundColor = 'transparent'
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

      {/* Replies */}
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
      backgroundColor: '#1a1a1a',
      border: '2px solid #333',
      borderRadius: '16px',
      padding: '25px',
      marginTop: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #333'
      }}>
        <h3 style={{ 
          color: '#00ff88', 
          margin: 0,
          fontSize: '22px',
          fontWeight: 'bold'
        }}>
          {getEntityIcon(entityType)} {entityName} Discussion ({comments.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

      {/* Error display */}
      {error && (
        <div style={{
          backgroundColor: '#2d1b1b',
          border: '1px solid #664444',
          borderRadius: '8px',
          padding: '15px',
          color: '#ff6b6b',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} style={{ marginBottom: '20px' }}>
          {/* Comment Type Selector */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <button
              type="button"
              onClick={() => {
                setCommentType('text')
                setSelectedMeme(null)
                setImageUrl('')
              }}
              style={{
                backgroundColor: commentType === 'text' ? '#00ff88' : '#333',
                color: commentType === 'text' ? '#000' : '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              💬 Text
            </button>
            <button
              type="button"
              onClick={() => setCommentType('meme')}
              style={{
                backgroundColor: commentType === 'meme' ? '#ff6b35' : '#333',
                color: commentType === 'meme' ? '#000' : '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              😂 Meme
            </button>
            <button
              type="button"
              onClick={() => setCommentType('image')}
              style={{
                backgroundColor: commentType === 'image' ? '#0099ff' : '#333',
                color: commentType === 'image' ? '#000' : '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🖼️ Image
            </button>
          </div>

          {/* Meme Selector */}
          {commentType === 'meme' && (
            <div style={{ marginBottom: '15px' }}>
              <MemeSelector onMemeSelect={setSelectedMeme} />
              {selectedMeme && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px'
                }}>
                  <img 
                    src={selectedMeme.url} 
                    alt={selectedMeme.caption}
                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                    {selectedMeme.caption}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image URL Input */}
          {commentType === 'image' && (
            <div style={{ marginBottom: '15px' }}>
              <input
                type="url"
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
              {imageUrl && (
                <div style={{
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  <img 
                    src={imageUrl} 
                    alt="Preview"
                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Reply indicator */}
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

          {/* Comment Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                commentType === 'meme' ? 'Add a caption for your meme...' :
                commentType === 'image' ? 'Add a description for your image...' :
                `Share your thoughts about this ${entityType}...`
              }
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
              disabled={!newComment.trim() && !selectedMeme && !imageUrl}
              style={{
                backgroundColor: (newComment.trim() || selectedMeme || imageUrl) ? '#00ff88' : '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                color: (newComment.trim() || selectedMeme || imageUrl) ? '#000' : '#666',
                fontSize: '14px',
                cursor: (newComment.trim() || selectedMeme || imageUrl) ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              Post (+{commentType === 'meme' || commentType === 'image' ? '15' : '10'} XP)
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
          <div style={{ 
            fontSize: '32px', 
            marginBottom: '15px'
          }}>💬</div>
          <div style={{ fontSize: '18px' }}>
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
            marginBottom: '20px'
          }}>🎯</div>
          <div style={{ fontSize: '20px', marginBottom: '10px', color: '#fff' }}>
            No comments yet!
          </div>
          <div style={{ fontSize: '16px' }}>
            Be the first to share your thoughts about this {entityType}!
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
  )
}