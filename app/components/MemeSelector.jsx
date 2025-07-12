'use client'

import { useState, useEffect } from 'react'

export default function MemeSelector({ onMemeSelect, selectedMeme }) {
  const [memes, setMemes] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const popularMemeTemplates = [
    {
      id: 'drake-pointing',
      title: 'Drake Pointing',
      template_url: 'https://i.imgflip.com/30b1gx.jpg',
      category: 'reaction'
    },
    {
      id: 'two-buttons',
      title: 'Two Buttons',
      template_url: 'https://i.imgflip.com/1g8my4.jpg',
      category: 'choice'
    },
    {
      id: 'distracted-boyfriend',
      title: 'Distracted Boyfriend',
      template_url: 'https://i.imgflip.com/1ur9b0.jpg',
      category: 'reaction'
    },
    {
      id: 'change-my-mind',
      title: 'Change My Mind',
      template_url: 'https://i.imgflip.com/24y43o.jpg',
      category: 'opinion'
    },
    {
      id: 'surprised-pikachu',
      title: 'Surprised Pikachu',
      template_url: 'https://i.imgflip.com/2kbn1e.jpg',
      category: 'reaction'
    },
    {
      id: 'expanding-brain',
      title: 'Expanding Brain',
      template_url: 'https://i.imgflip.com/1jwhww.jpg',
      category: 'progression'
    },
    {
      id: 'this-is-fine',
      title: 'This Is Fine',
      template_url: 'https://i.imgflip.com/26am.jpg',
      category: 'reaction'
    },
    {
      id: 'woman-yelling-cat',
      title: 'Woman Yelling at Cat',
      template_url: 'https://i.imgflip.com/345v97.jpg',
      category: 'reaction'
    },
    {
      id: 'mock-spongebob',
      title: 'Mocking SpongeBob',
      template_url: 'https://i.imgflip.com/1otk96.jpg',
      category: 'reaction'
    },
    {
      id: 'galaxy-brain',
      title: 'Galaxy Brain',
      template_url: 'https://i.imgflip.com/1jwhww.jpg',
      category: 'progression'
    },
    {
      id: 'always-has-been',
      title: 'Always Has Been',
      template_url: 'https://i.imgflip.com/3lmzyx.jpg',
      category: 'revelation'
    },
    {
      id: 'crying-jordan',
      title: 'Crying Jordan',
      template_url: 'https://i.imgflip.com/9ehk.jpg',
      category: 'sports'
    },
    {
      id: 'first-time',
      title: 'First Time?',
      template_url: 'https://i.imgflip.com/2fm6x.jpg',
      category: 'reaction'
    },
    {
      id: 'stonks',
      title: 'Stonks',
      template_url: 'https://i.imgflip.com/2lnala.jpg',
      category: 'success'
    },
    {
      id: 'leonardo-dicaprio',
      title: 'Leonardo DiCaprio',
      template_url: 'https://i.imgflip.com/2823jx.jpg',
      category: 'pointing'
    }
  ]

  const categories = [
    { id: 'all', name: 'All', emoji: '🎭' },
    { id: 'reaction', name: 'Reactions', emoji: '😱' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'choice', name: 'Choices', emoji: '🤔' },
    { id: 'opinion', name: 'Opinions', emoji: '💭' },
    { id: 'progression', name: 'Progression', emoji: '📈' },
    { id: 'success', name: 'Success', emoji: '🚀' }
  ]

  useEffect(() => {
    fetchMemes()
  }, [])

  const fetchMemes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/memes')
      if (response.ok) {
        const data = await response.json()
        const dbMemes = data.memes || []
        const allMemes = [...popularMemeTemplates, ...dbMemes]
        setMemes(allMemes)
      } else {
        setMemes(popularMemeTemplates)
      }
    } catch (error) {
      console.error('Error fetching memes:', error)
      setMemes(popularMemeTemplates)
    } finally {
      setLoading(false)
    }
  }

  const filteredMemes = selectedCategory === 'all' 
    ? memes 
    : memes.filter(meme => meme.category === selectedCategory)

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
          maxHeight: '400px',
          overflowY: 'auto',
          minWidth: '350px'
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
              
              {/* Category Filter */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                marginBottom: '12px'
              }}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      backgroundColor: selectedCategory === category.id ? '#00ff88' : '#333',
                      color: selectedCategory === category.id ? '#000' : '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    {category.emoji} {category.name}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '8px'
              }}>
                {filteredMemes.map((meme) => (
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
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMeme?.id !== meme.id) {
                        e.target.style.backgroundColor = '#444'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMeme?.id !== meme.id) {
                        e.target.style.backgroundColor = '#333'
                      }
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
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {meme.title}
                    </span>
                  </button>
                ))}
              </div>
              
              {filteredMemes.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: '#888',
                  padding: '20px',
                  fontSize: '12px'
                }}>
                  No memes found in this category
                </div>
              )}
              
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