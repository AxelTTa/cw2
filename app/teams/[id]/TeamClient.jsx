'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UniversalComments from '../../components/UniversalComments'

export default function TeamClient() {
  const params = useParams()
  const router = useRouter()
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTeamDetail() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🚀 Frontend: Fetching team detail for ID:', params.id)
        
        const response = await fetch(`/api/teams/${params.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch team: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load team data')
        }
        
        setTeamData(data.team)
      } catch (err) {
        console.error('❌ Frontend: Error loading team:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTeamDetail()
    }
  }, [params.id])

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
        <div style={{ fontSize: '18px', color: '#888' }}>Loading team details...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <div style={{ fontSize: '18px', color: '#ef4444', marginBottom: '20px' }}>
          {error}
        </div>
        <button 
          onClick={() => router.push('/teams')}
          style={{
            backgroundColor: '#00ff88',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Back to Teams
        </button>
      </main>
    )
  }

  return (
    <main style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => router.push('/teams')}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ← Back to Teams
        </button>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#111',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          {teamData.team?.logo && (
            <img 
              src={teamData.team.logo} 
              alt={`${teamData.team.name} logo`}
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain'
              }}
            />
          )}

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#ffffff'
            }}>
              {teamData.team?.name}
            </h1>
            
            <div style={{
              fontSize: '16px',
              color: '#888',
              marginBottom: '10px'
            }}>
              Founded: {teamData.team?.founded || 'Unknown'}
            </div>

            <div style={{
              fontSize: '16px',
              color: '#00ff88',
              fontWeight: 'bold'
            }}>
              {teamData.venue?.name}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <UniversalComments 
          entityType="team"
          entityId={teamData.team?.id}
          entityName={teamData.team?.name}
        />
      </div>
    </main>
  )
}