-- Fix foreign key constraint issue for profiles table
-- This allows cascading deletes/updates when a user profile is modified

-- First, drop the existing foreign key constraint
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add the constraint back with CASCADE options
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Also fix other tables that might have the same issue
-- Reward claims
ALTER TABLE reward_claims DROP CONSTRAINT IF EXISTS reward_claims_user_id_fkey;
ALTER TABLE reward_claims 
ADD CONSTRAINT reward_claims_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Daily rewards
ALTER TABLE daily_rewards DROP CONSTRAINT IF EXISTS daily_rewards_user_id_fkey;
ALTER TABLE daily_rewards 
ADD CONSTRAINT daily_rewards_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Wallet connections
ALTER TABLE wallet_connections DROP CONSTRAINT IF EXISTS wallet_connections_user_id_fkey;
ALTER TABLE wallet_connections 
ADD CONSTRAINT wallet_connections_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- User predictions (if exists)
ALTER TABLE user_predictions DROP CONSTRAINT IF EXISTS user_predictions_user_id_fkey;
ALTER TABLE user_predictions 
ADD CONSTRAINT user_predictions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Comment reactions (if exists)
ALTER TABLE comment_reactions DROP CONSTRAINT IF EXISTS comment_reactions_user_id_fkey;
ALTER TABLE comment_reactions 
ADD CONSTRAINT comment_reactions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Match bets (if exists)
ALTER TABLE match_bets DROP CONSTRAINT IF EXISTS match_bets_user_id_fkey;
ALTER TABLE match_bets 
ADD CONSTRAINT match_bets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- XP logs (the one causing the current error)
ALTER TABLE xp_logs DROP CONSTRAINT IF EXISTS xp_logs_user_id_fkey;
ALTER TABLE xp_logs 
ADD CONSTRAINT xp_logs_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;