'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentSection(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const floatingAnimation = {
    animation: 'float 6s ease-in-out infinite',
    animationDelay: '0s'
  }

  const sections = [
    { emoji: '🧩', title: 'Who We Are', color: '#00ff88' },
    { emoji: '⚽', title: 'Why We Built Clutch', color: '#0099ff' },
    { emoji: '🧠', title: 'What We Believe', color: '#ff6b35' },
    { emoji: '🚀', title: 'Join Us', color: '#00ff88' }
  ]

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-15px) rotate(-1deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.6); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-bg {
          background: linear-gradient(-45deg, #0a0a0a, #111111, #0a0a0a, #111111);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.2);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .mobile-hero-section {
            padding: 60px 15px !important;
            min-height: 60vh !important;
          }
          
          .mobile-hero-title {
            font-size: 32px !important;
            line-height: 1.2 !important;
          }
          
          .mobile-hero-text {
            font-size: 16px !important;
          }
          
          .mobile-about-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 0 15px !important;
          }
          
          .mobile-about-card {
            padding: 20px !important;
          }
          
          .mobile-content-section {
            padding: 40px 15px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-hero-title {
            font-size: 28px !important;
          }
          
          .mobile-hero-text {
            font-size: 15px !important;
          }
          
          .mobile-about-card {
            padding: 15px !important;
          }
        }
      `}</style>

      <Header />

      {/* Hero Section */}
      <section className="hero-bg" style={{
        padding: '100px 20px',
        textAlign: 'center',
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Floating Background Elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: '80px',
          opacity: 0.1,
          ...floatingAnimation,
          animationDelay: '0s'
        }}>⚽</div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          fontSize: '60px',
          opacity: 0.1,
          ...floatingAnimation,
          animationDelay: '2s'
        }}>🏆</div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          fontSize: '70px',
          opacity: 0.1,
          ...floatingAnimation,
          animationDelay: '4s'
        }}>🔥</div>

        <div style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s ease-out',
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: '72px',
            fontWeight: '900',
            marginBottom: '30px',
            background: 'linear-gradient(45deg, #00ff88, #0099ff, #ff6b35, #00ff88)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient 3s ease infinite'
          }}>
            We Are Clutch
          </h1>
          
          <p style={{
            fontSize: '24px',
            color: '#ffffff',
            marginBottom: '20px',
            fontWeight: '600',
            maxWidth: '800px'
          }}>
            The future of sports engagement is here
          </p>
          
          <p style={{
            fontSize: '18px',
            color: '#888',
            marginBottom: '50px',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            We're not just building an app — we're creating a revolution where every fan becomes part of the game
          </p>

          {/* Animated Quote */}
          <div style={{
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            border: '2px solid #00ff88',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '600px',
            margin: '0 auto',
            animation: 'glow 2s ease-in-out infinite'
          }}>
            <p style={{
              fontSize: '28px',
              fontStyle: 'italic',
              color: '#00ff88',
              fontWeight: 'bold',
              margin: 0
            }}>
              "Why are fans still on the sidelines?"
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Sections Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '40px 20px',
        backgroundColor: '#111'
      }}>
        {sections.map((section, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '15px 25px',
            borderRadius: '50px',
            backgroundColor: currentSection === index ? section.color : 'transparent',
            border: `2px solid ${section.color}`,
            color: currentSection === index ? '#000' : section.color,
            fontWeight: 'bold',
            transition: 'all 0.5s ease',
            cursor: 'pointer',
            transform: currentSection === index ? 'scale(1.1)' : 'scale(1)'
          }}
          onClick={() => setCurrentSection(index)}
          >
            <span style={{ fontSize: '20px' }}>{section.emoji}</span>
            <span>{section.title}</span>
          </div>
        ))}
      </div>

      {/* Main Content Cards */}
      <main style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '40px'
        }}>
          
          {/* Who We Are */}
          <div className="card-hover" style={{
            backgroundColor: '#111',
            border: '2px solid #00ff88',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              fontSize: '120px',
              opacity: 0.1,
              transform: 'rotate(15deg)'
            }}>🧩</div>
            <h3 style={{ 
              color: '#00ff88', 
              marginBottom: '20px', 
              fontSize: '28px',
              fontWeight: 'bold'
            }}>🧩 Who We Are</h3>
            <p style={{ color: '#ffffff', lineHeight: '1.7', marginBottom: '20px', fontSize: '18px' }}>
              We're a group of <strong style={{ color: '#00ff88' }}>sport-obsessed builders</strong> who got tired of just watching games.
            </p>
            <p style={{ color: '#888', lineHeight: '1.7', marginBottom: '20px' }}>
              We've worked in product, design, Web3, data, and gaming — and we've all asked ourselves the same question during a match:
            </p>
            <div style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #0099ff',
              borderRadius: '12px',
              padding: '20px',
              margin: '20px 0',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#0099ff',
                fontSize: '20px',
                fontStyle: 'italic',
                fontWeight: 'bold',
                margin: 0
              }}>
                "Why are fans still on the sidelines?"
              </p>
            </div>
            <p style={{ color: '#ffffff', lineHeight: '1.7' }}>
              Clutch was born from that frustration — and from our love for <strong style={{ color: '#ff6b35' }}>banter, prediction games, fantasy leagues, and live reactions</strong>.
            </p>
          </div>

          {/* Why We Built Clutch */}
          <div className="card-hover" style={{
            backgroundColor: '#111',
            border: '2px solid #0099ff',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              fontSize: '120px',
              opacity: 0.1,
              transform: 'rotate(-15deg)'
            }}>⚽</div>
            <h3 style={{ 
              color: '#0099ff', 
              marginBottom: '20px', 
              fontSize: '28px',
              fontWeight: 'bold'
            }}>⚽ Why We Built Clutch</h3>
            <h4 style={{
              color: '#ff6b35',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              Matchday is broken.
            </h4>
            <p style={{ color: '#888', lineHeight: '1.7', marginBottom: '20px' }}>
              Today's fan experience is scattered across multiple platforms:
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              margin: '20px 0'
            }}>
              {['SofaScore for scores', 'Twitter for drama', 'WhatsApp for memes', 'Reddit for takes', 'FlashScore for stats'].map((item, i) => (
                <div key={i} style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#888'
                }}>
                  {item}
                </div>
              ))}
            </div>

            <p style={{ color: '#ffffff', lineHeight: '1.7', marginBottom: '20px', fontSize: '18px' }}>
              But <strong style={{ color: '#ff6b35' }}>nothing connects it. Nothing rewards you. Nothing makes you feel inside the match.</strong>
            </p>
            
            <div style={{
              backgroundColor: '#0a0a0a',
              border: '2px solid #00ff88',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#00ff88',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                Clutch fixes that:
              </p>
              <p style={{
                color: '#ffffff',
                lineHeight: '1.6',
                margin: 0
              }}>
                It's a second screen that's made for fans, by fans — not broadcasters.
              </p>
            </div>
          </div>

          {/* What We Believe */}
          <div className="card-hover" style={{
            backgroundColor: '#111',
            border: '2px solid #ff6b35',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              fontSize: '120px',
              opacity: 0.1,
              transform: 'rotate(25deg)'
            }}>🧠</div>
            <h3 style={{ 
              color: '#ff6b35', 
              marginBottom: '25px', 
              fontSize: '28px',
              fontWeight: 'bold'
            }}>🧠 What We Believe</h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {[
                { icon: '⚡', color: '#00ff88', title: 'Live means live', desc: 'If it doesn\'t happen during the game, it doesn\'t matter.' },
                { icon: '🤝', color: '#0099ff', title: 'Fans are participants', desc: 'Fans aren\'t followers. They\'re participants.' },
                { icon: '📱', color: '#ff6b35', title: 'Digital playground', desc: 'Matchday deserves a real digital playground.' },
                { icon: '🧠', color: '#00ff88', title: 'Skill over luck', desc: 'Read the game, predict better, and earn it.' }
              ].map((belief, i) => (
                <div key={i} style={{
                  backgroundColor: '#0a0a0a',
                  border: `1px solid ${belief.color}`,
                  borderRadius: '12px',
                  padding: '15px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${belief.color}20`
                  e.currentTarget.style.transform = 'translateX(5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0a0a0a'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{belief.icon}</span>
                    <h4 style={{ color: belief.color, fontSize: '16px', margin: 0, fontWeight: 'bold' }}>
                      {belief.title}
                    </h4>
                  </div>
                  <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    {belief.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Join Us */}
          <div className="card-hover" style={{
            backgroundColor: '#111',
            border: '2px solid #00ff88',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              fontSize: '120px',
              opacity: 0.1,
              transform: 'rotate(-25deg)'
            }}>🚀</div>
            <h3 style={{ 
              color: '#00ff88', 
              marginBottom: '25px', 
              fontSize: '28px',
              fontWeight: 'bold'
            }}>🚀 Join Us</h3>
            <p style={{ color: '#888', lineHeight: '1.7', marginBottom: '25px', fontSize: '18px' }}>
              Whether you're:
            </p>
            
            <div style={{
              display: 'grid',
              gap: '15px',
              marginBottom: '30px'
            }}>
              {[
                { emoji: '📺', text: 'A fan who screams at the TV' },
                { emoji: '📊', text: 'A stats addict who sees the pass before it happens' },
                { emoji: '💻', text: 'A dev, designer, or community builder' },
                { emoji: '😴', text: 'Someone tired of boring second screens' }
              ].map((type, i) => (
                <div key={i} style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                >
                  <div style={{ fontSize: '24px' }}>{type.emoji}</div>
                  <p style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.4', margin: 0 }}>
                    {type.text}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{
              backgroundColor: '#0a0a0a',
              border: '2px solid #00ff88',
              borderRadius: '15px',
              padding: '25px',
              animation: 'pulse 2s infinite'
            }}>
              <p style={{
                color: '#00ff88',
                fontSize: '20px',
                fontWeight: 'bold',
                margin: 0
              }}>
                You're exactly who we're building this for.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center',
          marginTop: '80px',
          padding: '60px 40px',
          backgroundColor: '#111',
          borderRadius: '20px',
          border: '1px solid #333',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,255,136,0.1), rgba(0,153,255,0.1), rgba(255,107,53,0.1))',
            opacity: 0.5
          }}></div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ 
              fontSize: '36px', 
              marginBottom: '20px', 
              color: '#ffffff',
              fontWeight: 'bold'
            }}>
              Ready to be part of the revolution?
            </h2>
            <p style={{ 
              color: '#888', 
              fontSize: '18px', 
              lineHeight: '1.6', 
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto 40px'
            }}>
              Join thousands of fans who are already experiencing sports like never before. 
              Every comment, every prediction, every moment matters.
            </p>
            <a 
              href="/community" 
              style={{
                display: 'inline-block',
                backgroundColor: '#00ff88',
                color: '#000',
                textDecoration: 'none',
                padding: '18px 40px',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#00cc6a'
                e.target.style.transform = 'translateY(-3px) scale(1.05)'
                e.target.style.boxShadow = '0 10px 25px rgba(0, 255, 136, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00ff88'
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Join the Community 🚀
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}