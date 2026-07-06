# ForexFactory.cc SEO, AEO, GEO Implementation Plan

Date: 2026-07-06
Project audited: `C:\Users\LENOVO\forexfactory-nextjs`
Reference folder reviewed: `C:\Users\LENOVO\forexfactory-nextjs\claude-seo`

## Plain Verdict

SEO is partially aligned, but not enough for a serious #1 ranking push.

The project has a good technical SEO base: Next.js Metadata API, sitemap, robots, canonical URLs, OG/Twitter tags, schema helpers, IndexNow, `llms.txt`, and `ai.txt`.

The project is not fully aligned with the real product, current Google AI-search guidance, or trust requirements for forex/trading content. The main issue is not that SEO is missing. The issue is that some SEO signals are inconsistent, some claims are not backed by data, some schema can be misleading, and the content system is too programmatic for a finance-adjacent topic.

`claude-seo` is useful as an audit toolkit, but it is not a project-specific strategy. It should guide checks, not be treated as the actual ForexFactory.cc SEO plan.

Important expectation: nobody can honestly guarantee #1 rankings. The goal should be to build the strongest crawlable, trusted, evidence-backed, answer-ready forex EA resource in the niche. That is the path that gives the site a real shot at SEO, AEO, and GEO visibility.

## What Google Currently Says About AEO/GEO

For Google Search, AEO and GEO are not separate magic systems. Google says generative AI features rely on normal Search index, ranking, and quality systems. So the foundation is still SEO: crawlable pages, indexable content, helpful original information, strong technical structure, and trust.

Google also says `llms.txt`, special AI files, chunking pages into tiny pieces, AI-only rewrites, and fake mentions are not required for Google AI visibility. Keeping `llms.txt` is fine for non-Google AI systems, but it should not be treated as the main ranking lever.

Sources used:

- Google AI optimization guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google helpful content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google SoftwareApplication structured data: https://developers.google.com/search/docs/appearance/structured-data/software-app
- Google Product structured data: https://developers.google.com/search/docs/appearance/structured-data/product
- IndexNow documentation: https://www.indexnow.org/documentation
- Agent-friendly website guidance: https://web.dev/articles/ai-agent-site-ux

## Current Alignment Score

| Area | Status | Score | Reason |
|---|---:|---:|---|
| Technical SEO foundation | Partially aligned | 7/10 | Metadata, sitemap, robots, schema, OG, Twitter exist. But directives conflict. |
| Indexation control | Not aligned enough | 4/10 | Noindex values, sitemap rules, robots, IndexNow, and duplicate pages are inconsistent. |
| AEO/GEO readiness | Surface-level | 4/10 | AI files exist, but answer-first page content is weak. |
| Content quality | Risky | 4/10 | Many programmatic pages, duplicate patterns, weak evidence, generic snippets. |
| Entity and trust | Weak | 3/10 | Forex is high-risk. Author, testing, editorial, and risk transparency are thin. |
| Structured data | Present but risky | 5/10 | Useful helpers exist, but ratings/logos/schema can misrepresent visible content. |
| Internal linking | Decent | 6/10 | Nav, footer, cards, related posts exist, but hub architecture is not strong enough. |
| Performance SEO | Needs work | 4/10 | Public pages force dynamic rendering; Lighthouse file shows poor performance. |

## Main Finding

ForexFactory.cc should currently be treated as a programmatic forex EA/indicator review publisher with download links inside blog posts, not as a mature signals/download marketplace.

Why this matters:

- The app claims "500+ free Forex Expert Advisors," "verified backtests," "real performance data," "daily updates," and "1M+ downloads" in several places.
- The `Signal` model powers `/signals` and `/downloads`, but audit sampling found the signal inventory may be empty.
- The blog system appears to contain thousands of published posts, many with download links.

Therefore, the first SEO decision is:

Use `/blog/[slug]` as the primary indexed review/download surface until the download marketplace has real inventory and evidence.

## Phase 0: Stop The Biggest SEO Leaks

Forecast: 1-2 developer days
Priority: Critical
Goal: prevent wrong pages from being indexed and wrong signals from being sent.

### 0.1 Fix `metaRobots` Mapping

Problem:

`SeoMeta.metaRobots` is a Prisma enum with values like:

- `index_follow`
- `noindex_follow`
- `index_nofollow`
- `noindex_nofollow`

But `mapRobotsDirective()` in `src/lib/seo.ts` maps string labels like `noindex, follow`. Blog pages can fall back to `index, follow` even when the database intended noindex.

Implement:

