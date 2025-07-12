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
  Fire,
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

// Component definitions
const Button = ({ children, variant = 'default', size = 'default', onClick, className = '', asChild = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground'
  };
  
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

// Sub-components
const MatchStatusBadge = ({ status, startTime }) => {
  const getStatusDisplay = () => {
    switch (status.status) {
      case 'live':
        return { text: 'LIVE', className: 'bg-red-500 text-white animate-pulse' };
      case 'finished':
        return { text: 'FULL TIME', className: 'bg-gray-500 text-white' };
      case 'scheduled':
        return { text: new Date(startTime).toLocaleTimeString(), className: 'bg-blue-500 text-white' };
      default:
        return { text: status.status.toUpperCase(), className: 'bg-gray-500 text-white' };
    }
  };
  
  const { text, className } = getStatusDisplay();
  
  return (
    <Badge className={className}>
      {text}
    </Badge>
  );
};

const GoalScorers = ({ homeGoals, awayGoals }) => {
  if (!homeGoals.length && !awayGoals.length) return null;
  
  return (
    <div className="grid grid-cols-2 gap-8 mb-6">
      <div className="space-y-2">
        {homeGoals.map((goal, index) => (
          <div key={index} className="text-sm text-muted-foreground">
            <span className="font-medium">{goal.player}</span>
            <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">{goal.minute}'</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 text-right">
        {awayGoals.map((goal, index) => (
          <div key={index} className="text-sm text-muted-foreground">
            <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">{goal.minute}'</span>
            <span className="font-medium ml-2">{goal.player}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StadiumInfo = ({ match }) => (
  <div className="pt-6 border-t border-border">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <div className="text-muted-foreground">Venue</div>
        <div className="font-medium">{match.venue.name}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Location</div>
        <div className="font-medium">{match.venue.city}, {match.venue.country}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Referee</div>
        <div className="font-medium">{match.referee}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Attendance</div>
        <div className="font-medium">{match.attendance?.toLocaleString()}</div>
      </div>
    </div>
  </div>
);

const MatchHeader = ({ match, isLive = false }) => (
  <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-lg">
    {/* Tournament Info */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="font-semibold text-foreground">{match.tournament.name}</div>
          {match.tournament.round && (
            <div className="text-sm text-muted-foreground">{match.tournament.round}</div>
          )}
        </div>
      </div>
      <MatchStatusBadge status={match.status} startTime={match.startTime} />
    </div>

    {/* Main Match Display */}
    <div className="flex items-center justify-between mb-8">
      {/* Home Team */}
      <div className="flex flex-col items-center flex-1 min-w-0">
        <div className="relative w-24 h-24 mb-4">
          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-background to-muted border-2 border-border shadow-xl flex items-center justify-center">
            <img 
              src={match.homeTeam.logo} 
              alt={`${match.homeTeam.name} logo`}
              className="w-20 h-20 object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
        </div>
        <h2 className="font-bold text-xl text-center leading-tight mb-1 max-w-full">
          {match.homeTeam.name}
        </h2>
        <p className="text-sm text-muted-foreground font-medium">{match.homeTeam.country}</p>
      </div>

      {/* Score Section */}
      <div className="flex flex-col items-center px-8 py-4">
        <div className="flex items-center gap-6 mb-3">
          <div className="text-5xl font-black text-primary tabular-nums">
            {match.score.home}
          </div>
          <div className="text-3xl font-bold text-muted-foreground">-</div>
          <div className="text-5xl font-black text-primary tabular-nums">
            {match.score.away}
          </div>
        </div>
        
        {/* Half Time Score */}
        {match.score.halfTime && (
          <div className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
            HT: {match.score.halfTime.home} - {match.score.halfTime.away}
          </div>
        )}
        
        {/* Live Clock */}
        {isLive && match.status.minute && (
          <div className="flex items-center gap-2 mt-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>{match.status.minute}'</span>
          </div>
        )}
      </div>

      {/* Away Team */}
      <div className="flex flex-col items-center flex-1 min-w-0">
        <div className="relative w-24 h-24 mb-4">
          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-background to-muted border-2 border-border shadow-xl flex items-center justify-center">
            <img 
              src={match.awayTeam.logo} 
              alt={`${match.awayTeam.name} logo`}
              className="w-20 h-20 object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
        </div>
        <h2 className="font-bold text-xl text-center leading-tight mb-1 max-w-full">
          {match.awayTeam.name}
        </h2>
        <p className="text-sm text-muted-foreground font-medium">{match.awayTeam.country}</p>
      </div>
    </div>

    {/* Goal Scorers */}
    <GoalScorers homeGoals={match.goals.home} awayGoals={match.goals.away} />

    {/* Stadium & Match Information */}
    <StadiumInfo match={match} />
  </div>
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
        return 'border-green-500 bg-green-50';
      case 'yellow_card':
        return 'border-yellow-500 bg-yellow-50';
      case 'red_card':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${getEventColor()} ${isLive ? 'animate-pulse' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getEventIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm bg-muted px-2 py-1 rounded">{event.minute}'</span>
            <span className="text-sm font-medium capitalize">{event.type.replace('_', ' ')}</span>
            {event.isImportant && <Badge variant="destructive" className="text-xs">Key Event</Badge>}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
          
          {event.player && (
            <div className="text-sm font-medium mb-3">
              <span className="text-primary">{event.player}</span>
              {event.assistPlayer && <span className="text-muted-foreground"> (assisted by {event.assistPlayer})</span>}
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => onReaction(event.id, 'fire')}
              className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded transition-colors"
            >
              <Fire className="w-4 h-4" />
              <span>{event.reactions?.fire || 0}</span>
            </button>
            <button
              onClick={() => onReaction(event.id, 'heart')}
              className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{event.reactions?.heart || 0}</span>
            </button>
            <button
              onClick={() => onCommentClick(event)}
              className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Match Events
            {isLive && (
              <Badge variant="destructive" className="gap-1 animate-pulse">
                <Zap className="w-3 h-3" />
                Live
              </Badge>
            )}
          </CardTitle>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
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
                className="gap-1"
              >
                <span>{label}</span>
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
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

      <CardContent className="p-0">
        <div 
          ref={feedRef}
          className="max-h-96 overflow-y-auto p-4 space-y-4"
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
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No events match your filter</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter('all')}
                className="mt-2"
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
      <CardTitle className="text-lg">Betting Odds</CardTitle>
      <p className="text-sm text-muted-foreground">Latest odds from {odds.source}</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Home Win</div>
          <div className="text-xl font-bold">{odds.home}</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Draw</div>
          <div className="text-xl font-bold">{odds.draw}</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Away Win</div>
          <div className="text-xl font-bold">{odds.away}</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
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
        <CardTitle className="text-lg">Match Predictions</CardTitle>
        <p className="text-sm text-muted-foreground">{stats.total.toLocaleString()} predictions</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Home Win</span>
            <span>{stats.homePercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${stats.homePercentage}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Draw</span>
            <span>{stats.drawPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gray-500 h-2 rounded-full" 
              style={{ width: `${stats.drawPercentage}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Away Win</span>
            <span>{stats.awayPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full" 
              style={{ width: `${stats.awayPercentage}%` }}
            />
          </div>
        </div>

        {!userPrediction && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Make your prediction:</p>
            <div className="grid grid-cols-3 gap-2">
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
          <div className="pt-4 border-t">
            <p className="text-sm text-green-600 font-medium">
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
    <div className="min-h-screen bg-background text-foreground">
      {/* CSS Variables for theming */}
      <style jsx>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 222.2 47.4% 11.2%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96%;
          --secondary-foreground: 222.2 84% 4.9%;
          --muted: 210 40% 96%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96%;
          --accent-foreground: 222.2 84% 4.9%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 222.2 84% 4.9%;
          --radius: 0.5rem;
        }
        
        * {
          border-color: hsl(var(--border));
        }
        
        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 210 40% 98%;
          --primary-foreground: 222.2 84% 4.9%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 212.7 26.8% 83.9%;
        }
      `}</style>

      {/* Header Navigation */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Matches
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Match Header */}
        <MatchHeader match={mockMatch} isLive={false} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Feed */}
            <GameFeed
              events={mockEvents}
              isLive={false}
              onEventClick={handleEventClick}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
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

      {/* Comment Modal */}
      {showComments && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Event Comments</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(false)}>
                ×
              </Button>
            </div>
            
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium">{selectedEvent.minute}' - {selectedEvent.type}</div>
              <div className="text-sm text-muted-foreground">{selectedEvent.description}</div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">FootballFan123</span>
                  <span className="text-xs text-muted-foreground">5 min ago</span>
                </div>
                <p className="text-sm">What a goal! Absolutely incredible technique from that angle.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-3 h-3 mr-1" />
                    24
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border rounded-md bg-background"
                />
                <Button size="sm">
                  <Send className="w-4 h-4" />
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