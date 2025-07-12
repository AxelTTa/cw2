-- ===================================================
-- MILESTONE REWARD SYSTEM - MISSING DATABASE FUNCTIONS
-- ===================================================

-- Function to get eligible rewards for a user
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
        SELECT milestone_id
        FROM reward_claims
        WHERE user_id = p_user_id
        AND status IN ('completed', 'pending')
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

-- Function to record a reward claim
CREATE OR REPLACE FUNCTION record_reward_claim(
    p_user_id UUID,
    p_milestone_id UUID,
    p_wallet_address VARCHAR(42)
)
RETURNS JSON AS $$
DECLARE
    milestone_info RECORD;
    existing_claim RECORD;
    claim_id UUID;
BEGIN
    -- Get milestone information
    SELECT * INTO milestone_info 
    FROM reward_milestones 
    WHERE id = p_milestone_id AND is_active = TRUE;
    
    IF milestone_info IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Milestone not found');
    END IF;
    
    -- Check if already claimed
    SELECT * INTO existing_claim 
    FROM reward_claims 
    WHERE user_id = p_user_id AND milestone_id = p_milestone_id;
    
    IF existing_claim IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'Milestone already claimed');
    END IF;
    
    -- Verify user is eligible
    IF NOT EXISTS (
        SELECT 1 FROM get_eligible_rewards(p_user_id) 
        WHERE milestone_id = p_milestone_id AND is_eligible = TRUE
    ) THEN
        RETURN json_build_object('success', false, 'error', 'User not eligible for this milestone');
    END IF;
    
    -- Create claim record
    INSERT INTO reward_claims (
        user_id, 
        milestone_id, 
        claim_type, 
        chz_amount, 
        wallet_address,
        status
    ) VALUES (
        p_user_id,
        p_milestone_id,
        milestone_info.milestone_type,
        milestone_info.chz_reward,
        p_wallet_address,
        'pending'
    ) RETURNING id INTO claim_id;
    
    RETURN json_build_object(
        'success', true,
        'claim_id', claim_id,
        'chz_amount', milestone_info.chz_reward,
        'milestone_title', milestone_info.title
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update claim with transaction hash
CREATE OR REPLACE FUNCTION update_reward_claim(
    p_claim_id UUID,
    p_transaction_hash VARCHAR(66),
    p_status VARCHAR(20) DEFAULT 'completed'
)
RETURNS JSON AS $$
DECLARE
    claim_info RECORD;
BEGIN
    -- Get claim information
    SELECT * INTO claim_info FROM reward_claims WHERE id = p_claim_id;
    
    IF claim_info IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Claim not found');
    END IF;
    
    -- Update claim with transaction hash
    UPDATE reward_claims 
    SET 
        transaction_hash = p_transaction_hash,
        status = p_status,
        processed_at = now()
    WHERE id = p_claim_id;
    
    -- Update user's total CHZ earned if completed
    IF p_status = 'completed' THEN
        UPDATE profiles 
        SET total_chz_earned = total_chz_earned + claim_info.chz_amount
        WHERE id = claim_info.user_id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'transaction_hash', p_transaction_hash,
        'status', p_status
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's pending rewards
CREATE OR REPLACE FUNCTION get_user_pending_rewards(p_user_id UUID)
RETURNS TABLE (
    claim_id UUID,
    milestone_title VARCHAR(255),
    chz_amount DECIMAL(18,8),
    claimed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    transaction_hash VARCHAR(66)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.id as claim_id,
        rm.title as milestone_title,
        rc.chz_amount,
        rc.claimed_at,
        rc.status,
        rc.transaction_hash
    FROM reward_claims rc
    JOIN reward_milestones rm ON rc.milestone_id = rm.id
    WHERE rc.user_id = p_user_id
    ORDER BY rc.claimed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert default reward milestones if they don't exist
INSERT INTO reward_milestones (milestone_type, threshold_value, chz_reward, title, description) VALUES
-- Level milestones
('level', 5, 10.0, 'Rising Star', 'Reached level 5'),
('level', 10, 25.0, 'Sports Fan', 'Reached level 10'),
('level', 25, 50.0, 'Super Fan', 'Reached level 25'),
('level', 50, 100.0, 'Legend', 'Reached level 50'),
('level', 100, 250.0, 'Hall of Fame', 'Reached level 100'),

-- Comment milestones
('comments', 10, 5.0, 'Chatty', 'Posted 10 comments'),
('comments', 50, 15.0, 'Commentator', 'Posted 50 comments'),
('comments', 100, 30.0, 'Discussion Leader', 'Posted 100 comments'),
('comments', 500, 75.0, 'Community Voice', 'Posted 500 comments'),
('comments', 1000, 150.0, 'Expert Analyst', 'Posted 1000 comments'),

-- Upvote milestones
('upvotes', 25, 8.0, 'Liked', 'Received 25 upvotes'),
('upvotes', 100, 20.0, 'Popular', 'Received 100 upvotes'),
('upvotes', 500, 50.0, 'Crowd Favorite', 'Received 500 upvotes'),
('upvotes', 1000, 100.0, 'Community Champion', 'Received 1000 upvotes'),

-- Streak milestones
('streak', 7, 12.0, 'Weekly Warrior', '7 day activity streak'),
('streak', 30, 35.0, 'Monthly Master', '30 day activity streak'),
('streak', 100, 80.0, 'Dedication King', '100 day activity streak')
ON CONFLICT (milestone_type, threshold_value) DO NOTHING;