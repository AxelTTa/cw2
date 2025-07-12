'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from './app/components/Header';
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
  ChevronUp,
  Calendar,
  MapPin
} from 'lucide-react';

// FIFA Club World Cup matches data
const fifaClubWorldCupMatches = [
  {
    id: 'real-madrid-vs-al-hilal-2025',
    homeTeam: {
      id: 'real-madrid',
      name: 'Real Madrid',
      logo: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
      country: 'Spain',
      confederation: 'UEFA'
    },
    awayTeam: {
      id: 'al-hilal',
      name: 'Al Hilal',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Al-Hilal_FC_Logo.svg/1200px-Al-Hilal_FC_Logo.svg.png',
      country: 'Saudi Arabia',
      confederation: 'AFC'
    },
    score: null,
    status: {
      status: 'scheduled',
      minute: null,
      period: null
    },
    startTime: '2025-07-15T20:00:00Z',
    tournament: {
      id: 'cwc',
      name: 'FIFA Club World Cup',
      season: '2025',
      round: 'Round of 32'
    },
    venue: {
      name: 'MetLife Stadium',
      city: 'East Rutherford',
      country: 'United States'
    }
  },
  {
    id: 'man-city-vs-flamengo-2025',
    homeTeam: {
      id: 'man-city',
      name: 'Manchester City',
      logo: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
      country: 'England',
      confederation: 'UEFA'
    },
    awayTeam: {
      id: 'flamengo',
      name: 'Flamengo',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flamengo_braz_logo.svg/1200px-Flamengo_braz_logo.svg.png',
      country: 'Brazil',
      confederation: 'CONMEBOL'
    },
    score: null,
    status: {
      status: 'scheduled',
      minute: null,
      period: null
    },
    startTime: '2025-07-16T18:00:00Z',
    tournament: {
      id: 'cwc',
      name: 'FIFA Club World Cup',
      season: '2025',
      round: 'Round of 32'
    },
    venue: {
      name: 'Hard Rock Stadium',
      city: 'Miami',
      country: 'United States'
    }
  },
  {
    id: 'bayern-vs-monterrey-2025',
    homeTeam: {
      id: 'bayern',
      name: 'Bayern Munich',
      logo: 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png',
      country: 'Germany',
      confederation: 'UEFA'
    },
    awayTeam: {
      id: 'monterrey',
      name: 'CF Monterrey',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/CF_Monterrey_logo.svg/1200px-CF_Monterrey_logo.svg.png',
      country: 'Mexico',
      confederation: 'CONCACAF'
    },
    score: null,
    status: {
      status: 'scheduled',
      minute: null,
      period: null
    },
    startTime: '2025-07-17T21:00:00Z',
    tournament: {
      id: 'cwc',
      name: 'FIFA Club World Cup',
      season: '2025',
      round: 'Round of 32'
    },
    venue: {
      name: 'SoFi Stadium',
      city: 'Los Angeles',
      country: 'United States'
    }
  },
  {
    id: 'psg-vs-al-ahly-2025',
    homeTeam: {
      id: 'psg',
      name: 'Paris Saint-Germain',
      logo: 'https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-PSG-Logo.png',
      country: 'France',
      confederation: 'UEFA'
    },
    awayTeam: {
      id: 'al-ahly',
      name: 'Al Ahly',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Al_Ahly_logo.svg/1200px-Al_Ahly_logo.svg.png',
      country: 'Egypt',
      confederation: 'CAF'
    },
    score: null,
    status: {
      status: 'scheduled',
      minute: null,
      period: null
    },
    startTime: '2025-07-18T19:30:00Z',
    tournament: {
      id: 'cwc',
      name: 'FIFA Club World Cup',
      season: '2025',
      round: 'Round of 32'
    },
    venue: {
      name: 'Soldier Field',
      city: 'Chicago',
      country: 'United States'
    }
  },
  {
    id: 'chelsea-vs-palmeiras-2025',
    homeTeam: {
      id: 'chelsea',
      name: 'Chelsea FC',
      logo: 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
      country: 'England',
      confederation: 'UEFA'
    },
    awayTeam: {
      id: 'palmeiras',
      name: 'Palmeiras',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/1200px-Palmeiras_logo.svg.png',
      country: 'Brazil',
      confederation: 'CONMEBOL'
    },
    score: null,
    status: {
      status: 'scheduled',
      minute: null,
      period: null
    },
    startTime: '2025-07-19T22:00:00Z',
    tournament: {
      id: 'cwc',
      name: 'FIFA Club World Cup',
      season: '2025',
      round: 'Round of 32'
    },
    venue: {
      name: 'Lincoln Financial Field',
      city: 'Philadelphia',
      country: 'United States'
    }
  },
  {
    id: 'inter-miami-vs-wydad-2025',
    homeTeam: {
      id: 'inter-miami',
      name: 'Inter Miami CF',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/78/Inter_Miami_CF_logo.svg/1200px-Inter_Miami_CF_logo.svg.png',
      country: 'United States',
      confederation: 'CONCACAF'
    },
    awayTeam: {
      id: 'wydad',
      name: 'Wydad AC',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Wydad_AC_logo.svg/1200px-Wydad_AC_logo.svg.png',
      country: 'Morocco',
      confederation: 'CAF'
    },
    score: null,
    status: {
      status: 'scheduled',
      minute: null,
      period: null
    },
    startTime: '2025-07-20T20:30:00Z',
    tournament: {
      id: 'cwc',
      name: 'FIFA Club World Cup',
      season: '2025',
      round: 'Round of 32'
    },
    venue: {
      name: 'Hard Rock Stadium',
      city: 'Miami',
      country: 'United States'
    }
  }
];

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

