-- ===================================================
-- COMPLETE DATABASE SCHEMA FOR CHILIZ SPORTS PLATFORM
-- ===================================================
-- This file contains all necessary database tables, indexes, functions, 
-- triggers, and policies for the complete sports platform application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================
-- CORE USER MANAGEMENT TABLES
-- ===================================================

-- Main user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  
  -- Authentication fields
  login_method VARCHAR(50) DEFAULT 'email',
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false,
  google_id VARCHAR(255) UNIQUE,
  
  -- XP and Gamification
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_likes_received INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  level_up_notifications INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  
  -- Chiliz token management
  fan_tokens DECIMAL(18,8) DEFAULT 100.0,
  total_chz_earned DECIMAL(18,8) DEFAULT 0.0,
  wallet_address VARCHAR(42),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- XP transaction logs
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  xp_change INTEGER NOT NULL,
  xp_total INTEGER NOT NULL,
  related_id UUID NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===================================================
-- SPORTS DATA TABLES
-- ===================================================

-- Matches table for all sports competitions
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id VARCHAR(50) UNIQUE, -- API provider ID
  
  -- Team information
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  home_team_id VARCHAR(50),
  away_team_id VARCHAR(50),
  home_team_logo TEXT,
  away_team_logo TEXT,
  
  -- Match details
  league VARCHAR(255) NOT NULL,
  season INTEGER,
  round VARCHAR(100),
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue VARCHAR(255),
  venue_city VARCHAR(100),
  venue_capacity INTEGER,
  
  -- Match status and scores
  status VARCHAR(20) DEFAULT 'ns', -- ns=not started, live, ft=finished, pp=postponed
  status_long VARCHAR(100),
  home_score INTEGER,
  away_score INTEGER,
  
  -- Additional match data
  referee VARCHAR(255),
  weather TEXT,
  attendance INTEGER,
  
  -- Competition flags
  is_club_world_cup BOOLEAN DEFAULT false,
  is_champions_league BOOLEAN DEFAULT false,
  is_domestic_league BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id VARCHAR(50) UNIQUE, -- API provider ID
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  logo TEXT,
  founded INTEGER,
  venue_name VARCHAR(255),
  venue_capacity INTEGER,
  venue_city VARCHAR(100),
  website_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id VARCHAR(50) UNIQUE, -- API provider ID
  name VARCHAR(255) NOT NULL,
  photo TEXT,
  age INTEGER,
  nationality VARCHAR(100),
  position VARCHAR(50),
  height VARCHAR(20),
  weight VARCHAR(20),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Current season statistics
  games_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  rating DECIMAL(3,1),
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  
  -- Profile information
  jersey_number INTEGER,
  market_value DECIMAL(15,2),
  contract_expires DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Leagues/Competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id VARCHAR(50) UNIQUE, -- API provider ID
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  logo TEXT,
  type VARCHAR(50), -- domestic_league, international_cup, domestic_cup
  season INTEGER,
  current BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===================================================
-- COMMENT AND INTERACTION SYSTEM
-- ===================================================

-- Universal comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Universal entity support
  entity_type VARCHAR(20) NOT NULL, -- 'match', 'player', 'team', 'competition'
  entity_id VARCHAR(50) NOT NULL, -- Can reference any entity
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  
  -- Comment content
  content TEXT NOT NULL,
  comment_type VARCHAR(20) DEFAULT 'text', -- 'text', 'meme', 'image', 'prediction'
  
  -- Media content
  is_meme BOOLEAN DEFAULT FALSE,
  meme_url TEXT,
  meme_caption TEXT,
  image_url TEXT,
  
  -- Engagement metrics
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE,
  moderation_status VARCHAR(20) DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  
  -- Legacy support
  match_id UUID, -- Deprecated, use entity_id instead
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reactions table (likes, dislikes, etc.)
CREATE TABLE IF NOT EXISTS reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL, -- 'like', 'dislike', 'love', 'laugh', 'angry'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure user can only have ONE of each reaction type per comment
  UNIQUE(user_id, comment_id, reaction_type)
);

