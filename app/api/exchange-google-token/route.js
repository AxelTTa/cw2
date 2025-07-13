import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../utils/supabase'

export async function POST(request) {
  try {
    console.log('🔐 [EXCHANGE-TOKEN] Processing Google token exchange...')
    
    const requestBody = await request.json()
    const { code } = requestBody
    
    console.log('📋 [EXCHANGE-TOKEN] Request data:', {
      hasCode: !!code,
      codeLength: code?.length || 0
    })

    if (!code) {
      console.log('❌ [EXCHANGE-TOKEN] Missing authorization code')
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization code is required' 
      }, { status: 400 })
    }
    
    console.log('✅ [EXCHANGE-TOKEN] Authorization code received')

    // Exchange code for tokens
    console.log('🔑 [EXCHANGE-TOKEN] Exchanging code for tokens with Google...')
    
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
    
    console.log('🔑 [EXCHANGE-TOKEN] Google token response status:', tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('❌ [EXCHANGE-TOKEN] Token exchange error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorData
      })
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to exchange authorization code' 
      }, { status: 400 })
    }

    const tokens = await tokenResponse.json()
    
    console.log('✅ [EXCHANGE-TOKEN] Tokens received from Google:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      hasIdToken: !!tokens.id_token,
      expiresIn: tokens.expires_in
    })

    // Fetch user profile from Google
    console.log('👤 [EXCHANGE-TOKEN] Fetching user profile from Google...')
    
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!profileResponse.ok) {
      console.error('❌ [EXCHANGE-TOKEN] Failed to fetch profile:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText
      })
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch user profile' 
      }, { status: 400 })
    }

    const googleProfile = await profileResponse.json()
    
    console.log('👤 [EXCHANGE-TOKEN] Google profile received:', {
      id: googleProfile.id,
      email: googleProfile.email,
      name: googleProfile.name,
      verified_email: googleProfile.verified_email
    })

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

    // Check if user already exists in profiles table
    console.log('💾 [EXCHANGE-TOKEN] Checking for existing profile...')
    
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('google_id', googleProfile.id)
      .single()
      
    console.log('💾 [EXCHANGE-TOKEN] Profile check result:', {
      profileExists: !!existingProfile,
      errorCode: profileError?.code,
      errorMessage: profileError?.message
    })

    let userProfile

    if (profileError && profileError.code === 'PGRST116') {
      // User doesn't exist, create new profile
      // Generate a safe username using the database function
      const { data: usernameResult } = await supabaseAdmin.rpc('generate_safe_username', {
        base_email: googleProfile.email
      })
      
      const safeUsername = usernameResult || googleProfile.email.split('@')[0]
      
      const newProfile = {
        google_id: googleProfile.id,
        email: googleProfile.email,
        username: safeUsername,
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

      console.log('👥 [EXCHANGE-TOKEN] Creating new user profile...')
      
      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (createError) {
        console.error('❌ [EXCHANGE-TOKEN] Profile creation error:', {
          error: createError.message,
          code: createError.code,
          details: createError.details,
          newProfile: newProfile
        })
        
        // If it's a duplicate key error, try to find the existing profile
        if (createError.code === '23505') { // Unique constraint violation
          console.log('🔍 [EXCHANGE-TOKEN] Duplicate key error, searching for existing profile...')
          
          // Try to find existing profile by google_id or email
          const { data: existingProfile, error: findError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .or(`google_id.eq.${googleProfile.id},email.eq.${googleProfile.email}`)
            .single()
            
          if (existingProfile && !findError) {
            console.log('✅ [EXCHANGE-TOKEN] Found existing profile, updating it...')
            userProfile = existingProfile
          } else {
            return NextResponse.json({ 
              success: false, 
              error: 'Failed to create user profile - duplicate data' 
            }, { status: 500 })
          }
        } else {
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to create user profile' 
          }, { status: 500 })
        }
      } else {
        console.log('✅ [EXCHANGE-TOKEN] New profile created:', {
          id: createdProfile.id,
          email: createdProfile.email,
          username: createdProfile.username,
          fanTokens: createdProfile.fan_tokens
        })

        userProfile = createdProfile
      }
    } else {
      // User exists, update tokens and profile data
      console.log('🔄 [EXCHANGE-TOKEN] Updating existing user profile...')
      
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
        console.error('❌ [EXCHANGE-TOKEN] Profile update error:', {
          error: updateError.message,
          code: updateError.code,
          details: updateError.details
        })
        
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to update user profile' 
        }, { status: 500 })
      }
      
      console.log('✅ [EXCHANGE-TOKEN] Profile updated:', {
        id: updatedProfile.id,
        email: updatedProfile.email,
        fanTokens: updatedProfile.fan_tokens
      })

      userProfile = updatedProfile
    }

    // Generate session token
    console.log('🎫 [EXCHANGE-TOKEN] Creating session...')
    
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
      console.error('⚠️ [EXCHANGE-TOKEN] Session creation error:', {
        error: sessionError.message,
        code: sessionError.code
      })
      // Continue anyway, session creation is not critical
    } else {
      console.log('✅ [EXCHANGE-TOKEN] Session created successfully')
    }

    // Return success response
    console.log('✅ [EXCHANGE-TOKEN] Token exchange completed successfully')
    
    const responseData = {
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
    }
    
    console.log('📦 [EXCHANGE-TOKEN] Response data:', {
      success: responseData.success,
      userId: responseData.user.id,
      userEmail: responseData.user.email,
      fanTokens: responseData.user.fan_tokens,
      hasTokens: !!responseData.tokens.access_token
    })
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ [EXCHANGE-TOKEN] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
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