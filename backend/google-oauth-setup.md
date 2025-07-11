# Fix Google OAuth Redirect URI Mismatch

## The Problem
Google OAuth is rejecting the redirect URI because it's not configured properly in your Google Cloud Console project.

## Quick Fix Option 1: Use Supabase's Built-in Google OAuth

1. **Go to Supabase Dashboard** → Your Project → Authentication → Providers
2. **Click on Google provider settings**
3. **Look for "Use Supabase's Google OAuth" or similar option**
4. **Enable it** - this uses Supabase's pre-configured Google OAuth
5. **Save and test**

## Fix Option 2: Configure Your Own Google OAuth

### Step 1: Google Cloud Console Setup
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API or Google Identity API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Select "Web application"

### Step 2: Configure Redirect URIs
Add these exact URIs to your Google OAuth app:
```
http://localhost:3000/auth/callback
https://xabjpewtqmddevpbmxnl.supabase.co/auth/v1/callback
```

### Step 3: Add to Supabase
1. Copy the Client ID and Client Secret from Google
2. In Supabase Dashboard → Authentication → Providers → Google
3. Paste the Client ID and Client Secret
4. Save

### Step 4: Update Site URL in Supabase
1. Go to Authentication → Settings
2. Set Site URL to: `http://localhost:3000`
3. Add Additional Redirect URLs: `http://localhost:3000/auth/callback`

## Quick Test Solution: Use Email Authentication Instead

If you want to skip Google OAuth for now, use email/password authentication:

1. **Enable Email Provider** in Supabase Dashboard
2. **Update your community page** to use email auth instead of Google