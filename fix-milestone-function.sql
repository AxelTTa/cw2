-- Fix ambiguous column reference in get_eligible_rewards function
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
            WHEN rm.milestone_type = 'level' THEN us.level
            WHEN rm.milestone_type = 'comments' THEN us.total_comments
            WHEN rm.milestone_type = 'upvotes' THEN us.total_likes_received
            WHEN rm.milestone_type = 'streak' THEN us.streak_count
            ELSE 0
        END as current_value,
        CASE 
            WHEN cm.milestone_id IS NOT NULL THEN FALSE -- Already claimed
            WHEN rm.milestone_type = 'level' AND us.level >= rm.threshold_value THEN TRUE
            WHEN rm.milestone_type = 'comments' AND us.total_comments >= rm.threshold_value THEN TRUE
            WHEN rm.milestone_type = 'upvotes' AND us.total_likes_received >= rm.threshold_value THEN TRUE
            WHEN rm.milestone_type = 'streak' AND us.streak_count >= rm.threshold_value THEN TRUE
            ELSE FALSE
        END as is_eligible
    FROM reward_milestones rm
    CROSS JOIN user_stats us
    LEFT JOIN claimed_milestones cm ON rm.id = cm.milestone_id
    WHERE rm.is_active = TRUE
    ORDER BY rm.milestone_type, rm.threshold_value;
END;
$$ LANGUAGE plpgsql;