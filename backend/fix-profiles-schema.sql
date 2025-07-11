-- Fix profiles table schema - add missing email column
-- Run this in your Supabase SQL editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create unique index for email
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update the existing profiles table to match the OAuth schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_profile_data JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON profiles(google_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_google_id_unique ON profiles(google_id) WHERE google_id IS NOT NULL;