- Update `src/lib/seo.ts`.
- Make `mapRobotsDirective()` accept both enum values and human-readable values.

Target behavior:

```ts
noindex_follow -> { index: false, follow: true }
noindex_nofollow -> { index: false, follow: false }
index_nofollow -> { index: true, follow: false }
index_follow -> { index: true, follow: true }
```

Acceptance check:

- A blog with `metaRobots = noindex_follow` renders a noindex directive.
- Sitemap excludes it.
- IndexNow does not submit it.

### 0.2 Choose One Canonical Detail URL For Trading Tools

Problem:

Both of these are indexable and canonicalize to themselves:

- `/signals/[uuid]`
- `/downloads/[uuid]`

If both show the same or similar `Signal` content, this creates duplicate indexable pages.

Recommended decision:

- Make `/downloads/[uuid]` the canonical product/download URL.
- Make `/signals/[uuid]` either redirect to `/downloads/[uuid]` or set `noindex, follow`.

Implementation option A, best for SEO:

- Redirect `/signals/[uuid]` to `/downloads/[uuid]` if the content is the same.
- Remove `/signals/[uuid]` from sitemap.

Implementation option B, if signals must stay:

- Keep `/signals/[uuid]` for users.
- Set canonical to `/downloads/[uuid]`.
- Set robots to `noindex, follow`.
- Remove `/signals/[uuid]` from sitemap.

Acceptance check:

- Only one canonical URL per trading tool is indexable.
- Sitemap contains only canonical detail URLs.

### 0.3 Align Robots, Metadata, Sitemap, And IndexNow

Problem:

`robots.ts` disallows `/login`, `/signup`, `/search`, and `/dashboard`, but route metadata may still mark some as indexable. `src/lib/indexnow.ts` also submits URLs that should not be submitted, including `/search`, `/login`, `/signup`, and possibly non-existent `/pricing` and `/how-it-works`.

Implement:

- In `src/app/login/layout.tsx`, set `robots: { index: false, follow: false }`.
- In `src/app/signup/layout.tsx`, set `robots: { index: false, follow: false }`.
- In `src/app/search/layout.tsx`, set `robots: { index: false, follow: true }`.
- Remove duplicate manual `head.tsx` SEO tags where Metadata API already exists.
- Update `src/lib/indexnow.ts` to submit only canonical public URLs.
- Update `src/app/sitemap.ts` to exclude all noindex variants, not just `noindex_follow`.

Canonical public URLs to submit:

- `/`
- `/about`
- `/blog`
- `/blog/[slug]` only when published and indexable
- `/category/[slug]` only when active and useful
- `/downloads` only if inventory exists
- `/downloads/[uuid]` only if public and indexable
- `/faq`
- `/contact`
- `/privacy`
- `/terms`

Do not submit:

- `/api/*`
- `/dashboard/*`
- `/login`
- `/signup`
- `/search`
- duplicate `/signals/[uuid]` if downloads are canonical
- empty collection pages
- noindex pages
- non-existent routes

Acceptance check:

- `sitemap.xml`, page metadata, robots.txt, and IndexNow agree.
- No noindex URLs appear in sitemap.
- No private/auth/search URLs appear in IndexNow default submission list.

### 0.4 Fix Missing Logo In Schema

Problem:

`generateOrganizationSchema()` and related schema helpers reference `/logo.png`, but `public/logo.png` does not exist.

Implement one:

- Add a real `public/logo.png`.
- Or change schema logo references to `favicon.png` only if that is the real brand asset.

Recommended:

- Add `public/logo.png` at 512x512 or larger.
- Keep favicon separate from brand logo.

Acceptance check:

- `https://forexfactory.cc/logo.png` returns 200.
- Structured data validators can fetch the image.

## Phase 1: Project-Specific SEO Foundation

Forecast: 2-4 developer days
Priority: Critical
Goal: make the SEO system deterministic, truthful, and maintainable.

### 1.1 Create One SEO Source Of Truth

Current issue:

SEO is split across:

- `src/lib/seo.ts`
- route-level `metadata`
- `generateMetadata`
- manual `head.tsx`
- DB `seo_meta`
- old SEO audit docs
- `llms.txt`
- `ai.txt`

Implement:

- Keep reusable SEO constants and schema builders in `src/lib/seo.ts`.
- Keep route-specific Metadata API in each route.
- Remove manual `head.tsx` files when route metadata already exists.
- Treat DB `SeoMeta` as the override source only for blog detail pages.
- Update old docs to point to this plan.

Files to review:

