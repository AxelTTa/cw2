'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [floatingElements, setFloatingElements] = useState([])

  useEffect(() => {
    setIsVisible(true)
    
    // Create floating elements
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: ['⚽', '🏆', '🔥', '⭐', '🎯', '⚡', '💰', '🚀'][i],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      speed: 15 + Math.random() * 10
    }))
    setFloatingElements(elements)
  }, [])

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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          25% { transform: translateY(-20px) rotate(90deg); opacity: 0.4; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 0.6; }
          75% { transform: translateY(-15px) rotate(270deg); opacity: 0.3; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(58, 190, 249, 0.3); }
          50% { box-shadow: 0 0 40px rgba(58, 190, 249, 0.6); }
        }
        
        .floating-element {
          position: absolute;
          font-size: 24px;
          pointer-events: none;
          animation: float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          z-index: 1;
        }
        
        .hero-bg {
          background: linear-gradient(-45deg, #0a0a0a, #111111, #0f0f0f, #0a0a0a);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(58, 190, 249, 0.2);
        }
        
        .btn-primary {
          background: linear-gradient(45deg, #3ABEF9, #00FFAA);
          border: none;
          color: #000;
          font-weight: bold;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(58, 190, 249, 0.4);
        }
        
        .btn-secondary {
          background: transparent;
          border: 2px solid #3ABEF9;
          color: #3ABEF9;
          font-weight: bold;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-secondary:hover {
          background: #3ABEF9;
          color: #000;
          transform: translateY(-2px);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 40px !important;
            line-height: 1.2 !important;
          }
          .hero-subtitle {
            font-size: 18px !important;
          }
          .feature-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .btn-primary, .btn-secondary {
            padding: 14px 24px !important;
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* Floating Background Elements */}
      {floatingElements.map(element => (
        <div
          key={element.id}
          className="floating-element"
          style={{
            '--duration': `${element.speed}s`,
            '--delay': `${element.delay}s`,
            top: `${element.y}%`,
            left: `${element.x}%`
          }}
        >
          {element.emoji}
        </div>
      ))}

      <Header />

      {/* Hero Section */}
      <section className="hero-bg" style={{ 
        padding: '100px 20px 80px', 
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <h1 className="hero-title" style={{
            fontSize: '64px',
            fontWeight: '900',
            marginBottom: '24px',
            background: 'linear-gradient(45deg, #3ABEF9, #00FFAA, #3ABEF9)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 3s ease infinite',
            lineHeight: '1.1'
          }}>
            Step Up Your Game with Clutch
          </h1>
          
          <p className="hero-subtitle" style={{
            fontSize: '24px',
            color: '#cccccc',
            marginBottom: '40px',
            fontWeight: '400',
            lineHeight: '1.5'
          }}>
            Engage, Predict, Monetize – Where Crypto Meets Sports
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '40px'
          }}>
            <button className="btn-primary">
              Join Clutch Now
            </button>
          </div>
        </div>
      </section>

      {/* Feature Showcase - Three Sections */}
      <section style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div className="feature-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '40px'
        }}>
          {/* Know the Game */}
          <div className="card-hover" style={{
            backgroundColor: '#111',
            border: '2px solid #333',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            animation: 'slideInUp 0.8s ease-out 0.2s both'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3ABEF9'
            e.currentTarget.style.backgroundColor = '#1a1a1a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333'
            e.currentTarget.style.backgroundColor = '#111'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '24px'
            }}>📊</div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#3ABEF9',
              marginBottom: '20px'
            }}>
              Real-Time Stats & Insights
            </h3>
            <p style={{
              fontSize: '18px',
              color: '#aaa',
              lineHeight: '1.6'
            }}>
              Stay ahead of the action with instant access to detailed stats on players, teams, and competitions. Knowledge is your edge.
            </p>
          </div>

          {/* Engage & Win */}
          <div className="card-hover" style={{
            backgroundColor: '#111',
            border: '2px solid #333',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            animation: 'slideInUp 0.8s ease-out 0.4s both'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00FFAA'
            e.currentTarget.style.backgroundColor = '#1a1a1a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333'
            e.currentTarget.style.backgroundColor = '#111'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '24px'
            }}>💬</div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#00FFAA',
              marginBottom: '20px'
            }}>
              Join the Conversation
            </h3>
            <p style={{
              fontSize: '18px',
              color: '#aaa',
              lineHeight: '1.6'
            }}>
              Share your thoughts, predictions, and analysis. Get likes, build your profile, and compete daily to monetize your sports insight.
            </p>
          </div>

          {/* Clutch Bets */}
          <div className="card-hover" style={{
            backgroundColor: '#111',
            border: '2px solid #333',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            animation: 'slideInUp 0.8s ease-out 0.6s both'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3ABEF9'
            e.currentTarget.style.backgroundColor = '#1a1a1a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333'
            e.currentTarget.style.backgroundColor = '#111'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '24px'
            }}>🎯</div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#3ABEF9',
              marginBottom: '20px'
            }}>
              Instant Mini-Bets, Big Rewards
            </h3>
            <p style={{
              fontSize: '18px',
              color: '#aaa',
              lineHeight: '1.6'
            }}>
              Make the game even more thrilling. Place instant Clutch bets on live matches and earn crypto rewards in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Community Highlights Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#111',
        margin: '0 20px',
        borderRadius: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '80px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            Today's Top Clutch Players
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#aaa'
          }}>
            See who's leading today. Gain recognition and crypto rewards by becoming one of the top three most-liked contributors each day.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {[
            { rank: 1, name: 'CryptoKing88', likes: 2847, earnings: '0.34 ETH', color: '#FFD700' },
            { rank: 2, name: 'SportsProphet', likes: 2156, earnings: '0.21 ETH', color: '#C0C0C0' },
            { rank: 3, name: 'ClutchMaster', likes: 1893, earnings: '0.15 ETH', color: '#CD7F32' }
          ].map((player, index) => (
            <div key={index} className="card-hover" style={{
              backgroundColor: '#1a1a1a',
              border: `2px solid ${player.color}`,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              animation: `slideInUp 0.8s ease-out ${0.8 + index * 0.2}s both`
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: player.color,
                marginBottom: '12px'
              }}>
                #{player.rank}
              </div>
              <h4 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '8px'
              }}>
                {player.name}
              </h4>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                fontSize: '14px',
                color: '#aaa'
              }}>
                <span>👍 {player.likes.toLocaleString()}</span>
                <span style={{ color: '#00FFAA', fontWeight: 'bold' }}>
                  {player.earnings}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof Section */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '40px'
        }}>
          The New Era of Sports Fans is Here
        </h2>
        
        <div style={{
          backgroundColor: '#111',
          borderRadius: '20px',
          padding: '40px',
          border: '2px solid #333',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '24px',
            opacity: 0.3
          }}>
            "
          </div>
          <p style={{
            fontSize: '20px',
            color: '#ddd',
            fontStyle: 'italic',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            Clutch changed how I watch sports. Betting live, winning crypto, and connecting with other fans—there's nothing else like it.
          </p>
          <div style={{
            fontSize: '16px',
            color: '#3ABEF9',
            fontWeight: 'bold'
          }}>
            — Alex, Crypto Enthusiast & Football Fan
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
        background: 'linear-gradient(45deg, rgba(58, 190, 249, 0.1), rgba(0, 255, 170, 0.1))',
        margin: '80px 20px 40px',
        borderRadius: '24px',
        maxWidth: '1000px',
        margin: '80px auto 40px'
      }}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '16px'
        }}>
          Ready to Go Clutch?
        </h2>
        <p style={{
          fontSize: '20px',
          color: '#aaa',
          marginBottom: '40px'
        }}>
          Join thousands of fans already turning passion into profit.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button className="btn-primary">
            Sign Up & Win
          </button>
          <button className="btn-secondary">
            Learn More
          </button>
        </div>
      </section>
    </div>
  )
}