// Define the design system colors from example-ui
const colors = {
  // Dark theme colors
  background: 'hsl(240, 10%, 3.9%)',
  foreground: 'hsl(0, 0%, 98%)',
  card: 'hsl(240, 10%, 8%)',
  cardForeground: 'hsl(0, 0%, 98%)',
  primary: 'hsl(160, 84%, 39%)',
  primaryForeground: 'hsl(0, 0%, 98%)',
  secondary: 'hsl(240, 5%, 15%)',
  secondaryForeground: 'hsl(0, 0%, 98%)',
  muted: 'hsl(240, 5%, 15%)',
  mutedForeground: 'hsl(240, 5%, 65%)',
  accent: 'hsl(240, 5%, 15%)',
  accentForeground: 'hsl(0, 0%, 98%)',
  destructive: 'hsl(0, 75%, 60%)',
  destructiveForeground: 'hsl(0, 0%, 98%)',
  border: 'hsl(240, 5%, 15%)',
  input: 'hsl(240, 5%, 15%)',
  ring: 'hsl(160, 84%, 39%)',
  
  // Match specific colors
  matchBackground: 'hsl(240, 10%, 3.9%)',
  matchCard: 'hsl(240, 10%, 8%)',
  matchBorder: 'hsl(240, 5%, 15%)',
  success: 'hsl(160, 84%, 39%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(217, 91%, 60%)',
};

