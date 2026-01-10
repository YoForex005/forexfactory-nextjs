-- SQL script to create SEO meta for blogs that don't have it
-- This creates SEO meta entries with clean text (HTML stripped)

-- Insert SEO meta for all blogs that don't have seo_meta yet
INSERT INTO seo_meta (
    post_id,
    seo_title,
    seo_description,
    seo_keywords,
    seo_slug,
    meta_robots,
    og_title,
    og_description,
    og_image,
    created_at,
    updated_at
)
SELECT 
    b.id as post_id,
    b.title as seo_title,
    -- Strip HTML tags and limit to 160 characters
    LEFT(
        REGEXP_REPLACE(
            REGEXP_REPLACE(b.content, '<[^>]+>', '', 'g'),  -- Remove HTML tags
            '\s+', ' ', 'g'                                   -- Replace multiple spaces
        ),
        160
    ) as seo_description,
    b.tags as seo_keywords,
    b.seo_slug as seo_slug,
    'index_follow' as meta_robots,
    b.title as og_title,
    -- Same clean description for OG
    LEFT(
        REGEXP_REPLACE(
            REGEXP_REPLACE(b.content, '<[^>]+>', '', 'g'),
            '\s+', ' ', 'g'
        ),
        160
    ) as og_description,
    b.featured_image as og_image,
    NOW() as created_at,
    NOW() as updated_at
FROM blogs b
LEFT JOIN seo_meta sm ON b.id = sm.post_id
WHERE sm.id IS NULL;  -- Only insert for blogs without SEO meta

-- Check how many were created
SELECT COUNT(*) as "SEO Meta Entries Created" FROM seo_meta;
