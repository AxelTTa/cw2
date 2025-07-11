-- OAuth tokens and user data storage schema
-- Run this in your Supabase SQL editor

-- Update profiles table to store OAuth tokens and Google data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_profile_data JSONB;

-- Create index for Google ID lookup
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON profiles(google_id);

-- Create OAuth sessions table for tracking login sessions
CREATE TABLE IF NOT EXISTS oauth_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    google_access_token TEXT NOT NULL,
    google_refresh_token TEXT,
    google_id_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for session token lookup
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_token ON oauth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_user_id ON oauth_sessions(user_id);

-- RLS policies for OAuth sessions
ALTER TABLE oauth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own oauth sessions" ON oauth_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own oauth sessions" ON oauth_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own oauth sessions" ON oauth_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own oauth sessions" ON oauth_sessions FOR DELETE USING (auth.uid() = user_id);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM oauth_sessions 
    WHERE token_expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean up expired sessions (run daily)
-- Note: This would need to be set up manually in Supabase dashboard under Database > Extensions > pg_cron