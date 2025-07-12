-- Fix wallet_connections table constraint for upsert
-- Add the missing unique constraint that the API expects

-- First check if constraint exists
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'wallet_connections'::regclass;

-- Add the unique constraint for (user_id, wallet_address) if it doesn't exist
ALTER TABLE wallet_connections 
ADD CONSTRAINT wallet_connections_user_wallet_unique 
UNIQUE (user_id, wallet_address);