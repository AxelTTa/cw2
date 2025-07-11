'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function SimpleAuth({ onAuthSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        setMessage('Check your email for verification link!')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        if (onAuthSuccess) onAuthSuccess(data.user)
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h3 style={{ color: '#00ff88', marginBottom: '20px' }}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              backgroundColor: '#2a2a2a',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '10px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              backgroundColor: '#2a2a2a',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '10px',
              color: '#ffffff',
              fontSize: '14px'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#00ff88',
            border: 'none',
            borderRadius: '4px',
            padding: '12px',
            color: '#000',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          fontSize: '12px',
          textDecoration: 'underline'
        }}
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
      
      {message && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#2a2a2a',
          borderRadius: '4px',
          fontSize: '12px',
          color: message.includes('error') ? '#ff4444' : '#00ff88'
        }}>
          {message}
        </div>
      )}
    </div>
  )
}