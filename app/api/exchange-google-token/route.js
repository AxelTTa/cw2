import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'

export async function POST(request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization code is required' 
      }, { status: 400 })
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cw2-alpha.vercel.app'}/auth/callback`,
        grant_type: 'authorization_code'
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange error:', errorData)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to exchange authorization code' 
      }, { status: 400 })
    }

    const tokens = await tokenResponse.json()

    // Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!profileResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch user profile' 
      }, { status: 400 })
    }

    const googleProfile = await profileResponse.json()

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

    // Check if user already exists in profiles table
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('google_id', googleProfile.id)
      .single()

    let userProfile

    if (profileError && profileError.code === 'PGRST116') {
      // User doesn't exist, create new profile
      // Let the database generate the UUID automatically
      const newProfile = {
        google_id: googleProfile.id,
        email: googleProfile.email,
        username: googleProfile.email.split('@')[0],
        display_name: googleProfile.name,
        avatar_url: googleProfile.picture,
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_id_token: tokens.id_token,
        token_expires_at: expiresAt.toISOString(),
        google_profile_data: googleProfile,
        xp: 0,
        level: 1,
        fan_tokens: 100, // Welcome bonus
        streak_count: 0,
        bio: null
      }

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (createError) {
        console.error('Profile creation error:', createError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create user profile' 
        }, { status: 500 })
      }

      userProfile = createdProfile
    } else {
      // User exists, update tokens and profile data
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email: googleProfile.email,
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token || existingProfile.google_refresh_token,
          google_id_token: tokens.id_token,
          token_expires_at: expiresAt.toISOString(),
          google_profile_data: googleProfile,
          display_name: googleProfile.name,
          avatar_url: googleProfile.picture,
          updated_at: new Date().toISOString()
        })
        .eq('google_id', googleProfile.id)
        .select()
        .single()

      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to update user profile' 
        }, { status: 500 })
      }

      userProfile = updatedProfile
    }

    // Generate session token
    const sessionToken = generateSessionToken()

    // Create OAuth session
    const { error: sessionError } = await supabaseAdmin
      .from('oauth_sessions')
      .insert([{
        user_id: userProfile.id,
        session_token: sessionToken,
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_id_token: tokens.id_token,
        token_expires_at: expiresAt.toISOString()
      }])

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      // Continue anyway, session creation is not critical
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        google_id: userProfile.google_id,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture,
        username: userProfile.username,
        display_name: userProfile.display_name,
        avatar_url: userProfile.avatar_url,
        xp: userProfile.xp,
        level: userProfile.level,
        fan_tokens: userProfile.fan_tokens,
        streak_count: userProfile.streak_count
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
        expires_in: tokens.expires_in
      },
      session_token: sessionToken
    })

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function generateSessionToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}