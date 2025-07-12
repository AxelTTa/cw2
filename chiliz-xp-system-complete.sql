-- ===================================================
-- CHILIZ XP SYSTEM - COMPLETE DATABASE SETUP
-- ===================================================

-- First, ensure the profiles table has all necessary XP columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_likes_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_up_notifications INTEGER DEFAULT 0;

-- Ensure xp_logs table exists for tracking all XP changes
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  xp_change INTEGER NOT NULL,
  xp_total INTEGER NOT NULL,
  related_id UUID NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON xp_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_logs_action_type ON xp_logs(action_type);

-- Ensure reactions table exists
CREATE TABLE IF NOT EXISTS reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, comment_id, reaction_type)
);

-- Create indexes for reactions
CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(reaction_type);

-- ===================================================
-- XP CALCULATION FUNCTIONS
-- ===================================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: Every 1000 XP = 1 level
  -- Level 1: 0-999 XP
  -- Level 2: 1000-1999 XP
  -- Level 3: 2000-2999 XP, etc.
  RETURN GREATEST(1, FLOOR(xp_amount / 1000) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION xp_needed_for_next_level(current_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_level INTEGER;
  next_level_threshold INTEGER;
BEGIN
  current_level := calculate_level_from_xp(current_xp);
  next_level_threshold := current_level * 1000;
  RETURN next_level_threshold - current_xp;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- XP AWARD FUNCTIONS
-- ===================================================

-- Function to award XP and log the transaction
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_xp_change INTEGER,
  p_related_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_profile RECORD;
  new_xp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
  level_up BOOLEAN := FALSE;
  result JSON;
BEGIN
  -- Get current user profile
  SELECT xp, level, total_likes_received, total_comments 
  INTO current_profile 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF current_profile IS NULL THEN
    RAISE EXCEPTION 'User profile not found for ID: %', p_user_id;
  END IF;
  
  -- Calculate new XP and level
  new_xp := GREATEST(0, current_profile.xp + p_xp_change);
  old_level := current_profile.level;
  new_level := calculate_level_from_xp(new_xp);
  
  -- Check if user leveled up
  IF new_level > old_level THEN
    level_up := TRUE;
  END IF;
  
  -- Update user profile
  UPDATE profiles 
  SET 
    xp = new_xp,
    level = new_level,
    level_up_notifications = CASE 
      WHEN level_up THEN level_up_notifications + 1 
      ELSE level_up_notifications 
    END,
    total_likes_received = CASE 
      WHEN p_action_type = 'like_received' THEN total_likes_received + 1
      ELSE total_likes_received
    END,
    total_comments = CASE 
      WHEN p_action_type IN ('comment_created', 'reply_created') THEN total_comments + 1
      ELSE total_comments
    END,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP transaction
  INSERT INTO xp_logs (user_id, action_type, xp_change, xp_total, related_id, description)
  VALUES (p_user_id, p_action_type, p_xp_change, new_xp, p_related_id, p_description);
  
  -- Return result
  result := json_build_object(
    'success', true,
    'old_xp', current_profile.xp,
    'new_xp', new_xp,
    'xp_change', p_xp_change,
    'old_level', old_level,
    'new_level', new_level,
    'level_up', level_up,
    'xp_needed_for_next_level', xp_needed_for_next_level(new_xp)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC XP AWARDS
-- ===================================================

-- Function to award XP when comments are created
CREATE OR REPLACE FUNCTION handle_comment_xp()
RETURNS trigger AS $$
DECLARE
  xp_reward INTEGER;
  action_type VARCHAR(50);
  description TEXT;
BEGIN
  -- Determine XP reward based on comment type
  IF NEW.comment_type = 'meme' OR NEW.is_meme = true THEN
    xp_reward := 15;
    action_type := 'meme_posted';
    description := 'Posted a meme comment';
  ELSIF NEW.comment_type = 'image' THEN
    xp_reward := 15;
    action_type := 'image_posted';
    description := 'Posted an image comment';
  ELSIF NEW.parent_id IS NOT NULL THEN
    xp_reward := 5;
    action_type := 'reply_created';
    description := 'Posted a reply';
  ELSE
    xp_reward := 10;
    action_type := 'comment_created';
    description := 'Posted a comment';
  END IF;
  
  -- Award XP
  PERFORM award_xp(
    NEW.user_id,
    action_type,
    xp_reward,
    NEW.id,
    description
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to award XP when likes are received
CREATE OR REPLACE FUNCTION handle_like_xp()
RETURNS trigger AS $$
DECLARE
  comment_author_id UUID;
BEGIN
  -- Get the comment author
  SELECT user_id INTO comment_author_id 
  FROM comments 
  WHERE id = NEW.comment_id;
  
  -- Only award XP for 'like' reactions
  IF NEW.reaction_type = 'like' AND comment_author_id IS NOT NULL THEN
    -- Award XP to comment author
    PERFORM award_xp(
      comment_author_id,
      'like_received',
      2,
      NEW.comment_id,
      'Received a like on comment'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to remove XP when likes are removed
CREATE OR REPLACE FUNCTION handle_like_removal_xp()
RETURNS trigger AS $$
DECLARE
  comment_author_id UUID;
BEGIN
  -- Get the comment author
  SELECT user_id INTO comment_author_id 
  FROM comments 
  WHERE id = OLD.comment_id;
  
  -- Only remove XP for 'like' reactions
  IF OLD.reaction_type = 'like' AND comment_author_id IS NOT NULL THEN
    -- Remove XP from comment author
    PERFORM award_xp(
      comment_author_id,
      'like_removed',
      -2,
      OLD.comment_id,
      'Like removed from comment'
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- CREATE TRIGGERS
-- ===================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_comment_xp ON comments;
DROP TRIGGER IF EXISTS trigger_like_xp ON reactions;
DROP TRIGGER IF EXISTS trigger_like_removal_xp ON reactions;

-- Create triggers
CREATE TRIGGER trigger_comment_xp
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_xp();

CREATE TRIGGER trigger_like_xp
  AFTER INSERT ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_xp();

CREATE TRIGGER trigger_like_removal_xp
  AFTER DELETE ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_removal_xp();

-- ===================================================
-- LEADERBOARD AND STATS VIEWS
-- ===================================================

-- XP Leaderboard View
CREATE OR REPLACE VIEW xp_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.xp,
  p.level,
  p.total_likes_received,
  p.total_comments,
  p.created_at,
  ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC) as rank
FROM profiles p
WHERE p.xp > 0
ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC;

-- User XP Stats View
CREATE OR REPLACE VIEW user_xp_stats AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.xp,
  p.level,
  p.total_likes_received,
  p.total_comments,
  calculate_level_from_xp(p.xp) as calculated_level,
  xp_needed_for_next_level(p.xp) as xp_needed_for_next_level,
  (p.level - 1) * 1000 as current_level_min_xp,
  p.level * 1000 as next_level_min_xp,
  ROUND((p.xp - (p.level - 1) * 1000)::DECIMAL / 1000 * 100, 1) as level_progress_percent,
  (
    SELECT COUNT(*) + 1 
    FROM profiles p2 
    WHERE p2.xp > p.xp
  ) as global_rank,
  (
    SELECT COUNT(DISTINCT xl.action_type) 
    FROM xp_logs xl 
    WHERE xl.user_id = p.id
  ) as activity_types_count,
  (
    SELECT SUM(CASE WHEN xl.xp_change > 0 THEN xl.xp_change ELSE 0 END)
    FROM xp_logs xl 
    WHERE xl.user_id = p.id
  ) as total_xp_earned,
  p.created_at as member_since
FROM profiles p;

-- Recent XP Activity View
CREATE OR REPLACE VIEW recent_xp_activity AS
SELECT 
  xl.id,
  xl.user_id,
  p.username,
  p.display_name,
  xl.action_type,
  xl.xp_change,
  xl.xp_total,
  xl.description,
  xl.created_at,
  ROW_NUMBER() OVER (PARTITION BY xl.user_id ORDER BY xl.created_at DESC) as activity_rank
FROM xp_logs xl
JOIN profiles p ON xl.user_id = p.id
ORDER BY xl.created_at DESC;

-- ===================================================
-- UTILITY FUNCTIONS
-- ===================================================

-- Function to get user's XP dashboard data
CREATE OR REPLACE FUNCTION get_user_xp_dashboard(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_stats RECORD;
  recent_activities JSON;
  weekly_xp INTEGER;
  monthly_xp INTEGER;
  result JSON;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats
  FROM user_xp_stats
  WHERE id = p_user_id;
  
  IF user_stats IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Get recent activities (last 10)
  SELECT json_agg(
    json_build_object(
      'action_type', action_type,
      'xp_change', xp_change,
      'description', description,
      'created_at', created_at
    )
  ) INTO recent_activities
  FROM (
    SELECT action_type, xp_change, description, created_at
    FROM xp_logs
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) sub;
  
  -- Get weekly XP (last 7 days)
  SELECT COALESCE(SUM(CASE WHEN xp_change > 0 THEN xp_change ELSE 0 END), 0)
  INTO weekly_xp
  FROM xp_logs
  WHERE user_id = p_user_id 
    AND created_at >= now() - interval '7 days';
  
  -- Get monthly XP (last 30 days)
  SELECT COALESCE(SUM(CASE WHEN xp_change > 0 THEN xp_change ELSE 0 END), 0)
  INTO monthly_xp
  FROM xp_logs
  WHERE user_id = p_user_id 
    AND created_at >= now() - interval '30 days';
  
  -- Build result
  result := json_build_object(
    'user_id', user_stats.id,
    'username', user_stats.username,
    'display_name', user_stats.display_name,
    'xp', user_stats.xp,
    'level', user_stats.level,
    'global_rank', user_stats.global_rank,
    'total_likes_received', user_stats.total_likes_received,
    'total_comments', user_stats.total_comments,
    'xp_needed_for_next_level', user_stats.xp_needed_for_next_level,
    'level_progress_percent', user_stats.level_progress_percent,
    'weekly_xp', weekly_xp,
    'monthly_xp', monthly_xp,
    'total_xp_earned', user_stats.total_xp_earned,
    'member_since', user_stats.member_since,
    'recent_activities', COALESCE(recent_activities, '[]'::json)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_xp_leaderboard(p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS JSON AS $$
DECLARE
  leaderboard JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'rank', rank,
      'user_id', id,
      'username', username,
      'display_name', display_name,
      'avatar_url', avatar_url,
      'xp', xp,
      'level', level,
      'total_likes_received', total_likes_received,
      'total_comments', total_comments
    )
  ) INTO leaderboard
  FROM (
    SELECT *
    FROM xp_leaderboard
    LIMIT p_limit OFFSET p_offset
  ) sub;
  
  RETURN COALESCE(leaderboard, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- DATA MIGRATION - UPDATE EXISTING USERS
-- ===================================================

-- Update existing users with calculated XP based on their activity
DO $$
DECLARE
  user_record RECORD;
  comment_count INTEGER;
  like_count INTEGER;
  calculated_xp INTEGER;
  calculated_level INTEGER;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    -- Count comments
    SELECT COUNT(*) INTO comment_count
    FROM comments
    WHERE user_id = user_record.id;
    
    -- Count likes received
    SELECT COUNT(*) INTO like_count
    FROM reactions r
    JOIN comments c ON r.comment_id = c.id
    WHERE c.user_id = user_record.id AND r.reaction_type = 'like';
    
    -- Calculate XP: 10 per comment + 2 per like received
    calculated_xp := (comment_count * 10) + (like_count * 2);
    calculated_level := calculate_level_from_xp(calculated_xp);
    
    -- Update user
    UPDATE profiles
    SET 
      xp = calculated_xp,
      level = calculated_level,
      total_likes_received = like_count,
      total_comments = comment_count,
      updated_at = now()
    WHERE id = user_record.id;
    
    -- Create initial XP log entry
    IF calculated_xp > 0 THEN
      INSERT INTO xp_logs (user_id, action_type, xp_change, xp_total, description)
      VALUES (
        user_record.id,
        'migration_calculated',
        calculated_xp,
        calculated_xp,
        'Initial XP calculation from existing activity'
      );
    END IF;
  END LOOP;
END $$;

-- ===================================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================================

-- Enable RLS on xp_logs if not already enabled
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;

-- XP logs - users can view their own logs
CREATE POLICY "Users can view own xp logs" ON xp_logs
  FOR SELECT USING (auth.uid() = user_id);

-- XP logs - system can insert logs (for triggers)
CREATE POLICY "System can insert xp logs" ON xp_logs
  FOR INSERT WITH CHECK (true);

-- Comments will be accessible for XP calculations
-- (Assuming RLS policies already exist for comments)

-- Reactions will be accessible for XP calculations  
-- (Assuming RLS policies already exist for reactions)

-- ===================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================

-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_xp_level ON profiles(xp DESC, level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_comments_user_type ON comments(user_id, comment_type);
CREATE INDEX IF NOT EXISTS idx_reactions_user_comment ON reactions(user_id, comment_id);

-- ===================================================
-- COMPLETE SETUP VERIFICATION
-- ===================================================

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Chiliz XP System Setup Complete!';
  RAISE NOTICE 'Tables created/updated: profiles, xp_logs, reactions';
  RAISE NOTICE 'Functions created: award_xp, calculate_level_from_xp, xp_needed_for_next_level, get_user_xp_dashboard, get_xp_leaderboard';
  RAISE NOTICE 'Views created: xp_leaderboard, user_xp_stats, recent_xp_activity';
  RAISE NOTICE 'Triggers created: comment XP awards, like XP awards, like removal XP deduction';
  RAISE NOTICE 'RLS policies applied for security';
  RAISE NOTICE 'Data migration completed for existing users';
END $$;