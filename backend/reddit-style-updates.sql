-- Reddit-style updates with memes, email, and XP tracking
-- Run this in your Supabase SQL editor

-- First update profiles table to include email
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- Create XP log table to track XP changes
CREATE TABLE IF NOT EXISTS xp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'comment_created', 'upvote_received', 'prediction_correct', etc.
    xp_change INTEGER NOT NULL, -- can be positive or negative
    xp_total INTEGER NOT NULL, -- total XP after this change
    related_id UUID, -- ID of related content (comment, prediction, etc.)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add meme-related columns to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS meme_url TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS meme_caption TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_meme BOOLEAN DEFAULT false;

-- Create memes table for storing meme templates/popular memes
CREATE TABLE IF NOT EXISTS memes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    template_url TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON xp_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_logs_action_type ON xp_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_comments_is_meme ON comments(is_meme);
CREATE INDEX IF NOT EXISTS idx_memes_category ON memes(category);
CREATE INDEX IF NOT EXISTS idx_memes_active ON memes(is_active);

-- Enable RLS on new tables
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Create public policies (Reddit-style - everyone can read everything)
CREATE POLICY "Anyone can view xp_logs" ON xp_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can view memes" ON memes FOR SELECT USING (true);

-- Users can only insert their own XP logs (will be handled by triggers)
CREATE POLICY "System can insert xp_logs" ON xp_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update xp_logs" ON xp_logs FOR UPDATE USING (true);

-- Anyone can use memes
CREATE POLICY "Anyone can use memes" ON memes FOR ALL USING (true);

-- Update comments policies to be fully public like Reddit
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = comments.user_id)
);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = comments.user_id)
);

-- Function to log XP changes and update user profile
CREATE OR REPLACE FUNCTION log_xp_change(
    p_user_id UUID,
    p_action_type VARCHAR(50),
    p_xp_change INTEGER,
    p_related_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_new_total INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Update user's XP in profiles table
    UPDATE profiles 
    SET xp = xp + p_xp_change,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING xp INTO v_new_total;
    
    -- Calculate new level (every 100 XP = 1 level)
    v_new_level := FLOOR(v_new_total / 100) + 1;
    
    -- Update user's level
    UPDATE profiles 
    SET level = v_new_level
    WHERE id = p_user_id;
    
    -- Log the XP change
    INSERT INTO xp_logs (user_id, action_type, xp_change, xp_total, related_id, description)
    VALUES (p_user_id, p_action_type, p_xp_change, v_new_total, p_related_id, p_description);
END;
$$ LANGUAGE plpgsql;

-- Trigger function for automatic XP rewards
CREATE OR REPLACE FUNCTION handle_xp_rewards() RETURNS TRIGGER AS $$
BEGIN
    -- Award XP for new comments
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'comments' THEN
        PERFORM log_xp_change(
            NEW.user_id,
            'comment_created',
            5, -- 5 XP for creating a comment
            NEW.id,
            'Posted a new comment'
        );
    END IF;
    
    -- Award XP for upvotes received
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'comments' AND NEW.upvotes > OLD.upvotes THEN
        PERFORM log_xp_change(
            NEW.user_id,
            'upvote_received',
            (NEW.upvotes - OLD.upvotes) * 2, -- 2 XP per upvote
            NEW.id,
            'Received ' || (NEW.upvotes - OLD.upvotes) || ' upvote(s)'
        );
    END IF;
    
    -- Award bonus XP for memes
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'comments' AND NEW.is_meme = true THEN
        PERFORM log_xp_change(
            NEW.user_id,
            'meme_posted',
            3, -- 3 bonus XP for posting a meme
            NEW.id,
            'Posted a meme'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for XP rewards
DROP TRIGGER IF EXISTS trigger_xp_rewards_comments_insert ON comments;
CREATE TRIGGER trigger_xp_rewards_comments_insert
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_xp_rewards();

DROP TRIGGER IF EXISTS trigger_xp_rewards_comments_update ON comments;
CREATE TRIGGER trigger_xp_rewards_comments_update
    AFTER UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_xp_rewards();

-- Insert some sample meme templates
INSERT INTO memes (title, template_url, category) VALUES
('Drake Pointing', 'https://i.imgflip.com/30b1gx.jpg', 'reaction'),
('Distracted Boyfriend', 'https://i.imgflip.com/1ur9b0.jpg', 'reaction'),
('Woman Yelling at Cat', 'https://i.imgflip.com/345v97.jpg', 'reaction'),
('This is Fine', 'https://i.imgflip.com/26am.jpg', 'reaction'),
('Expanding Brain', 'https://i.imgflip.com/1jwhww.jpg', 'reaction'),
('Surprised Pikachu', 'https://i.imgflip.com/2kbn1e.jpg', 'reaction'),
('Change My Mind', 'https://i.imgflip.com/24y43o.jpg', 'opinion'),
('One Does Not Simply', 'https://i.imgflip.com/1bij.jpg', 'classic'),
('Most Interesting Man', 'https://i.imgflip.com/1bh.jpg', 'classic'),
('Success Kid', 'https://i.imgflip.com/1bhk.jpg', 'celebration')
ON CONFLICT DO NOTHING;