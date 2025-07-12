'use client'

import { useState, useEffect } from 'react'
import GoogleAuth from './GoogleAuth'
import MemeSelector from './MemeSelector'
import CommentCard from './CommentCard'

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
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [userVotes, setUserVotes] = useState({})

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    loadComments()
  }, [entityType, entityId, sortBy, user])

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
    if (!entityId) {
      console.warn('loadComments called without entityId:', { entityType, entityId })
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/comments', window.location.origin)
      url.searchParams.set('entity_type', entityType)
      url.searchParams.set('entity_id', entityId)
      url.searchParams.set('sort_by', sortBy)
      url.searchParams.set('limit', '100')
      if (user?.id) {
        url.searchParams.set('user_id', user.id)
      }

      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments || [])
        setUserVotes(data.user_votes || {})
      } else {
        setError(data.error || 'Failed to load comments')
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      setError('Failed to load comments')
    }
    setLoading(false)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
    if (!allowedTypes.includes(file.type)) {
      setError('Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG) are allowed')
      return
    }

    setSelectedFile(file)
    setImageUrl('') // Clear manual URL input
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setFilePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user || (!newComment.trim() && !selectedMeme && !imageUrl && !selectedFile)) return

    if (!entityId) {
      setError('Entity ID is missing. Please refresh the page and try again.')
      return
    }

    try {
      let uploadedFileUrl = null
      
      // Upload file if selected
      if (selectedFile) {
        uploadedFileUrl = await uploadFile(selectedFile)
      }

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
        commentData.meme_caption = newComment.trim() || selectedMeme.title
        commentData.comment_type = 'meme'
      }

      // Add image data if provided (either upload or URL)
      if (uploadedFileUrl || imageUrl) {
        commentData.image_url = uploadedFileUrl || imageUrl
        commentData.comment_type = selectedMeme ? 'meme' : (uploadedFileUrl && uploadedFileUrl.includes('.mp4') || uploadedFileUrl && uploadedFileUrl.includes('.webm') || uploadedFileUrl && uploadedFileUrl.includes('.ogg') ? 'video' : 'image')
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
        setSelectedFile(null)
        setFilePreview(null)
        await loadComments()
      } else {
        setError(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      setError('Failed to post comment')
    }
  }

  const handleUpvote = async (commentId, isRemoving = false) => {
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

  const handleDownvote = async (commentId, isRemoving = false) => {
    if (!user) return
    
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: 'downvote',
          user_id: user.id
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadComments()
      }
    } catch (error) {
      console.error('Error downvoting comment:', error)
    }
  }

  const handleReply = async (parentId, content) => {
    if (!user || !content.trim()) return

    if (!entityId) {
      setError('Entity ID is missing. Please refresh the page and try again.')
      return
    }

    try {
      const commentData = {
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        parent_id: parentId,
        content: content.trim(),
        comment_type: 'text'
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
        await loadComments()
      } else {
        setError(data.error || 'Failed to post reply')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      setError('Failed to post reply')
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
          {getEntityIcon(entityType)} {entityName || 'Unknown'} Discussion ({comments.length})
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
              onClick={() => {
                setCommentType('image')
                setSelectedMeme(null)
              }}
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
            <button
              type="button"
              onClick={() => {
                setCommentType('video')
                setSelectedMeme(null)
                setImageUrl('')
              }}
              style={{
                backgroundColor: commentType === 'video' ? '#ff4444' : '#333',
                color: commentType === 'video' ? '#000' : '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🎥 Video
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
                    src={selectedMeme.template_url} 
                    alt={selectedMeme.title}
                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                    {selectedMeme.title}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Upload for Images and Videos */}
          {(commentType === 'image' || commentType === 'video') && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="file"
                    accept={commentType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    style={{
                      backgroundColor: selectedFile ? '#00ff88' : '#444',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    📎 {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : `Upload ${commentType === 'image' ? 'Image' : 'Video'}`}
                  </label>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={removeFile}
                    style={{
                      backgroundColor: '#ff4444',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div style={{ 
                fontSize: '12px', 
                color: '#888', 
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                OR
              </div>
              
              <input
                type="url"
                placeholder={`Enter ${commentType} URL...`}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  if (e.target.value) {
                    setSelectedFile(null)
                    setFilePreview(null)
                  }
                }}
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
              
              {/* File Preview */}
              {selectedFile && filePreview && (
                <div style={{
                  marginTop: '10px',
                  textAlign: 'center',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px'
                }}>
                  {selectedFile.type.startsWith('image/') ? (
                    <img 
                      src={filePreview} 
                      alt="Preview"
                      style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                    />
                  ) : (
                    <video
                      src={filePreview}
                      style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                      controls
                    />
                  )}
                </div>
              )}
              
              {/* URL Preview */}
              {imageUrl && !selectedFile && (
                <div style={{
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  {imageUrl.includes('.mp4') || imageUrl.includes('.webm') || imageUrl.includes('.ogg') ? (
                    <video
                      src={imageUrl}
                      style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                      controls
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <img 
                      src={imageUrl} 
                      alt="Preview"
                      style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
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
                commentType === 'video' ? 'Add a description for your video...' :
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
              disabled={uploading || (!newComment.trim() && !selectedMeme && !imageUrl && !selectedFile)}
              style={{
                backgroundColor: uploading ? '#666' : ((newComment.trim() || selectedMeme || imageUrl || selectedFile) ? '#00ff88' : '#333'),
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                color: uploading ? '#888' : ((newComment.trim() || selectedMeme || imageUrl || selectedFile) ? '#000' : '#666'),
                fontSize: '14px',
                cursor: uploading ? 'not-allowed' : ((newComment.trim() || selectedMeme || imageUrl || selectedFile) ? 'pointer' : 'not-allowed'),
                fontWeight: 'bold'
              }}
            >
              {uploading ? 'Uploading...' : `Post (+${commentType === 'meme' || commentType === 'image' || commentType === 'video' ? '15' : '10'} XP)`}
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
              <CommentCard 
                comment={comment}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                onReply={handleReply}
                currentUser={user}
                depth={0}
                userVotes={userVotes}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}