'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Trophy, 
  Activity, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  MessageSquare, 
  Zap, 
  ArrowLeft, 
  Share, 
  Bookmark,
  Heart,
  Flame,
  Angry,
  Smile,
  Surprise,
  User,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Mock data for the demo
const mockMatch = {
  id: 'psg-vs-madrid-2024',
  homeTeam: {
    id: 'psg',
    name: 'Paris Saint-Germain',
    logo: 'https://via.placeholder.com/80x80/0066cc/ffffff?text=PSG',
    country: 'France',
    formation: '4-3-3'
  },
  awayTeam: {
    id: 'madrid',
    name: 'Real Madrid',
    logo: 'https://via.placeholder.com/80x80/ffffff/000000?text=RM',
    country: 'Spain',
    formation: '4-3-3'
  },
  score: {
    home: 2,
    away: 1,
    halfTime: { home: 1, away: 0 }
  },
  status: {
    status: 'finished',
    minute: 90,
    period: 'full_time'
  },
  startTime: '2024-03-15T20:00:00Z',
  tournament: {
    id: 'ucl',
    name: 'UEFA Champions League',
    season: '2023-24',
    round: 'Round of 16'
  },
  venue: {
    name: 'Parc des Princes',
    city: 'Paris',
    country: 'France'
  },
  referee: 'Daniele Orsato',
  attendance: 47929,
  goals: {
    home: [
      { player: 'Kylian Mbappé', minute: '25', type: 'regular' },
      { player: 'Lionel Messi', minute: '78', type: 'penalty' }
    ],
    away: [
      { player: 'Vinícius Jr.', minute: '61', type: 'regular' }
    ]
  },
  coach: {
    home: 'Luis Enrique',
    away: 'Carlo Ancelotti'
  }
};

const mockEvents = [
  {
    id: '1',
    matchId: 'psg-vs-madrid-2024',
    minute: '25',
    type: 'goal',
    team: 'home',
    player: 'Kylian Mbappé',
    assistPlayer: 'Lionel Messi',
    description: 'Brilliant finish from Mbappé after a perfect through ball from Messi',
    isImportant: true,
    timestamp: '2024-03-15T20:25:00Z',
    reactions: { fire: 156, heart: 89, angry: 12, cool: 234, surprised: 45, total: 536 },
    commentCount: 24
  },
  {
    id: '2',
    matchId: 'psg-vs-madrid-2024',
    minute: '61',
    type: 'goal',
    team: 'away',
    player: 'Vinícius Jr.',
    description: 'Vinícius Jr. equalizes with a stunning solo effort',
    isImportant: true,
    timestamp: '2024-03-15T21:01:00Z',
    reactions: { fire: 234, heart: 123, angry: 67, cool: 189, surprised: 78, total: 691 },
    commentCount: 31
  },
  {
    id: '3',
    matchId: 'psg-vs-madrid-2024',
    minute: '78',
    type: 'penalty',
    team: 'home',
    player: 'Lionel Messi',
    description: 'Messi converts the penalty to give PSG the lead',
    isImportant: true,
    timestamp: '2024-03-15T21:18:00Z',
    reactions: { fire: 287, heart: 156, angry: 23, cool: 198, surprised: 67, total: 731 },
    commentCount: 42
  },
  {
    id: '4',
    matchId: 'psg-vs-madrid-2024',
    minute: '43',
    type: 'yellow_card',
    team: 'away',
    player: 'Luka Modrić',
    description: 'Yellow card for a tactical foul',
    isImportant: false,
    timestamp: '2024-03-15T20:43:00Z',
    reactions: { fire: 12, heart: 8, angry: 45, cool: 23, surprised: 6, total: 94 },
    commentCount: 5
  }
];

const mockOdds = {
  home: 2.15,
  draw: 3.40,
  away: 3.20,
  source: 'Bet365',
  lastUpdated: '2024-03-15T19:30:00Z'
};

const mockPredictions = {
  total: 15847,
  homePercentage: 42,
  drawPercentage: 23,
  awayPercentage: 35,
  breakdown: {
    home: 6656,
    draw: 3645,
    away: 5546
  }
};

// Component definitions with inline styles
const Button = ({ children, variant = 'default', size = 'default', onClick, style = {}, ...props }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
    ...style
  };
  
  const variants = {
    default: {
      backgroundColor: '#2563eb',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid #d1d5db',
      color: '#374151',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#374151',
    },
    destructive: {
      backgroundColor: '#dc2626',
      color: 'white',
    }
  };
  
  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: '12px',
    },
    default: {
      padding: '8px 16px',
      fontSize: '14px',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '16px',
    }
  };
  
  return (
    <button
      style={{
        ...baseStyle,
        ...variants[variant],
        ...sizes[size]
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    ...style
  }}>
    {children}
  </div>
);

