'use client'

import { useState, useEffect } from 'react'

export default function CompetitionBracket({ competition, onClose }) {
  const [bracketData, setBracketData] = useState(null)

  useEffect(() => {
    generateBracketData()
  }, [competition])

  const generateBracketData = () => {
    // Generate different bracket structures based on competition type
    let bracket = {}
    
    if (competition.teams === 32) {
      // Club World Cup format
      bracket = generateClubWorldCupBracket()
    } else if (competition.teams === 36) {
      // Champions League format
      bracket = generateChampionsLeagueBracket()
    } else if (competition.teams === 24) {
      // AFC Champions League format
      bracket = generate24TeamBracket()
    } else {
      // Default knockout format
      bracket = generateDefaultBracket(competition.teams)
    }
    
    setBracketData(bracket)
  }

  const generateClubWorldCupBracket = () => {
    return {
      type: 'group_stage_plus_knockout',
      groups: [
        { name: 'Group A', teams: ['Team A1', 'Team A2', 'Team A3', 'Team A4'] },
        { name: 'Group B', teams: ['Team B1', 'Team B2', 'Team B3', 'Team B4'] },
        { name: 'Group C', teams: ['Team C1', 'Team C2', 'Team C3', 'Team C4'] },
        { name: 'Group D', teams: ['Team D1', 'Team D2', 'Team D3', 'Team D4'] },
        { name: 'Group E', teams: ['Team E1', 'Team E2', 'Team E3', 'Team E4'] },
        { name: 'Group F', teams: ['Team F1', 'Team F2', 'Team F3', 'Team F4'] },
        { name: 'Group G', teams: ['Team G1', 'Team G2', 'Team G3', 'Team G4'] },
        { name: 'Group H', teams: ['Team H1', 'Team H2', 'Team H3', 'Team H4'] }
      ],
      knockout: {
        'Round of 16': Array(8).fill().map((_, i) => ({
          match: i + 1,
          team1: `Winner Group ${String.fromCharCode(65 + Math.floor(i/2))}`,
          team2: `Runner-up Group ${String.fromCharCode(65 + Math.floor(i/2) + 4)}`,
          winner: null
        })),
        'Quarter-finals': Array(4).fill().map((_, i) => ({
          match: i + 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        })),
        'Semi-finals': Array(2).fill().map((_, i) => ({
          match: i + 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        })),
        'Final': [{
          match: 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        }]
      }
    }
  }

  const generateChampionsLeagueBracket = () => {
    return {
      type: 'league_phase_plus_knockout',
      leaguePhase: {
        teams: Array(36).fill().map((_, i) => `Team ${i + 1}`),
        matches: 144
      },
      knockout: {
        'Playoff Round': Array(8).fill().map((_, i) => ({
          match: i + 1,
          team1: `9th-16th place`,
          team2: `17th-24th place`,
          winner: null
        })),
        'Round of 16': Array(8).fill().map((_, i) => ({
          match: i + 1,
          team1: `Top 8`,
          team2: `Playoff Winner`,
          winner: null
        })),
        'Quarter-finals': Array(4).fill().map((_, i) => ({
          match: i + 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        })),
        'Semi-finals': Array(2).fill().map((_, i) => ({
          match: i + 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        })),
        'Final': [{
          match: 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        }]
      }
    }
  }

  const generate24TeamBracket = () => {
    return {
      type: 'group_stage_plus_knockout',
      groups: [
        { name: 'Group A', teams: ['Team A1', 'Team A2', 'Team A3', 'Team A4'] },
        { name: 'Group B', teams: ['Team B1', 'Team B2', 'Team B3', 'Team B4'] },
        { name: 'Group C', teams: ['Team C1', 'Team C2', 'Team C3', 'Team C4'] },
        { name: 'Group D', teams: ['Team D1', 'Team D2', 'Team D3', 'Team D4'] },
        { name: 'Group E', teams: ['Team E1', 'Team E2', 'Team E3', 'Team E4'] },
        { name: 'Group F', teams: ['Team F1', 'Team F2', 'Team F3', 'Team F4'] }
      ],
      knockout: {
        'Round of 16': Array(8).fill().map((_, i) => ({
          match: i + 1,
          team1: `Group Winner`,
          team2: `Group Runner-up`,
          winner: null
        })),
        'Quarter-finals': Array(4).fill().map((_, i) => ({
          match: i + 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        })),
        'Semi-finals': Array(2).fill().map((_, i) => ({
          match: i + 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        })),
        'Final': [{
          match: 1,
          team1: 'TBD',
          team2: 'TBD',
          winner: null
        }]
      }
    }
  }

  const generateDefaultBracket = (teamCount) => {
    const rounds = Math.ceil(Math.log2(teamCount))
    const knockout = {}
    
    for (let i = rounds; i >= 1; i--) {
      const roundName = i === 1 ? 'Final' : 
                       i === 2 ? 'Semi-finals' : 
                       i === 3 ? 'Quarter-finals' : 
                       `Round ${rounds - i + 1}`
      
      const matchCount = Math.pow(2, i - 1)
      knockout[roundName] = Array(matchCount).fill().map((_, j) => ({
        match: j + 1,
        team1: 'TBD',
        team2: 'TBD',
        winner: null
      }))
    }
    
    return {
      type: 'knockout_only',
      knockout
    }
  }

  if (!bracketData) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>Loading bracket...</div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%'
    }}>
      {/* Competition Info */}
      <div style={{
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #333'
      }}>
        <p style={{
          color: '#888',
          fontSize: '16px',
          margin: 0
        }}>
          {bracketData.type === 'group_stage_plus_knockout' && 'Group Stage + Knockout Format'}
          {bracketData.type === 'league_phase_plus_knockout' && 'League Phase + Knockout Format'}
          {bracketData.type === 'knockout_only' && 'Single Elimination Format'}
        </p>
      </div>

      {/* Groups (if applicable) */}
      {bracketData.groups && (
        <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              color: '#00ff88',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              Group Stage
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {bracketData.groups.map((group, index) => (
                <div key={index} style={{
                  backgroundColor: '#1a1a1a',
                  border: '2px solid #333',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h4 style={{
                    color: '#0099ff',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    {group.name}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.teams.map((team, teamIndex) => (
                      <div key={teamIndex} style={{
                        backgroundColor: '#2a2a2a',
                        padding: '10px',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        {team}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {/* League Phase (if applicable) */}
      {bracketData.leaguePhase && (
        <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              color: '#00ff88',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              League Phase
            </h3>
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '2px solid #333',
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#0099ff',
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                {bracketData.leaguePhase.teams.length}
              </div>
              <div style={{
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                Teams compete in single league table
              </div>
              <div style={{
                color: '#888',
                fontSize: '14px'
              }}>
                {bracketData.leaguePhase.matches} matches total
              </div>
          </div>
        </div>
      )}

      {/* Knockout Rounds */}
      <div>
          <h3 style={{
            color: '#ff6b35',
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            Knockout Stage
          </h3>
          <div style={{
            display: 'flex',
            gap: '30px',
            overflowX: 'auto',
            paddingBottom: '20px'
          }}>
            {Object.entries(bracketData.knockout).map(([roundName, matches], roundIndex) => (
              <div key={roundIndex} style={{
                minWidth: '200px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <h4 style={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px'
                }}>
                  {roundName}
                </h4>
                {matches.map((match, matchIndex) => (
                  <div key={matchIndex} style={{
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #333',
                    borderRadius: '8px',
                    padding: '15px',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '8px',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}>
                        {match.team1}
                      </div>
                      <div style={{
                        color: '#888',
                        fontSize: '10px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        VS
                      </div>
                      <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '8px',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}>
                        {match.team2}
                      </div>
                    </div>
                    {match.winner && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#00ff88',
                        color: '#000',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                    
                    {/* Connection line to next round */}
                    {roundIndex < Object.keys(bracketData.knockout).length - 1 && (
                      <div style={{
                        position: 'absolute',
                        right: '-15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '30px',
                        height: '2px',
                        backgroundColor: '#333'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
      </div>

      {/* Legend */}
      <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '2px solid #333',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          fontSize: '14px'
        }}>
          <div style={{ color: '#888' }}>
            <span style={{ color: '#00ff88' }}>●</span> Group Stage
          </div>
          <div style={{ color: '#888' }}>
            <span style={{ color: '#ff6b35' }}>●</span> Knockout Stage
          </div>
          <div style={{ color: '#888' }}>
            <span style={{ color: '#0099ff' }}>●</span> League Phase
          </div>
          <div style={{ color: '#888' }}>
            TBD = To Be Determined
        </div>
      </div>
    </div>
  )
}