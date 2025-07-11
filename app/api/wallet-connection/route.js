import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Connect wallet to user account
export async function POST(request) {
  try {
    const { user_id, wallet_address, wallet_type = 'metamask' } = await request.json()

    if (!user_id || !wallet_address) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and wallet address are required' 
      }, { status: 400 })
    }

    // Validate wallet address format (Ethereum format)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(wallet_address)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      }, { status: 400 })
    }

    // Check if wallet is already connected to another user
    const { data: existingConnection, error: checkError } = await supabaseAdmin
      .from('wallet_connections')
      .select('user_id')
      .eq('wallet_address', wallet_address)
      .neq('user_id', user_id)
      .single()

    if (existingConnection) {
      return NextResponse.json({ 
        success: false, 
        error: 'This wallet is already connected to another account' 
      }, { status: 400 })
    }

    // Upsert wallet connection
    const { data: connection, error: upsertError } = await supabaseAdmin
      .from('wallet_connections')
      .upsert({
        user_id,
        wallet_address: wallet_address.toLowerCase(),
        wallet_type,
        is_primary: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,wallet_address'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error upserting wallet connection:', upsertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save wallet connection' 
      }, { status: 500 })
    }

    // Update user profile with primary wallet address
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        wallet_address: wallet_address.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (profileError) {
      console.error('Error updating profile with wallet address:', profileError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        wallet_address: connection.wallet_address,
        wallet_type: connection.wallet_type,
        is_primary: connection.is_primary,
        connected_at: connection.connected_at
      }
    })

  } catch (error) {
    console.error('Wallet connection API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Update wallet connection
export async function PUT(request) {
  try {
    const { user_id, wallet_address } = await request.json()

    if (!user_id || !wallet_address) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and wallet address are required' 
      }, { status: 400 })
    }

    // Validate wallet address format
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(wallet_address)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address format' 
      }, { status: 400 })
    }

    // Update wallet connection
    const { data: connection, error } = await supabaseAdmin
      .from('wallet_connections')
      .update({
        wallet_address: wallet_address.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('is_primary', true)
      .select()
      .single()

    if (error) {
      console.error('Error updating wallet connection:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update wallet connection' 
      }, { status: 500 })
    }

    // Update user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        wallet_address: wallet_address.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (profileError) {
      console.error('Error updating profile with wallet address:', profileError)
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        wallet_address: connection.wallet_address,
        wallet_type: connection.wallet_type,
        is_primary: connection.is_primary,
        connected_at: connection.connected_at
      }
    })

  } catch (error) {
    console.error('Wallet connection update API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Get user's wallet connections
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
    }

    const { data: connections, error } = await supabaseAdmin
      .from('wallet_connections')
      .select(`
        id,
        wallet_address,
        wallet_type,
        is_primary,
        connected_at,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wallet connections:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch wallet connections' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      connections: connections || []
    })

  } catch (error) {
    console.error('Wallet connection get API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Disconnect wallet
export async function DELETE(request) {
  try {
    const { user_id, wallet_address } = await request.json()

    if (!user_id || !wallet_address) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and wallet address are required' 
      }, { status: 400 })
    }

    // Remove wallet connection
    const { error: deleteError } = await supabaseAdmin
      .from('wallet_connections')
      .delete()
      .eq('user_id', user_id)
      .eq('wallet_address', wallet_address.toLowerCase())

    if (deleteError) {
      console.error('Error deleting wallet connection:', deleteError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to disconnect wallet' 
      }, { status: 500 })
    }

    // Update user profile to remove wallet address if it matches
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        wallet_address: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .eq('wallet_address', wallet_address.toLowerCase())

    if (profileError) {
      console.error('Error updating profile after wallet disconnect:', profileError)
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet disconnected successfully'
    })

  } catch (error) {
    console.error('Wallet disconnect API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}