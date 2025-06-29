-- Views Migration Script
-- Run this in your Supabase SQL Editor to add view tracking functionality
-- This script safely adds only the new view tracking features

-- Views Table for tracking page views
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type TEXT NOT NULL CHECK (page_type IN ('reflections_section', 'blog_post')),
    page_id TEXT, -- For blog posts, this will be the blog post ID. For reflections section, this will be 'main'
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- View counts table for aggregated stats
CREATE TABLE IF NOT EXISTS view_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type TEXT NOT NULL CHECK (page_type IN ('reflections_section', 'blog_post')),
    page_id TEXT NOT NULL, -- For blog posts, this will be the blog post ID. For reflections section, this will be 'main'
    total_views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_type, page_id)
);

-- Create indexes for better performance (only for new tables)
CREATE INDEX IF NOT EXISTS idx_page_views_page_type_id ON page_views(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_page ON page_views(ip_address, page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_view_counts_page_type_id ON view_counts(page_type, page_id);

-- Function to update view counts
CREATE OR REPLACE FUNCTION update_view_counts()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO view_counts (page_type, page_id, total_views, unique_views, last_updated)
    VALUES (NEW.page_type, NEW.page_id, 1, 1, NOW())
    ON CONFLICT (page_type, page_id)
    DO UPDATE SET
        total_views = view_counts.total_views + 1,
        unique_views = CASE 
            WHEN EXISTS (
                SELECT 1 FROM page_views 
                WHERE page_type = NEW.page_type 
                AND page_id = NEW.page_id 
                AND ip_address = NEW.ip_address
                AND id != NEW.id
            ) THEN view_counts.unique_views
            ELSE view_counts.unique_views + 1
        END,
        last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for view counts (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS update_view_counts_trigger ON page_views;
CREATE TRIGGER update_view_counts_trigger AFTER INSERT ON page_views
    FOR EACH ROW EXECUTE FUNCTION update_view_counts();

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_counts ENABLE ROW LEVEL SECURITY;

-- Create policies with correct syntax for INSERT operations
DROP POLICY IF EXISTS "Public read access for view_counts" ON view_counts;
CREATE POLICY "Public read access for view_counts" ON view_counts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write access for page_views" ON page_views;
CREATE POLICY "Public write access for page_views" ON page_views
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for page_views" ON page_views;
CREATE POLICY "Public read access for page_views" ON page_views
    FOR SELECT USING (true);

-- Verify the migration completed successfully
DO $$
BEGIN
    -- Check if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_views') AND
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'view_counts') THEN
        RAISE NOTICE 'SUCCESS: View tracking tables created successfully!';
    ELSE
        RAISE EXCEPTION 'FAILED: View tracking tables were not created properly';
    END IF;
    
    -- Check if trigger exists
    IF EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_view_counts_trigger') THEN
        RAISE NOTICE 'SUCCESS: View counting trigger created successfully!';
    ELSE
        RAISE EXCEPTION 'FAILED: View counting trigger was not created properly';
    END IF;
END
$$; 