- `src/lib/seo.ts`
- `src/app/contact/head.tsx`
- `src/app/faq/head.tsx`
- `src/app/search/head.tsx`
- `src/app/contact/layout.tsx`
- `src/app/faq/layout.tsx`
- `src/app/search/layout.tsx`

Acceptance check:

- Each route has exactly one clear metadata source.
- No duplicate title, canonical, robots, or OG tags from mixed systems.

### 1.2 Deduplicate SEO Meta Rows

Problem:

`SeoMeta.postId` is not unique. Blog pages read `blog.seoMeta[0]`, which is unpredictable if a post has multiple meta rows.

Implement:

- Write a dry-run script to find duplicate `seo_meta` rows by `postId`.
- Decide newest row wins unless a row has stronger fields.
- Archive or delete duplicates.
- Add a unique constraint on `SeoMeta.postId` after cleanup.

Suggested script:

- `scripts/audit-seo-meta-duplicates.ts`
- `scripts/fix-seo-meta-duplicates.ts`

Acceptance check:

- Every blog has 0 or 1 SEO meta row.
- `generateMetadata()` no longer depends on arbitrary array ordering.

### 1.3 Truth Audit All Homepage And Marketing Claims

Problem:

The site claims numbers and verification signals that must be true and provable.

Claims to verify:

- 500+ Expert Advisors
- 1M+ downloads
- 50,000+ traders
- verified backtests
- Myfxbook verification
- 92% success rate
- daily updates

Implement:

- If a claim is backed by DB or public proof, show it with the source.
- If not backed, rewrite it to a softer true claim.

Examples:

- Replace "500+ verified Expert Advisors" with "A growing library of MT4/MT5 expert advisor reviews and downloads."
- Replace "1M+ downloads" with real count from `downloadCount` if available.
- Replace "verified Myfxbook" only when each page has an actual Myfxbook URL or evidence.

Files to review:

- `src/app/page.tsx`
- `src/app/downloads/page.tsx`
- `src/app/signals/page.tsx`
- `public/llms.txt`
- `public/ai.txt`
- `src/lib/seo.ts`

Acceptance check:

- Every number or verification claim is either backed by data or removed.

## Phase 2: Programmatic SEO Cleanup

Forecast: 5-10 developer/content days
Priority: Critical
Goal: reduce scaled-content risk and raise quality of indexed pages.

### 2.1 Audit Existing Blog Inventory

Create a script that exports:

- total published posts
- posts with empty tags
- duplicate title groups
- near-duplicate intro groups
- posts under 600 words
- posts without images
- posts without download links
- posts without risk warning
- posts without FAQ-style headings
- posts without tables
- posts with no internal links
- posts with duplicate SEO meta rows
- posts with low-quality descriptions

Suggested file:

- `scripts/audit-content-quality.ts`

Output:

- `reports/content-quality-audit.csv`
- `reports/content-quality-summary.md`

Acceptance check:

- You can sort all published posts by quality risk.

### 2.2 Define Indexing Rules For Existing Posts

Do not index every page just because it exists.

Recommended indexing rules:

Index only if:

- unique title
- unique intro
- at least 800-1,200 useful words for review/guides
- visible risk warning
- visible author
- date published and date updated
- direct answer summary
- specs/evidence table when it is a tool review
- at least 3 relevant internal links
- no fake rating/review data
- useful meta title and description

Noindex until improved if:

- duplicate title
- duplicate intro
- thin content
- no evidence
- no tags/category
- purely scraped/vendor text
- no original analysis
- unsafe claims

Merge if:

- two posts target the same EA/tool/version
- one page is a duplicate or near duplicate
- two pages differ only by keyword wording

Acceptance check:

- Weak pages are noindexed, merged, or improved before being submitted.

### 2.3 Add A Pre-Publish Quality Gate

Before new posts go live, require:

- primary keyword
- unique title
- short answer block
- visible author
- reviewed date
- risk warning
- evidence/methodology section
- minimum internal links
- category
- tags
- meta title under 60 characters where possible
- meta description under 155-160 characters where possible
- canonical URL
- image alt text

Suggested implementation:

- Add validation logic to the admin/super-admin publishing flow.
- Add a DB or script-level quality score.
- Prevent publish if critical fields are missing.

Files to review:

- `src/app/api/super-admin/inject/route.ts`
- `prisma/schema.prisma`
- existing SEO automation scripts in `scripts/`

Acceptance check:

- New programmatic content cannot publish unless it clears minimum quality rules.

## Phase 3: Content Architecture For #1 Ranking Attempts

Forecast: 2-4 weeks for initial build, then ongoing
Priority: High
Goal: build topical authority instead of thousands of isolated pages.

## 3.1 Canonical Topic Hubs

