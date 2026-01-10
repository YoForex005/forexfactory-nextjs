# Database Optimization Guide

## Critical Performance Indexes

Run these SQL commands to add essential indexes that will dramatically improve query performance:

```sql
-- Blog table indexes (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS idx_blogs_status_created ON blogs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_views ON blogs(views DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_title ON blogs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON blogs USING gin(to_tsvector('english', tags));
CREATE INDEX IF NOT EXISTS idx_blogs_content ON blogs USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blogs_status_views ON blogs(status, views DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_status_category_created ON blogs(status, category_id, created_at DESC);

-- BlogCategory junction table
CREATE INDEX IF NOT EXISTS idx_blog_categories_blog ON blog_categories(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_category ON blog_categories(category_id);

-- Comments table
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);

-- SeoMeta table
CREATE INDEX IF NOT EXISTS idx_seo_meta_post ON seo_meta(post_id);
```

## Expected Performance Improvements

- **Homepage**: 7.1s → ~2-3s (60% faster)
- **Blog Page**: 4s → ~1-2s (50-75% faster)
- **Search API**: Current → ~100-300ms (90% faster)
- **Individual Blog**: Current → ~500ms-1s (80% faster)

## How to Apply

### Option 1: Using Prisma Migrate (Recommended)
1. Create a new migration file
2. Add the SQL commands above
3. Run `npx prisma migrate dev`

### Option 2: Direct SQL Execution
1. Connect to your PostgreSQL database
2. Run the SQL commands directly
3. Verify with `\d blogs` in psql

## Verification

After adding indexes, verify they were created:

```sql
-- Check all indexes on blogs table
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'blogs';
```

## Monitoring

Track query performance improvements:

```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 100;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%blogs%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```
