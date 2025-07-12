'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import GoogleAuth from '../../components/GoogleAuth'
import CommentForm from '../../components/CommentForm'
import { supabase } from '../../utils/supabase'

export default function MatchClient() {
  const params = useParams()
  const [match, setMatch] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function fetchMatch() {
      try {
        const response = await fetch(`/api/matches/${params.id}`)
        const data = await response.json()
        if (data.success) {
          setMatch(data.match)
        }
      } catch (error) {
        console.error('Error fetching match:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatch()
  }, [params.id])

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
        <div style={{ fontSize: '18px', color: '#888' }}>Loading match details...</div>
      </main>
    )
  }

  if (!match) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <div style={{ fontSize: '18px', color: '#ef4444' }}>Match not found</div>
      </main>
    )
  }

  return (
    <main style={{ padding: '40px 20px' }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#111',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          {match.fixture?.teams?.home?.name} vs {match.fixture?.teams?.away?.name}
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            {match.fixture?.teams?.home?.logo && (
              <img 
                src={match.fixture.teams.home.logo} 
                alt={match.fixture.teams.home.name}
                style={{ width: '60px', height: '60px', marginBottom: '10px' }}
              />
            )}
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {match.fixture?.teams?.home?.name}
            </div>
          </div>

          <div style={{
            backgroundColor: '#00ff88',
            color: '#000',
            padding: '15px 25px',
            borderRadius: '12px',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {match.fixture?.goals?.home || 0} - {match.fixture?.goals?.away || 0}
          </div>

          <div style={{ textAlign: 'center' }}>
            {match.fixture?.teams?.away?.logo && (
              <img 
                src={match.fixture.teams.away.logo} 
                alt={match.fixture.teams.away.name}
                style={{ width: '60px', height: '60px', marginBottom: '10px' }}
              />
            )}
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {match.fixture?.teams?.away?.name}
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          color: '#888',
          fontSize: '14px'
        }}>
          {match.fixture?.date && new Date(match.fixture.date).toLocaleDateString()}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <GoogleAuth onUserUpdate={setUser} onProfileUpdate={setProfile} />
        <CommentForm 
          matchId={params.id}
          user={user}
          profile={profile}
          onCommentAdded={() => {}}
        />
      </div>
    </main>
  )
}