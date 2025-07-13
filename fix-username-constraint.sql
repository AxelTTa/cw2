-- ===================================================
-- FIX USERNAME CONSTRAINT ISSUE
-- ===================================================
-- This script fixes the username constraint that's causing 
-- "User ID is required" errors by making username nullable
-- and adding proper unique constraints

-- Step 1: Make username nullable (allow NULL values)
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;

-- Step 2: Add unique constraint on username (only when not null)
-- This prevents duplicate usernames while allowing NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON profiles(username) WHERE username IS NOT NULL;

-- Step 3: Add unique constraint on email (only when not null)
-- This prevents duplicate emails while allowing NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON profiles(email) WHERE email IS NOT NULL;

-- Step 4: Add unique constraint on google_id (only when not null)
-- This prevents duplicate Google accounts while allowing NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_google_id_unique 
ON profiles(google_id) WHERE google_id IS NOT NULL;

-- Step 5: Create function to generate safe usernames
CREATE OR REPLACE FUNCTION generate_safe_username(base_email TEXT)
RETURNS TEXT AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 0;
BEGIN
    -- Extract username from email
    base_username := split_part(base_email, '@', 1);
    
    -- Clean the username (remove special characters, make lowercase)
    base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
    
    -- Ensure minimum length
    IF length(base_username) < 3 THEN
        base_username := 'user_' || base_username;
    END IF;
    
    -- Try the base username first
    final_username := base_username;
    
    -- Keep trying with incrementing numbers until we find a unique username
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
        counter := counter + 1;
        final_username := base_username || '_' || counter;
    END LOOP;
    
    RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update any existing profiles that have null usernames
UPDATE profiles 
SET username = generate_safe_username(COALESCE(email, 'user_' || id::text))
WHERE username IS NULL AND email IS NOT NULL;

-- Step 7: For any profiles without email or username, generate from ID
UPDATE profiles 
SET username = 'user_' || substring(id::text, 1, 8)
WHERE username IS NULL;

-- ===================================================
-- COMPLETION MESSAGE
-- ===================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'USERNAME CONSTRAINT FIX COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '- Made username column nullable';
  RAISE NOTICE '- Added unique constraints for username, email, google_id';
  RAISE NOTICE '- Created safe username generation function';
  RAISE NOTICE '- Updated existing NULL usernames';
  RAISE NOTICE '';
  RAISE NOTICE 'This should fix the "User ID is required" error!';
  RAISE NOTICE '========================================';
END $$;