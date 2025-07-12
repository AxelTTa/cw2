-- Universal comments schema for matches, players, competitions, and teams
-- This replaces match-specific comments with a more flexible system

-- Update comments table to support multiple entity types
DO $$ 
BEGIN
    -- Add entity_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='entity_type') THEN
        ALTER TABLE comments ADD COLUMN entity_type VARCHAR(20) DEFAULT 'match';
        CREATE INDEX idx_comments_entity_type ON comments(entity_type);
    END IF;
    
    -- Add entity_id column if it doesn't exist (replaces match_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='entity_id') THEN
        ALTER TABLE comments ADD COLUMN entity_id VARCHAR(50);
        CREATE INDEX idx_comments_entity_id ON comments(entity_id);
    END IF;
    
    -- Add meme/image support columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='is_meme') THEN
        ALTER TABLE comments ADD COLUMN is_meme BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='meme_url') THEN
        ALTER TABLE comments ADD COLUMN meme_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='meme_caption') THEN
        ALTER TABLE comments ADD COLUMN meme_caption TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='image_url') THEN
        ALTER TABLE comments ADD COLUMN image_url TEXT;
    END IF;
    
    -- Add downvotes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='downvotes') THEN
        ALTER TABLE comments ADD COLUMN downvotes INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_pinned column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='comments' AND column_name='is_pinned') THEN
        ALTER TABLE comments ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Migrate existing match_id data to entity_id/entity_type
UPDATE comments 
SET entity_id = match_id::text, entity_type = 'match' 
WHERE match_id IS NOT NULL AND entity_id IS NULL;

-- Create comprehensive indexes
CREATE INDEX IF NOT EXISTS idx_comments_entity_type_id ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity_created_at ON comments(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_upvotes ON comments(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_pinned ON comments(is_pinned DESC, created_at DESC);

-- Function to get comments for any entity type
CREATE OR REPLACE FUNCTION get_entity_comments(
    p_entity_type VARCHAR(20), 
    p_entity_id VARCHAR(50), 
    p_limit INTEGER DEFAULT 50, 
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'newest'
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    entity_type VARCHAR(20),
    entity_id VARCHAR(50),
    parent_id UUID,
    content TEXT,
    comment_type VARCHAR(20),
    is_meme BOOLEAN,
    meme_url TEXT,
    meme_caption TEXT,
    image_url TEXT,
    upvotes INTEGER,
    downvotes INTEGER,
    is_pinned BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    profiles JSON,
    reactions JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH comment_data AS (
        SELECT 
            c.*,
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
        FROM comments c
        LEFT JOIN profiles p ON p.id = c.user_id
        LEFT JOIN reactions r ON r.comment_id = c.id
        WHERE c.entity_type = p_entity_type 
        AND c.entity_id = p_entity_id 
        AND c.parent_id IS NULL
        GROUP BY c.id, c.user_id, c.entity_type, c.entity_id, c.parent_id, 
                 c.content, c.comment_type, c.is_meme, c.meme_url, c.meme_caption,
                 c.image_url, c.upvotes, c.downvotes, c.is_pinned,
                 c.created_at, c.updated_at, p.*
    )
    SELECT 
        cd.id,
        cd.user_id,
        cd.entity_type,
        cd.entity_id,
        cd.parent_id,
        cd.content,
        cd.comment_type,
        cd.is_meme,
        cd.meme_url,
        cd.meme_caption,
        cd.image_url,
        cd.upvotes,
        cd.downvotes,
        cd.is_pinned,
        cd.created_at,
        cd.updated_at,
        cd.profile_data as profiles,
        cd.reaction_data as reactions
    FROM comment_data cd
    ORDER BY 
        cd.is_pinned DESC,
        CASE 
            WHEN p_sort_by = 'newest' THEN cd.created_at 
            WHEN p_sort_by = 'oldest' THEN cd.created_at
            WHEN p_sort_by = 'popular' THEN cd.created_at
            ELSE cd.created_at 
        END DESC,
        CASE 
            WHEN p_sort_by = 'popular' THEN cd.upvotes - cd.downvotes
            ELSE 0 
        END DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to create a comment for any entity
CREATE OR REPLACE FUNCTION create_entity_comment(
    p_user_id UUID,
    p_entity_type VARCHAR(20),
    p_entity_id VARCHAR(50),
    p_content TEXT,
    p_comment_type VARCHAR(20) DEFAULT 'text',
    p_parent_id UUID DEFAULT NULL,
    p_is_meme BOOLEAN DEFAULT FALSE,
    p_meme_url TEXT DEFAULT NULL,
    p_meme_caption TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_comment_id UUID;
    v_result JSON;
BEGIN
    -- Insert new comment
    INSERT INTO comments (
        user_id, entity_type, entity_id, content, comment_type,
        parent_id, is_meme, meme_url, meme_caption, image_url
    )
    VALUES (
        p_user_id, p_entity_type, p_entity_id, p_content, p_comment_type,
        p_parent_id, p_is_meme, p_meme_url, p_meme_caption, p_image_url
    )
    RETURNING id INTO v_comment_id;
    
    -- Award XP to user (10 for regular comment, 15 for meme/image)
    UPDATE profiles 
    SET xp = xp + CASE WHEN p_is_meme OR p_image_url IS NOT NULL THEN 15 ELSE 10 END,
        level = CASE 
            WHEN (xp + CASE WHEN p_is_meme OR p_image_url IS NOT NULL THEN 15 ELSE 10 END) >= level * 100 
            THEN level + 1 
            ELSE level 
        END
    WHERE id = p_user_id;
    
    -- Return success with comment ID
    SELECT json_build_object(
        'success', true,
        'comment_id', v_comment_id,
        'message', 'Comment created successfully'
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

-- Add some sample data for testing
-- Note: This should be removed in production
/*
INSERT INTO comments (user_id, entity_type, entity_id, content, comment_type) VALUES
('00000000-0000-0000-0000-000000000001', 'player', '12345', 'Amazing player! Love watching him play.', 'text'),
('00000000-0000-0000-0000-000000000002', 'team', 'real-madrid', 'Best team in the world! Hala Madrid!', 'text'),
('00000000-0000-0000-0000-000000000003', 'competition', 'champions-league', 'The most exciting tournament ever!', 'text');
*/