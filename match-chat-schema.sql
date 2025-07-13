-- ===================================================
-- MATCH CHAT SYSTEM SCHEMA
-- ===================================================
-- Schema for live chat functionality on upcoming matches

-- Match chat table for live messaging
CREATE TABLE IF NOT EXISTS match_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id VARCHAR(50) NOT NULL, -- References match external_id or match.id
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'emoji', 'system'
  
  -- Chat room management
  is_deleted BOOLEAN DEFAULT FALSE,
  is_system_message BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat moderation (optional for future expansion)
CREATE TABLE IF NOT EXISTS chat_moderation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES match_chats(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type VARCHAR(20) NOT NULL, -- 'delete', 'flag', 'warn'
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User chat preferences
CREATE TABLE IF NOT EXISTS user_chat_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  auto_clear_chats BOOLEAN DEFAULT FALSE,
  chat_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- ===================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================

-- Match chat indexes
CREATE INDEX IF NOT EXISTS idx_match_chats_match_id ON match_chats(match_id);
CREATE INDEX IF NOT EXISTS idx_match_chats_user_id ON match_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_match_chats_created_at ON match_chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_chats_match_created ON match_chats(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_chats_not_deleted ON match_chats(match_id, created_at DESC) WHERE is_deleted = FALSE;

-- Chat moderation indexes
CREATE INDEX IF NOT EXISTS idx_chat_moderation_chat_id ON chat_moderation(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_moderation_moderator_id ON chat_moderation(moderator_id);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_chat_preferences_user_id ON user_chat_preferences(user_id);

-- ===================================================
-- FUNCTIONS FOR CHAT OPERATIONS
-- ===================================================

-- Function to get chat messages for a match
CREATE OR REPLACE FUNCTION get_match_chat_messages(
    p_match_id VARCHAR(50), 
    p_limit INTEGER DEFAULT 50, 
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    match_id VARCHAR(50),
    user_id UUID,
    username VARCHAR(100),
    display_name VARCHAR(255),
    message TEXT,
    message_type VARCHAR(20),
    is_system_message BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mc.id,
        mc.match_id,
        mc.user_id,
        p.username,
        p.display_name,
        mc.message,
        mc.message_type,
        mc.is_system_message,
        mc.created_at
    FROM match_chats mc
    INNER JOIN profiles p ON p.id = mc.user_id
    WHERE mc.match_id = p_match_id 
    AND mc.is_deleted = FALSE
    AND p.username IS NOT NULL
    ORDER BY mc.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to add a chat message
CREATE OR REPLACE FUNCTION add_match_chat_message(
    p_match_id VARCHAR(50),
    p_user_id UUID,
    p_message TEXT,
    p_message_type VARCHAR(20) DEFAULT 'text'
)
RETURNS JSON AS $$
DECLARE
    new_message_id UUID;
    user_profile RECORD;
BEGIN
    -- Check if user exists and get profile info
    SELECT username, display_name INTO user_profile
    FROM profiles 
    WHERE id = p_user_id;
    
    IF user_profile IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Insert the new message
    INSERT INTO match_chats (match_id, user_id, message, message_type)
    VALUES (p_match_id, p_user_id, p_message, p_message_type)
    RETURNING id INTO new_message_id;
    
    -- Return success with message details
    RETURN json_build_object(
        'success', true,
        'message_id', new_message_id,
        'username', user_profile.username,
        'display_name', user_profile.display_name,
        'message', p_message,
        'created_at', now()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to clear user's chat messages for a match
CREATE OR REPLACE FUNCTION clear_user_match_chat(
    p_match_id VARCHAR(50),
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Soft delete user's messages for this match
    UPDATE match_chats 
    SET is_deleted = TRUE, updated_at = now()
    WHERE match_id = p_match_id 
    AND user_id = p_user_id 
    AND is_deleted = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'message', 'Chat messages cleared successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get chat statistics for a match
CREATE OR REPLACE FUNCTION get_match_chat_stats(p_match_id VARCHAR(50))
RETURNS JSON AS $$
DECLARE
    total_messages INTEGER;
    unique_users INTEGER;
    recent_activity INTEGER;
BEGIN
    -- Get total messages
    SELECT COUNT(*) INTO total_messages
    FROM match_chats 
    WHERE match_id = p_match_id AND is_deleted = FALSE;
    
    -- Get unique users
    SELECT COUNT(DISTINCT user_id) INTO unique_users
    FROM match_chats 
    WHERE match_id = p_match_id AND is_deleted = FALSE;
    
    -- Get recent activity (last 10 minutes)
    SELECT COUNT(*) INTO recent_activity
    FROM match_chats 
    WHERE match_id = p_match_id 
    AND is_deleted = FALSE 
    AND created_at >= now() - interval '10 minutes';
    
    RETURN json_build_object(
        'total_messages', total_messages,
        'unique_users', unique_users,
        'recent_activity', recent_activity
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- REALTIME SUBSCRIPTIONS SETUP
-- ===================================================

-- Enable realtime for match_chats table
ALTER PUBLICATION supabase_realtime ADD TABLE match_chats;

-- ===================================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================================

-- Enable RLS on chat tables
ALTER TABLE match_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_preferences ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on match_chats" ON match_chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on chat_moderation" ON chat_moderation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_chat_preferences" ON user_chat_preferences FOR ALL USING (true) WITH CHECK (true);

-- ===================================================
-- COMPLETION MESSAGE
-- ===================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MATCH CHAT SCHEMA SETUP COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: match_chats, chat_moderation, user_chat_preferences';
  RAISE NOTICE 'Functions created: get_match_chat_messages, add_match_chat_message, clear_user_match_chat, get_match_chat_stats';
  RAISE NOTICE 'Indexes created: Performance indexes for chat queries';
  RAISE NOTICE 'Realtime enabled: match_chats table ready for live updates';
  RAISE NOTICE 'RLS policies: Permissive policies for development';
  RAISE NOTICE '========================================';
END $$;