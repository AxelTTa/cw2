'use client'

import { useState, useEffect } from 'react'

export default function Web3WalletConnect({ onWalletConnected, onWalletDisconnected, currentUser }) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletType, setWalletType] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const [chainId, setChainId] = useState(null)

  // Chiliz Chain configuration
  const CHILIZ_CHAIN_CONFIG = {
    chainId: '0x15B38', // 88888 in hex
    chainName: 'Chiliz Chain',
    nativeCurrency: {
      name: 'CHZ',
      symbol: 'CHZ',
      decimals: 18
    },
    rpcUrls: ['https://rpc.chiliz.com'],
    blockExplorerUrls: ['https://chiliscan.com']
  }

  useEffect(() => {
    checkExistingConnection()
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkExistingConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        if (accounts.length > 0) {
          setIsConnected(true)
          setWalletAddress(accounts[0])
          setWalletType('MetaMask')
          setChainId(chainId)
          
          // Load saved wallet connection from localStorage
          const savedConnection = localStorage.getItem('wallet_connection')
          if (savedConnection) {
            const connection = JSON.parse(savedConnection)
            if (connection.address === accounts[0]) {
              onWalletConnected?.(connection)
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing connection:', error)
      }
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect()
    } else if (accounts[0] !== walletAddress) {
      setWalletAddress(accounts[0])
      updateWalletConnection(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(chainId)
    window.location.reload() // Recommended by MetaMask
  }

  const connectMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        setIsConnected(true)
        setWalletAddress(address)
        setWalletType('MetaMask')

        // Get current chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        setChainId(chainId)

        // Try to switch to Chiliz Chain
        await switchToChilizChain()

        // Save connection to database
        await saveWalletConnection(address, 'metamask')

        // Save to localStorage
        const connection = {
          address,
          type: 'metamask',
          connectedAt: new Date().toISOString()
        }
        localStorage.setItem('wallet_connection', JSON.stringify(connection))

        onWalletConnected?.(connection)
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      setError(error.message || 'Failed to connect to MetaMask')
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToChilizChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHILIZ_CHAIN_CONFIG.chainId }]
      })
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHILIZ_CHAIN_CONFIG]
          })
        } catch (addError) {
          console.error('Error adding Chiliz Chain:', addError)
        }
      } else {
        console.error('Error switching to Chiliz Chain:', switchError)
      }
    }
  }

  const saveWalletConnection = async (address, type) => {
    if (!currentUser) return

    try {
      const response = await fetch('/api/wallet-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          wallet_address: address,
          wallet_type: type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save wallet connection')
      }
    } catch (error) {
      console.error('Error saving wallet connection:', error)
    }
  }

  const updateWalletConnection = async (newAddress) => {
    if (!currentUser) return

    try {
      const response = await fetch('/api/wallet-connection', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          wallet_address: newAddress
        })
      })

      if (response.ok) {
        const connection = {
          address: newAddress,
          type: walletType.toLowerCase(),
          connectedAt: new Date().toISOString()
        }
        localStorage.setItem('wallet_connection', JSON.stringify(connection))
        onWalletConnected?.(connection)
      }
    } catch (error) {
      console.error('Error updating wallet connection:', error)
    }
  }

  const handleDisconnect = async () => {
    setIsConnected(false)
    setWalletAddress('')
    setWalletType('')
    setChainId(null)
    setError('')

    // Remove from localStorage
    localStorage.removeItem('wallet_connection')

    onWalletDisconnected?.()
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isChilizChain = chainId === CHILIZ_CHAIN_CONFIG.chainId

  if (isConnected) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '2px solid #00ff88',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#00ff88',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
            Wallet Connected
          </span>
        </div>

        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '8px'
        }}>
          {formatAddress(walletAddress)}
        </div>

        <div style={{
          fontSize: '14px',
          color: '#888',
          marginBottom: '15px'
        }}>
          {walletType}
        </div>

        {!isChilizChain && (
          <div style={{
            backgroundColor: '#ff6b35',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '15px'
          }}>
            ⚠️ Please switch to Chiliz Chain to claim rewards
            <button
              onClick={switchToChilizChain}
              style={{
                display: 'block',
                margin: '10px auto 0',
                backgroundColor: '#ffffff',
                color: '#ff6b35',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Switch Network
            </button>
          </div>
        )}

        <button
          onClick={handleDisconnect}
          style={{
            backgroundColor: '#333',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
        >
          Disconnect
        </button>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#111',
      border: '2px solid #333',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '20px'
      }}>
        👛
      </div>

      <h3 style={{
        color: '#ffffff',
        fontSize: '20px',
        marginBottom: '10px'
      }}>
        Connect Your Wallet
      </h3>

      <p style={{
        color: '#888',
        fontSize: '14px',
        marginBottom: '20px',
        lineHeight: '1.5'
      }}>
        Connect your Web3 wallet to claim your CHZ token rewards. 
        Make sure you're on the Chiliz Chain network.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#ff4444',
          color: '#ffffff',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={connectMetaMask}
        disabled={isConnecting}
        style={{
          backgroundColor: isConnecting ? '#666' : '#00ff88',
          color: isConnecting ? '#ccc' : '#000000',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          margin: '0 auto'
        }}
        onMouseEnter={(e) => {
          if (!isConnecting) {
            e.target.style.backgroundColor = '#00cc6a'
            e.target.style.transform = 'translateY(-2px)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isConnecting) {
            e.target.style.backgroundColor = '#00ff88'
            e.target.style.transform = 'translateY(0)'
          }
        }}
      >
        {isConnecting ? (
          <>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ccc',
              borderTop: '2px solid #000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Connecting...
          </>
        ) : (
          <>
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyIiBoZWlnaHQ9IjE4OSIgdmlld0JveD0iMCAwIDIxMiAxODkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xXzIpIj4KPHBhdGggZD0iTTEwNS4yIDEyNi4zNzFMMjAuMjU5NSAyMC4yNTcxSDE5MC4yNTlMMTA1LjIgMTI2LjM3MVoiIGZpbGw9IiNGNjY1MTQiLz4KPHBhdGggZD0iTTEwNS4yIDEyNi4zNzFMMjAuMjU5NSAyMC4yNTcxSDE5MC4yNTlMMTA1LjIgMTI2LjM3MVoiIGZpbGw9IiNGNjY1MTQiLz4KPC9nPgo8L3N2Zz4K"
              alt="MetaMask"
              style={{ width: '24px', height: '24px' }}
            />
            Connect MetaMask
          </>
        )}
      </button>

      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: '#666',
        lineHeight: '1.4'
      }}>
        Don't have MetaMask? <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#00ff88', textDecoration: 'none' }}
        >
          Download it here
        </a>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}