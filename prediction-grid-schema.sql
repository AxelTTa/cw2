-- ===================================================
-- PREDICTION GRID SYSTEM SCHEMA
-- ===================================================

-- Extend prediction_markets for micro-predictions
-- Add new columns to existing table (safe if columns already exist)
DO $$ 
BEGIN
  -- Add columns one by one with IF NOT EXISTS checks
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='prediction_type') THEN
    ALTER TABLE prediction_markets ADD COLUMN prediction_type VARCHAR(20) DEFAULT 'standard';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='time_window_seconds') THEN
    ALTER TABLE prediction_markets ADD COLUMN time_window_seconds INTEGER DEFAULT 90;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='stake_amount') THEN
    ALTER TABLE prediction_markets ADD COLUMN stake_amount DECIMAL(18,8) DEFAULT 0.25;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='house_fee_percentage') THEN
    ALTER TABLE prediction_markets ADD COLUMN house_fee_percentage DECIMAL(5,2) DEFAULT 5.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='auto_generated') THEN
    ALTER TABLE prediction_markets ADD COLUMN auto_generated BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='context_data') THEN
    ALTER TABLE prediction_markets ADD COLUMN context_data JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='expires_at') THEN
    ALTER TABLE prediction_markets ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='resolved_at') THEN
    ALTER TABLE prediction_markets ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prediction_markets' AND column_name='winning_option') THEN
    ALTER TABLE prediction_markets ADD COLUMN winning_option VARCHAR(50);
  END IF;
END $$;

-- Create micro prediction pools for stake aggregation
CREATE TABLE IF NOT EXISTS prediction_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES prediction_markets(id) ON DELETE CASCADE,
  option_value VARCHAR(50) NOT NULL, -- 'yes', 'no', 'option_a', etc.
  total_stakes DECIMAL(18,8) DEFAULT 0.0,
  participant_count INTEGER DEFAULT 0,
  potential_payout_per_chz DECIMAL(18,8) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(market_id, option_value)
);

-- Create user prediction stakes
CREATE TABLE IF NOT EXISTS prediction_stakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES prediction_markets(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES prediction_pools(id) ON DELETE CASCADE,
  stake_amount DECIMAL(18,8) NOT NULL,
  selected_option VARCHAR(50) NOT NULL,
  potential_return DECIMAL(18,8) DEFAULT 0.0,
  actual_return DECIMAL(18,8) DEFAULT 0.0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'won', 'lost', 'refunded'
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settled_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, market_id) -- One bet per user per market
);

-- Live match prediction templates
CREATE TABLE IF NOT EXISTS prediction_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name VARCHAR(100) NOT NULL,
  question_template TEXT NOT NULL, -- e.g., "Next action will be a {event_type}?"
  options JSONB NOT NULL, -- ["Yes", "No"] or ["Team A", "Team B", "Neither"]
  event_triggers JSONB NOT NULL, -- Match events that can trigger this prediction
  context_requirements JSONB, -- Required match state (e.g., ball_position, minute_range)
  frequency_limit INTEGER DEFAULT 1, -- Max times per match
  priority INTEGER DEFAULT 1, -- Higher priority = more likely to be selected
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Track prediction generation history
CREATE TABLE IF NOT EXISTS prediction_generation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  template_id UUID REFERENCES prediction_templates(id) ON DELETE SET NULL,
  generated_question TEXT NOT NULL,
  options_generated JSONB NOT NULL,
  context_used JSONB,
  generation_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  market_created BOOLEAN DEFAULT false,
  market_id UUID REFERENCES prediction_markets(id) ON DELETE SET NULL
);

