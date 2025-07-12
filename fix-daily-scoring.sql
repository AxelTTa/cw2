-- Fixed Daily Scoring Function that uses real upvotes data
CREATE OR REPLACE FUNCTION calculate_daily_commentator_scores(target_date DATE)
RETURNS TABLE(user_id UUID, score DECIMAL, rank INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      c.user_id,
      COUNT(c.id) as comments_count,
      COALESCE(SUM(c.upvotes), 0) as total_upvotes,
      -- Score: comments * 10 + upvotes * 5
      (COUNT(c.id) * 10 + COALESCE(SUM(c.upvotes), 0) * 5) as final_score
    FROM comments c
    WHERE DATE(c.created_at) = target_date
      AND c.user_id IS NOT NULL
    GROUP BY c.user_id
  ),
  ranked_scores AS (
    SELECT 
      ds.user_id,
      ds.final_score::DECIMAL(10,2),
      ROW_NUMBER() OVER (ORDER BY ds.final_score DESC, ds.total_upvotes DESC) as rank
    FROM daily_stats ds
    WHERE ds.final_score > 0
  )
  SELECT rs.user_id, rs.final_score, rs.rank::INTEGER
  FROM ranked_scores rs
  WHERE rs.rank <= 10; -- Top 10 for leaderboard, top 3 get rewards
END;
$$ LANGUAGE plpgsql;

-- Add manual test transaction function for devs
CREATE OR REPLACE FUNCTION test_chz_transaction()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This is a test function that simulates a CHZ transaction
  -- In a real implementation, this would interface with the blockchain
  
  result := json_build_object(
    'success', true,
    'message', 'Test transaction completed successfully',
    'transaction_hash', '0x' || encode(gen_random_bytes(32), 'hex'),
    'amount', 10,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update daily_commentator_scores to store actual comment data
CREATE OR REPLACE FUNCTION store_daily_scores(target_date DATE)
RETURNS JSON AS $$
DECLARE
  scores_record RECORD;
  result JSON;
  total_users INTEGER := 0;
BEGIN
  -- Delete existing scores for this date
  DELETE FROM daily_commentator_scores WHERE date = target_date;
  
  -- Calculate and store new scores
  FOR scores_record IN
    SELECT 
      c.user_id,
      COUNT(c.id) as comments_count,
      COALESCE(SUM(c.upvotes), 0) as total_upvotes,
      (COUNT(c.id) * 10 + COALESCE(SUM(c.upvotes), 0) * 5) as final_score
    FROM comments c
    WHERE DATE(c.created_at) = target_date
      AND c.user_id IS NOT NULL
    GROUP BY c.user_id
    HAVING COUNT(c.id) > 0
    ORDER BY (COUNT(c.id) * 10 + COALESCE(SUM(c.upvotes), 0) * 5) DESC
  LOOP
    total_users := total_users + 1;
    
    INSERT INTO daily_commentator_scores (
      user_id,
      date,
      comments_count,
      total_upvotes,
      final_score,
      rank,
      created_at,
      updated_at
    ) VALUES (
      scores_record.user_id,
      target_date,
      scores_record.comments_count,
      scores_record.total_upvotes,
      scores_record.final_score,
      total_users,
      now(),
      now()
    );
  END LOOP;
  
  result := json_build_object(
    'success', true,
    'date', target_date,
    'total_users', total_users,
    'message', 'Daily scores calculated and stored successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;