-- Final schema updates for match comments functionality
-- Run this in your Supabase SQL editor to ensure all tables exist

-- Ensure comments table has all necessary columns for matches
DO $$ 
BEGIN
    -- Add match_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='match_id') THEN
        ALTER TABLE comments ADD COLUMN match_id BIGINT;
        CREATE INDEX idx_comments_match_id ON comments(match_id);
    END IF;
    
    -- Ensure user_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='user_id') THEN
        ALTER TABLE comments ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure parent_id column exists for replies
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='parent_id') THEN
        ALTER TABLE comments ADD COLUMN parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure content column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='content') THEN
        ALTER TABLE comments ADD COLUMN content TEXT NOT NULL;
    END IF;
    
    -- Ensure comment_type column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='comment_type') THEN
        ALTER TABLE comments ADD COLUMN comment_type VARCHAR(20) DEFAULT 'text';
    END IF;
    
    -- Ensure upvotes column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='upvotes') THEN
        ALTER TABLE comments ADD COLUMN upvotes INTEGER DEFAULT 0;
    END IF;
    
    -- Ensure created_at column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='created_at') THEN
        ALTER TABLE comments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Ensure updated_at column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='updated_at') THEN
        ALTER TABLE comments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_match_id_created_at ON comments(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Ensure reactions table exists (for comment reactions)
CREATE TABLE IF NOT EXISTS reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id, reaction_type)
);

-- Ensure profiles table has necessary columns
DO $$ 
BEGIN
    -- Ensure username column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='username') THEN
        ALTER TABLE profiles ADD COLUMN username VARCHAR(50);
    END IF;
    
    -- Ensure display_name column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='display_name') THEN
        ALTER TABLE profiles ADD COLUMN display_name VARCHAR(100);
    END IF;
    
    -- Ensure email column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE profiles ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Ensure xp column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='xp') THEN
        ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
    
    -- Ensure level column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='level') THEN
        ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    
    -- Ensure fan_tokens column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='fan_tokens') THEN
        ALTER TABLE profiles ADD COLUMN fan_tokens INTEGER DEFAULT 0;
    END IF;
END $$;

-- Enable RLS on tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (Reddit-style public access)
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on reactions" ON reactions;
CREATE POLICY "Allow all operations on reactions" ON reactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Function to get nested comments with replies
CREATE OR REPLACE FUNCTION get_match_comments(p_match_id BIGINT, p_limit INTEGER DEFAULT 50, p_sort_by TEXT DEFAULT 'newest')
RETURNS TABLE (
    id UUID,
    user_id UUID,
    match_id BIGINT,
    parent_id UUID,
    content TEXT,
    comment_type VARCHAR(20),
    upvotes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    profiles JSON,
    reactions JSON,
    replies JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE comment_tree AS (
        -- Get parent comments
        SELECT 
            c.id, c.user_id, c.match_id, c.parent_id, c.content, c.comment_type,
            c.upvotes, c.created_at, c.updated_at,
            0 as depth
        FROM comments c
        WHERE c.match_id = p_match_id AND c.parent_id IS NULL
        
        UNION ALL
        
        -- Get replies recursively
        SELECT 
            c.id, c.user_id, c.match_id, c.parent_id, c.content, c.comment_type,
            c.upvotes, c.created_at, c.updated_at,
            ct.depth + 1
        FROM comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
        WHERE ct.depth < 3 -- Limit nesting depth
    ),
    comment_data AS (
        SELECT 
            ct.*,
            row_to_json(p.*) as profile_data,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', r.id,
                        'user_id', r.user_id,
                        'reaction_type', r.reaction_type,
                        'created_at', r.created_at
                    )
                ) FILTER (WHERE r.id IS NOT NULL),
                '[]'::json
            ) as reaction_data
        FROM comment_tree ct
        LEFT JOIN profiles p ON p.id = ct.user_id
        LEFT JOIN reactions r ON r.comment_id = ct.id
        GROUP BY ct.id, ct.user_id, ct.match_id, ct.parent_id, ct.content, 
                 ct.comment_type, ct.upvotes, ct.created_at, ct.updated_at, ct.depth, p.*
    )
    SELECT 
        cd.id,
        cd.user_id,
        cd.match_id,
        cd.parent_id,
        cd.content,
        cd.comment_type,
        cd.upvotes,
        cd.created_at,
        cd.updated_at,
        cd.profile_data as profiles,
        cd.reaction_data as reactions,
        '[]'::json as replies -- Replies will be nested in application logic
    FROM comment_data cd
    WHERE cd.depth = 0
    ORDER BY 
        CASE 
            WHEN p_sort_by = 'newest' THEN cd.created_at 
            ELSE cd.created_at 
        END DESC,
        CASE 
            WHEN p_sort_by = 'popular' THEN cd.upvotes 
            ELSE 0 
        END DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle comment upvotes
CREATE OR REPLACE FUNCTION handle_comment_upvote(p_comment_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_new_upvotes INTEGER;
    v_result JSON;
BEGIN
    -- Increment upvote count
    UPDATE comments 
    SET upvotes = upvotes + 1,
        updated_at = NOW()
    WHERE id = p_comment_id
    RETURNING upvotes INTO v_new_upvotes;
    
    -- Return result
    SELECT json_build_object(
        'success', true,
        'upvotes', v_new_upvotes,
        'message', 'Comment upvoted successfully'
    ) INTO v_result;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        SELECT json_build_object(
            'success', false,
            'error', SQLERRM
        ) INTO v_result;
        RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle reactions
CREATE OR REPLACE FUNCTION handle_comment_reaction(p_comment_id UUID, p_user_id UUID, p_reaction_type VARCHAR(20))
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Insert or update reaction (upsert)
    INSERT INTO reactions (user_id, comment_id, reaction_type)
    VALUES (p_user_id, p_comment_id, p_reaction_type)
    ON CONFLICT (user_id, comment_id, reaction_type) 
    DO UPDATE SET created_at = NOW();
    
    -- Return success
    SELECT json_build_object(
        'success', true,
        'message', 'Reaction added successfully'
    ) INTO v_result;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        SELECT json_build_object(
            'success', false,
            'error', SQLERRM
        ) INTO v_result;
        RETURN v_result;
END;
$$ LANGUAGE plpgsql;