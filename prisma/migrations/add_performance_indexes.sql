-- Add critical performance indexes to blogs table and related tables
-- Run this migration to significantly improve query performance

-- Full-text search indexes for faster search queries
CREATE INDEX IF NOT EXISTS idx_blogs_title_search ON blogs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_blogs_tags_search ON blogs USING gin(to_tsvector('english', tags));
CREATE INDEX IF NOT EXISTS idx_blogs_content_search ON blogs USING gin(to_tsvector('english', content));

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_blogs_status_created ON blogs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_status_views ON blogs(status, views DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_status_category_created ON blogs(status, category_id, created_at DESC);

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_blogs_views ON blogs(views DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(seo_slug);

-- Junction table indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_blog ON blog_categories(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_category ON blog_categories(category_id);

-- Comments performance
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);

-- SEO meta performance
CREATE INDEX IF NOT EXISTS idx_seo_meta_post ON seo_meta(post_id);

-- Signal table optimization
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_rating ON signals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_signals_downloads ON signals(download_count DESC);
