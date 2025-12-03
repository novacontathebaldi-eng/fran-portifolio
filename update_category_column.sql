-- Script to ensure 'category' column in 'projects' table is TEXT/VARCHAR
-- This allows for dynamic category creation instead of restricted ENUMs.

DO $$ 
BEGIN
  -- Check if the column exists and change its type if necessary
  -- Note: This will only work if the current values are compatible with TEXT (which they always are)
  ALTER TABLE projects 
  ALTER COLUMN category TYPE TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error altering column: %', SQLERRM;
END $$;
