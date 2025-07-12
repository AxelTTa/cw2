-- Fix function overloading error for record_reward_claim
-- Drop all existing versions of the function to resolve conflicts

-- Drop all versions of record_reward_claim function
DROP FUNCTION IF EXISTS record_reward_claim(UUID, UUID, VARCHAR(42));
DROP FUNCTION IF EXISTS record_reward_claim(UUID, UUID, VARCHAR(42), TEXT);
DROP FUNCTION IF EXISTS record_reward_claim(p_user_id UUID, p_milestone_id UUID, p_wallet_address VARCHAR(42));
DROP FUNCTION IF EXISTS record_reward_claim(p_user_id UUID, p_milestone_id UUID, p_wallet_address VARCHAR(42), p_claim_signature TEXT);

-- Recreate the correct version of the function
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