-- ===================================================
-- MEME SYSTEM
-- ===================================================

-- Meme templates table
CREATE TABLE IF NOT EXISTS memes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  template_url TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  tags TEXT[], -- Array of tags
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===================================================
-- REWARDS AND GAMIFICATION SYSTEM
-- ===================================================

-- Reward milestones
CREATE TABLE IF NOT EXISTS reward_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_type VARCHAR(50) NOT NULL, -- 'level', 'comments', 'upvotes', 'streak'
  threshold_value INTEGER NOT NULL,
  chz_reward DECIMAL(18,8) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(milestone_type, threshold_value)
);

-- Reward claims tracking
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES reward_milestones(id) ON DELETE CASCADE,
  claim_type VARCHAR(50) NOT NULL,
  xp_threshold INTEGER,
  chz_amount DECIMAL(18,8) NOT NULL,
  wallet_address VARCHAR(42),
  transaction_hash VARCHAR(66),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, milestone_id)
);

-- ===================================================
-- WALLET AND BLOCKCHAIN INTEGRATION
-- ===================================================

-- Wallet connections
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  wallet_type VARCHAR(50) DEFAULT 'metamask', -- 'metamask', 'walletconnect', 'coinbase'
  is_primary BOOLEAN DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, wallet_address)
);

-- Token transactions log
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'reward_claim', 'purchase', 'transfer', 'stake'
  amount DECIMAL(18,8) NOT NULL,
  token_type VARCHAR(20) DEFAULT 'CHZ', -- 'CHZ', 'FAN_TOKEN'
  wallet_address VARCHAR(42),
  transaction_hash VARCHAR(66),
  block_number BIGINT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  related_id UUID, -- Reference to reward claim, purchase, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- ===================================================
-- PREDICTIONS AND BETTING
-- ===================================================

-- Prediction markets
CREATE TABLE IF NOT EXISTS prediction_markets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  market_type VARCHAR(50) NOT NULL, -- 'match_result', 'total_goals', 'first_scorer'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  options JSONB NOT NULL, -- Array of prediction options
  total_pool DECIMAL(18,8) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'settled'
  settlement_result VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closes_at TIMESTAMP WITH TIME ZONE,
  settled_at TIMESTAMP WITH TIME ZONE
);

-- User predictions
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES prediction_markets(id) ON DELETE CASCADE,
  predicted_option VARCHAR(100) NOT NULL,
  stake_amount DECIMAL(18,8) NOT NULL,
  potential_return DECIMAL(18,8),
  is_correct BOOLEAN,
  actual_return DECIMAL(18,8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settled_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, market_id)
);

-- ===================================================
-- DAILY LEADERBOARD SYSTEM
-- ===================================================

-- Daily commentator scores for leaderboard
CREATE TABLE IF NOT EXISTS daily_commentator_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  comments_count INTEGER DEFAULT 0,
  total_upvotes INTEGER DEFAULT 0,
  total_downvotes INTEGER DEFAULT 0,
  final_score DECIMAL(10,2) DEFAULT 0.0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Function to calculate and update daily scores
CREATE OR REPLACE FUNCTION update_daily_commentator_scores(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  scores_updated INTEGER := 0;
BEGIN
  -- Delete existing scores for the target date
  DELETE FROM daily_commentator_scores WHERE date = target_date;
  
  -- Calculate and insert new daily scores
  WITH daily_stats AS (
    SELECT 
      c.user_id,
      COUNT(c.id) as comments_count,
      COALESCE(SUM(c.upvotes), 0) as total_upvotes,
      COALESCE(SUM(c.downvotes), 0) as total_downvotes,
      -- Calculate final score: comments * 10 + upvotes * 2 - downvotes * 1
      (COUNT(c.id) * 10) + (COALESCE(SUM(c.upvotes), 0) * 2) - (COALESCE(SUM(c.downvotes), 0) * 1) as final_score
    FROM comments c
    WHERE DATE(c.created_at) = target_date
    AND c.is_deleted = FALSE
    GROUP BY c.user_id
    HAVING COUNT(c.id) > 0 -- Only include users who commented
  ),
  ranked_scores AS (
    SELECT 
      user_id,
      comments_count,
      total_upvotes,
      total_downvotes,
      final_score,
      ROW_NUMBER() OVER (ORDER BY final_score DESC, comments_count DESC, total_upvotes DESC) as rank
    FROM daily_stats
  )
  INSERT INTO daily_commentator_scores (
    user_id, date, comments_count, total_upvotes, total_downvotes, final_score, rank
  )
  SELECT 
    user_id, target_date, comments_count, total_upvotes, total_downvotes, final_score, rank
  FROM ranked_scores;
  
  GET DIAGNOSTICS scores_updated = ROW_COUNT;
  
  RETURN scores_updated;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- MODERATION AND REPORTING
-- ===================================================

-- Content reports
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL, -- 'comment', 'meme', 'profile'
  content_id UUID NOT NULL,
  reason VARCHAR(50) NOT NULL, -- 'spam', 'inappropriate', 'harassment', 'fake'
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- User moderation actions
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'warning', 'mute', 'suspend', 'ban'
  reason TEXT NOT NULL,
  duration_hours INTEGER, -- NULL for permanent actions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ===================================================
-- PERFORMANCE INDEXES
-- ===================================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON profiles(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_xp_level ON profiles(xp DESC, level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet_address) WHERE wallet_address IS NOT NULL;

-- XP logs indexes
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON xp_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_logs_action_type ON xp_logs(action_type);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_club_world_cup ON matches(is_club_world_cup) WHERE is_club_world_cup = true;

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_entity_type_id ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity_created_at ON comments(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_upvotes ON comments(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_pinned ON comments(is_pinned DESC, created_at DESC);

-- Reactions indexes
CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(reaction_type);

-- Teams and players indexes
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON teams(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_players_external_id ON players(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- Wallet and transaction indexes
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_address ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_hash ON token_transactions(transaction_hash) WHERE transaction_hash IS NOT NULL;

-- Daily leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_commentator_scores(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date ON daily_commentator_scores(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_scores_rank ON daily_commentator_scores(date, rank);

-- ===================================================
-- XP CALCULATION FUNCTIONS
-- ===================================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: Every 1000 XP = 1 level
  RETURN GREATEST(1, FLOOR(xp_amount / 1000) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION xp_needed_for_next_level(current_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_level INTEGER;
  next_level_threshold INTEGER;
BEGIN
  current_level := calculate_level_from_xp(current_xp);
  next_level_threshold := current_level * 1000;
  RETURN next_level_threshold - current_xp;
END;
$$ LANGUAGE plpgsql;

-- Function to award XP and log the transaction
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_xp_change INTEGER,
  p_related_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_profile RECORD;
  new_xp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
  level_up BOOLEAN := FALSE;
  result JSON;
BEGIN
  -- Get current user profile
  SELECT xp, level, total_likes_received, total_comments 
  INTO current_profile 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF current_profile IS NULL THEN
    RAISE EXCEPTION 'User profile not found for ID: %', p_user_id;
  END IF;
  
  -- Calculate new XP and level
  new_xp := GREATEST(0, current_profile.xp + p_xp_change);
  old_level := current_profile.level;
  new_level := calculate_level_from_xp(new_xp);
  
  -- Check if user leveled up
  IF new_level > old_level THEN
    level_up := TRUE;
  END IF;
  
  -- Update user profile
  UPDATE profiles 
  SET 
    xp = new_xp,
    level = new_level,
    level_up_notifications = CASE 
      WHEN level_up THEN level_up_notifications + 1 
      ELSE level_up_notifications 
    END,
    total_likes_received = CASE 
      WHEN p_action_type = 'like_received' THEN total_likes_received + 1
      ELSE total_likes_received
    END,
    total_comments = CASE 
      WHEN p_action_type IN ('comment_created', 'reply_created') THEN total_comments + 1
      ELSE total_comments
    END,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP transaction
  INSERT INTO xp_logs (user_id, action_type, xp_change, xp_total, related_id, description)
  VALUES (p_user_id, p_action_type, p_xp_change, new_xp, p_related_id, p_description);
  
  -- Return result
  result := json_build_object(
    'success', true,
    'old_xp', current_profile.xp,
    'new_xp', new_xp,
    'xp_change', p_xp_change,
    'old_level', old_level,
    'new_level', new_level,
    'level_up', level_up,
    'xp_needed_for_next_level', xp_needed_for_next_level(new_xp)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- REACTION MANAGEMENT FUNCTIONS
-- ===================================================

-- Function to handle user reactions (like/dislike) with proper constraints
CREATE OR REPLACE FUNCTION upsert_reaction(
  p_user_id UUID,
  p_comment_id UUID,
  p_reaction_type VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
  existing_reaction RECORD;
  result JSON;
  comment_author_id UUID;
  xp_change INTEGER := 0;
BEGIN
  -- Get the comment author for XP calculations
  SELECT user_id INTO comment_author_id 
  FROM comments 
  WHERE id = p_comment_id;
  
  IF comment_author_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Comment not found');
  END IF;
  
  -- Don't allow users to react to their own comments
  IF comment_author_id = p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot react to your own comment');
  END IF;
  
  -- Check for existing reaction of the same type
  SELECT * INTO existing_reaction
  FROM reactions
  WHERE user_id = p_user_id AND comment_id = p_comment_id AND reaction_type = p_reaction_type;
  
  -- If same reaction type exists, remove it (toggle off)
  IF existing_reaction.id IS NOT NULL THEN
    DELETE FROM reactions 
    WHERE user_id = p_user_id AND comment_id = p_comment_id AND reaction_type = p_reaction_type;
    
    -- Calculate XP change for removal
    IF p_reaction_type = 'like' THEN
      xp_change := -2;
      PERFORM award_xp(comment_author_id, 'like_removed', xp_change, p_comment_id, 'Like removed from comment');
    END IF;
    
    result := json_build_object(
      'success', true,
      'action', 'removed',
      'reaction_type', p_reaction_type,
      'xp_change', xp_change
    );
    
  -- No existing reaction of this type, create new one
  ELSE
    INSERT INTO reactions (user_id, comment_id, reaction_type)
    VALUES (p_user_id, p_comment_id, p_reaction_type);
    
    -- Award XP for new reaction
    IF p_reaction_type = 'like' THEN
      xp_change := 2;
      PERFORM award_xp(comment_author_id, 'like_received', xp_change, p_comment_id, 'Received a like on comment');
    END IF;
    
    result := json_build_object(
      'success', true,
      'action', 'created',
      'reaction_type', p_reaction_type,
      'xp_change', xp_change
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- COMMENT SYSTEM FUNCTIONS
-- ===================================================

-- Function to validate comment constraints before creation
CREATE OR REPLACE FUNCTION validate_comment_constraints()
RETURNS trigger AS $$
BEGIN
  -- If this is a reply to another comment
  IF NEW.parent_id IS NOT NULL THEN
    -- Check if user has already replied to this comment
    IF EXISTS (
      SELECT 1 FROM comments 
      WHERE user_id = NEW.user_id 
      AND parent_id = NEW.parent_id 
      AND is_deleted = FALSE
    ) THEN
      RAISE EXCEPTION 'User can only reply once to each comment';
    END IF;
    
    -- Ensure parent comment exists and is not deleted
    IF NOT EXISTS (
      SELECT 1 FROM comments 
      WHERE id = NEW.parent_id 
      AND is_deleted = FALSE
    ) THEN
      RAISE EXCEPTION 'Parent comment not found or deleted';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get comments for any entity type
CREATE OR REPLACE FUNCTION get_entity_comments(
    p_entity_type VARCHAR(20), 
    p_entity_id VARCHAR(50), 
    p_limit INTEGER DEFAULT 50, 
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'newest'
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    entity_type VARCHAR(20),
    entity_id VARCHAR(50),
    parent_id UUID,
    content TEXT,
    comment_type VARCHAR(20),
    is_meme BOOLEAN,
    meme_url TEXT,
    meme_caption TEXT,
    image_url TEXT,
    upvotes INTEGER,
    downvotes INTEGER,
    is_pinned BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    profiles JSON,
    reactions JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH comment_data AS (
        SELECT 
            c.*,
            row_to_json(p.*) as profile_data,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', r.id,
                        'user_id', r.user_id,
                        'reaction_type', r.reaction_type,
                        'created_at', r.created_at
                    )
                ) FILTER (WHERE r.id IS NOT NULL),
                '[]'::json
            ) as reaction_data
        FROM comments c
        LEFT JOIN profiles p ON p.id = c.user_id
        LEFT JOIN reactions r ON r.comment_id = c.id
        WHERE c.entity_type = p_entity_type 
        AND c.entity_id = p_entity_id 
        AND c.parent_id IS NULL
        AND c.is_deleted = FALSE
        GROUP BY c.id, c.user_id, c.entity_type, c.entity_id, c.parent_id, 
                 c.content, c.comment_type, c.is_meme, c.meme_url, c.meme_caption,
                 c.image_url, c.upvotes, c.downvotes, c.is_pinned,
                 c.created_at, c.updated_at, p.*
    )
    SELECT 
        cd.id,
        cd.user_id,
        cd.entity_type,
        cd.entity_id,
        cd.parent_id,
        cd.content,
        cd.comment_type,
        cd.is_meme,
        cd.meme_url,
        cd.meme_caption,
        cd.image_url,
        cd.upvotes,
        cd.downvotes,
        cd.is_pinned,
        cd.created_at,
        cd.updated_at,
        cd.profile_data as profiles,
        cd.reaction_data as reactions
    FROM comment_data cd
    ORDER BY 
        cd.is_pinned DESC,
        CASE 
            WHEN p_sort_by = 'newest' THEN cd.created_at 
            WHEN p_sort_by = 'oldest' THEN cd.created_at
            WHEN p_sort_by = 'popular' THEN cd.created_at
            ELSE cd.created_at 
        END DESC,
        CASE 
            WHEN p_sort_by = 'popular' THEN cd.upvotes - cd.downvotes
            ELSE 0 
        END DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- REWARDS SYSTEM FUNCTIONS
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

-- ===================================================
-- LEADERBOARD FUNCTIONS
-- ===================================================

-- Function to get XP leaderboard
CREATE OR REPLACE FUNCTION get_xp_leaderboard(p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username VARCHAR(100),
    display_name VARCHAR(255),
    avatar_url TEXT,
    xp INTEGER,
    level INTEGER,
    total_likes_received INTEGER,
    total_comments INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC) as rank,
        p.id as user_id,
        p.username,
        p.display_name,
        p.avatar_url,
        p.xp,
        p.level,
        p.total_likes_received,
        p.total_comments
    FROM profiles p
    WHERE p.xp > 0
    ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC XP AWARDS
-- ===================================================

-- Function to award XP when comments are created
CREATE OR REPLACE FUNCTION handle_comment_xp()
RETURNS trigger AS $$
DECLARE
  xp_reward INTEGER;
  action_type VARCHAR(50);
  description TEXT;
BEGIN
  -- Determine XP reward based on comment type
  IF NEW.comment_type = 'meme' OR NEW.is_meme = true THEN
    xp_reward := 15;
    action_type := 'meme_posted';
    description := 'Posted a meme comment';
  ELSIF NEW.comment_type = 'image' THEN
    xp_reward := 15;
    action_type := 'image_posted';
    description := 'Posted an image comment';
  ELSIF NEW.parent_id IS NOT NULL THEN
    xp_reward := 5;
    action_type := 'reply_created';
    description := 'Posted a reply';
  ELSE
    xp_reward := 10;
    action_type := 'comment_created';
    description := 'Posted a comment';
  END IF;
  
  -- Award XP
  PERFORM award_xp(
    NEW.user_id,
    action_type,
    xp_reward,
    NEW.id,
    description
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NOTE: Reaction XP handling is now managed by the upsert_reaction function
-- This ensures proper constraint handling and prevents duplicate reactions

-- ===================================================
-- CREATE TRIGGERS
-- ===================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_comment_xp ON comments;
DROP TRIGGER IF EXISTS trigger_like_xp ON reactions;
DROP TRIGGER IF EXISTS trigger_like_removal_xp ON reactions;

-- Create triggers for comments
CREATE TRIGGER trigger_comment_constraints
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION validate_comment_constraints();

CREATE TRIGGER trigger_comment_xp
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_xp();

-- ===================================================
-- VIEWS FOR ANALYTICS AND PERFORMANCE
-- ===================================================

-- XP Leaderboard View
CREATE OR REPLACE VIEW xp_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.xp,
  p.level,
  p.total_likes_received,
  p.total_comments,
  p.created_at,
  ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC) as rank
FROM profiles p
WHERE p.xp > 0
ORDER BY p.xp DESC, p.level DESC, p.total_likes_received DESC;

-- User Statistics View
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.level,
    p.xp,
    p.fan_tokens,
    p.total_chz_earned,
    p.created_at,
    p.last_login,
    COUNT(DISTINCT c.id) as total_comments,
    COALESCE(SUM(c.upvotes), 0) as total_upvotes,
    COUNT(DISTINCT CASE WHEN c.is_meme = true THEN c.id END) as memes_posted,
    COUNT(DISTINCT r.id) as total_reactions_given
FROM profiles p
LEFT JOIN comments c ON p.id = c.user_id AND c.is_deleted = FALSE
LEFT JOIN reactions r ON p.id = r.user_id
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.level, p.xp, 
         p.fan_tokens, p.total_chz_earned, p.created_at, p.last_login;

-- ===================================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (adjust for production)
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on xp_logs" ON xp_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on reactions" ON reactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on memes" ON memes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on competitions" ON competitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on wallet_connections" ON wallet_connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on reward_milestones" ON reward_milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on reward_claims" ON reward_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on token_transactions" ON token_transactions FOR ALL USING (true) WITH CHECK (true);

-- ===================================================
-- INITIAL DATA SEEDING
-- ===================================================

-- Insert default reward milestones
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

-- Insert sample meme templates
INSERT INTO memes (title, template_url, category, tags) VALUES
('Drake Pointing', 'https://i.imgflip.com/30b1gx.jpg', 'reaction', ARRAY['drake', 'choice', 'preference']),
('Distracted Boyfriend', 'https://i.imgflip.com/1ur9b0.jpg', 'reaction', ARRAY['choice', 'temptation', 'decision']),
('Woman Yelling at Cat', 'https://i.imgflip.com/345v97.jpg', 'reaction', ARRAY['argument', 'angry', 'confused']),
('This is Fine', 'https://i.imgflip.com/26am.jpg', 'reaction', ARRAY['calm', 'disaster', 'ironic']),
('Surprised Pikachu', 'https://i.imgflip.com/2kbn1e.jpg', 'reaction', ARRAY['surprise', 'shock', 'unexpected']),
('Change My Mind', 'https://i.imgflip.com/24y43o.jpg', 'opinion', ARRAY['debate', 'opinion', 'convince']),
('Success Kid', 'https://i.imgflip.com/1bhk.jpg', 'celebration', ARRAY['success', 'victory', 'achievement'])
ON CONFLICT DO NOTHING;

-- ===================================================
-- COMPLETION MESSAGE
-- ===================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'COMPLETE DATABASE SCHEMA SETUP FINISHED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: %', (
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  );
  RAISE NOTICE 'Functions created: %', (
    SELECT COUNT(*) FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
  );
  RAISE NOTICE 'Views created: %', (
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'VIEW'
  );
  RAISE NOTICE 'Indexes created: Multiple performance indexes added';
  RAISE NOTICE 'Triggers created: XP reward system + comment constraints';
  RAISE NOTICE 'RLS policies: Permissive policies for development';
  RAISE NOTICE 'Constraints: One like/dislike/reply per comment (each action once)';
  RAISE NOTICE 'Initial data: Reward milestones and meme templates seeded';
  RAISE NOTICE 'Daily leaderboard: Table and scoring function created';
  RAISE NOTICE '========================================';
END $$;