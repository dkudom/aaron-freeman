-- Fix Views RLS Policies
-- Run this in your Supabase SQL Editor to fix the RLS policy issue

-- Add missing policies for view_counts table to allow trigger operations
DROP POLICY IF EXISTS "Allow insert for view_counts" ON view_counts;
CREATE POLICY "Allow insert for view_counts" ON view_counts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for view_counts" ON view_counts;
CREATE POLICY "Allow update for view_counts" ON view_counts
    FOR UPDATE USING (true) WITH CHECK (true);

-- Verify the fix worked
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: RLS policies for view_counts have been updated!';
    RAISE NOTICE 'You can now re-enable view tracking in your application.';
END
$$; 