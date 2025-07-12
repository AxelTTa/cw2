'use client'

import { useState } from 'react'

export default function CommentCard({ comment, onUpvote, onDownvote, onReply }) {
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [isDownvoted, setIsDownvoted] = useState(false)

  const handleUpvote = async () => {
    if (isUpvoted) return
    
    try {
      await onUpvote(comment.id)
      setIsUpvoted(true)
      setIsDownvoted(false)
    } catch (error) {
      console.error('Error upvoting comment:', error)
    }
  }

  const handleDownvote = async () => {
    if (isDownvoted) return
    
    try {
      await onDownvote(comment.id)
      setIsDownvoted(true)
      setIsUpvoted(false)
    } catch (error) {
      console.error('Error downvoting comment:', error)
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

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.2s ease',
      willChange: 'transform, box-shadow',
      transform: 'translateZ(0)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px) translateZ(0)'
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
      e.currentTarget.style.borderColor = '#555'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) translateZ(0)'
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.borderColor = '#333'
    }}
    >
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

      {/* Image/Video content */}
      {comment.image_url && (
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          {comment.image_url.includes('.mp4') || comment.image_url.includes('.webm') || comment.image_url.includes('.ogg') ? (
            <video
              src={comment.image_url}
              controls
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '4px'
              }}
            />
          ) : (
            <img
              src={comment.image_url}
              alt="Uploaded content"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '4px'
              }}
            />
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

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '12px'
      }}>
        <button
          onClick={handleUpvote}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: isUpvoted ? '#00ff88' : '#888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ⬆️ {comment.upvotes || 0}
        </button>

        <button
          onClick={handleDownvote}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: isDownvoted ? '#ff4444' : '#888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ⬇️ {comment.downvotes || 0}
        </button>

        <button
          onClick={() => onReply(comment)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          💬 Reply
        </button>

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

        {comment.image_url && !comment.is_meme && (
          <div style={{
            backgroundColor: '#ff6b35',
            color: '#ffffff',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {comment.image_url.includes('.mp4') || comment.image_url.includes('.webm') || comment.image_url.includes('.ogg') ? 'VIDEO' : 'IMAGE'}
          </div>
        )}
      </div>
    </div>
  )
}