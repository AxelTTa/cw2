'use client'

import { useState, useEffect } from 'react'

export default function MemeSelector({ onMemeSelect, selectedMeme }) {
  const [memes, setMemes] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMemes()
  }, [])

  const fetchMemes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/memes')
      if (response.ok) {
        const data = await response.json()
        setMemes(data.memes || [])
      }
    } catch (error) {
      console.error('Error fetching memes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemeSelect = (meme) => {
    onMemeSelect(meme)
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: selectedMeme ? '#00ff88' : '#333',
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
        🎭 {selectedMeme ? 'Meme Selected' : 'Add Meme'}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '12px',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
              Loading memes...
            </div>
          ) : (
            <>
              <div style={{ 
                marginBottom: '12px', 
                fontSize: '12px', 
                color: '#888' 
              }}>
                Select a meme template:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '8px'
              }}>
                {memes.map((meme) => (
                  <button
                    key={meme.id}
                    onClick={() => handleMemeSelect(meme)}
                    style={{
                      backgroundColor: selectedMeme?.id === meme.id ? '#00ff88' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <img
                      src={meme.template_url}
                      alt={meme.title}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <span style={{
                      fontSize: '10px',
                      color: '#ffffff',
                      textAlign: 'center'
                    }}>
                      {meme.title}
                    </span>
                  </button>
                ))}
              </div>
              {selectedMeme && (
                <button
                  onClick={() => handleMemeSelect(null)}
                  style={{
                    backgroundColor: '#666',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  Remove Meme
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}