-- Fix the profiles table ID column to auto-generate UUIDs
-- Run this in your Supabase SQL editor

-- First, check if the id column has a default UUID generation
SELECT column_name, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';

-- If the id column doesn't have a default, set it to generate UUIDs
-- This assumes the id column is already a UUID type
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Alternative: If you need to ensure the column is UUID type and has default
-- ALTER TABLE profiles ALTER COLUMN id TYPE UUID USING id::UUID;
-- ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Check if the change was applied
SELECT column_name, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';