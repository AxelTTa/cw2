-- Simple match betting table for Club World Cup 2025
CREATE TABLE IF NOT EXISTS match_bets (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id BIGINT NOT NULL, -- Match ID from API-Football
    team_bet TEXT NOT NULL, -- Name of the team the user bet on
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0), -- Amount of CHZ bet
    odds DECIMAL(5,2) DEFAULT 2.0, -- Betting odds (can be calculated later)
    potential_return DECIMAL(10,2) GENERATED ALWAYS AS (amount * odds) STORED,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'refunded')),
    result TEXT, -- Final result (will be filled after match ends)
    actual_return DECIMAL(10,2) DEFAULT 0, -- Actual payout amount
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settled_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(user_id, match_id) -- One bet per user per match
);

-- Create indexes for performance
CREATE INDEX idx_match_bets_user_id ON match_bets(user_id);
CREATE INDEX idx_match_bets_match_id ON match_bets(match_id);
CREATE INDEX idx_match_bets_status ON match_bets(status);
CREATE INDEX idx_match_bets_created_at ON match_bets(created_at);

-- RLS Policies
ALTER TABLE match_bets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bets
CREATE POLICY "Users can view their own bets" ON match_bets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bets
CREATE POLICY "Users can place their own bets" ON match_bets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bets (for status changes, etc.)
CREATE POLICY "Users can update their own bets" ON match_bets
    FOR UPDATE USING (auth.uid() = user_id);

-- Optional: Allow admins to see all bets for settlement purposes
-- CREATE POLICY "Admins can view all bets" ON match_bets
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_match_bets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_bets_updated_at
    BEFORE UPDATE ON match_bets
    FOR EACH ROW
    EXECUTE FUNCTION update_match_bets_updated_at();

-- Comments for documentation
COMMENT ON TABLE match_bets IS 'Simple win/loss betting system for Club World Cup 2025 matches';
COMMENT ON COLUMN match_bets.match_id IS 'Match ID from API-Football fixtures endpoint';
COMMENT ON COLUMN match_bets.team_bet IS 'Name of the team the user is betting on to win';
COMMENT ON COLUMN match_bets.amount IS 'Amount of CHZ tokens bet by the user';
COMMENT ON COLUMN match_bets.odds IS 'Betting odds at time of bet placement';
COMMENT ON COLUMN match_bets.potential_return IS 'Calculated potential payout (amount * odds)';
COMMENT ON COLUMN match_bets.status IS 'Current status: active, won, lost, or refunded';
COMMENT ON COLUMN match_bets.actual_return IS 'Actual CHZ tokens returned to user (if won)';