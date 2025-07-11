# Supabase Authentication Setup Guide

## Enable Google OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle it to "Enabled"

4. **Configure Google OAuth (Option 1 - Quick Setup)**
   - For development, you can use Supabase's built-in Google OAuth
   - Just enable it and it should work for testing

5. **Configure Custom Google OAuth (Option 2 - Production)**
   - Go to Google Cloud Console: https://console.cloud.google.com/
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your domains to authorized origins
   - Copy Client ID and Client Secret to Supabase

6. **Set Redirect URLs**
   - In Supabase Auth settings, add these URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

## Alternative: Enable Email/Password Auth

If you prefer email/password authentication instead:

1. **Enable Email Provider**
   - In Supabase Dashboard > Authentication > Providers
   - Make sure "Email" is enabled

2. **Update the signin code**
   - Replace Google OAuth with email/password signup

## Quick Test Setup

For immediate testing, you can also enable "Anonymous" authentication:
- Go to Authentication > Providers
- Enable "Anonymous" 
- This allows users to sign in without credentials for testing

## Site URL Configuration

Make sure your Site URL is set correctly:
- Go to Authentication > Settings
- Set Site URL to: `http://localhost:3000` (for development)
- Add any additional redirect URLs you need