// Component definitions with inline styles using the design system
const Button = ({ children, variant = 'default', size = 'default', onClick, style = {}, ...props }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px', // Using --radius: 0.75rem
    fontWeight: '500',
    fontSize: '14px',
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    ...style
  };
  
  const variants = {
    default: {
      backgroundColor: colors.primary,
      color: colors.primaryForeground,
      boxShadow: '0 0 20px hsl(160 84% 39% / 0.1)',
    },
    outline: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      color: colors.foreground,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.foreground,
    },
    destructive: {
      backgroundColor: colors.destructive,
      color: colors.destructiveForeground,
    },
    secondary: {
      backgroundColor: colors.secondary,
      color: colors.secondaryForeground,
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
      onMouseOver={(e) => {
        if (variant === 'default') {
          e.target.style.boxShadow = '0 0 30px hsl(160 84% 39% / 0.15)';
        } else if (variant === 'outline' || variant === 'ghost') {
          e.target.style.backgroundColor = colors.accent;
        }
      }}
      onMouseOut={(e) => {
        if (variant === 'default') {
          e.target.style.boxShadow = '0 0 20px hsl(160 84% 39% / 0.1)';
        } else if (variant === 'outline' || variant === 'ghost') {
          e.target.style.backgroundColor = 'transparent';
        }
      }}
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

// Match Card Component
const MatchCard = ({ match }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardContent style={{ padding: '20px' }}>
        {/* Tournament and Time Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} style={{ color: colors.primary }} />
            <span style={{ fontSize: '14px', color: colors.mutedForeground }}>
              {match.tournament.name} - {match.tournament.round}
            </span>
          </div>
          <Badge variant="secondary">
            {formatDate(match.startTime)}
          </Badge>
        </div>

        {/* Teams */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          {/* Home Team */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${colors.border}`,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.secondary
            }}>
              <img 
                src={match.homeTeam.logo} 
                alt={`${match.homeTeam.name} logo`}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                backgroundColor: colors.primary,
                color: colors.primaryForeground,
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                {match.homeTeam.name.charAt(0)}
              </div>
            </div>
            <h4 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              color: colors.foreground
            }}>
              {match.homeTeam.name}
            </h4>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: colors.mutedForeground,
              textAlign: 'center'
            }}>
              {match.homeTeam.country}
            </p>
          </div>

          {/* VS and Time */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 20px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: '4px'
            }}>
              VS
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.mutedForeground,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Clock size={14} />
              {formatTime(match.startTime)}
            </div>
          </div>

          {/* Away Team */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${colors.border}`,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.secondary
            }}>
              <img 
                src={match.awayTeam.logo} 
                alt={`${match.awayTeam.name} logo`}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                backgroundColor: colors.primary,
                color: colors.primaryForeground,
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                {match.awayTeam.name.charAt(0)}
              </div>
            </div>
            <h4 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              color: colors.foreground
            }}>
              {match.awayTeam.name}
            </h4>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: colors.mutedForeground,
              textAlign: 'center'
            }}>
              {match.awayTeam.country}
            </p>
          </div>
        </div>

        {/* Venue Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: colors.secondary,
          borderRadius: '8px',
          fontSize: '14px',
          color: colors.mutedForeground
        }}>
          <MapPin size={14} />
          <span>{match.venue.name}, {match.venue.city}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
const FIFAClubWorldCup = () => {
  const [matches, setMatches] = useState(fifaClubWorldCupMatches);
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');

  const sortMatches = (matchList, sortType) => {
    const sorted = [...matchList];
    switch (sortType) {
      case 'date':
        return sorted.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      case 'round':
        return sorted.sort((a, b) => a.tournament.round.localeCompare(b.tournament.round));
      case 'venue':
        return sorted.sort((a, b) => a.venue.city.localeCompare(b.venue.city));
      default:
        return sorted;
    }
  };

  const filterMatches = (matchList, filterType) => {
    switch (filterType) {
      case 'uefa':
        return matchList.filter(match => 
          match.homeTeam.confederation === 'UEFA' || match.awayTeam.confederation === 'UEFA'
        );
      case 'conmebol':
        return matchList.filter(match => 
          match.homeTeam.confederation === 'CONMEBOL' || match.awayTeam.confederation === 'CONMEBOL'
        );
      case 'concacaf':
        return matchList.filter(match => 
          match.homeTeam.confederation === 'CONCACAF' || match.awayTeam.confederation === 'CONCACAF'
        );
      case 'caf':
        return matchList.filter(match => 
          match.homeTeam.confederation === 'CAF' || match.awayTeam.confederation === 'CAF'
        );
      case 'afc':
        return matchList.filter(match => 
          match.homeTeam.confederation === 'AFC' || match.awayTeam.confederation === 'AFC'
        );
      default:
        return matchList;
    }
  };

  const filteredAndSortedMatches = sortMatches(filterMatches(matches, filterBy), sortBy);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.foreground
    }}>
      <Header />
      
      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.secondary} 100%)`,
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <Trophy size={40} style={{ color: colors.primary }} />
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              margin: 0,
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.success})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              FIFA Club World Cup 2025
            </h1>
          </div>
          <p style={{
            fontSize: '20px',
            color: colors.mutedForeground,
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            The ultimate club competition featuring the world's best teams from all confederations
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px 20px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          {/* Sort Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '14px', color: colors.mutedForeground }}>Sort by:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'date', label: 'Date' },
                { key: 'round', label: 'Round' },
                { key: 'venue', label: 'Venue' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '14px', color: colors.mutedForeground }}>Filter by confederation:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'uefa', label: 'UEFA' },
                { key: 'conmebol', label: 'CONMEBOL' },
                { key: 'concacaf', label: 'CONCACAF' },
                { key: 'caf', label: 'CAF' },
                { key: 'afc', label: 'AFC' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filterBy === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <Card>
            <CardContent style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary }}>
                {filteredAndSortedMatches.length}
              </div>
              <div style={{ fontSize: '14px', color: colors.mutedForeground }}>
                Upcoming Matches
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary }}>
                32
              </div>
              <div style={{ fontSize: '14px', color: colors.mutedForeground }}>
                Total Teams
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary }}>
                6
              </div>
              <div style={{ fontSize: '14px', color: colors.mutedForeground }}>
                Confederations
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary }}>
                12
              </div>
              <div style={{ fontSize: '14px', color: colors.mutedForeground }}>
                Host Cities
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {filteredAndSortedMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {filteredAndSortedMatches.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: colors.mutedForeground
          }}>
            <Trophy size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No matches found</h3>
            <p style={{ margin: 0 }}>Try adjusting your filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the main component as BalthaTest for compatibility
const BalthaTest = FIFAClubWorldCup;

export default BalthaTest;