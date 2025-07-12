-- Fix missing user_xp_stats view and daily_chz_rewards table

-- 1. Create user_xp_stats view (referenced in dashboard API)
CREATE OR REPLACE VIEW user_xp_stats AS
SELECT 
    p.id,
    p.username,
    p.display_name,
    p.xp,
    p.level,
    p.total_likes_received,
    p.total_comments,
    p.level as calculated_level,
    CASE 
        WHEN p.level >= 100 THEN 0
        ELSE (p.level * 1000) - p.xp
    END as xp_needed_for_next_level,
    (p.level - 1) * 1000 as current_level_min_xp,
    p.level * 1000 as next_level_min_xp,
    CASE 
        WHEN p.level >= 100 THEN 100.0
        ELSE ROUND(((p.xp - ((p.level - 1) * 1000))::DECIMAL / 1000.0) * 100, 2)
    END as level_progress_percent,
    ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC) as global_rank,
    0 as achievement_count, -- Placeholder for future achievements
    p.xp as total_xp_earned, -- Same as current XP for now
    p.created_at as member_since
FROM profiles p
WHERE p.xp > 0
ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC;

-- 2. Create daily_chz_rewards table (referenced in daily rewards API)
CREATE TABLE IF NOT EXISTS daily_chz_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    rank INTEGER NOT NULL,
    chz_amount DECIMAL(18,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'distributed', 'failed'
    wallet_address VARCHAR(42),
    transaction_hash VARCHAR(66),
    awarded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);

-- 3. Create get_user_xp_dashboard function (referenced in dashboard API)
CREATE OR REPLACE FUNCTION get_user_xp_dashboard(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_data RECORD;
    recent_activities JSON;
    result JSON;
BEGIN
    -- Get user stats from user_xp_stats view
    SELECT * INTO user_data
    FROM user_xp_stats 
    WHERE id = p_user_id;
    
    IF user_data IS NULL THEN
        -- Fallback to profiles table if user not in view
        SELECT 
            p.id,
            p.username,
            p.display_name,
            p.xp,
            p.level,
            p.total_likes_received,
            p.total_comments,
            p.level as calculated_level,
            CASE 
                WHEN p.level >= 100 THEN 0
                ELSE (p.level * 1000) - p.xp
            END as xp_needed_for_next_level,
            (p.level - 1) * 1000 as current_level_min_xp,
            p.level * 1000 as next_level_min_xp,
            CASE 
                WHEN p.level >= 100 THEN 100.0
                ELSE ROUND(((p.xp - ((p.level - 1) * 1000))::DECIMAL / 1000.0) * 100, 2)
            END as level_progress_percent,
            1 as global_rank, -- Default rank
            0 as achievement_count,
            p.xp as total_xp_earned,
            p.created_at as member_since
        INTO user_data
        FROM profiles p
        WHERE p.id = p_user_id;
    END IF;
    
    IF user_data IS NULL THEN
        RETURN json_build_object('error', 'User not found');
    END IF;
    
    -- Get recent XP activities
    SELECT json_agg(
        json_build_object(
            'action_type', xl.action_type,
            'xp_change', xl.xp_change,
            'description', xl.description,
            'created_at', xl.created_at
        ) ORDER BY xl.created_at DESC
    ) INTO recent_activities
    FROM xp_logs xl
    WHERE xl.user_id = p_user_id
    LIMIT 10;
    
    -- Build result
    result := json_build_object(
        'id', user_data.id,
        'username', user_data.username,
        'display_name', user_data.display_name,
        'xp', user_data.xp,
        'level', user_data.level,
        'total_likes_received', user_data.total_likes_received,
        'total_comments', user_data.total_comments,
        'calculated_level', user_data.calculated_level,
        'xp_needed_for_next_level', user_data.xp_needed_for_next_level,
        'current_level_min_xp', user_data.current_level_min_xp,
        'next_level_min_xp', user_data.next_level_min_xp,
        'level_progress_percent', user_data.level_progress_percent,
        'global_rank', user_data.global_rank,
        'achievement_count', user_data.achievement_count,
        'total_xp_earned', user_data.total_xp_earned,
        'member_since', user_data.member_since,
        'recent_activities', COALESCE(recent_activities, '[]'::json),
        'weekly_xp', 0, -- Placeholder for weekly XP calculation
        'monthly_xp', 0 -- Placeholder for monthly XP calculation
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_chz_rewards_user_id ON daily_chz_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_chz_rewards_date ON daily_chz_rewards(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_chz_rewards_status ON daily_chz_rewards(status);