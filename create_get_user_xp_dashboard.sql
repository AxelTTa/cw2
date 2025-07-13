CREATE OR REPLACE FUNCTION get_user_xp_dashboard(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    dashboard_data JSON;
BEGIN
    WITH
    user_profile AS (
        SELECT * FROM profiles WHERE id = p_user_id
    ),
    global_rank AS (
        SELECT COUNT(*) + 1 as rank
        FROM profiles
        WHERE xp > (SELECT xp FROM user_profile)
    ),
    recent_activities AS (
        SELECT action_type, xp_change, description, created_at
        FROM xp_logs
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 10
    ),
    weekly_xp AS (
        SELECT COALESCE(SUM(xp_change), 0) as total
        FROM xp_logs
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('week', now())
        AND xp_change > 0
    ),
    monthly_xp AS (
        SELECT COALESCE(SUM(xp_change), 0) as total
        FROM xp_logs
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', now())
        AND xp_change > 0
    ),
    total_xp_earned AS (
        SELECT COALESCE(SUM(xp_change), 0) as total
        FROM xp_logs
        WHERE user_id = p_user_id
        AND xp_change > 0
    )
    SELECT json_build_object(
        'user_id', up.id,
        'username', up.username,
        'display_name', up.display_name,
        'xp', up.xp,
        'level', up.level,
        'global_rank', (SELECT rank FROM global_rank),
        'total_likes_received', up.total_likes_received,
        'total_comments', up.total_comments,
        'xp_needed_for_next_level', (up.level * 1000) - up.xp,
        'level_progress_percent', ROUND(((up.xp - ((up.level - 1) * 1000)) / 1000.0) * 100),
        'weekly_xp', (SELECT total FROM weekly_xp),
        'monthly_xp', (SELECT total FROM monthly_xp),
        'total_xp_earned', (SELECT total FROM total_xp_earned),
        'member_since', up.created_at,
        'recent_activities', (SELECT json_agg(t) FROM (SELECT * FROM recent_activities) t)
    )
    INTO dashboard_data
    FROM user_profile up;

    RETURN dashboard_data;
END;
$$ LANGUAGE plpgsql;