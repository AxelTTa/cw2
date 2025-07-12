// Chiliz Token Utility for milestone rewards
import { ethers } from 'ethers'

// Chiliz Chain Configuration
export const CHILIZ_CHAIN_CONFIG = {
  chainId: '0x15B38', // 88888 in hex
  chainName: 'Chiliz Chain',
  rpcUrls: ['https://rpc.chiliz.com'],
  nativeCurrency: {
    name: 'Chiliz',
    symbol: 'CHZ',
    decimals: 18,
  },
  blockExplorerUrls: ['https://chiliscan.com'],
}

// CHZ Token Contract on Chiliz Chain (native CHZ)
export const CHZ_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000' // Native CHZ

/**
 * Switch to Chiliz Chain
 */
export async function switchToChilizChain() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    // Try to switch to Chiliz chain
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHILIZ_CHAIN_CONFIG.chainId }],
      })
    } catch (switchError) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHILIZ_CHAIN_CONFIG],
        })
      } else {
        throw switchError
      }
    }

    return true
  } catch (error) {
    console.error('Error switching to Chiliz Chain:', error)
    throw error
  }
}

/**
 * Get CHZ balance for an address
 */
export async function getChzBalance(address) {
  try {
    const provider = new ethers.JsonRpcProvider('https://rpc.chiliz.com')
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error('Error getting CHZ balance:', error)
    throw error
  }
}

/**
 * Send CHZ tokens to a recipient
 */
export async function sendChzTokens(recipientAddress, amount) {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    // Ensure we're on Chiliz Chain
    await switchToChilizChain()

    // Connect to MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = provider.getSigner()
    
    // Get current account
    const accounts = await provider.send('eth_requestAccounts', [])
    const fromAddress = accounts[0]

    console.log('🚀 Sending CHZ tokens:', {
      from: fromAddress,
      to: recipientAddress,
      amount: `${amount} CHZ`
    })

    // Check balance
    const balance = await provider.getBalance(fromAddress)
    const balanceInEth = ethers.formatEther(balance)
    
    if (parseFloat(balanceInEth) < amount) {
      throw new Error(`Insufficient balance. You have ${balanceInEth} CHZ, but need ${amount} CHZ`)
    }

    // Create transaction
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount.toString()),
      gasLimit: 21000, // Standard gas limit for CHZ transfer
    })

    console.log('📝 Transaction submitted:', tx.hash)

    // Wait for confirmation
    const receipt = await tx.wait()
    
    console.log('✅ Transaction confirmed:', {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    })

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    }

  } catch (error) {
    console.error('❌ Error sending CHZ tokens:', error)
    throw error
  }
}

/**
 * Send CHZ tokens from admin wallet (server-side)
 */
export async function sendChzFromAdmin(recipientAddress, amount, privateKey) {
  try {
    const provider = new ethers.JsonRpcProvider('https://rpc.chiliz.com')
    const wallet = new ethers.Wallet(privateKey, provider)

    console.log('🚀 Admin sending CHZ tokens:', {
      from: wallet.address,
      to: recipientAddress,
      amount: `${amount} CHZ`
    })

    // Check admin balance
    const balance = await provider.getBalance(wallet.address)
    const balanceInEth = ethers.formatEther(balance)
    
    if (parseFloat(balanceInEth) < amount) {
      throw new Error(`Admin wallet insufficient balance. Has ${balanceInEth} CHZ, needs ${amount} CHZ`)
    }

    // Create and send transaction
    const tx = await wallet.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount.toString()),
      gasLimit: 21000,
    })

    console.log('📝 Admin transaction submitted:', tx.hash)

    // Wait for confirmation
    const receipt = await tx.wait()
    
    console.log('✅ Admin transaction confirmed:', {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    })

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from: wallet.address,
      to: recipientAddress,
      amount: amount
    }

  } catch (error) {
    console.error('❌ Error in admin CHZ transfer:', error)
    throw error
  }
}

/**
 * Validate Chiliz address
 */
export function isValidChilizAddress(address) {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

/**
 * Format CHZ amount for display
 */
export function formatChzAmount(amount) {
  const num = parseFloat(amount)
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K CHZ`
  }
  return `${num.toFixed(2)} CHZ`
}