-- ===================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_prediction_markets_type_status ON prediction_markets(prediction_type, status);
CREATE INDEX IF NOT EXISTS idx_prediction_markets_expires_at ON prediction_markets(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prediction_pools_market_id ON prediction_pools(market_id);
CREATE INDEX IF NOT EXISTS idx_prediction_stakes_user_id ON prediction_stakes(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_stakes_market_id ON prediction_stakes(market_id);
CREATE INDEX IF NOT EXISTS idx_prediction_stakes_status ON prediction_stakes(status);
CREATE INDEX IF NOT EXISTS idx_prediction_templates_active ON prediction_templates(active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_generation_log_match_id ON prediction_generation_log(match_id);

-- ===================================================
-- FUNCTIONS FOR PREDICTION GRID
-- ===================================================

-- Function to create a micro prediction market
CREATE OR REPLACE FUNCTION create_micro_prediction(
  p_match_id UUID,
  p_question TEXT,
  p_options JSONB,
  p_time_window INTEGER DEFAULT 90,
  p_stake_amount DECIMAL DEFAULT 0.25,
  p_context_data JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  market_id UUID;
  option_item TEXT;
BEGIN
  -- Create the market
  INSERT INTO prediction_markets (
    match_id, market_type, question, options, prediction_type,
    time_window_seconds, stake_amount, expires_at, context_data,
    auto_generated, status
  ) VALUES (
    p_match_id, 'micro_event', p_question, p_options, 'micro',
    p_time_window, p_stake_amount, 
    now() + (p_time_window || ' seconds')::interval, p_context_data,
    true, 'active'
  ) RETURNING id INTO market_id;
  
  -- Create pools for each option
  FOR option_item IN SELECT jsonb_array_elements_text(p_options)
  LOOP
    INSERT INTO prediction_pools (market_id, option_value)
    VALUES (market_id, option_item);
  END LOOP;
  
  RETURN market_id;
END;
$$ LANGUAGE plpgsql;

-- Function to place a prediction bet
CREATE OR REPLACE FUNCTION place_prediction_bet(
  p_user_id UUID,
  p_market_id UUID,
  p_selected_option VARCHAR(50),
  p_stake_amount DECIMAL
) RETURNS JSON AS $$
DECLARE
  market_record RECORD;
  pool_record RECORD;
  user_balance DECIMAL;
  stake_id UUID;
BEGIN
  -- Check if market is still active
  SELECT * INTO market_record FROM prediction_markets 
  WHERE id = p_market_id AND status = 'active' AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Market not available');
  END IF;
  
  -- Check if user has enough CHZ
  SELECT fan_tokens INTO user_balance FROM profiles WHERE id = p_user_id;
  IF user_balance < p_stake_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CHZ balance');
  END IF;
  
  -- Check if user already bet on this market
  IF EXISTS (SELECT 1 FROM prediction_stakes WHERE user_id = p_user_id AND market_id = p_market_id) THEN
    RETURN json_build_object('success', false, 'error', 'Already bet on this market');
  END IF;
  
  -- Get the pool for this option
  SELECT * INTO pool_record FROM prediction_pools 
  WHERE market_id = p_market_id AND option_value = p_selected_option;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid option selected');
  END IF;
  
  -- Deduct CHZ from user balance
  UPDATE profiles SET fan_tokens = fan_tokens - p_stake_amount WHERE id = p_user_id;
  
  -- Create transaction log
  INSERT INTO token_transactions (
    user_id, transaction_type, amount, status, description
  ) VALUES (
    p_user_id, 'prediction_bet', -p_stake_amount, 'confirmed',
    'Prediction bet: ' || market_record.question
  );
  
  -- Add stake to pool
  UPDATE prediction_pools 
  SET total_stakes = total_stakes + p_stake_amount,
      participant_count = participant_count + 1
  WHERE id = pool_record.id;
  
  -- Record user's stake
  INSERT INTO prediction_stakes (
    user_id, market_id, pool_id, stake_amount, selected_option
  ) VALUES (
    p_user_id, p_market_id, pool_record.id, p_stake_amount, p_selected_option
  ) RETURNING id INTO stake_id;
  
  RETURN json_build_object(
    'success', true, 
    'stake_id', stake_id,
    'message', 'Bet placed successfully'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to settle a prediction market
CREATE OR REPLACE FUNCTION settle_prediction_market(
  p_market_id UUID,
  p_winning_option VARCHAR(50)
) RETURNS JSON AS $$
DECLARE
  total_pool DECIMAL := 0;
  winning_pool DECIMAL := 0;
  house_fee DECIMAL := 0;
  payout_per_chz DECIMAL := 0;
  winner_record RECORD;
  market_record RECORD;
  winners_count INTEGER := 0;
  total_payouts DECIMAL := 0;
BEGIN
  -- Get market details
  SELECT * INTO market_record FROM prediction_markets WHERE id = p_market_id;
  
  -- Calculate total pool across all options
  SELECT SUM(total_stakes) INTO total_pool FROM prediction_pools WHERE market_id = p_market_id;
  
  -- Get winning pool size
  SELECT total_stakes INTO winning_pool FROM prediction_pools 
  WHERE market_id = p_market_id AND option_value = p_winning_option;
  
  -- Calculate house fee and net payout pool
  house_fee := total_pool * (market_record.house_fee_percentage / 100);
  
  -- If no one won, refund all bets
  IF winning_pool = 0 THEN
    -- Refund all stakes
    FOR winner_record IN 
      SELECT ps.*, pp.total_stakes as pool_total
      FROM prediction_stakes ps
      JOIN prediction_pools pp ON ps.pool_id = pp.id
      WHERE ps.market_id = p_market_id AND ps.status = 'active'
    LOOP
      -- Refund the stake
      UPDATE profiles 
      SET fan_tokens = fan_tokens + winner_record.stake_amount 
      WHERE id = winner_record.user_id;
      
      -- Record transaction
      INSERT INTO token_transactions (
        user_id, transaction_type, amount, status, description
      ) VALUES (
        winner_record.user_id, 'prediction_refund', winner_record.stake_amount, 'confirmed',
        'Prediction refund: ' || market_record.question
      );
      
      -- Update stake status
      UPDATE prediction_stakes 
      SET status = 'refunded', actual_return = winner_record.stake_amount, settled_at = now()
      WHERE id = winner_record.id;
    END LOOP;
    
    -- Update market
    UPDATE prediction_markets 
    SET status = 'settled', winning_option = 'refund', resolved_at = now()
    WHERE id = p_market_id;
    
    RETURN json_build_object('success', true, 'result', 'refunded', 'total_refunded', total_pool);
  END IF;
  
  -- Calculate payout per CHZ for winners
  payout_per_chz := (total_pool - house_fee) / winning_pool;
  
  -- Distribute winnings
  FOR winner_record IN 
    SELECT ps.*
    FROM prediction_stakes ps
    JOIN prediction_pools pp ON ps.pool_id = pp.id
    WHERE ps.market_id = p_market_id AND pp.option_value = p_winning_option AND ps.status = 'active'
  LOOP
    DECLARE
      payout DECIMAL;
    BEGIN
      payout := winner_record.stake_amount * payout_per_chz;
      total_payouts := total_payouts + payout;
      winners_count := winners_count + 1;
      
      -- Pay the winner
      UPDATE profiles 
      SET fan_tokens = fan_tokens + payout 
      WHERE id = winner_record.user_id;
      
      -- Record transaction
      INSERT INTO token_transactions (
        user_id, transaction_type, amount, status, description
      ) VALUES (
        winner_record.user_id, 'prediction_win', payout, 'confirmed',
        'Prediction win: ' || market_record.question
      );
      
      -- Update stake status
      UPDATE prediction_stakes 
      SET status = 'won', actual_return = payout, settled_at = now()
      WHERE id = winner_record.id;
    END;
  END LOOP;
  
  -- Mark losing stakes
  UPDATE prediction_stakes 
  SET status = 'lost', actual_return = 0, settled_at = now()
  WHERE market_id = p_market_id AND selected_option != p_winning_option AND status = 'active';
  
  -- Update market
  UPDATE prediction_markets 
  SET status = 'settled', winning_option = p_winning_option, resolved_at = now()
  WHERE id = p_market_id;
  
  RETURN json_build_object(
    'success', true, 
    'result', 'settled',
    'winners_count', winners_count,
    'total_pool', total_pool,
    'house_fee', house_fee,
    'total_payouts', total_payouts,
    'payout_per_chz', payout_per_chz
  );
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- INSERT PREDICTION TEMPLATES
-- ===================================================

INSERT INTO prediction_templates (template_name, question_template, options, event_triggers, context_requirements, frequency_limit, priority) VALUES
('Next Foul', 'Will there be a foul in the next {time_window} seconds?', '["Yes", "No"]', '["foul", "yellow_card", "red_card"]', '{"min_minute": 5}', 3, 5),
('Shot on Target', 'Will the next shot be on target?', '["Yes", "No"]', '["shot_on_goal", "shot_off_goal", "shot_blocked"]', '{"recent_shots": true}', 2, 8),
('Corner Kick', 'Will there be a corner kick in the next {time_window} seconds?', '["Yes", "No"]', '["corner", "goal_kick"]', '{"min_minute": 10}', 2, 6),
('Goal Scored', 'Will a goal be scored in the next {time_window} seconds?', '["Yes", "No"]', '["goal", "penalty_goal"]', '{"max_per_half": 1}', 1, 10),
('Yellow Card', 'Will there be a yellow card in the next {time_window} seconds?', '["Yes", "No"]', '["yellow_card", "foul"]', '{"min_minute": 15}', 2, 4),
('Substitution', 'Will there be a substitution in the next {time_window} seconds?', '["Yes", "No"]', '["substitution"]', '{"min_minute": 45}', 3, 3),
('Offside', 'Will there be an offside in the next {time_window} seconds?', '["Yes", "No"]', '["offside"]', '{"attacking_play": true}', 2, 7),
('Free Kick', 'Will there be a free kick in the next {time_window} seconds?', '["Yes", "No"]', '["free_kick", "foul"]', '{"min_minute": 5}', 4, 5),
('Ball Possession', 'Which team will have more possession in the next {time_window} seconds?', '["Home Team", "Away Team", "Equal"]', '["possession_change"]', '{}', 2, 6),
('Next Team Action', 'Which team will have the next significant action?', '["Home Team", "Away Team"]', '["shot", "foul", "corner", "free_kick"]', '{}', 5, 8)
ON CONFLICT DO NOTHING;

-- ===================================================
-- PERMISSIONS
-- ===================================================

-- Add RLS policies for new tables
ALTER TABLE prediction_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_generation_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on prediction_pools" ON prediction_pools;
DROP POLICY IF EXISTS "Allow all operations on prediction_stakes" ON prediction_stakes;
DROP POLICY IF EXISTS "Allow all operations on prediction_templates" ON prediction_templates;
DROP POLICY IF EXISTS "Allow all operations on prediction_generation_log" ON prediction_generation_log;

-- Create new policies
CREATE POLICY "Allow all operations on prediction_pools" ON prediction_pools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on prediction_stakes" ON prediction_stakes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on prediction_templates" ON prediction_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on prediction_generation_log" ON prediction_generation_log FOR ALL USING (true) WITH CHECK (true);

-- ===================================================
-- COMPLETION MESSAGE
-- ===================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PREDICTION GRID SCHEMA SETUP COMPLETE';
  RAISE NOTICE 'Ready for micro-prediction betting!';
  RAISE NOTICE '========================================';
END $$;