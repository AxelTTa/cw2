'use client';

import { useState, useEffect } from 'react';

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const [floatingStats, setFloatingStats] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatingCard, setAnimatingCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
    
    const statsInterval = setInterval(() => {
      const newStat = {
        id: Date.now(),
        emoji: ['📊', '⚽', '🥅', '🎯', '📈', '🔥', '⭐', '🏆', '⚡', '💎'][Math.floor(Math.random() * 10)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        speed: 12 + Math.random() * 8
      };
      setFloatingStats(prev => [...prev.slice(-9), newStat]);
    }, 3000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleCardClick = (index) => {
    setAnimatingCard(index);
    setTimeout(() => setAnimatingCard(null), 600);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/live', label: 'Live' },
    { href: '/players', label: 'Players' },
    { href: '/stats', label: 'Stats', active: true },
    { href: '/teams', label: 'Teams' },
    { href: '/community', label: 'Community' },
    { href: '/about', label: 'About' },
    { href: '/rewards', label: 'Rewards' }
  ];

  const liveMatches = [
    { 
      home: 'Real Madrid', 
      away: 'Bayern München', 
      homeScore: 1, 
      awayScore: 2, 
      time: '1st Half 38:42',
      status: 'live'
    },
    { 
      home: 'Chelsea', 
      away: 'Arsenal', 
      homeScore: 2, 
      awayScore: 1, 
      time: '2nd Half 67:23',
      status: 'live'
    }
  ];

  const topPlayers = [
    { 
      name: 'Lionel Messi', 
      team: 'Inter Miami', 
      goals: '8', 
      assists: '12', 
      games: '15',
      position: '#1',
      flag: '🇦🇷'
    },
    { 
      name: 'Erling Haaland', 
      team: 'Manchester City', 
      goals: '12', 
      assists: '3', 
      games: '14',
      position: '#2',
      flag: '🇳🇴'
    },
    { 
      name: 'Kylian Mbappé', 
      team: 'Real Madrid', 
      goals: '9', 
      assists: '7', 
      games: '16',
      position: '#3',
      flag: '🇫🇷'
    }
  ];

  const liveUpdates = [
    { 
      time: '2 min ago', 
      text: 'Goal by Bellingham, Real Madrid 1-2 Bayern München',
      type: 'goal',
      icon: '⚽',
      color: '#00ff88'
    },
    { 
      time: '5 min ago', 
      text: 'Penalty goal by Havertz, Chelsea 2-1 Arsenal',
      type: 'penalty',
      icon: '🥅',
      color: '#0099ff'
    },
    { 
      time: '8 min ago', 
      text: 'Substitution: Messi replaces Suárez, Inter Miami',
      type: 'substitution',
      icon: '🔄',
      color: '#ff6b35'
    },
    { 
      time: '12 min ago', 
      text: 'Yellow card for Xhaka, Arsenal vs Chelsea',
      type: 'card',
      icon: '🟨',
      color: '#ffdd00'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes floatStats {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          25% { transform: translateY(-40px) rotate(90deg); opacity: 0.8; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
          75% { transform: translateY(-35px) rotate(270deg); opacity: 0.6; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.3); }
          50% { box-shadow: 0 0 50px rgba(0, 255, 136, 0.7); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
        @keyframes numberCount {
          from { transform: scale(0.5) rotate(-180deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        
        .floating-stat {
          position: absolute;
          font-size: 32px;
          pointer-events: none;
          animation: floatStats var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          z-index: 1;
        }
        
        .hero-bg {
          background: linear-gradient(-45deg, #0a0a0a, #111111, #0f0f0f, #0a0a0a);
          background-size: 400% 400%;
          animation: gradientShift 25s ease infinite;
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .card-hover:hover {
          transform: translateY(-15px) scale(1.03);
          box-shadow: 0 30px 60px rgba(0, 255, 136, 0.3);
        }
        
        .card-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.7s;
        }
        
        .card-hover:hover::before {
          left: 100%;
        }
        
        .live-badge {
          animation: heartbeat 2s infinite;
        }
        
        .number-animate {
          animation: numberCount 0.8s ease-out;
        }
        
        .stat-card {
          position: relative;
          background: linear-gradient(135deg, #111111, #1a1a1a, #111111);
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        
        .update-item {
          transition: all 0.3s ease;
        }
        
        .update-item:hover {
          background-color: rgba(0, 255, 136, 0.05);
          transform: translateX(10px);
          border-left: 3px solid #00ff88;
          padding-left: 12px;
        }
        
        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: sparkle 2.5s infinite;
        }
      `}</style>

      {/* Floating Stats */}
      {floatingStats.map(stat => (
        <div
          key={stat.id}
          className="floating-stat"
          style={{
            '--duration': `${stat.speed}s`,
            '--delay': `${stat.delay}s`,
            top: `${stat.y}%`,
            left: `${stat.x}%`
          }}
        >
          {stat.emoji}
        </div>
      ))}

      {/* Sparkles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${Math.random() * 4}s`
          }}
        />
      ))}

      {/* Header */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        animation: isVisible ? 'slideInUp 0.8s ease-out' : 'none'
      }}>
        <div 
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#00ff88',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => window.location.href = '/'}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.15)';
            e.target.style.textShadow = '0 0 25px #00ff88';
            e.target.style.filter = 'brightness(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.textShadow = 'none';
            e.target.style.filter = 'brightness(1)';
          }}
        >
          Clutch
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          {navItems.map((item, index) => (
            <a 
              key={item.href}
              href={item.href} 
              style={{ 
                color: item.active ? '#ffffff' : '#888', 
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                padding: '8px 0'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#00ff88';
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.textShadow = '0 5px 10px rgba(0, 255, 136, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = item.active ? '#ffffff' : '#888';
                e.target.style.transform = 'translateY(0)';
                e.target.style.textShadow = 'none';
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="hero-bg" style={{ padding: '60px 20px' }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          animation: isVisible ? 'slideInUp 0.8s ease-out 0.2s both' : 'none'
        }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '900',
            marginBottom: '25px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35, #00ff88)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 4s ease infinite',
            textShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
          }}>
            📊 Live Statistics
          </h1>
          <p style={{
            fontSize: '22px',
            color: '#cccccc',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            animation: 'fadeInScale 1s ease-out 0.4s both'
          }}>
            Real-time data and insights from the Club World Cup 2025
          </p>
          
          <div style={{
            marginTop: '30px',
            display: 'inline-block',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            border: '2px solid #00ff88',
            borderRadius: '50px',
            padding: '15px 30px',
            animation: 'glow 3s ease-in-out infinite'
          }}>
            <div style={{ 
              color: '#00ff88', 
              fontSize: '18px', 
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}>
              🕐 {currentTime.toLocaleTimeString()} - Live Updates
            </div>
          </div>
        </div>

        {/* Live Matches */}
        <section style={{ 
          marginBottom: '60px',
          maxWidth: '1200px',
          margin: '0 auto 60px'
        }}>
          <h2 style={{ 
            color: '#ffffff', 
            marginBottom: '30px', 
            fontSize: '32px',
            textAlign: 'center',
            animation: isVisible ? 'slideInLeft 0.8s ease-out 0.6s both' : 'none'
          }}>
            🔥 Live Matches
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px'
          }}>
            {liveMatches.map((match, index) => (
              <div 
                key={index}
                className={`card-hover stat-card ${animatingCard === index ? 'number-animate' : ''}`}
                style={{
                  border: '2px solid #333',
                  borderRadius: '16px',
                  padding: '30px',
                  animation: isVisible ? `fadeInScale 0.8s ease-out ${0.8 + index * 0.2}s both` : 'none',
                  position: 'relative'
                }}
                onClick={() => handleCardClick(index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent)',
                  animation: 'shimmer 3s infinite'
                }} />
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '20px' 
                }}>
                  <span className="live-badge" style={{ 
                    color: '#00ff88', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #00ff88'
                  }}>
                    🔴 LIVE
                  </span>
                  <span style={{ 
                    color: '#888', 
                    fontSize: '16px',
                    animation: 'pulse 2s infinite'
                  }}>
                    {match.time}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      marginBottom: '10px',
                      color: '#ffffff'
                    }}>
                      {match.home}
                    </div>
                    <div style={{ 
                      fontSize: '48px', 
                      fontWeight: 'bold', 
                      color: '#0099ff',
                      animation: 'glow 3s ease-in-out infinite'
                    }}>
                      {match.homeScore}
                    </div>
                  </div>
                  
                  <div style={{ 
                    color: '#888', 
                    fontSize: '24px',
                    margin: '0 20px',
                    animation: 'pulse 3s infinite'
                  }}>
                    vs
                  </div>
                  
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      marginBottom: '10px',
                      color: '#ffffff'
                    }}>
                      {match.away}
                    </div>
                    <div style={{ 
                      fontSize: '48px', 
                      fontWeight: 'bold', 
                      color: '#0099ff',
                      animation: 'glow 3s ease-in-out infinite 0.5s'
                    }}>
                      {match.awayScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Players */}
        <section style={{ 
          marginBottom: '60px',
          maxWidth: '1200px',
          margin: '0 auto 60px'
        }}>
          <h2 style={{ 
            color: '#ffffff', 
            marginBottom: '30px', 
            fontSize: '32px',
            textAlign: 'center',
            animation: isVisible ? 'slideInRight 0.8s ease-out 1.2s both' : 'none'
          }}>
            ⭐ Top Performers This Week
          </h2>
          
          <div className="card-hover stat-card" style={{
            border: '2px solid #333',
            borderRadius: '16px',
            overflow: 'hidden',
            animation: isVisible ? 'fadeInScale 0.8s ease-out 1.4s both' : 'none'
          }}>
            {topPlayers.map((player, index) => (
              <div 
                key={index} 
                className="card-hover" 
                style={{
                  padding: '25px',
                  borderBottom: index < 2 ? '2px solid #333' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 136, 0.05)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                    color: '#000',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    animation: 'pulse 3s infinite'
                  }}>
                    {player.position}
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span>{player.flag}</span>
                      {player.name}
                    </div>
                    <div style={{ color: '#888', fontSize: '16px' }}>{player.team}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '40px', textAlign: 'center' }}>
                  <div>
                    <div style={{ 
                      color: '#00ff88', 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      animation: 'bounce 2s infinite'
                    }}>
                      {player.goals}
                    </div>
                    <div style={{ color: '#888', fontSize: '14px' }}>⚽ Goals</div>
                  </div>
                  <div>
                    <div style={{ 
                      color: '#0099ff', 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      animation: 'bounce 2s infinite 0.3s'
                    }}>
                      {player.assists}
                    </div>
                    <div style={{ color: '#888', fontSize: '14px' }}>🎯 Assists</div>
                  </div>
                  <div>
                    <div style={{ 
                      color: '#ff6b35', 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      animation: 'bounce 2s infinite 0.6s'
                    }}>
                      {player.games}
                    </div>
                    <div style={{ color: '#888', fontSize: '14px' }}>🏃 Games</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Updates */}
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            color: '#ffffff', 
            marginBottom: '30px', 
            fontSize: '32px',
            textAlign: 'center',
            animation: isVisible ? 'slideInUp 0.8s ease-out 1.6s both' : 'none'
          }}>
            ⚡ Live Updates Feed
          </h2>
          
          <div className="card-hover stat-card" style={{
            border: '2px solid #333',
            borderRadius: '16px',
            padding: '30px',
            animation: isVisible ? 'fadeInScale 0.8s ease-out 1.8s both' : 'none'
          }}>
            {liveUpdates.map((update, index) => (
              <div key={index} className="update-item" style={{
                padding: '20px 0',
                borderBottom: index < 3 ? '1px solid #333' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{
                  backgroundColor: `${update.color}20`,
                  border: `2px solid ${update.color}`,
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  animation: 'pulse 3s infinite'
                }}>
                  {update.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: update.color,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    textTransform: 'uppercase'
                  }}>
                    {update.time}
                  </div>
                  <div style={{ 
                    color: '#ffffff', 
                    fontSize: '18px',
                    lineHeight: '1.4'
                  }}>
                    {update.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <button 
              style={{
                backgroundColor: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                animation: 'glow 4s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a';
                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 255, 136, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              View All Updates 📈
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}