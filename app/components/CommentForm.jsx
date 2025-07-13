'use client'

import { useState } from 'react'
import MemeSelector from './MemeSelector'

export default function CommentForm({ onSubmit, placeholder = "Share your thoughts..." }) {
  const [content, setContent] = useState('')
  const [selectedMeme, setSelectedMeme] = useState(null)
  const [memeCaption, setMemeCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG) are allowed')
      return
    }

    setSelectedFile(file)
    
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim() && !selectedMeme && !selectedFile) {
      return
    }

    setIsSubmitting(true)

    try {
      let uploadedFileUrl = null
      
      // Upload file if selected
      if (selectedFile) {
        uploadedFileUrl = await uploadFile(selectedFile)
      }

      const commentData = {
        content: content.trim(),
        is_meme: !!selectedMeme,
        meme_url: selectedMeme?.template_url || null,
        meme_caption: selectedMeme ? memeCaption : null,
        image_url: uploadedFileUrl,
        comment_type: selectedMeme ? 'meme' : (uploadedFileUrl ? 'media' : 'text')
      }

      await onSubmit(commentData)
      
      // Trigger XP refresh event
      window.dispatchEvent(new CustomEvent('commentPosted', { 
        detail: { commentData } 
      }))
      
      // Reset form
      setContent('')
      setSelectedMeme(null)
      setMemeCaption('')
      setSelectedFile(null)
      setFilePreview(null)
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      {selectedMeme && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          backgroundColor: '#2a2a2a',
          borderRadius: '6px',
          border: '1px solid #444'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <img
              src={selectedMeme.template_url}
              alt={selectedMeme.title}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
            <div>
              <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                {selectedMeme.title}
              </div>
              <div style={{ color: '#888', fontSize: '12px' }}>
                Meme Template
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="Add a caption for your meme..."
            value={memeCaption}
            onChange={(e) => setMemeCaption(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#333',
              border: '1px solid #555',
              borderRadius: '4px',
              padding: '8px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          />
        </div>
      )}

      {/* File Preview */}
      {selectedFile && filePreview && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          backgroundColor: '#2a2a2a',
          borderRadius: '6px',
          border: '1px solid #444'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            {selectedFile.type.startsWith('image/') ? (
              <img
                src={filePreview}
                alt="Preview"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <video
                src={filePreview}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
                controls
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
                {selectedFile.name}
              </div>
              <div style={{ color: '#888', fontSize: '12px' }}>
                {selectedFile.type} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <button
                type="button"
                onClick={removeFile}
                style={{
                  backgroundColor: '#ff4444',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={selectedMeme ? "Add text to go with your meme..." : placeholder}
        rows={4}
        style={{
          width: '100%',
          backgroundColor: '#333',
          border: '1px solid #555',
          borderRadius: '6px',
          padding: '12px',
          color: '#ffffff',
          fontSize: '14px',
          resize: 'vertical',
          marginBottom: '12px'
        }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <MemeSelector 
            onMemeSelect={setSelectedMeme}
            selectedMeme={selectedMeme}
          />
          
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                backgroundColor: selectedFile ? '#00ff88' : '#333',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📎 {selectedFile ? 'File Selected' : 'Add Photo/Video'}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || uploading || (!content.trim() && !selectedMeme && !selectedFile)}
          style={{
            backgroundColor: (isSubmitting || uploading || (!content.trim() && !selectedMeme && !selectedFile)) ? '#666' : '#00ff88',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            color: '#000000',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: (isSubmitting || uploading || (!content.trim() && !selectedMeme && !selectedFile)) ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : (isSubmitting ? 'Posting...' : 'Post Comment')}
        </button>
      </div>
    </form>
  )
}