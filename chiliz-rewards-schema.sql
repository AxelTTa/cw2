-- Chiliz Token Rewards Database Schema
-- Run this in your Supabase SQL editor

-- Create reward_claims table to track CHZ token distributions
CREATE TABLE IF NOT EXISTS reward_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    claim_type VARCHAR(50) NOT NULL, -- 'level_milestone', 'achievement', 'streak_bonus'
    xp_threshold INTEGER NOT NULL, -- XP level that triggered the reward
    chz_amount DECIMAL(18, 8) NOT NULL, -- CHZ tokens awarded (supports decimal amounts)
    wallet_address VARCHAR(42) NOT NULL, -- Ethereum address that received tokens
    transaction_hash VARCHAR(66), -- Blockchain transaction hash
    claim_signature TEXT, -- Server-generated signature for claim validation
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_id ON reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_claim_type ON reward_claims(claim_type);
CREATE INDEX IF NOT EXISTS idx_reward_claims_claimed_at ON reward_claims(claimed_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_claims_wallet_address ON reward_claims(wallet_address);

-- Create reward_milestones table to define XP thresholds and CHZ amounts
CREATE TABLE IF NOT EXISTS reward_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    milestone_type VARCHAR(50) NOT NULL, -- 'level', 'comments', 'upvotes', 'streak'
    threshold_value INTEGER NOT NULL, -- XP amount, comment count, etc.
    chz_reward DECIMAL(18, 8) NOT NULL, -- CHZ tokens to award
    title VARCHAR(100) NOT NULL, -- Display name for the milestone
    description TEXT, -- Description of the achievement
    icon VARCHAR(10) DEFAULT '🏆', -- Emoji icon
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to prevent duplicate milestones
CREATE UNIQUE INDEX IF NOT EXISTS idx_reward_milestones_unique ON reward_milestones(milestone_type, threshold_value);

-- Create wallet_connections table to track user wallet addresses
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    wallet_type VARCHAR(20) DEFAULT 'metamask', -- 'metamask', 'walletconnect', 'web3auth'
    is_primary BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to prevent duplicate wallet connections
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_connections_unique ON wallet_connections(user_id, wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_address ON wallet_connections(wallet_address);

-- Add wallet_address column to profiles table for quick access
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='wallet_address') THEN
        ALTER TABLE profiles ADD COLUMN wallet_address VARCHAR(42);
    END IF;
    
    -- Add total_chz_earned column to track lifetime CHZ earnings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='total_chz_earned') THEN
        ALTER TABLE profiles ADD COLUMN total_chz_earned DECIMAL(18, 8) DEFAULT 0;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for reward_claims
CREATE POLICY "Users can view their own reward claims" ON reward_claims
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "System can insert reward claims" ON reward_claims
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update reward claims" ON reward_claims
    FOR UPDATE USING (true);

-- Create policies for reward_milestones (public read)
CREATE POLICY "Anyone can view reward milestones" ON reward_milestones
    FOR SELECT USING (true);

CREATE POLICY "System can manage reward milestones" ON reward_milestones
    FOR ALL USING (true);

-- Create policies for wallet_connections
CREATE POLICY "Users can view their own wallet connections" ON wallet_connections
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own wallet connections" ON wallet_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own wallet connections" ON wallet_connections
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Insert initial reward milestones
INSERT INTO reward_milestones (milestone_type, threshold_value, chz_reward, title, description, icon) VALUES
-- Level-based rewards
('level', 5, 0.5, 'Rookie Champion', 'Reached level 5 - welcome to the community!', '🔥'),
('level', 10, 1.0, 'Rising Star', 'Reached level 10 - your insights are gaining traction!', '⭐'),
('level', 15, 1.5, 'Community Favorite', 'Reached level 15 - the community loves your content!', '💎'),
('level', 20, 2.0, 'Expert Analyst', 'Reached level 20 - your analysis is top-tier!', '🚀'),
('level', 25, 2.5, 'Sports Oracle', 'Reached level 25 - you predict the future!', '🔮'),
('level', 30, 3.0, 'Legend Status', 'Reached level 30 - you are a sports legend!', '👑'),

-- Comment-based rewards
('comments', 10, 0.2, 'First Conversations', 'Posted 10 comments - starting discussions!', '💬'),
('comments', 25, 0.5, 'Active Commenter', 'Posted 25 comments - engaging with the community!', '📢'),
('comments', 50, 1.0, 'Discussion Leader', 'Posted 50 comments - leading conversations!', '🎯'),
('comments', 100, 2.0, 'Community Voice', 'Posted 100 comments - your voice matters!', '📣'),
('comments', 250, 3.0, 'Content Creator', 'Posted 250 comments - creating amazing content!', '✨'),

-- Upvote-based rewards
('upvotes', 50, 0.3, 'Popular Takes', 'Received 50 upvotes - people love your insights!', '❤️'),
('upvotes', 100, 0.7, 'Crowd Favorite', 'Received 100 upvotes - the crowd loves you!', '🔥'),
('upvotes', 250, 1.5, 'Community Champion', 'Received 250 upvotes - you are a champion!', '🏆'),
('upvotes', 500, 2.5, 'Viral Sensation', 'Received 500 upvotes - your content goes viral!', '⚡'),
('upvotes', 1000, 4.0, 'Influence Master', 'Received 1000 upvotes - you influence the community!', '👑'),

