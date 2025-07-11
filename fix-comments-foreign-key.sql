-- Fix for comments foreign key constraint issue
-- This script ensures profiles exist for users trying to comment

-- First, create a function to automatically create profiles for users that don't exist
CREATE OR REPLACE FUNCTION create_profile_if_not_exists(p_user_id UUID, p_email TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Insert profile if it doesn't exist
    INSERT INTO profiles (
        id,
        email,
        username,
        display_name,
        level,
        xp,
        fan_tokens,
        total_chz_earned,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        COALESCE(p_email, p_user_id::text || '@tempuser.com'),
        'user_' || SUBSTRING(p_user_id::text, 1, 8),
        'User ' || SUBSTRING(p_user_id::text, 1, 8),
        1,
        0,
        0,
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to auto-create profiles when comments are inserted
CREATE OR REPLACE FUNCTION auto_create_profile_for_comment()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile if it doesn't exist
    PERFORM create_profile_if_not_exists(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS auto_create_profile_trigger ON comments;
CREATE TRIGGER auto_create_profile_trigger
    BEFORE INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_profile_for_comment();

-- Fix any existing orphaned comments by creating profiles for them
-- Create profiles for any user_ids that exist in comments but not in profiles
INSERT INTO profiles (
    id,
    email,
    username,
    display_name,
    level,
    xp,
    fan_tokens,
    total_chz_earned,
    created_at,
    updated_at
)
SELECT DISTINCT
    c.user_id,
    c.user_id::text || '@tempuser.com',
    'user_' || SUBSTRING(c.user_id::text, 1, 8),
    'User ' || SUBSTRING(c.user_id::text, 1, 8),
    1,
    0,
    0,
    0,
    NOW(),
    NOW()
FROM comments c
LEFT JOIN profiles p ON p.id = c.user_id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Also create profiles for any user_ids that exist in other tables
INSERT INTO profiles (
    id,
    email,
    username,
    display_name,
    level,
    xp,
    fan_tokens,
    total_chz_earned,
    created_at,
    updated_at
)
SELECT DISTINCT
    r.user_id,
    r.user_id::text || '@tempuser.com',
    'user_' || SUBSTRING(r.user_id::text, 1, 8),
    'User ' || SUBSTRING(r.user_id::text, 1, 8),
    1,
    0,
    0,
    0,
    NOW(),
    NOW()
FROM reactions r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Create the specific user that was failing
INSERT INTO profiles (
    id,
    email,
    username,
    display_name,
    level,
    xp,
    fan_tokens,
    total_chz_earned,
    created_at,
    updated_at
) VALUES (
    '8a3fdcd8-51e8-4643-8611-0855f425ff2c',
    '8a3fdcd8-51e8-4643-8611-0855f425ff2c@tempuser.com',
    'user_8a3fdcd8',
    'User 8a3fdcd8',
    1,
    0,
    0,
    0,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Make sure the profiles table has all necessary columns
DO $$ 
BEGIN
    -- Ensure id column is primary key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name='profiles' AND constraint_type='PRIMARY KEY') THEN
        ALTER TABLE profiles ADD PRIMARY KEY (id);
    END IF;
    
    -- Ensure all necessary columns exist with proper defaults
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='id') THEN
        ALTER TABLE profiles ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='streak_count') THEN
        ALTER TABLE profiles ADD COLUMN streak_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update the comments table to make sure foreign key constraint is properly set
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_comments_user_id_performance ON comments(user_id);

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for profiles (Reddit-style public access)
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

COMMIT;