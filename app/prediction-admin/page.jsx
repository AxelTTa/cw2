'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const Button = ({ children, onClick, variant = 'default', disabled = false, style = {} }) => {
  const variants = {
    default: { backgroundColor: '#2563eb', color: 'white' },
    success: { backgroundColor: '#16a34a', color: 'white' },
    warning: { backgroundColor: '#d97706', color: 'white' },
    danger: { backgroundColor: '#dc2626', color: 'white' }
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...style
      }}
    >
      {children}
    </button>
  )
}

const Card = ({ children, title }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '20px',
    marginBottom: '20px'
  }}>
    {title && <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{title}</h3>}
    {children}
  </div>
)

export default function PredictionAdmin() {
  const [user, setUser] = useState(null)
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      window.location.href = '/login'
      return
    }
    setUser(user)
  }

  const loadData = async () => {
    try {
      setLoading(true)

      // Load live matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          id, home_team, away_team, status, date,
          home_team_info:teams!matches_home_team_fkey(name),
          away_team_info:teams!matches_away_team_fkey(name)
        `)
        .in('status', ['1H', '2H', 'HT', 'ET', 'P'])
        .order('date', { ascending: true })

      setMatches(matchesData || [])

      // Load recent predictions
      const { data: predictionsData } = await supabase
        .from('prediction_markets')
        .select(`
          *,
          match:matches(home_team, away_team),
          pools:prediction_pools(option_value, total_stakes, participant_count)
        `)
        .eq('prediction_type', 'micro')
        .order('created_at', { ascending: false })
        .limit(20)

      setPredictions(predictionsData || [])

      // Load generation logs
      const { data: logsData } = await supabase
        .from('prediction_generation_log')
        .select('*')
        .order('generation_time', { ascending: false })
        .limit(10)

      setLogs(logsData || [])

    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePrediction = async (matchId) => {
    try {
      const response = await fetch('/api/predictions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('✅ Prediction generated successfully!')
        await loadData()
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const settlePrediction = async (marketId, winningOption) => {
    try {
      const response = await fetch('/api/predictions/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId, winningOption })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('✅ Prediction settled successfully!')
        await loadData()
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const autoSettleMatch = async (matchId) => {
    try {
      const response = await fetch('/api/predictions/auto-settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Auto-settled ${result.settled} predictions`)
        await loadData()
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const createTestMatch = async () => {
    try {
      // Create a test live match
      const { data, error } = await supabase
        .from('matches')
        .insert({
          home_team: 'FC Barcelona',
          away_team: 'Real Madrid',
          status: '1H',
          date: new Date().toISOString(),
          home_score: 0,
          away_score: 0,
          minute: 25
        })
        .select()
        .single()

      if (error) throw error

      alert('✅ Test match created!')
      await loadData()
    } catch (error) {
      alert(`❌ Error creating test match: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <h1>Loading Prediction Admin...</h1>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{ margin: 0, marginBottom: '8px' }}>🛠️ Prediction Grid Admin</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Testing and administration panel for the prediction system
        </p>
      </div>

      {/* Quick Actions */}
      <Card title="🚀 Quick Actions">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={createTestMatch}>
            ➕ Create Test Match
          </Button>
          <Button onClick={loadData}>
            🔄 Refresh Data
          </Button>
          <Button 
            onClick={() => window.open('/prediction-grid', '_blank')}
            variant="success"
          >
            🎯 Open Prediction Grid
          </Button>
        </div>
      </Card>

      {/* Live Matches */}
      <Card title="🔴 Live Matches">
        {matches.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No live matches found. Create a test match to get started.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {matches.map((match) => (
              <div key={match.id} style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>
                    {match.home_team_info?.name || match.home_team} vs {match.away_team_info?.name || match.away_team}
                  </strong>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Status: {match.status} • ID: {match.id}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    onClick={() => generatePrediction(match.id)}
                    variant="success"
                    style={{ fontSize: '12px' }}
                  >
                    Generate Prediction
                  </Button>
                  <Button 
                    onClick={() => autoSettleMatch(match.id)}
                    variant="warning"
                    style={{ fontSize: '12px' }}
                  >
                    Auto-Settle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active Predictions */}
      <Card title="🎯 Recent Predictions">
        {predictions.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No predictions found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {predictions.map((prediction) => (
              <div key={prediction.id} style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>{prediction.question}</strong>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    Match: {prediction.match?.home_team} vs {prediction.match?.away_team}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Status: {prediction.status} • 
                    Expires: {new Date(prediction.expires_at).toLocaleTimeString()}
                  </div>
                </div>

                {/* Pool Information */}
                {prediction.pools && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {prediction.pools.map((pool) => (
                      <div key={pool.option_value} style={{
                        padding: '8px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: '600' }}>{pool.option_value}</div>
                        <div>{pool.participant_count} bets</div>
                        <div>{pool.total_stakes} CHZ</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Settlement Actions */}
                {prediction.status === 'active' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {prediction.options?.map((option) => (
                      <Button
                        key={option}
                        onClick={() => settlePrediction(prediction.id, option)}
                        variant="warning"
                        style={{ fontSize: '12px' }}
                      >
                        Settle: {option}
                      </Button>
                    ))}
                    <Button
                      onClick={() => settlePrediction(prediction.id, 'refund')}
                      variant="danger"
                      style={{ fontSize: '12px' }}
                    >
                      Refund All
                    </Button>
                  </div>
                )}

                {prediction.status === 'settled' && prediction.winning_option && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    ✅ Settled: {prediction.winning_option}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Generation Logs */}
      <Card title="📋 Recent Generation Logs">
        {logs.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No generation logs found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {logs.map((log, index) => (
              <div key={log.id} style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <div style={{ fontWeight: '600' }}>{log.generated_question}</div>
                <div style={{ color: '#6b7280' }}>
                  {new Date(log.generation_time).toLocaleString()} • 
                  Market Created: {log.market_created ? '✅' : '❌'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}