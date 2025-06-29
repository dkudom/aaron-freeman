-- Aaron Freeman Portfolio Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    read_time TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Urban & Environmental Projects',
        'Environmental & Compliance Experience',
        'Community & Volunteer Leadership'
    )),
    location TEXT,
    year TEXT,
    status TEXT NOT NULL CHECK (status IN (
        'Completed',
        'In Progress',
        'Planning',
        'Concept'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume Table (single row)
CREATE TABLE IF NOT EXISTS resume (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date_issued DATE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_certificates_date_issued ON certificates(date_issued DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_type_id ON page_views(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_page ON page_views(ip_address, page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_view_counts_page_type_id ON view_counts(page_type, page_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Create triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_updated_at BEFORE UPDATE ON resume
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for view counts
CREATE TRIGGER update_view_counts_trigger AFTER INSERT ON page_views
    FOR EACH ROW EXECUTE FUNCTION update_view_counts();

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_counts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for blog_posts" ON blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Public read access for projects" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Public read access for resume" ON resume
    FOR SELECT USING (true);

CREATE POLICY "Public read access for certificates" ON certificates
    FOR SELECT USING (true);

CREATE POLICY "Public read access for view_counts" ON view_counts
    FOR SELECT USING (true);

-- Admin write policies (you can modify these based on your auth setup)
-- For now, allowing all writes (you should implement proper auth later)
CREATE POLICY "Admin write access for blog_posts" ON blog_posts
    FOR ALL USING (true);

CREATE POLICY "Admin write access for projects" ON projects
    FOR ALL USING (true);

CREATE POLICY "Admin write access for resume" ON resume
    FOR ALL USING (true);

CREATE POLICY "Admin write access for certificates" ON certificates
    FOR ALL USING (true);

CREATE POLICY "Public write access for page_views" ON page_views
    FOR INSERT USING (true);

CREATE POLICY "Public read access for page_views" ON page_views
    FOR SELECT USING (true);

-- Insert some sample data (optional)
INSERT INTO blog_posts (title, excerpt, content, date, read_time, tags) VALUES 
(
    'Welcome to My Portfolio',
    'Introduction to my work in environmental planning and urban development.',
    'This is my first blog post on this new portfolio platform. I''ll be sharing insights about environmental planning, urban development, and sustainability projects.',
    CURRENT_DATE,
    '2 min read',
    ARRAY['welcome', 'introduction', 'portfolio']
) ON CONFLICT DO NOTHING;

INSERT INTO projects (title, description, pdf_url, category, location, year, status) VALUES 
(
    'Sample Environmental Project',
    'A comprehensive environmental impact assessment for urban development.',
    'https://example.com/sample.pdf',
    'Environmental & Compliance Experience',
    'Brisbane, QLD',
    '2024',
    'Completed'
) ON CONFLICT DO NOTHING; 