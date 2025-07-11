-- Clutch Match Discussion Database Schema
-- Run this in your Supabase SQL editor

-- Profiles table for user management
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    fan_tokens INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table for tracking football matches
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, finished
    league VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table for match discussions
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for threaded replies
    content TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'text', -- text, meme, prediction
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table for likes/emojis on comments
CREATE TABLE reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- like, love, fire, laugh, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id, reaction_type)
);

-- Predictions table for match predictions
CREATE TABLE predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- winner, score, first_goal, etc.
    prediction_value JSONB NOT NULL,
    is_correct BOOLEAN,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, match_id, prediction_type)
);

-- Leaderboards table for tracking top fans
CREATE TABLE leaderboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, all_time
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE,
    total_xp INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_upvotes INTEGER DEFAULT 0,
    rank_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period, period_start)
);

-- NFT Badges table for achievements
CREATE TABLE nft_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL, -- streak, top_fan, prediction_master, etc.
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_image_url TEXT,
    metadata JSONB,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_match_id ON comments(match_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_reactions_comment_id ON reactions(comment_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_leaderboards_period ON leaderboards(period, period_start);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Matches policies (read-only for users)
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Anyone can view reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reactions" ON reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Predictions policies
CREATE POLICY "Anyone can view predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboards policies (read-only for users)
CREATE POLICY "Anyone can view leaderboards" ON leaderboards FOR SELECT USING (true);

-- NFT Badges policies
CREATE POLICY "Anyone can view nft_badges" ON nft_badges FOR SELECT USING (true);
CREATE POLICY "Users can view own badges" ON nft_badges FOR SELECT USING (auth.uid() = user_id);

-- Functions for updating profile stats
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update XP and level when user gets upvotes
    IF TG_OP = 'UPDATE' AND NEW.upvotes > OLD.upvotes THEN
        UPDATE profiles 
        SET xp = xp + (NEW.upvotes - OLD.upvotes) * 10,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile stats when comments get upvotes
CREATE TRIGGER trigger_update_profile_stats
    AFTER UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_stats();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name)
    VALUES (NEW.id, NEW.email, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Players table for Club World Cup participants
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id INTEGER UNIQUE NOT NULL, -- External API player ID
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(100),
    position VARCHAR(50),
    age INTEGER,
    height VARCHAR(20),
    weight VARCHAR(20),
    photo_url TEXT,
    team_name VARCHAR(255),
    team_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player statistics table for tracking performance
CREATE TABLE player_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    season INTEGER NOT NULL,
    league VARCHAR(100),
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    appearances INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, season, league)
);

-- Player predictions table for user predictions about players
CREATE TABLE player_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- top_scorer, mvp, most_assists, etc.
    tournament VARCHAR(100) DEFAULT 'FIFA Club World Cup 2025',
    is_correct BOOLEAN,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, player_id, prediction_type, tournament)
);

-- Indexes for performance
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_nationality ON players(nationality);
CREATE INDEX idx_player_statistics_player_id ON player_statistics(player_id);
CREATE INDEX idx_player_statistics_season ON player_statistics(season);
CREATE INDEX idx_player_predictions_player_id ON player_predictions(player_id);
CREATE INDEX idx_player_predictions_user_id ON player_predictions(user_id);

-- Row Level Security for new tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_predictions ENABLE ROW LEVEL SECURITY;

-- Players policies (read-only for users)
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);

-- Player statistics policies (read-only for users)
CREATE POLICY "Anyone can view player statistics" ON player_statistics FOR SELECT USING (true);

-- Player predictions policies
CREATE POLICY "Anyone can view player predictions" ON player_predictions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create player predictions" ON player_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own player predictions" ON player_predictions FOR UPDATE USING (auth.uid() = user_id);