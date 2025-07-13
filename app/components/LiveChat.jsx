'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'

export default function LiveChat({ matchId, currentUser }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [chatStats, setChatStats] = useState({ total_messages: 0, unique_users: 0 })
  const messagesEndRef = useRef(null)
  const realtimeChannelRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load initial chat messages
  const loadMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_match_chat_messages', {
        p_match_id: matchId,
        p_limit: 100,
        p_offset: 0
      })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      // Reverse to show newest at bottom
      setMessages(data?.reverse() || [])
      
      // Load chat stats
      const { data: stats } = await supabase.rpc('get_match_chat_stats', {
        p_match_id: matchId
      })
      
      if (stats) {
        setChatStats(stats)
      }
    } catch (err) {
      console.error('Error in loadMessages:', err)
    } finally {
      setLoading(false)
    }
  }

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !currentUser || sending) {
      return
    }

    try {
      setSending(true)
      
      const { data, error } = await supabase.rpc('add_match_chat_message', {
        p_match_id: matchId,
        p_user_id: currentUser.id,
        p_message: newMessage.trim(),
        p_message_type: 'text'
      })

      if (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message. Please try again.')
        return
      }

      if (data?.success) {
        setNewMessage('')
        // Message will be added via realtime subscription
      }
    } catch (err) {
      console.error('Error in sendMessage:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Clear user's chat messages
  const clearChat = async () => {
    if (!currentUser || !confirm('Are you sure you want to clear your chat messages? This action cannot be undone.')) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('clear_user_match_chat', {
        p_match_id: matchId,
        p_user_id: currentUser.id
      })

      if (error) {
        console.error('Error clearing chat:', error)
        alert('Failed to clear chat. Please try again.')
        return
      }

      if (data?.success) {
        // Reload messages to reflect the changes
        await loadMessages()
        alert(`Cleared ${data.deleted_count} messages successfully.`)
      }
    } catch (err) {
      console.error('Error in clearChat:', err)
      alert('Failed to clear chat. Please try again.')
    }
  }

  // Setup realtime subscription
  useEffect(() => {
    if (!matchId) return

    // Load initial messages
    loadMessages()

    // Setup realtime subscription
    const channel = supabase
      .channel(`match_chat:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_chats',
          filter: `match_id=eq.${matchId}`
        },
        async (payload) => {
          const newRow = payload.new
          
          // Fetch user details for the new message
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', newRow.user_id)
            .single()

          if (userProfile) {
            const newMessage = {
              ...newRow,
              username: userProfile.username,
              display_name: userProfile.display_name
            }

            setMessages(prev => [...prev, newMessage])
            
            // Update stats
            setChatStats(prev => ({
              ...prev,
              total_messages: prev.total_messages + 1
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'match_chats',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          // Handle message updates (like deletions)
          const updatedRow = payload.new
          if (updatedRow.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedRow.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    realtimeChannelRef.current = channel

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [matchId])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div style={{
      backgroundColor: '#111',
      border: '2px solid #333',
      borderRadius: '12px',
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#00ff88',
            margin: '0 0 4px 0'
          }}>
            💬 Live Chat
          </h3>
          <div style={{
            fontSize: '12px',
            color: '#888'
          }}>
            {chatStats.total_messages} messages • {chatStats.unique_users} users
            {isConnected && (
              <span style={{ color: '#00ff88', marginLeft: '8px' }}>
                🟢 Live
              </span>
            )}
          </div>
        </div>
        
        {currentUser && (
          <button
            onClick={clearChat}
            style={{
              backgroundColor: '#444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#666'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#444'}
          >
            Clear My Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            color: '#888',
            padding: '20px'
          }}>
            Loading chat...
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#888',
            padding: '20px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💭</div>
            <div>No messages yet. Be the first to chat!</div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {/* Message Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px'
              }}>
                <span style={{
                  color: '#00ff88',
                  fontWeight: 'bold'
                }}>
                  {message.display_name || message.username}
                </span>
                <span style={{ color: '#666' }}>
                  {formatTime(message.created_at)}
                </span>
              </div>
              
              {/* Message Content */}
              <div style={{
                backgroundColor: '#0a0a0a',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                lineHeight: '1.4',
                wordBreak: 'break-word'
              }}>
                {message.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {currentUser ? (
        <form onSubmit={sendMessage} style={{
          padding: '16px',
          borderTop: '1px solid #333',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            style={{
              flex: 1,
              backgroundColor: '#222',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none'
            }}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              backgroundColor: newMessage.trim() && !sending ? '#00ff88' : '#444',
              color: newMessage.trim() && !sending ? '#000' : '#888',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>
      ) : (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #333',
          textAlign: 'center',
          color: '#888',
          fontSize: '14px'
        }}>
          Please log in to participate in the chat
        </div>
      )}
    </div>
  )
}