Create or improve hubs around real user intent:

1. MT4 Expert Advisors
2. MT5 Expert Advisors
3. Forex Robots
4. Forex Indicators
5. Source Code MQ4
6. Source Code MQ5
7. Prop Firm EAs
8. Gold/XAUUSD EAs
9. Scalping EAs
10. Grid/Martingale EAs
11. Copy Trading Tools
12. Beginner Forex Automation Guides

Each hub page must include:

- one clear H1
- definition
- who this category is for
- best/featured tools table
- risks
- comparison criteria
- internal links to child pages
- FAQs
- last updated date
- editorial note

Suggested routes:

- `/category/mt4-expert-advisors`
- `/category/mt5-expert-advisors`
- `/category/forex-indicators`
- or dedicated routes like `/forex-robots/mt4-expert-advisors`

Recommended first move:

- Use existing `/category/[slug]` route, but enrich category descriptions and add hub content blocks.

### 3.2 Page Clusters

Each hub should link down to support pages and reviews.

Example cluster: MT4 Expert Advisors

- Hub: `/category/mt4-expert-advisors`
- Support guide: "What is an MT4 Expert Advisor?"
- Support guide: "How to install an EA in MT4"
- Support guide: "How to backtest an EA in MT4"
- Support guide: "MT4 EA risk settings explained"
- Review pages: individual EA pages
- Comparison page: "Best free MT4 EAs for beginners"

Example cluster: Prop Firm EAs

- Hub: `/category/prop-firm-eas`
- Guide: "What makes an EA prop-firm friendly?"
- Guide: "Daily drawdown vs max drawdown"
- Guide: "Why grid/martingale EAs can fail prop challenges"
- Reviews: prop firm EA pages

Acceptance check:

- Every important page has parent, sibling, and child internal links.
- Hubs are not just card grids; they contain expert explanation.

## Phase 4: Review Page Template For SEO/AEO/GEO

Forecast: 5-7 developer days for template, 2-8 weeks for content backfill
Priority: High
Goal: make review pages useful, citable, and trustworthy.

### 4.1 Required Page Sections

Every EA/indicator review page should include:

1. Direct answer summary
2. Key facts table
3. What this tool does
4. Who it is for
5. Who should avoid it
6. Strategy logic
7. Backtest or evidence section
8. Risk profile
9. Installation steps
10. Settings explanation
11. Pros and cons
12. Alternatives
13. FAQs
14. Author/testing note
15. Risk disclaimer
16. Related tools and guides

### 4.2 Direct Answer Summary

Add near the top of the page.

Template:

```md
## Quick Answer

[Tool Name] is a [MT4/MT5] [EA/indicator] designed for [strategy/use case]. It may suit traders who want [benefit], but it should be demo-tested first because [main risk]. ForexFactory.cc does not guarantee profitability, and past backtest performance does not guarantee future live results.
```

Target:

- 40-70 words
- plain language
- no hype
- includes risk
- directly answers "is this tool worth using?"

### 4.3 Specs Table

Template:

```md
| Field | Details |
|---|---|
| Platform | MT4 / MT5 |
| File type | EX4 / EX5 / MQ4 / MQ5 |
| Strategy | Scalping / Grid / Trend / Breakout / News |
| Markets | EUR/USD, GBP/USD, XAU/USD, etc. |
| Timeframes | M5, M15, H1, etc. |
| Risk style | Low / medium / high |
| Version | 1.0 |
| Last reviewed | YYYY-MM-DD |
| Download type | Free |
```

Why:

- Helps human users compare.
- Helps AI systems extract facts.
- Helps search engines understand the page.

### 4.4 Evidence And Testing Section

Template:

```md
## Testing And Evidence

We reviewed this tool using the information available on the page and any attached files or performance references. Before using it live, test it on a demo account with your broker's spread, commission, leverage, and execution conditions.

Evidence available:

- Backtest file: Yes/No
- Myfxbook or third-party verification: Yes/No
- Source code available: Yes/No
- Last reviewed by: [Author]
- Review date: YYYY-MM-DD
```

Do not claim "verified" unless proof is visible.

### 4.5 Risk Block

Required on all trading pages.

Template:

```md
## Risk Warning

Forex and CFD trading involve significant risk. Expert Advisors can lose money quickly during high volatility, spread widening, low liquidity, broker execution delays, or incorrect settings. Always test on demo first and never risk money you cannot afford to lose.
```

### 4.6 FAQ Block

Add visible FAQs to important pages.

Example:

```md
## FAQs

### Is [Tool Name] safe for live trading?
No EA is automatically safe for live trading. Test it on demo first and compare results with your broker's spread, commission, and execution speed.

### Does [Tool Name] work on MT4 or MT5?
[Answer based on actual file/platform.]

### Is [Tool Name] free?
[Answer based on actual download model.]

### What risk settings should I use?
Start with conservative lot sizing and demo-test drawdown before live use.

### Can this EA pass a prop firm challenge?
Only if its strategy respects the prop firm's drawdown, news, lot size, and consistency rules. Do not assume compatibility without testing.
```

Note:

FAQ rich results are no longer a broad Google ranking/display win. Use FAQs because they help users and answer extraction, not because they guarantee rich results.

## Phase 5: Structured Data Refactor

Forecast: 3-6 developer days
Priority: High
Goal: make schema accurate, current, and compliant.

### 5.1 Schema Rules

Use schema only when it matches visible content.

Do:

- `Organization` on homepage/global
- `WebSite` with `SearchAction`
- `Article` or `BlogPosting` for blog posts
- `BreadcrumbList` where breadcrumbs are visible
- `CollectionPage` + `ItemList` for real collection pages
- `SoftwareApplication` for real downloadable software pages
- `Product` or `Review` only when visible product/review content exists
- `Person` and `ProfilePage` for real authors

Do not:

- invent ratings
- estimate reviews from downloads
- mark hidden content
- mark pages as products if the page is really only an article
- use `HowTo` expecting Google how-to rich results
- treat FAQ schema as a ranking shortcut

### 5.2 Remove Fabricated Ratings

Problem:

`src/app/signals/[uuid]/page.tsx` defaults rating to `5` and estimates review count from downloads.

Implement:

- Remove default rating.
- Only output `aggregateRating` when there are real visible reviews/ratings.
- If no real rating exists, omit rating schema completely.

Acceptance check:

- Structured data matches visible page content.

### 5.3 Add BreadcrumbList JSON-LD

Blog detail pages show breadcrumbs visually but do not emit breadcrumb schema.

Implement:

- Use existing `generateBreadcrumbSchema()` in `src/lib/seo.ts`.
- Add it to blog detail, category pages, download pages, and important static pages.

Example for blog:

- Home
- Blog
- Category
- Article title

Acceptance check:

- Rich Results Test detects BreadcrumbList where applicable.

### 5.4 Improve Article Schema

Add where supported:

- `headline`
- `description`
- `image`
- `datePublished`
- `dateModified`
- `author`
- `publisher`
- `mainEntityOfPage`
- `articleSection`
- `keywords`

Add author `@id` once author pages exist.

### 5.5 Add Author Entity Schema

Create author pages:

- `/author/[slug]`

Each author page should include:

- real name
- role
- bio
- trading/technical experience
- editorial responsibility
- links to articles
- disclosure

Schema:

- `ProfilePage`
- `Person`

Acceptance check:

- Every blog author links to a real author page.
- Random author assignment is removed.

## Phase 6: E-E-A-T And Trust Layer

Forecast: 1-2 weeks
Priority: High
Goal: make the site credible for forex/trading content.

### 6.1 Add Required Trust Pages

Create:

- `/editorial-policy`
- `/testing-methodology`
- `/risk-disclosure`
- `/corrections-policy`
- `/about`
- `/contact`

Content required:

- who runs the site
- how content is created
- how EAs are reviewed
- what "verified" means
- how corrections are handled
- affiliate/ad disclosure if applicable
- risk disclosure
- contact method

### 6.2 Stop Random Author Assignment

Problem:

The super-admin injection route can assign author names when missing. For finance-related content, this weakens trust.

Implement:

- Require a real author ID.
- Add `reviewedBy` if a second reviewer checks content.
- Store author records in DB instead of free-text only.

Possible Prisma addition:

