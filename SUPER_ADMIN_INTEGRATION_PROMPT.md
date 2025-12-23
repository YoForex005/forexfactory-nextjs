# Super Admin AI Blog Integration Prompt

Use this prompt to integrate AI-generated blogs from your Super Admin into any new EA/Forex website.

---

## Overview

This integration allows your Super Admin application to inject AI-generated blog posts directly into the website's database. The website will then display these blogs with proper SEO metadata, FAQ schema, and styling.

---

## 1. Super Admin Pydantic Schema (Reference)

The Super Admin generates content with this structure:

```python
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from enum import Enum

class SearchIntent(str, Enum):
    INFORMATIONAL = "Informational"
    TRANSACTIONAL = "Transactional"
    COMMERCIAL = "Commercial Investigation"
    NAVIGATIONAL = "Navigational"

class ContentType(str, Enum):
    BLOG_POST = "Standard Blog Post"
    PILLAR_PAGE = "Pillar Page"
    LISTICLE = "Listicle"
    CASE_STUDY = "Case Study"
    NEWS_UPDATE = "News Update"

class PersonaType(str, Enum):
    ROGUE_ACADEMIC = "The Rogue SEO Academic"
    WALL_STREET = "The Wall Street Veteran"
    FRIENDLY_CODER = "The Friendly Coder"
    CUSTOM = "Custom"

class CoreIdentity(BaseModel):
    campaign_name: str
    primary_keyword: str
    target_audience: str
    intent: SearchIntent
    content_type: ContentType

class SEOTechnical(BaseModel):
    secondary_keywords: List[str]
    meta_description_goal: Optional[str] = None
    internal_links: List[str] = []
    external_authority_links: bool = False
    slug_strategy: str

class ToneStylePersona(BaseModel):
    act_as: PersonaType
    custom_persona: Optional[str] = None
    tone: str
    style: str
    pov: str
    emoji_usage: str  # Yes, No, Minimal
    humanization_level: int  # 0-100
    negative_constraints: Optional[str] = None

class StructureFormatting(BaseModel):
    target_word_count: List[int]  # [min, max]
    header_structure: List[str]  # FAQ, Key Takeaways, Pros/Cons
    cta: str

class Distribution(BaseModel):
    target_site_ids: Optional[List[str]] = None
    post_status: str  # Publish, Draft, Schedule

class ContentGenerationRequest(BaseModel):
    core_identity: CoreIdentity
    seo_technical: SEOTechnical
    personalization: ToneStylePersona
    structure: StructureFormatting
    distribution: Distribution

# Gemini Structured Output Schema
class FAQItem(BaseModel):
    question: str
    answer: str

class BlogContent(BaseModel):
    h1: str
    meta_title: str
    meta_description: str
    body_html: str
    faq_schema_json: List[FAQItem]
    lsi_used: List[str]
```

---

## 2. Prisma Schema for Website Database

Add or extend the `Blog` model with these fields to receive AI-generated content:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}

model Blog {
  id            Int         @id @default(autoincrement())
  title         String      @db.VarChar(500)          // Maps from: h1
  seoSlug       String      @unique @map("seo_slug") @db.VarChar(500)
  status        BlogStatus
  views         Int?        @default(0)
  createdAt     DateTime    @default(now()) @map("created_at")
  content       String                                // Maps from: body_html
  author        String      @db.VarChar(255)
  featuredImage String      @map("featured_image")
  tags          String
  categoryId    Int         @map("category_id")
  downloadLink  String?     @map("download_link")

  // === SEO Meta (from AI) ===
  metaTitle       String?   @map("meta_title") @db.VarChar(255)       // Maps from: meta_title
  metaDescription String?   @map("meta_description") @db.VarChar(500) // Maps from: meta_description

  // === AI Generation Metadata ===
  isAiGenerated     Boolean   @default(false) @map("is_ai_generated")
  primaryKeyword    String?   @map("primary_keyword") @db.VarChar(255)   // Maps from: primary_keyword
  secondaryKeywords String?   @map("secondary_keywords")                  // JSON array from: secondary_keywords
  targetAudience    String?   @map("target_audience") @db.VarChar(500)   // Maps from: target_audience
  searchIntent      String?   @map("search_intent") @db.VarChar(50)      // Maps from: intent (Informational, Transactional, Commercial, Navigational)
  contentType       String?   @map("content_type") @db.VarChar(50)       // Maps from: content_type (Blog Post, Pillar Page, Listicle, Case Study, News Update)
  personaType       String?   @map("persona_type") @db.VarChar(50)       // Maps from: act_as (Rogue Academic, Wall Street, Friendly Coder, Custom)
  customPersona     String?   @map("custom_persona")                      // Maps from: custom_persona
  tone              String?   @db.VarChar(100)                            // Maps from: tone
  style             String?   @db.VarChar(100)                            // Maps from: style
  pov               String?   @db.VarChar(50)                             // Maps from: pov (Point of view)
  emojiUsage        String?   @map("emoji_usage") @db.VarChar(20)        // Maps from: emoji_usage (Yes, No, Minimal)
  humanizationLevel Int?      @map("humanization_level")                  // Maps from: humanization_level (0-100)
  lsiKeywords       String?   @map("lsi_keywords")                        // JSON array from: lsi_used
  faqSchema         String?   @map("faq_schema")                          // JSON array from: faq_schema_json [{question, answer}]
  ctaText           String?   @map("cta_text") @db.VarChar(500)          // Maps from: cta

  // === Relations ===
  categories    BlogCategory[]
  comments      Comment[]
  seoMeta       SeoMeta[]
  savedBy       SavedArticle[]
  recentViews   RecentBlog[]

  @@index([status, createdAt])
  @@index([isAiGenerated])
  @@map("blogs")
}

