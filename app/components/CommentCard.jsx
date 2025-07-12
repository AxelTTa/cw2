'use client'

import { useState, useEffect } from 'react'

export default function CommentCard({ 
  comment, 
  onUpvote, 
  onDownvote, 
  onReply, 
  currentUser,
  depth = 0,
  userVotes = {} 
}) {
  const [userVote, setUserVote] = useState(userVotes[comment.id] || null) // null, 'upvote', 'downvote'
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const handleVote = async (voteType) => {
    if (!currentUser) return
    
    try {
      const isRemoving = userVote === voteType
      const newVote = isRemoving ? null : voteType
      
      if (voteType === 'upvote') {
        await onUpvote(comment.id, isRemoving)
      } else {
        await onDownvote(comment.id, isRemoving)
      }
      
      setUserVote(newVote)
    } catch (error) {
      console.error(`Error ${voteType}ing comment:`, error)
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyContent.trim() || !currentUser) return

    setIsSubmittingReply(true)
    try {
      await onReply(comment.id, replyContent.trim())
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const commentTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now - commentTime) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const maxDepth = 6
  const isDeepNested = depth >= maxDepth
  const indentSize = Math.min(depth, maxDepth) * 16
  
  return (
    <div style={{
      marginLeft: `${indentSize}px`,
      marginBottom: '8px'
    }}>
      {/* Reddit-style thread line */}
      {depth > 0 && (
        <div style={{
          position: 'absolute',
          left: `${indentSize - 8}px`,
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: '#333',
          zIndex: 1
        }} />
      )}
      
      <div style={{
        backgroundColor: depth % 2 === 0 ? '#1a1a1a' : '#171717',
        border: `1px solid ${depth > 0 ? '#2a2a2a' : '#333'}`,
        borderRadius: depth > 0 ? '4px' : '8px',
        padding: depth > 0 ? '12px' : '16px',
        position: 'relative',
        borderLeft: depth > 0 ? '3px solid #00ff88' : '1px solid #333'
      }}>
      {/* User info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
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
          {comment.profiles?.display_name?.[0]?.toUpperCase() || 
           comment.user?.display_name?.[0]?.toUpperCase() || 
           '?'}
        </div>
        <div>
          <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
            {comment.profiles?.display_name || 
             comment.user?.display_name || 
             'Anonymous User'}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            @{comment.profiles?.username || 
              comment.user?.username || 
              'anonymous'} • {formatTimeAgo(comment.created_at)}
            {(comment.profiles?.level || comment.user?.level) && (
              <span style={{ color: '#00ff88', marginLeft: '8px' }}>
                Level {comment.profiles?.level || comment.user?.level}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meme content */}
      {comment.is_meme && comment.meme_url && (
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          <img
            src={comment.meme_url}
            alt="Meme"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '4px',
              marginBottom: comment.meme_caption ? '8px' : '0'
            }}
          />
          {comment.meme_caption && (
            <div style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {comment.meme_caption}
            </div>
          )}
        </div>
      )}

      {/* Text content */}
      {comment.content && (
        <div style={{
          color: '#ffffff',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '12px'
        }}>
          {comment.content}
        </div>
      )}

        {/* Reddit-style Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          marginTop: '8px'
        }}>
          {/* Vote Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#2a2a2a',
            borderRadius: '16px',
            padding: '4px 8px'
          }}>
            <button
              onClick={() => handleVote('upvote')}
              disabled={!currentUser}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: userVote === 'upvote' ? '#ff6b35' : '#888',
                cursor: currentUser ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                padding: '2px 4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              title={userVote === 'upvote' ? 'Remove upvote' : 'Upvote'}
            >
              ▲
            </button>
            
            <span style={{
              color: '#fff',
              fontWeight: 'bold',
              minWidth: '20px',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              {((comment.upvotes || 0) - (comment.downvotes || 0))}
            </span>
            
            <button
              onClick={() => handleVote('downvote')}
              disabled={!currentUser}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: userVote === 'downvote' ? '#6666ff' : '#888',
                cursor: currentUser ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                padding: '2px 4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              title={userVote === 'downvote' ? 'Remove downvote' : 'Downvote'}
            >
              ▼
            </button>
          </div>

          {/* Reply Button */}
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            disabled={!currentUser}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: showReplyForm ? '#00ff88' : '#888',
              cursor: currentUser ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: '500',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            💬 Reply
          </button>

          {/* Time ago and other info */}
          <span style={{ color: '#666', fontSize: '11px' }}>
            {formatTimeAgo(comment.created_at)}
          </span>

          {comment.is_meme && (
            <div style={{
              backgroundColor: '#00ff88',
              color: '#000000',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              MEME
            </div>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && currentUser && (
          <form onSubmit={handleReplySubmit} style={{
            marginTop: '12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              style={{
                width: '100%',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '8px',
                color: '#ffffff',
                fontSize: '13px',
                resize: 'vertical',
                marginBottom: '8px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #666',
                  color: '#888',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim() || isSubmittingReply}
                style={{
                  backgroundColor: replyContent.trim() ? '#00ff88' : '#666',
                  border: 'none',
                  color: replyContent.trim() ? '#000' : '#888',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: replyContent.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                {isSubmittingReply ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {comment.replies.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
                onUpvote={onUpvote}
                onDownvote={onDownvote}
                onReply={onReply}
                currentUser={currentUser}
                depth={depth + 1}
                userVotes={userVotes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}