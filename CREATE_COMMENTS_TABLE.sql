-- Run this in Supabase SQL Editor to create the comments table
-- This will fix the "table does not exist" error

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_post_id UUID NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_blog_post_id ON comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to approved comments
CREATE POLICY "Public read access for approved comments" ON comments
    FOR SELECT USING (is_approved = true);

-- Create policy for public insert access  
CREATE POLICY "Public insert access for comments" ON comments
    FOR INSERT WITH CHECK (true);

-- Test the table
SELECT 'Comments table created successfully!' as message; 