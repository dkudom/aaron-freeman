-- Comments Schema for Aaron Freeman Portfolio
-- Add this to your Supabase SQL Editor after running the main schema

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT true, -- For moderation if needed
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE -- For nested replies
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_blog_post_id ON comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Update trigger for comments
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Public read access for approved comments" ON comments
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Public insert access for comments" ON comments
    FOR INSERT WITH CHECK (true);

-- Admin policies for comment moderation
CREATE POLICY "Admin full access for comments" ON comments
    FOR ALL USING (true);

-- Comment count view for easy querying
CREATE OR REPLACE VIEW comment_counts AS
SELECT 
    blog_post_id,
    COUNT(*) as total_comments,
    COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as top_level_comments
FROM comments 
WHERE is_approved = true
GROUP BY blog_post_id; 