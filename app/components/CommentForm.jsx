'use client'

import { useState } from 'react'
import MemeSelector from './MemeSelector'

export default function CommentForm({ onSubmit, placeholder = "Share your thoughts..." }) {
  const [content, setContent] = useState('')
  const [selectedMeme, setSelectedMeme] = useState(null)
  const [memeCaption, setMemeCaption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim() && !selectedMeme) {
      return
    }

    setIsSubmitting(true)

    try {
      const commentData = {
        content: content.trim(),
        is_meme: !!selectedMeme,
        meme_url: selectedMeme?.template_url || null,
        meme_caption: selectedMeme ? memeCaption : null,
        comment_type: selectedMeme ? 'meme' : 'text'
      }

      await onSubmit(commentData)
      
      // Reset form
      setContent('')
      setSelectedMeme(null)
      setMemeCaption('')
    } catch (error) {
      console.error('Error submitting comment:', error)
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
        <MemeSelector 
          onMemeSelect={setSelectedMeme}
          selectedMeme={selectedMeme}
        />

        <button
          type="submit"
          disabled={isSubmitting || (!content.trim() && !selectedMeme)}
          style={{
            backgroundColor: (!content.trim() && !selectedMeme) ? '#666' : '#00ff88',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            color: '#000000',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: (!content.trim() && !selectedMeme) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}