const CardHeader = ({ children, style = {} }) => (
  <div style={{
    padding: '24px',
    paddingBottom: '16px',
    ...style
  }}>
    {children}
  </div>
);

const CardTitle = ({ children, style = {} }) => (
  <h3 style={{
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    marginBottom: '8px',
    ...style
  }}>
    {children}
  </h3>
);

const CardContent = ({ children, style = {} }) => (
  <div style={{
    padding: '0 24px 24px 24px',
    ...style
  }}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', style = {} }) => {
  const variants = {
    default: {
      backgroundColor: '#2563eb',
      color: 'white',
    },
    destructive: {
      backgroundColor: '#dc2626',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
    }
  };
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '500',
      ...variants[variant],
      ...style
    }}>
      {children}
    </span>
  );
};

// Sub-components
const MatchStatusBadge = ({ status, startTime }) => {
  const getStatusDisplay = () => {
    switch (status.status) {
      case 'live':
        return { text: 'LIVE', variant: 'destructive' };
      case 'finished':
        return { text: 'FULL TIME', variant: 'secondary' };
      case 'scheduled':
        return { text: new Date(startTime).toLocaleTimeString(), variant: 'default' };
      default:
        return { text: status.status.toUpperCase(), variant: 'secondary' };
    }
  };
  
  const { text, variant } = getStatusDisplay();
  
  return (
    <Badge variant={variant}>
      {text}
    </Badge>
  );
};