enum BlogStatus {
  published
  draft
}
```

### Apply Schema Changes
```bash
npx prisma db push
npx prisma generate
```

---

## 3. Frontend: Auto-Render Extra Fields

Add this component to display AI blog metadata and FAQ schema with consistent styling.

### Create: `src/components/blog/AIBlogMeta.tsx`

```tsx
import { Brain, Target, User, Sparkles, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface AIBlogMetaProps {
  isAiGenerated?: boolean;
  primaryKeyword?: string | null;
  searchIntent?: string | null;
  contentType?: string | null;
  personaType?: string | null;
  targetAudience?: string | null;
  lsiKeywords?: string | null;  // JSON string
  faqSchema?: string | null;    // JSON string
  tone?: string | null;
  style?: string | null;
}

export function AIBlogMeta({
  isAiGenerated,
  primaryKeyword,
  searchIntent,
  contentType,
  personaType,
  targetAudience,
  lsiKeywords,
  faqSchema,
  tone,
  style,
}: AIBlogMetaProps) {
  if (!isAiGenerated) return null;

  // Parse JSON fields
  const parsedLsiKeywords: string[] = lsiKeywords ? JSON.parse(lsiKeywords) : [];
  const parsedFaqSchema: FAQItem[] = faqSchema ? JSON.parse(faqSchema) : [];

  return (
    <div className="space-y-8">
      {/* AI Generation Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 rounded-lg border border-brand/20">
        <Sparkles className="h-3.5 w-3.5" />
        AI Generated Content
      </div>

      {/* Content Metadata Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {primaryKeyword && (
          <MetaCard icon={Target} label="Primary Keyword" value={primaryKeyword} />
        )}
        {searchIntent && (
          <MetaCard icon={Brain} label="Search Intent" value={searchIntent} />
        )}
        {contentType && (
          <MetaCard icon={Brain} label="Content Type" value={contentType} />
        )}
        {personaType && (
          <MetaCard icon={User} label="Writing Persona" value={personaType} />
        )}
        {targetAudience && (
          <MetaCard icon={Target} label="Target Audience" value={targetAudience} />
        )}
        {tone && style && (
          <MetaCard icon={Sparkles} label="Tone & Style" value={`${tone} / ${style}`} />
        )}
      </div>

      {/* LSI Keywords */}
      {parsedLsiKeywords.length > 0 && (
        <div className="p-5 bg-[#0d0d14] rounded-xl border border-white/5">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">LSI Keywords Used</p>
          <div className="flex flex-wrap gap-2">
            {parsedLsiKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs text-zinc-400 bg-white/5 rounded-md border border-white/10"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Schema Section */}
      {parsedFaqSchema.length > 0 && (
        <div className="mt-12 p-6 bg-gradient-to-br from-brand/5 to-transparent rounded-2xl border border-brand/10">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {parsedFaqSchema.map((faq, idx) => (
              <details
                key={idx}
                className="group p-4 bg-[#0d0d14] rounded-xl border border-white/5 hover:border-brand/30 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-white font-medium">
                  {faq.question}
                  <span className="ml-4 text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 pt-3 text-zinc-400 border-t border-white/5 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for metadata cards
function MetaCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-4 bg-[#0d0d14] rounded-xl border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-brand" />
        <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
      <p className="text-sm text-white font-medium">{value}</p>
    </div>
  );
}
```

### Update: Blog Detail Page

In your `src/app/blog/[slug]/page.tsx`, add the component after the article content:

```tsx
import { AIBlogMeta } from "@/components/blog/AIBlogMeta";

// Inside your component, after the main content:
<AIBlogMeta
  isAiGenerated={blog.isAiGenerated}
  primaryKeyword={blog.primaryKeyword}
  searchIntent={blog.searchIntent}
  contentType={blog.contentType}
  personaType={blog.personaType}
  targetAudience={blog.targetAudience}
  lsiKeywords={blog.lsiKeywords}
  faqSchema={blog.faqSchema}
  tone={blog.tone}
  style={blog.style}
/>
```

---

## 4. FAQ Schema for SEO (JSON-LD)

Add FAQ structured data to the page for search engines:

```tsx
// Add to generateMetadata or inside the page component
const faqSchema = blog.faqSchema ? JSON.parse(blog.faqSchema) : [];

const faqJsonLd = faqSchema.length > 0 ? {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqSchema.map((faq: { question: string; answer: string }) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
} : null;

// Render in component
{faqJsonLd && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
  />
)}
```

---

## 5. Color Palette & Typography Reference

Use these consistent design tokens across all EA websites:

### Colors (Tailwind Config)
```js
colors: {
  brand: {
    DEFAULT: "#0A84FF",  // Primary blue
    dark: "#0060DF",
    light: "#9ED0FF",
  },
  surface: {
    50: "#0B0D16",   // Darkest background
    100: "#121527",  // Main background
    200: "#1B2040",  // Card background
    300: "#232A58",  // Elevated surfaces
  },
}
```

### CSS Classes
```css
/* Background */
.bg-surface-100    /* Main page background */
.bg-[#0d0d14]      /* Card/panel background */
.bg-[#0a0a0f]      /* Darker sections */

/* Text */
.text-white        /* Primary headings */
.text-zinc-300     /* Body text */
.text-zinc-400     /* Secondary text */
.text-zinc-500     /* Muted/labels */
.text-brand        /* Accent/links */

/* Borders */
.border-white/5    /* Subtle borders */
.border-white/10   /* Visible borders */
.border-brand/20   /* Accent borders */

/* Glass Effect */
.glass-panel {
  @apply rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl;
  box-shadow: 0 40px 120px rgba(10, 132, 255, 0.25);
}

/* Gradient Text */
.gradient-text {
  @apply bg-gradient-to-r from-brand via-cyan-400 to-indigo-400 bg-clip-text text-transparent;
}
```

### Typography
- **Font Family**: Geist Sans (or system-ui fallback)
- **Headings**: font-bold, text-white
- **Body**: text-zinc-300, leading-7
- **Labels**: text-xs, uppercase, tracking-wider, text-zinc-500

---

## 6. Field Mapping Summary

| Super Admin Field | Prisma Field | Description |
|-------------------|--------------|-------------|
| `h1` | `title` | Blog title |
| `meta_title` | `metaTitle` | SEO title |
| `meta_description` | `metaDescription` | SEO description |
| `body_html` | `content` | Full HTML content |
| `faq_schema_json` | `faqSchema` | JSON array |
| `lsi_used` | `lsiKeywords` | JSON array |
| `primary_keyword` | `primaryKeyword` | Target keyword |
| `secondary_keywords` | `secondaryKeywords` | JSON array |
| `target_audience` | `targetAudience` | Audience description |
| `intent` | `searchIntent` | Search intent type |
| `content_type` | `contentType` | Content format |
| `act_as` | `personaType` | Writing persona |
| `custom_persona` | `customPersona` | Custom persona text |
| `tone` | `tone` | Writing tone |
| `style` | `style` | Writing style |
| `pov` | `pov` | Point of view |
| `emoji_usage` | `emojiUsage` | Emoji preference |
| `humanization_level` | `humanizationLevel` | 0-100 scale |
| `cta` | `ctaText` | Call to action |
| (computed) | `isAiGenerated` | Set to `true` |

---

## Quick Start Checklist

1. [ ] Copy the Prisma schema changes to your new project
2. [ ] Run `npx prisma db push && npx prisma generate`
3. [ ] Create `src/components/blog/AIBlogMeta.tsx` component
4. [ ] Import and use `<AIBlogMeta />` in blog detail page
5. [ ] Add FAQ JSON-LD schema for SEO
6. [ ] Configure Super Admin to inject with `isAiGenerated: true`
7. [ ] Test by injecting a sample blog post