-- Streak-based rewards
('streak', 7, 0.3, 'Week Warrior', 'Maintained 7-day streak - consistency is key!', '🔥'),
('streak', 14, 0.7, 'Two Week Champion', 'Maintained 14-day streak - you are dedicated!', '💪'),
('streak', 30, 1.5, 'Monthly Master', 'Maintained 30-day streak - incredible dedication!', '🎯'),
('streak', 60, 2.5, 'Consistency King', 'Maintained 60-day streak - you are unstoppable!', '👑'),
('streak', 90, 4.0, 'Streak Legend', 'Maintained 90-day streak - legendary commitment!', '🌟')

ON CONFLICT (milestone_type, threshold_value) DO NOTHING;

-- Function to calculate eligible rewards for a user
CREATE OR REPLACE FUNCTION get_eligible_rewards(p_user_id UUID)
RETURNS TABLE (
    milestone_id UUID,
    milestone_type VARCHAR(50),
    threshold_value INTEGER,
    chz_reward DECIMAL(18, 8),
    title VARCHAR(100),
    description TEXT,
    icon VARCHAR(10),
    user_current_value INTEGER,
    already_claimed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            p.level,
            p.xp,
            p.streak_count,
            COALESCE(comment_count.total, 0) as total_comments,
            COALESCE(upvote_count.total, 0) as total_upvotes
        FROM profiles p
        LEFT JOIN (
            SELECT user_id, COUNT(*) as total
            FROM comments
            WHERE user_id = p_user_id
            GROUP BY user_id
        ) comment_count ON comment_count.user_id = p.id
        LEFT JOIN (
            SELECT user_id, SUM(upvotes) as total
            FROM comments
            WHERE user_id = p_user_id
            GROUP BY user_id
        ) upvote_count ON upvote_count.user_id = p.id
        WHERE p.id = p_user_id
    ),
    claimed_rewards AS (
        SELECT rm.id as milestone_id
        FROM reward_claims rc
        JOIN reward_milestones rm ON (
            rc.claim_type = rm.milestone_type AND 
            rc.xp_threshold = rm.threshold_value
        )
        WHERE rc.user_id = p_user_id
    )
    SELECT 
        rm.id,
        rm.milestone_type,
        rm.threshold_value,
        rm.chz_reward,
        rm.title,
        rm.description,
        rm.icon,
        CASE 
            WHEN rm.milestone_type = 'level' THEN us.level
            WHEN rm.milestone_type = 'comments' THEN us.total_comments
            WHEN rm.milestone_type = 'upvotes' THEN us.total_upvotes
            WHEN rm.milestone_type = 'streak' THEN us.streak_count
            ELSE 0
        END as user_current_value,
        CASE 
            WHEN cr.milestone_id IS NOT NULL THEN true
            ELSE false
        END as already_claimed
    FROM reward_milestones rm
    CROSS JOIN user_stats us
    LEFT JOIN claimed_rewards cr ON cr.milestone_id = rm.id
    WHERE rm.is_active = true
    AND (
        (rm.milestone_type = 'level' AND us.level >= rm.threshold_value) OR
        (rm.milestone_type = 'comments' AND us.total_comments >= rm.threshold_value) OR
        (rm.milestone_type = 'upvotes' AND us.total_upvotes >= rm.threshold_value) OR
        (rm.milestone_type = 'streak' AND us.streak_count >= rm.threshold_value)
    )
    ORDER BY rm.milestone_type, rm.threshold_value;
END;
$$ LANGUAGE plpgsql;

-- Function to record a reward claim
CREATE OR REPLACE FUNCTION record_reward_claim(
    p_user_id UUID,
    p_milestone_id UUID,
    p_wallet_address VARCHAR(42),
    p_claim_signature TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_milestone record;
    v_claim_id UUID;
    v_result JSON;
BEGIN
    -- Get milestone details
    SELECT * INTO v_milestone
    FROM reward_milestones
    WHERE id = p_milestone_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid milestone ID'
        );
    END IF;
    
    -- Check if already claimed
    IF EXISTS (
        SELECT 1 FROM reward_claims rc
        JOIN reward_milestones rm ON (
            rc.claim_type = rm.milestone_type AND 
            rc.xp_threshold = rm.threshold_value
        )
        WHERE rc.user_id = p_user_id AND rm.id = p_milestone_id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Reward already claimed'
        );
    END IF;
    
    -- Insert reward claim
    INSERT INTO reward_claims (
        user_id, 
        claim_type, 
        xp_threshold, 
        chz_amount, 
        wallet_address, 
        claim_signature
    ) VALUES (
        p_user_id,
        v_milestone.milestone_type,
        v_milestone.threshold_value,
        v_milestone.chz_reward,
        p_wallet_address,
        p_claim_signature
    ) RETURNING id INTO v_claim_id;
    
    -- Update user's total CHZ earned
    UPDATE profiles 
    SET total_chz_earned = total_chz_earned + v_milestone.chz_reward,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'claim_id', v_claim_id,
        'chz_amount', v_milestone.chz_reward,
        'message', 'Reward claimed successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;