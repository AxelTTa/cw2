'use client'

import { useState, useEffect } from 'react'
import CommentCard from './CommentCard'
import CommentForm from './CommentForm'

export default function PublicComments({ matchId = null, showForm = true }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchComments()
    
    // Check if user is logged in
    const userData = localStorage.getItem('user_profile')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [matchId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const url = matchId 
        ? `/api/comments?match_id=${matchId}&limit=100` 
        : '/api/comments?limit=100'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.comments)
      } else {
        setError('Failed to load comments')
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (commentData) => {
    if (!user) {
      alert('Please log in to post comments')
      return
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...commentData,
          user_id: user.id,
          match_id: matchId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Add new comment to the top of the list
        setComments([data.comment, ...comments])
      } else {
        alert('Failed to post comment: ' + data.error)
      }
    } catch (err) {
      console.error('Error posting comment:', err)
      alert('Failed to post comment')
    }
  }

  const handleUpvote = async (commentId) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: 'upvote',
          user_id: user?.id
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update comment in the list
        setComments(comments.map(comment => 
          comment.id === commentId ? data.comment : comment
        ))
      }
    } catch (err) {
      console.error('Error upvoting comment:', err)
    }
  }

  const handleDownvote = async (commentId) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: 'downvote',
          user_id: user?.id
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update comment in the list
        setComments(comments.map(comment => 
          comment.id === commentId ? data.comment : comment
        ))
      }
    } catch (err) {
      console.error('Error downvoting comment:', err)
    }
  }

  const handleReply = (comment) => {
    // For now, just scroll to the comment form
    // In the future, we can implement threaded replies
    console.log('Reply to comment:', comment.id)
  }

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#888'
      }}>
        Loading comments...
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h2 style={{
        color: '#ffffff',
        fontSize: '24px',
        marginBottom: '20px'
      }}>
        💬 Community Discussion
      </h2>

      {/* Comment Form - Show even if not logged in */}
      {showForm && (
        <div>
          {user ? (
            <CommentForm
              onSubmit={handleSubmitComment}
              placeholder="Share your thoughts, reactions, or memes..."
            />
          ) : (
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#888', marginBottom: '16px' }}>
                Want to join the discussion? Post comments and memes!
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                style={{
                  backgroundColor: '#00ff88',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Sign in to Comment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comments List */}
      <div>
        {error && (
          <div style={{
            backgroundColor: '#ff4444',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {comments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p>No comments yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          <div>
            <div style={{
              color: '#888',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </div>
            
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={{
                  ...comment,
                  user: comment.profiles
                }}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}