# SEO Optimization Suite Documentation

This project implements a comprehensive SEO strategy covering IndexNow (Instant Indexing), GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization).

## 1. IndexNow (Instant Indexing)
**Goal:** Notify Bing, Yandex, and other engines immediately when content changes.

- **Configuration**:
  - Key File: `public/32e226b0675237f87f5e2d08a8009c6c.txt`
  - Library: `src/lib/indexnow.ts`
- **Usage**:
  - **Manual**: POST to `/api/indexnow/submit` with `x-api-key`.
  - **Bulk Sync**: POST to `/api/indexnow/sync` with `x-cron-secret` (best for Cron jobs).
- **Reference**: See [IndexNow.md](./IndexNow.md) for full API details.

## 2. GEO (Generative Engine Optimization)
**Goal:** Optimize content for AI models (ChatGPT, Claude, Perplexity) to improve visibility in AI-generated answers.

- **Public Context Files**:
  - `public/llms.txt`: Company facts, products, and stats for LLMs.
  - `public/ai.txt`: Directives for AI crawlers on what to prioritize.
- **Crawler Access**:
  - `robots.ts` has been updated to explicitly allow `GPTBot`, `ClaudeBot`, `PerplexityBot`, and others while protecting sensitive admin routes.

## 3. AEO (Voice Search & Answer Engines)
**Goal:** Structure content for voice assistants (Alexa, Siri) and simplified "Answer" boxes (Google SGE).

- **Components**:
  - `<SpeakableSchema />`: Use this in news/blog templates to mark content for voice reading.
  - `<HowToSchema />`: Use this in tutorials/guides to provide structured step-by-step data.
- **Implementation**:
  Import these components from `@/components/seo/` and include them in your pages.

  ```tsx
  // Example:
  import { SpeakableSchema } from '@/components/seo/SpeakableSchema';

  <SpeakableSchema 
    url="https://forexfactory.cc/blog/my-post"
    headline="How to trade Forex"
    cssSelectors={['#summary', '#conclusion']} 
  />
  ```

## 4. Environment Variables
Ensure the following are set in your production environment:

```env
# IndexNow
INDEXNOW_KEY="32e226b0675237f87f5e2d08a8009c6c"
INDEXNOW_HOST="https://forexfactory.cc"

# Security
API_SECRET_KEY="..."
CRON_SECRET="..."
```
