# IndexNow Integration Guide

This project implements the IndexNow protocol to automatically notify search engines (Bing, Yandex, etc.) about content updates.

## Quick Start

1.  **Key Verification**:
    The file `public/32e226b0675237f87f5e2d08a8009c6c.txt` verifies ownership of the domain. Do not delete this file.

2.  **Environment Variables**:
    Ensure the following are set in your `.env`:
    ```env
    INDEXNOW_KEY="32e226b0675237f87f5e2d08a8009c6c"
    INDEXNOW_HOST="https://forexfactory.cc"
    API_SECRET_KEY="your-secure-key"
    CRON_SECRET="your-cron-secret"
    ```

## API Endpoints

### 1. Manual Submission
Submit a single URL when content is updated.

-   **URL**: `/api/indexnow/submit`
-   **Method**: `POST`
-   **Headers**:
    -   `Content-Type: application/json`
    -   `x-api-key: [API_SECRET_KEY]`
-   **Body**:
    ```json
    {
      "url": "https://forexfactory.cc/blog/new-post"
    }
    ```

### 2. Bulk Sync (Cron Job)
Sync all sitemap URLs. Recommended to run daily via cron.

-   **URL**: `/api/indexnow/sync`
-   **Method**: `POST`
-   **Headers**:
    -   `x-cron-secret: [CRON_SECRET]`

## Integration Tips

-   **Vercel Cron**: You can configure a `vercel.json` to call `/api/indexnow/sync` automatically.
-   **CMS Hooks**: Trigger `/api/indexnow/submit` from your CMS whenever a post is published.
