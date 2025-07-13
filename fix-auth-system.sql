-- ===================================================
-- FIX AUTHENTICATION SYSTEM
-- ===================================================
-- This script creates the missing oauth_sessions table
-- Run this in your Supabase SQL editor or database

-- Create the missing oauth_sessions table
CREATE TABLE IF NOT EXISTS oauth_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    session_token character varying NOT NULL,
    google_access_token text,
    google_refresh_token text,
    google_id_token text,
    token_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    last_used_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    user_agent text,
    ip_address inet,
    CONSTRAINT oauth_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT oauth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT oauth_sessions_session_token_unique UNIQUE (session_token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_user_id ON oauth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_session_token ON oauth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_active ON oauth_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires ON oauth_sessions(token_expires_at) WHERE token_expires_at IS NOT NULL;

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM oauth_sessions 
    WHERE token_expires_at < now() 
    AND token_expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Optionally create a function to validate session tokens
CREATE OR REPLACE FUNCTION validate_session_token(p_session_token text)
RETURNS TABLE(
    user_id uuid,
    is_valid boolean,
    expires_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        os.user_id,
        (os.token_expires_at > now() OR os.token_expires_at IS NULL) as is_valid,
        os.token_expires_at as expires_at
    FROM oauth_sessions os
    WHERE os.session_token = p_session_token
    AND os.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust for your setup)
-- GRANT ALL ON oauth_sessions TO authenticated;
-- GRANT ALL ON oauth_sessions TO service_role;