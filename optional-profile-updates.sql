-- Optional SQL updates for enhanced user profile management
-- These are supplementary to the existing database structure
-- Run these ONLY if you want additional functionality

-- Add additional fields to profiles table for better user management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_method VARCHAR(50) DEFAULT 'email';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_login_method ON profiles(login_method);
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON profiles(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login DESC);

-- Function to create or update user profile on login
CREATE OR REPLACE FUNCTION upsert_user_profile(
    p_email VARCHAR(255),
    p_username VARCHAR(100),
    p_display_name VARCHAR(255) DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_login_method VARCHAR(50) DEFAULT 'email',
    p_google_id VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_final_username VARCHAR(100);
BEGIN
    -- First try to find existing user by email or google_id
    SELECT id INTO v_user_id
    FROM profiles 
    WHERE email = p_email 
    OR (p_google_id IS NOT NULL AND google_id = p_google_id);
    
    -- If user exists, update their info
    IF v_user_id IS NOT NULL THEN
        UPDATE profiles 
        SET 
            display_name = COALESCE(p_display_name, display_name),
            avatar_url = COALESCE(p_avatar_url, avatar_url),
            last_login = NOW(),
            email_verified = CASE WHEN p_login_method = 'google' THEN true ELSE email_verified END,
            google_id = COALESCE(p_google_id, google_id),
            updated_at = NOW()
        WHERE id = v_user_id;
        
        RETURN v_user_id;
    END IF;
    
    -- Make username unique if it already exists
    v_final_username := p_username;
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = v_final_username) LOOP
        v_final_username := p_username || '_' || FLOOR(RANDOM() * 10000)::TEXT;
    END LOOP;
    
    -- Create new user profile
    INSERT INTO profiles (
        username, 
        display_name, 
        email, 
        avatar_url, 
        login_method,
        google_id,
        last_login,
        email_verified,
        xp,
        level,
        fan_tokens
    ) VALUES (
        v_final_username,
        COALESCE(p_display_name, v_final_username),
        p_email,
        p_avatar_url,
        p_login_method,
        p_google_id,
        NOW(),
        CASE WHEN p_login_method = 'google' THEN true ELSE false END,
        0,
        1,
        100
    ) RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track user login events
CREATE OR REPLACE FUNCTION log_user_login(p_user_id UUID) RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET last_login = NOW()
    WHERE id = p_user_id;
    
    -- Optional: Insert into a login_logs table if you want detailed tracking
    -- INSERT INTO login_logs (user_id, login_time, ip_address) VALUES (p_user_id, NOW(), ...);
END;
$$ LANGUAGE plpgsql;

-- Create a view for user stats (helpful for leaderboards)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.level,
    p.xp,
    p.fan_tokens,
    p.created_at,
    p.last_login,
    COUNT(DISTINCT c.id) as total_comments,
    COALESCE(SUM(c.upvotes), 0) as total_upvotes,
    COUNT(DISTINCT CASE WHEN c.is_meme = true THEN c.id END) as memes_posted
FROM profiles p
LEFT JOIN comments c ON p.id = c.user_id
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.level, p.xp, p.fan_tokens, p.created_at, p.last_login;

-- Sample data: Insert some default matches if they don't exist
-- (This helps with testing the comment system)
INSERT INTO matches (
    id, 
    home_team, 
    away_team, 
    league, 
    season, 
    round,
    match_date,
    venue,
    status,
    home_score,
    away_score
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Real Madrid',
    'Chelsea',
    'FIFA Club World Cup',
    2025,
    'Semi-Final',
    NOW() + INTERVAL '1 day',
    'MetLife Stadium',
    'ns',
    NULL,
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440002', 
    'Manchester City',
    'Inter Miami',
    'FIFA Club World Cup',
    2025,
    'Semi-Final',
    NOW() + INTERVAL '2 days',
    'Rose Bowl',
    'ns',
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;