const GoalScorers = ({ homeGoals, awayGoals }) => {
  if (!homeGoals.length && !awayGoals.length) return null;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {homeGoals.map((goal, index) => (
          <div key={index} style={{
            fontSize: '14px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: '500' }}>{goal.player}</span>
            <span style={{
              fontSize: '12px',
              backgroundColor: '#f3f4f6',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>{goal.minute}'</span>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        textAlign: 'right'
      }}>
        {awayGoals.map((goal, index) => (
          <div key={index} style={{
            fontSize: '14px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '12px',
              backgroundColor: '#f3f4f6',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>{goal.minute}'</span>
            <span style={{ fontWeight: '500' }}>{goal.player}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StadiumInfo = ({ match }) => (
  <div style={{
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      fontSize: '14px'
    }}>
      <div>
        <div style={{ color: '#6b7280', marginBottom: '4px' }}>Venue</div>
        <div style={{ fontWeight: '500' }}>{match.venue.name}</div>
      </div>
      <div>
        <div style={{ color: '#6b7280', marginBottom: '4px' }}>Location</div>
        <div style={{ fontWeight: '500' }}>{match.venue.city}, {match.venue.country}</div>
      </div>
      <div>
        <div style={{ color: '#6b7280', marginBottom: '4px' }}>Referee</div>
        <div style={{ fontWeight: '500' }}>{match.referee}</div>
      </div>
      <div>
        <div style={{ color: '#6b7280', marginBottom: '4px' }}>Attendance</div>
        <div style={{ fontWeight: '500' }}>{match.attendance?.toLocaleString()}</div>
      </div>
    </div>
  </div>
);

const MatchHeader = ({ match, isLive = false }) => (
  <Card style={{ marginBottom: '24px' }}>
    <CardContent style={{ padding: '24px' }}>
      {/* Tournament Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Trophy size={16} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <div style={{ fontWeight: '600' }}>{match.tournament.name}</div>
            {match.tournament.round && (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{match.tournament.round}</div>
            )}
          </div>
        </div>
        <MatchStatusBadge status={match.status} startTime={match.startTime} />
      </div>

      {/* Main Match Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        {/* Home Team */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          minWidth: 0
        }}>
          <div style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white'
            }}>
              <img 
                src={match.homeTeam.logo} 
                alt={`${match.homeTeam.name} logo`}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '24px',
              height: '24px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>W</span>
            </div>
          </div>
          <h2 style={{
            fontWeight: 'bold',
            fontSize: '20px',
            textAlign: 'center',
            margin: '0 0 4px 0',
            maxWidth: '100%'
          }}>
            {match.homeTeam.name}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500',
            margin: 0
          }}>{match.homeTeam.country}</p>
        </div>

        {/* Score Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#2563eb'
            }}>
              {match.score.home}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6b7280'
            }}>-</div>
            <div style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#2563eb'
            }}>
              {match.score.away}
            </div>
          </div>
          
          {/* Half Time Score */}
          {match.score.halfTime && (
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500',
              backgroundColor: '#f3f4f6',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              HT: {match.score.halfTime.home} - {match.score.halfTime.away}
            </div>
          )}
          
          {/* Live Clock */}
          {isLive && match.status.minute && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              <Clock size={16} />
              <span>{match.status.minute}'</span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          minWidth: 0
        }}>
          <div style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white'
            }}>
              <img 
                src={match.awayTeam.logo} 
                alt={`${match.awayTeam.name} logo`}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '24px',
              height: '24px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>L</span>
            </div>
          </div>
          <h2 style={{
            fontWeight: 'bold',
            fontSize: '20px',
            textAlign: 'center',
            margin: '0 0 4px 0',
            maxWidth: '100%'
          }}>
            {match.awayTeam.name}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500',
            margin: 0
          }}>{match.awayTeam.country}</p>
        </div>
      </div>

      {/* Goal Scorers */}
      <GoalScorers homeGoals={match.goals.home} awayGoals={match.goals.away} />

      {/* Stadium & Match Information */}
      <StadiumInfo match={match} />
    </CardContent>
  </Card>
);

const GameEventItem = ({ event, onReaction, onCommentClick, isLive = false }) => {
  const getEventIcon = () => {
    switch (event.type) {
      case 'goal':
      case 'penalty':
        return '⚽';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      case 'substitution':
        return '🔄';
      default:
        return '⚽';
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case 'goal':
      case 'penalty':
        return { borderColor: '#10b981', backgroundColor: '#f0fdf4' };
      case 'yellow_card':
        return { borderColor: '#f59e0b', backgroundColor: '#fffbeb' };
      case 'red_card':
        return { borderColor: '#dc2626', backgroundColor: '#fef2f2' };
      default:
        return { borderColor: '#e5e7eb', backgroundColor: 'white' };
    }
  };

  const eventStyle = getEventColor();

  return (
    <div style={{
      border: '1px solid',
      borderColor: eventStyle.borderColor,
      backgroundColor: eventStyle.backgroundColor,
      borderRadius: '8px',
      padding: '16px',
      transition: 'all 0.2s',
      ...(isLive && { opacity: 0.7 })
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>{getEventIcon()}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <span style={{
              fontWeight: 'bold',
              fontSize: '14px',
              backgroundColor: '#f3f4f6',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>{event.minute}'</span>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>{event.type.replace('_', ' ')}</span>
            {event.isImportant && <Badge variant="destructive">Key Event</Badge>}
          </div>
          
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            margin: '8px 0'
          }}>{event.description}</p>
          
          {event.player && (
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#2563eb' }}>{event.player}</span>
              {event.assistPlayer && <span style={{ color: '#6b7280' }}> (assisted by {event.assistPlayer})</span>}
            </div>
          )}

          {/* Reactions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '14px'
          }}>
            <button
              onClick={() => onReaction(event.id, 'fire')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Flame size={16} />
              <span>{event.reactions?.fire || 0}</span>
            </button>
            <button
              onClick={() => onReaction(event.id, 'heart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Heart size={16} />
              <span>{event.reactions?.heart || 0}</span>
            </button>
            <button
              onClick={() => onCommentClick(event)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <MessageSquare size={16} />
              <span>{event.commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameFeed = ({ events, isLive = false, onEventClick }) => {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filter, setFilter] = useState('all');
  const feedRef = useRef(null);

  useEffect(() => {
    let filtered = [...events];
    
    switch (filter) {
      case 'important':
        filtered = events.filter(event => event.isImportant);
        break;
      case 'goals':
        filtered = events.filter(event => ['goal', 'penalty'].includes(event.type));
        break;
      case 'cards':
        filtered = events.filter(event => ['yellow_card', 'red_card'].includes(event.type));
        break;
      default:
        break;
    }
    
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredEvents(filtered);
  }, [events, filter]);

  const handleReaction = (eventId, reaction) => {
    console.log('Reaction added:', { eventId, reaction });
  };

  return (
    <Card>
      <CardHeader>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <CardTitle style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Activity size={20} />
            Match Events
            {isLive && (
              <Badge variant="destructive" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Zap size={12} />
                Live
              </Badge>
            )}
          </CardTitle>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Filter size={16} style={{ color: '#6b7280' }} />
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { key: 'all', label: 'All Events' },
              { key: 'important', label: 'Key Events' },
              { key: 'goals', label: 'Goals' },
              { key: 'cards', label: 'Cards' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{label}</span>
                <Badge variant="secondary" style={{
                  marginLeft: '4px',
                  height: '20px',
                  fontSize: '12px'
                }}>
                  {key === 'all' ? events.length : 
                   key === 'important' ? events.filter(e => e.isImportant).length :
                   key === 'goals' ? events.filter(e => ['goal', 'penalty'].includes(e.type)).length :
                   events.filter(e => ['yellow_card', 'red_card'].includes(e.type)).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ padding: 0 }}>
        <div 
          ref={feedRef}
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <GameEventItem
                key={event.id}
                event={event}
                onReaction={handleReaction}
                onCommentClick={onEventClick}
                isLive={isLive && index === 0}
              />
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '32px'
            }}>
              <Activity size={48} style={{
                color: '#6b7280',
                margin: '0 auto 12px'
              }} />
              <p style={{
                color: '#6b7280',
                marginBottom: '8px'
              }}>No events match your filter</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter('all')}
              >
                Show All Events
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const BettingOdds = ({ odds }) => (
  <Card>
    <CardHeader>
      <CardTitle style={{ fontSize: '18px' }}>Betting Odds</CardTitle>
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        margin: 0
      }}>Latest odds from {odds.source}</p>
    </CardHeader>
    <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>Home Win</div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold'
          }}>{odds.home}</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>Draw</div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold'
          }}>{odds.draw}</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>Away Win</div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold'
          }}>{odds.away}</div>
        </div>
      </div>
      <p style={{
        fontSize: '12px',
        color: '#6b7280',
        margin: 0
      }}>
        Last updated: {new Date(odds.lastUpdated).toLocaleTimeString()}
      </p>
    </CardContent>
  </Card>
);

const UserPrediction = ({ stats, onPredict }) => {
  const [userPrediction, setUserPrediction] = useState(null);

  const handlePredict = (prediction) => {
    setUserPrediction(prediction);
    onPredict(prediction);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: '18px' }}>Match Predictions</CardTitle>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>{stats.total.toLocaleString()} predictions</p>
      </CardHeader>
      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px'
          }}>
            <span>Home Win</span>
            <span>{stats.homePercentage}%</span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            height: '8px'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              height: '8px',
              borderRadius: '4px',
              width: `${stats.homePercentage}%`
            }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px'
          }}>
            <span>Draw</span>
            <span>{stats.drawPercentage}%</span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            height: '8px'
          }}>
            <div style={{
              backgroundColor: '#6b7280',
              height: '8px',
              borderRadius: '4px',
              width: `${stats.drawPercentage}%`
            }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px'
          }}>
            <span>Away Win</span>
            <span>{stats.awayPercentage}%</span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            height: '8px'
          }}>
            <div style={{
              backgroundColor: '#dc2626',
              height: '8px',
              borderRadius: '4px',
              width: `${stats.awayPercentage}%`
            }} />
          </div>
        </div>

        {!userPrediction && (
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '12px'
            }}>Make your prediction:</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              <Button size="sm" onClick={() => handlePredict('1')} variant="outline">
                Home Win
              </Button>
              <Button size="sm" onClick={() => handlePredict('X')} variant="outline">
                Draw
              </Button>
              <Button size="sm" onClick={() => handlePredict('2')} variant="outline">
                Away Win
              </Button>
            </div>
          </div>
        )}

        {userPrediction && (
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#059669',
              fontWeight: '500'
            }}>
              ✓ Your prediction: {userPrediction === '1' ? 'Home Win' : userPrediction === 'X' ? 'Draw' : 'Away Win'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main component
const BalthaTest = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowComments(true);
  };

  const handlePrediction = (prediction) => {
    console.log('Prediction submitted:', prediction);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header Navigation */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Button variant="ghost" size="sm">
                <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                Back to Matches
              </Button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Match Header */}
        <MatchHeader match={mockMatch} isLive={false} />

        {/* Main Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }}>
          {/* Desktop: 2/3 and 1/3 columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Game Feed */}
            <div style={{ gridColumn: 'span 2' }}>
              <GameFeed
                events={mockEvents}
                isLive={false}
                onEventClick={handleEventClick}
              />
            </div>

            {/* Sidebar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Betting Odds */}
              <BettingOdds odds={mockOdds} />

              {/* User Predictions */}
              <UserPrediction
                stats={mockPredictions}
                onPredict={handlePrediction}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showComments && selectedEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            margin: '0 16px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}>Event Comments</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(false)}>
                ×
              </Button>
            </div>
            
            <div style={{
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500'
              }}>{selectedEvent.minute}' - {selectedEvent.type}</div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>{selectedEvent.description}</div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <User size={16} />
                  <span style={{
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>FootballFan123</span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>5 min ago</span>
                </div>
                <p style={{
                  fontSize: '14px',
                  margin: 0
                }}>What a goal! Absolutely incredible technique from that angle.</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}>
                  <Button variant="ghost" size="sm">
                    <Heart size={12} style={{ marginRight: '4px' }} />
                    24
                  </Button>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white'
                  }}
                />
                <Button size="sm">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalthaTest;