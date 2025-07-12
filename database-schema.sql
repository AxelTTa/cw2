-- ===================================================
-- COMPLETE DATABASE SCHEMA FOR CHILIZ SPORTS PLATFORM
-- ===================================================
-- This file contains all necessary database tables, indexes, functions, 
-- triggers, and policies for the complete sports platform application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================
-- CORE USER MANAGEMENT TABLES (CREATED FIRST)
-- ===================================================

-- Main user profiles table (MUST BE FIRST - referenced by many tables)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username character varying NOT NULL,
    display_name character varying,
    email character varying,
    avatar_url text,
    bio text,
    login_method character varying DEFAULT 'email'::character varying,
    last_login timestamp with time zone,
    email_verified boolean DEFAULT false,
    google_id character varying,
    xp integer DEFAULT 0,
    level integer DEFAULT 1,
    total_likes_received integer DEFAULT 0,
    total_comments integer DEFAULT 0,
    level_up_notifications integer DEFAULT 0,
    streak_count integer DEFAULT 0,
    fan_tokens numeric DEFAULT 100.0,
    total_chz_earned numeric DEFAULT 0.0,
    wallet_address character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    google_access_token text,
    google_refresh_token text,
    google_id_token text,
    token_expires_at timestamp with time zone,
    google_profile_data jsonb,
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- ===================================================
-- SPORTS DATA TABLES
-- ===================================================

-- Teams table (referenced by players)
CREATE TABLE IF NOT EXISTS teams (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    external_id character varying,
    name character varying NOT NULL,
    country character varying,
    logo text,
    founded integer,
    venue_name character varying,
    venue_capacity integer,
    venue_city character varying,
    website_url text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT teams_pkey PRIMARY KEY (id)
);

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    external_id character varying,
    name character varying NOT NULL,
    country character varying,
    logo text,
    type character varying,
    season integer,
    current boolean DEFAULT false,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT competitions_pkey PRIMARY KEY (id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    external_id character varying,
    home_team character varying NOT NULL,
    away_team character varying NOT NULL,
    home_team_id character varying,
    away_team_id character varying,
    home_team_logo text,
    away_team_logo text,
    league character varying NOT NULL,
    season integer,
    round character varying,
    match_date timestamp with time zone NOT NULL,
    venue character varying,
    venue_city character varying,
    venue_capacity integer,
    status character varying DEFAULT 'ns'::character varying,
    status_long character varying,
    home_score integer,
    away_score integer,
    referee character varying,
    weather text,
    attendance integer,
    is_club_world_cup boolean DEFAULT false,
    is_champions_league boolean DEFAULT false,
    is_domestic_league boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT matches_pkey PRIMARY KEY (id)
);

-- Players table (references teams)
CREATE TABLE IF NOT EXISTS players (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    external_id character varying,
    name character varying NOT NULL,
    photo text,
    age integer,
    nationality character varying,
    position character varying,
    height character varying,
    weight character varying,
    team_id uuid,
    games_played integer DEFAULT 0,
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    minutes_played integer DEFAULT 0,
    rating numeric,
    yellow_cards integer DEFAULT 0,
    red_cards integer DEFAULT 0,
    jersey_number integer,
    market_value numeric,
    contract_expires date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT players_pkey PRIMARY KEY (id),
    CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Memes table (references profiles)
CREATE TABLE IF NOT EXISTS memes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title character varying NOT NULL,
    template_url text NOT NULL,
    category character varying DEFAULT 'general'::character varying,
    tags text[],
    usage_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT memes_pkey PRIMARY KEY (id),
    CONSTRAINT memes_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- ===================================================
-- COMMENT AND INTERACTION SYSTEM
-- ===================================================

-- Comments table (references profiles)
CREATE TABLE IF NOT EXISTS comments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    entity_type character varying NOT NULL,
    entity_id character varying NOT NULL,
    parent_id uuid,
    content text NOT NULL,
    comment_type character varying DEFAULT 'text'::character varying,
    is_meme boolean DEFAULT false,
    meme_url text,
    meme_caption text,
    image_url text,
    upvotes integer DEFAULT 0,
    downvotes integer DEFAULT 0,
    reply_count integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    is_reported boolean DEFAULT false,
    moderation_status character varying DEFAULT 'approved'::character varying,
    match_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- Reactions table (references profiles and comments) - PREVENTS DUPLICATE LIKES
CREATE TABLE IF NOT EXISTS reactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    comment_id uuid NOT NULL,
    reaction_type character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reactions_pkey PRIMARY KEY (id),
    CONSTRAINT reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT reactions_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES comments(id),
    -- CRITICAL: This unique constraint prevents duplicate likes per user per comment
    CONSTRAINT reactions_user_comment_unique UNIQUE (user_id, comment_id)
);

-- ===================================================
-- XP AND REWARDS SYSTEM
-- ===================================================

-- XP transaction logs (references profiles)
CREATE TABLE IF NOT EXISTS xp_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    action_type character varying NOT NULL,
    xp_change integer NOT NULL,
    xp_total integer NOT NULL,
    related_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT xp_logs_pkey PRIMARY KEY (id),
    CONSTRAINT xp_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Reward milestones
CREATE TABLE IF NOT EXISTS reward_milestones (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    milestone_type character varying NOT NULL,
    threshold_value integer NOT NULL,
    chz_reward numeric NOT NULL,
    title character varying NOT NULL,
    description text,
    icon_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reward_milestones_pkey PRIMARY KEY (id)
);

-- Reward claims tracking (references profiles and reward_milestones)
CREATE TABLE IF NOT EXISTS reward_claims (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    milestone_id uuid NOT NULL,
    claim_type character varying NOT NULL,
    xp_threshold integer,
    chz_amount numeric NOT NULL,
    wallet_address character varying,
    transaction_hash character varying,
    status character varying DEFAULT 'pending'::character varying,
    claimed_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    CONSTRAINT reward_claims_pkey PRIMARY KEY (id),
    CONSTRAINT reward_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT reward_claims_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES reward_milestones(id)
);

-- ===================================================
-- PREDICTIONS AND BETTING SYSTEM
-- ===================================================

-- Prediction templates
CREATE TABLE IF NOT EXISTS prediction_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    template_name character varying NOT NULL,
    question_template text NOT NULL,
    options jsonb NOT NULL,
    event_triggers jsonb NOT NULL,
    context_requirements jsonb,
    frequency_limit integer DEFAULT 1,
    priority integer DEFAULT 1,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT prediction_templates_pkey PRIMARY KEY (id)
);

-- Prediction markets (references matches)
CREATE TABLE IF NOT EXISTS prediction_markets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_id uuid,
    market_type character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    options jsonb NOT NULL,
    total_pool numeric DEFAULT 0,
    status character varying DEFAULT 'open'::character varying,
    settlement_result character varying,
    created_at timestamp with time zone DEFAULT now(),
    closes_at timestamp with time zone,
    settled_at timestamp with time zone,
    prediction_type character varying DEFAULT 'standard'::character varying,
    time_window_seconds integer DEFAULT 90,
    stake_amount numeric DEFAULT 0.25,
    house_fee_percentage numeric DEFAULT 5.0,
    auto_generated boolean DEFAULT false,
    context_data jsonb,
    expires_at timestamp with time zone,
    resolved_at timestamp with time zone,
    winning_option character varying,
    CONSTRAINT prediction_markets_pkey PRIMARY KEY (id),
    CONSTRAINT prediction_markets_match_id_fkey FOREIGN KEY (match_id) REFERENCES matches(id)
);

-- Prediction pools (references prediction_markets)
CREATE TABLE IF NOT EXISTS prediction_pools (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    market_id uuid NOT NULL,
    option_value character varying NOT NULL,
    total_stakes numeric DEFAULT 0.0,
    participant_count integer DEFAULT 0,
    potential_payout_per_chz numeric DEFAULT 1.0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT prediction_pools_pkey PRIMARY KEY (id),
    CONSTRAINT prediction_pools_market_id_fkey FOREIGN KEY (market_id) REFERENCES prediction_markets(id)
);

-- Prediction generation log (references matches, prediction_templates, prediction_markets)
CREATE TABLE IF NOT EXISTS prediction_generation_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    match_id uuid,
    template_id uuid,
    generated_question text NOT NULL,
    options_generated jsonb NOT NULL,
    context_used jsonb,
    generation_time timestamp with time zone DEFAULT now(),
    market_created boolean DEFAULT false,
    market_id uuid,
    CONSTRAINT prediction_generation_log_pkey PRIMARY KEY (id),
    CONSTRAINT prediction_generation_log_match_id_fkey FOREIGN KEY (match_id) REFERENCES matches(id),
    CONSTRAINT prediction_generation_log_template_id_fkey FOREIGN KEY (template_id) REFERENCES prediction_templates(id),
    CONSTRAINT prediction_generation_log_market_id_fkey FOREIGN KEY (market_id) REFERENCES prediction_markets(id)
);

-- Prediction stakes (references profiles, prediction_markets, prediction_pools)
CREATE TABLE IF NOT EXISTS prediction_stakes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    market_id uuid NOT NULL,
    pool_id uuid NOT NULL,
    stake_amount numeric NOT NULL,
    selected_option character varying NOT NULL,
    potential_return numeric DEFAULT 0.0,
    actual_return numeric DEFAULT 0.0,
    status character varying DEFAULT 'active'::character varying,
    placed_at timestamp with time zone DEFAULT now(),
    settled_at timestamp with time zone,
    CONSTRAINT prediction_stakes_pkey PRIMARY KEY (id),
    CONSTRAINT prediction_stakes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT prediction_stakes_market_id_fkey FOREIGN KEY (market_id) REFERENCES prediction_markets(id),
    CONSTRAINT prediction_stakes_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES prediction_pools(id)
);

-- Predictions (references profiles, prediction_markets)
CREATE TABLE IF NOT EXISTS predictions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    market_id uuid NOT NULL,
    predicted_option character varying NOT NULL,
    stake_amount numeric NOT NULL,
    potential_return numeric,
    is_correct boolean,
    actual_return numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    settled_at timestamp with time zone,
    CONSTRAINT predictions_pkey PRIMARY KEY (id),
    CONSTRAINT predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT predictions_market_id_fkey FOREIGN KEY (market_id) REFERENCES prediction_markets(id)
);

-- ===================================================
-- MODERATION AND REPORTING
-- ===================================================

-- Content reports (references profiles)
CREATE TABLE IF NOT EXISTS content_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL,
    content_type character varying NOT NULL,
    content_id uuid NOT NULL,
    reason character varying NOT NULL,
    description text,
    status character varying DEFAULT 'pending'::character varying,
    moderator_id uuid,
    moderator_notes text,
    created_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    CONSTRAINT content_reports_pkey PRIMARY KEY (id),
    CONSTRAINT content_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES profiles(id),
    CONSTRAINT content_reports_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES profiles(id)
);

-- Moderation actions (references profiles)
CREATE TABLE IF NOT EXISTS moderation_actions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    moderator_id uuid NOT NULL,
    action_type character varying NOT NULL,
    reason text NOT NULL,
    duration_hours integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    CONSTRAINT moderation_actions_pkey PRIMARY KEY (id),
    CONSTRAINT moderation_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
    CONSTRAINT moderation_actions_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES profiles(id)
);

-- ===================================================
-- WALLET AND BLOCKCHAIN INTEGRATION
-- ===================================================

-- Wallet connections (references profiles)
CREATE TABLE IF NOT EXISTS wallet_connections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    wallet_address character varying NOT NULL,
    wallet_type character varying DEFAULT 'metamask'::character varying,
    is_primary boolean DEFAULT true,
    connected_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wallet_connections_pkey PRIMARY KEY (id),
    CONSTRAINT wallet_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Token transactions (references profiles)
CREATE TABLE IF NOT EXISTS token_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    transaction_type character varying NOT NULL,
    amount numeric NOT NULL,
    token_type character varying DEFAULT 'CHZ'::character varying,
    wallet_address character varying,
    transaction_hash character varying,
    block_number bigint,
    status character varying DEFAULT 'pending'::character varying,
    related_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    confirmed_at timestamp with time zone,
    CONSTRAINT token_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT token_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- ===================================================
-- DAILY REWARDS SYSTEM
-- ===================================================

-- Daily commentator scores (references profiles)
CREATE TABLE IF NOT EXISTS daily_commentator_scores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    final_score integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    total_upvotes integer DEFAULT 0,
    rank integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT daily_commentator_scores_pkey PRIMARY KEY (id),
    CONSTRAINT daily_commentator_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- ===================================================
-- VIEWS (Tables that appear to be views based on structure)
-- ===================================================

-- Note: user_stats, user_xp_stats, and xp_leaderboard appear to be views 
-- based on their lack of primary keys and constraints. They should be 
-- created as views rather than tables.

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

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_entity_type_id ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity_created_at ON comments(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_upvotes ON comments(upvotes DESC);

-- Reactions indexes (CRITICAL for preventing duplicate likes)
CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_reactions_user_comment ON reactions(user_id, comment_id);

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

-- ===================================================
-- ATOMIC VOTING FUNCTION TO PREVENT DUPLICATE VOTES
-- ===================================================

CREATE OR REPLACE FUNCTION handle_comment_vote(
  p_user_id UUID,
  p_comment_id UUID,
  p_vote_type TEXT
) RETURNS JSON AS $$
DECLARE
  existing_reaction RECORD;
  vote_action TEXT;
  vote_message TEXT;
BEGIN
  -- Check for existing reaction of this type
  SELECT * INTO existing_reaction
  FROM reactions 
  WHERE user_id = p_user_id 
    AND comment_id = p_comment_id 
    AND reaction_type = p_vote_type;

  IF FOUND THEN
    -- Remove existing vote (toggle off)
    DELETE FROM reactions 
    WHERE user_id = p_user_id 
      AND comment_id = p_comment_id 
      AND reaction_type = p_vote_type;
    
    -- Update comment counts
    IF p_vote_type = 'like' THEN
      UPDATE comments 
      SET upvotes = GREATEST(0, upvotes - 1) 
      WHERE id = p_comment_id;
      vote_message := 'Upvote removed';
    ELSE
      UPDATE comments 
      SET downvotes = GREATEST(0, downvotes - 1) 
      WHERE id = p_comment_id;
      vote_message := 'Downvote removed';
    END IF;
    
    vote_action := 'removed';
  ELSE
    -- Check if user has opposite reaction and remove it
    IF p_vote_type = 'like' THEN
      -- Check and remove dislike if exists
      IF EXISTS (SELECT 1 FROM reactions WHERE user_id = p_user_id AND comment_id = p_comment_id AND reaction_type = 'dislike') THEN
        DELETE FROM reactions 
        WHERE user_id = p_user_id 
          AND comment_id = p_comment_id 
          AND reaction_type = 'dislike';
        UPDATE comments 
        SET downvotes = GREATEST(0, downvotes - 1) 
        WHERE id = p_comment_id;
      END IF;
    ELSE
      -- Check and remove like if exists
      IF EXISTS (SELECT 1 FROM reactions WHERE user_id = p_user_id AND comment_id = p_comment_id AND reaction_type = 'like') THEN
        DELETE FROM reactions 
        WHERE user_id = p_user_id 
          AND comment_id = p_comment_id 
          AND reaction_type = 'like';
        UPDATE comments 
        SET upvotes = GREATEST(0, upvotes - 1) 
        WHERE id = p_comment_id;
      END IF;
    END IF;
    
    -- Add new reaction (protected by unique constraint)
    INSERT INTO reactions (user_id, comment_id, reaction_type)
    VALUES (p_user_id, p_comment_id, p_vote_type)
    ON CONFLICT (user_id, comment_id) DO UPDATE SET 
      reaction_type = p_vote_type,
      created_at = now();
    
    -- Update comment counts
    IF p_vote_type = 'like' THEN
      UPDATE comments 
      SET upvotes = upvotes + 1 
      WHERE id = p_comment_id;
      vote_message := 'Upvote added';
    ELSE
      UPDATE comments 
      SET downvotes = downvotes + 1 
      WHERE id = p_comment_id;
      vote_message := 'Downvote added';
    END IF;
    
    vote_action := 'added';
  END IF;

  RETURN json_build_object(
    'action', vote_action,
    'message', vote_message,
    'success', true
  );
END;
$$ LANGUAGE plpgsql;