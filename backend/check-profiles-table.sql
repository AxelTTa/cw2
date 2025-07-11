-- Check the profiles table structure and constraints
-- Run this in your Supabase SQL editor to see the current table structure

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type, column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'profiles';

-- Check if there are any existing profiles
SELECT COUNT(*) as profile_count FROM profiles;

-- Check if id column has a default value for UUID generation
SELECT column_name, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';