-- Fix milestone claiming system and add simple test milestone

-- 1. Clear existing milestones and add simple test milestone
DELETE FROM reward_milestones WHERE milestone_type = 'comments' AND threshold_value = 5;

INSERT INTO reward_milestones (milestone_type, threshold_value, chz_reward, title, description, is_active) VALUES
('comments', 5, 0.001, 'First Steps', 'Posted 5 comments - Welcome reward!', true)
ON CONFLICT (milestone_type, threshold_value) DO UPDATE SET
chz_reward = 0.001,
title = 'First Steps',
description = 'Posted 5 comments - Welcome reward!',
is_active = true;

-- 2. Fix the get_eligible_rewards function to properly handle eligibility
CREATE OR REPLACE FUNCTION get_eligible_rewards(p_user_id UUID)
RETURNS TABLE (
    milestone_id UUID,
    milestone_type VARCHAR(50),
    threshold_value INTEGER,
    chz_reward DECIMAL(18,8),
    title VARCHAR(255),
    description TEXT,
    already_claimed BOOLEAN,
    current_value INTEGER,
    is_eligible BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            p.level,
            p.total_comments,
            p.total_likes_received,
            p.streak_count
        FROM profiles p
        WHERE p.id = p_user_id
    ),
    claimed_milestones AS (
        SELECT rc.milestone_id
        FROM reward_claims rc
        WHERE rc.user_id = p_user_id
        AND rc.status IN ('completed', 'pending')
    )
    SELECT 
        rm.id as milestone_id,
        rm.milestone_type,
        rm.threshold_value,
        rm.chz_reward,
        rm.title,
        rm.description,
        CASE WHEN cm.milestone_id IS NOT NULL THEN TRUE ELSE FALSE END as already_claimed,
        CASE 
            WHEN rm.milestone_type = 'level' THEN COALESCE(us.level, 1)
            WHEN rm.milestone_type = 'comments' THEN COALESCE(us.total_comments, 0)
            WHEN rm.milestone_type = 'upvotes' THEN COALESCE(us.total_likes_received, 0)
            WHEN rm.milestone_type = 'streak' THEN COALESCE(us.streak_count, 0)
            ELSE 0
        END as current_value,
        CASE 
            WHEN cm.milestone_id IS NOT NULL THEN FALSE -- Already claimed
            WHEN rm.milestone_type = 'level' AND COALESCE(us.level, 1) >= rm.threshold_value THEN TRUE
            WHEN rm.milestone_type = 'comments' AND COALESCE(us.total_comments, 0) >= rm.threshold_value THEN TRUE
            WHEN rm.milestone_type = 'upvotes' AND COALESCE(us.total_likes_received, 0) >= rm.threshold_value THEN TRUE
            WHEN rm.milestone_type = 'streak' AND COALESCE(us.streak_count, 0) >= rm.threshold_value THEN TRUE
            ELSE FALSE
        END as is_eligible
    FROM reward_milestones rm
    LEFT JOIN user_stats us ON true  -- Changed from CROSS JOIN to LEFT JOIN
    LEFT JOIN claimed_milestones cm ON rm.id = cm.milestone_id
    WHERE rm.is_active = TRUE
    ORDER BY rm.milestone_type, rm.threshold_value;
END;
$$ LANGUAGE plpgsql;

-- 3. Test the function with a sample user (you can run this manually to test)
-- SELECT * FROM get_eligible_rewards('your-user-id-here');

-- 4. Add a trigger to automatically update total_comments when comments are inserted
CREATE OR REPLACE FUNCTION update_profile_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET total_comments = total_comments + 1,
            updated_at = now()
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles 
        SET total_comments = GREATEST(0, total_comments - 1),
            updated_at = now()
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;

-- Create trigger to automatically update comment count
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_comment_count();

-- 5. Fix any existing users' comment counts (run this once)
UPDATE profiles 
SET total_comments = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.user_id = profiles.id 
    AND comments.is_deleted = false
)
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM comments 
    WHERE is_deleted = false
);