```prisma
model Author {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  role        String?
  bio         String
  image       String?
  credentials String?
  sameAs      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Later:

- Link `Blog.authorId` to `Author`.

### 6.3 Add Last Reviewed Date

For trading tool pages, `updatedAt` is not enough. Add visible:

- Published date
- Last updated date
- Last reviewed date
- Reviewed by

Acceptance check:

- Users can tell whether trading information is fresh.

## Phase 7: AEO/GEO Content Layer

Forecast: 2-6 weeks for first 100 pages
Priority: High
Goal: make pages answer-ready and citation-worthy.

### 7.1 What To Optimize For

Optimize for questions users actually ask:

- What is the best free MT4 EA for beginners?
- Is this EA safe?
- Does this EA work with prop firms?
- How do I install an EA in MT4?
- What is the risk of grid EAs?
- Does this indicator repaint?
- Is MQ4 source code included?
- What settings should I test first?

### 7.2 Add Answer Blocks

Every high-value page should include at least one direct answer block.

Rules:

- concise
- self-contained
- factual
- not keyword-stuffed
- includes risk when relevant

### 7.3 Add Comparison Tables

Tables to add:

- best EA by strategy
- MT4 vs MT5 compatibility
- free vs premium
- scalping vs grid vs trend
- prop firm friendly vs not recommended
- source code available vs compiled only

### 7.4 Add Original Evidence

Best ranking moat:

- screenshots from actual settings
- original testing notes
- sample backtest assumptions
- broker/spread caveats
- known failure modes
- update history
- user comments after moderation

Generic descriptions will not be enough for #1 rankings.

### 7.5 Keep `llms.txt` And `ai.txt`, But Fix Them

Current issue:

They contain encoding artifacts and claims that may not be fully backed.

Implement:

- Rewrite both files in clean UTF-8.
- Remove unsupported claims.
- Link to best canonical pages.
- Keep them short and factual.

Important:

- Do not measure success by existence of `llms.txt`.
- Measure success by rankings, indexation, citations, traffic, assisted conversions, and brand mentions.

## Phase 8: Internal Linking Plan

Forecast: 3-7 days
Priority: Medium-high
Goal: make authority flow from hubs to money pages and from articles to hubs.

### 8.1 Navigation

Main nav should expose:

- Forex Robots
- MT4 EAs
- MT5 EAs
- Indicators
- Source Code
- Guides
- Risk/Methodology

Avoid nav clutter. Use dropdowns or grouped links if needed.

### 8.2 Footer

Footer should include:

- About
- Contact
- Editorial Policy
- Testing Methodology
- Risk Disclosure
- Corrections Policy
- Privacy
- Terms
- Sitemap

### 8.3 Related Links

On each review page:

- link to parent category
- link to installation guide
- link to risk guide
- link to similar tools
- link to alternatives

Anchor examples:

- "MT4 expert advisors"
- "how to install an EA in MT4"
- "grid EA risk"
- "prop firm EA rules"

## Phase 9: Performance SEO

Forecast: 3-7 developer days
Priority: Medium-high
Goal: improve crawl efficiency, user experience, and Core Web Vitals.

### 9.1 Remove Unnecessary `force-dynamic`

Current public pages force dynamic rendering:

- `src/app/page.tsx`
- `src/app/blog/page.tsx`
- `src/app/downloads/page.tsx`
- `src/app/signals/page.tsx`

Implement:

- Use ISR/revalidate for public pages where possible.
- Keep dynamic only where user/session-specific content is required.

Recommended:

```ts
export const revalidate = 300;
```

or rely on `unstable_cache` plus route-level caching.

Acceptance check:

- TTFB improves.
- Build does not break.
- Freshness remains acceptable.

### 9.2 Optimize Scripts

Current:

- GTM loads globally after interactive.
- GA loads lazy.

Implement:

- Keep analytics as late as possible.
- Do not load heavy third-party scripts on pages where not needed.
- Check whether GTM and GA are both necessary.

### 9.3 Fix Image And LCP

Implement:

- use real dimensions
- use priority only on true LCP image
- avoid oversized images
- ensure OG image route is committed/tracked
- keep WebP/AVIF support

Acceptance check:

- Run Lighthouse before/after.
- Target mobile LCP under 2.5s for key templates.

## Phase 10: Measurement And Reporting

Forecast: 1-3 days setup, ongoing weekly
Priority: Medium

### 10.1 Required Tools

Set up:

- Google Search Console
- Bing Webmaster Tools
- GA4
- PageSpeed Insights/CrUX
- sitemap monitoring
- IndexNow logs

Optional paid tools:

- Ahrefs or Semrush
- SE Ranking AI visibility
- Profound or similar LLM citation tracker
- DataForSEO

### 10.2 Weekly Dashboard

Track:

- indexed pages
- excluded pages
- sitemap submitted vs indexed
- top queries
- top pages
- CTR by page type
- Core Web Vitals
- rich result/schema errors
- duplicate title count
- noindex count
- pages improved
- AI citation mentions if tool is available

### 10.3 KPIs

Technical KPIs:

- 0 noindex URLs in sitemap
- 0 private/auth/search URLs in IndexNow default list
- 0 schema fabricated rating issues
- 0 missing logo schema errors
- TTFB improved
- LCP improved

Content KPIs:

- top 100 pages have answer block
- top 100 pages have risk warning
- top 100 pages have internal links
- top 100 pages have author/review info
- duplicate titles reduced
- weak pages noindexed or merged

Business KPIs:

- organic clicks
- organic impressions
- CTR
- downloads
- newsletter/signup conversions
- returning users

## Forecasted Work Plan

### Sprint 1: Critical SEO Fixes

Time: 1 week

Work:

- fix robots enum mapping
- align noindex metadata
- clean IndexNow default URLs
- fix sitemap noindex filtering
- choose canonical route for signal/download detail pages
- add/fix logo asset
- remove duplicate manual head tags

Outcome:

- Crawl/index signals become consistent.
- Duplicate URL risk decreases.
- Schema asset errors reduce.

### Sprint 2: Database And Programmatic Cleanup

Time: 1-2 weeks

Work:

- audit duplicate SEO meta rows
- dedupe `seo_meta`
- add unique constraint
- audit duplicate titles/intros
- generate content quality report
- set noindex rules for weak pages

Outcome:

- Programmatic SEO risk decreases.
- Important pages become easier to prioritize.

### Sprint 3: Trust And Schema Refactor

Time: 1-2 weeks

Work:

- remove fabricated aggregate ratings
- add BreadcrumbList
- improve Article schema
- create author model/pages or static author profiles
- create editorial/testing/risk/corrections pages
- remove random author assignment

Outcome:

- Better trust layer.
- Safer structured data.
- Stronger entity signals.

### Sprint 4: Review Template Upgrade

Time: 1-2 weeks

Work:

- add direct answer block
- add specs table
- add testing/evidence section
- add risk block
- add FAQ block
- add related links
- update BlogCard to show real SEO descriptions

Outcome:

- Pages become more useful for users and easier for AI/search systems to cite.

### Sprint 5: Topical Hubs

Time: 2-3 weeks

Work:

- build/enrich MT4 EA hub
- build/enrich MT5 EA hub
- build/enrich Forex Indicators hub
- build/enrich Source Code hub
- build/enrich Prop Firm EA hub
- add hub-to-review internal links

Outcome:

- Stronger topical authority.
- Better crawl paths.
- More competitive category rankings.

### Sprint 6: Top 100 Content Backfill

Time: 3-6 weeks

Work:

- identify top 100 pages by impressions, clicks, downloads, or business value
- add answer blocks
- add tables
- add risk/evidence sections
- rewrite thin intros
- add FAQs
- add internal links
- update meta titles/descriptions

Outcome:

- Highest-value pages become meaningfully stronger.

### Sprint 7: Performance And Monitoring

Time: 1 week

Work:

- remove unnecessary dynamic rendering
- improve TTFB/LCP
- run Lighthouse
- validate sitemap
- validate schema
- build weekly SEO report

Outcome:

- Faster public pages.
- Better crawl and user experience.
- Ongoing measurement loop.

## Parallel Agent Work Plan

Use parallel agents or developers like this:

### Agent 1: Technical SEO

Owns:

- `src/lib/seo.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/lib/indexnow.ts`
- route metadata cleanup

Deliverables:

- consistent robots/indexing logic
- fixed sitemap
- fixed IndexNow list
- fixed canonical route strategy

### Agent 2: Schema And Trust

Owns:

- schema helpers
- blog detail schema
- download/detail schema
- author pages
- editorial/testing/risk pages

Deliverables:

- no fabricated ratings
- BreadcrumbList schema
- improved Article schema
- author/entity schema
- trust pages

### Agent 3: Programmatic Content Quality

Owns:

- audit scripts
- duplicate SEO meta cleanup
- duplicate title/intro report
- noindex candidate list
- quality gates

Deliverables:

- content quality report
- duplicate cleanup plan
- pre-publish rules

### Agent 4: Content And AEO/GEO

Owns:

- review template sections
- hub copy
- FAQ blocks
- answer blocks
- comparison tables
- top 100 page backfill

Deliverables:

- upgraded templates
- hub pages
- answer-ready priority pages

### Agent 5: Performance And QA

Owns:

- caching
- Lighthouse
- Core Web Vitals
- schema validation
- sitemap validation
- build/lint/typecheck monitoring

Deliverables:

- performance report
- validation report
- release checklist

## File-By-File Implementation Checklist

### `src/lib/seo.ts`

- Fix `mapRobotsDirective`.
- Add schema IDs using stable `@id`.
- Replace `/logo.png` only after asset exists.
- Add safer schema builders for:
  - `BlogPosting`
  - `BreadcrumbList`
  - `SoftwareApplication`
  - `Person`
  - `ProfilePage`
- Remove keyword-density thinking from future workflows; it is not the right quality model.

### `src/app/sitemap.ts`

- Exclude all noindex values.
- Exclude duplicate `/signals/[uuid]` if downloads are canonical.
- Use real `lastModified`.
- Avoid empty collection pages if inventory is zero.
- Ensure categories resolve correctly.

### `src/app/robots.ts`

- Keep private and API paths blocked.
- Do not make robots conflict with metadata.
- Consider explicit AI bot rules only if you have a deliberate policy, but do not expect Google ranking benefit from AI-bot-specific rules.

### `src/lib/indexnow.ts`

- Submit only changed URLs.
- Remove non-existent and noindex URLs.
- Add logging for status and errors.
- Use sitemap for full inventory and IndexNow for recent changes.

### `src/app/blog/[slug]/page.tsx`

- Use fixed robots mapping.
- Add BreadcrumbList JSON-LD.
- Add direct answer block area.
- Add specs table when the post is a tool review.
- Add risk warning.
- Add FAQ block.
- Add stronger author card linked to author profile.
- Add related internal links by topic, not just same category.

### `src/components/blog/BlogCard.tsx`

- Replace generic excerpt:
  - current: "Click to read this article about trading strategies and insights."
- Use real `seoDescription` or sanitized content excerpt.

### `src/app/downloads/page.tsx`

- If inventory is empty, noindex or rewrite claims.
- If inventory exists, make it a real marketplace hub with filters, unique intro text, and ItemList schema.

### `src/app/downloads/[uuid]/page.tsx`

- Keep as canonical only if it has real product content.
- Remove invented reviews/ratings.
- Add visible risk and testing sections.
- Add BreadcrumbList.

### `src/app/signals/page.tsx`

- If no real signal inventory exists, noindex.
- If signals become real, separate signal intent from downloadable EA intent.

### `src/app/signals/[uuid]/page.tsx`

- Redirect or noindex if duplicate of downloads.
- Remove fake rating defaults.

### `src/app/api/super-admin/inject/route.ts`

- Stop random author assignment.
- Add content quality validation.
- Require category, tags, summary, risk warning, author, and canonical SEO record.

### `public/llms.txt`

- Rewrite in clean UTF-8.
- Remove unsupported claims.
- Add canonical high-value URLs.
- Keep it factual.

### `public/ai.txt`

- Rewrite in clean UTF-8.
- Keep crawler preferences factual.
- Remove unverifiable claims.

## First 30 Days Plan

Week 1:

- Fix crawl/index conflicts.
- Fix robots enum mapping.
- Fix sitemap and IndexNow.
- Resolve duplicate `/signals` vs `/downloads`.
- Add logo asset.

Week 2:

- Deduplicate SEO meta rows.
- Audit content quality.
- Noindex obvious weak/duplicate pages.
- Remove fake ratings.
- Add BreadcrumbList.

Week 3:

- Build author/trust pages.
- Stop random authors.
- Add improved review template sections.
- Update BlogCard snippets.

Week 4:

- Upgrade top 25 pages.
- Build first 2 hubs.
- Improve caching/performance.
- Validate schema, sitemap, and build.

## First 90 Days Plan

Days 1-30:

- technical cleanup
- trust foundation
- schema safety
- top 25 content upgrades

Days 31-60:

- top 100 page backfill
- 5 major hubs
- noindex/merge duplicate programmatic pages
- author/entity expansion

Days 61-90:

- publish supporting guides
- improve comparison pages
- add original testing evidence
- monitor GSC and Bing
- revise based on queries and CTR

## Definition Of Done

This plan is done when:

- Sitemap contains only canonical indexable URLs.
- Robots, metadata, sitemap, and IndexNow agree.
- No fabricated rating/review schema exists.
- Logo schema points to a real crawlable image.
- Blog SEO meta is one record per post.
- Weak programmatic pages are improved, merged, or noindexed.
- Top 100 priority pages have answer blocks, risk blocks, internal links, author trust, and useful metadata.
- Core hubs exist and link to supporting pages.
- Trust pages exist and are linked sitewide.
- Public templates pass schema validation.
- TypeScript passes.
- Build passes.
- SEO reporting is weekly, not one-time.

## Final Ranking Strategy

To compete for #1, ForexFactory.cc should not try to win by "AEO/GEO hacks."

Win by becoming the most useful result:

- real tool information
- transparent risk warnings
- actual testing notes
- strong comparison tables
- author accountability
- clear category hubs
- clean canonical/indexing signals
- fast pages
- accurate schema
- consistent updates

That is the practical path to SEO, AEO, and GEO visibility.
