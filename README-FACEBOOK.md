# Personal Facebook Feed Reader

This is a personal-only Facebook feed reader built into FocusTube. It scrapes public Facebook Pages with Playwright, stores posts in Firebase, and displays them in the `/facebook` tab.

## Architecture

```text
data/facebook-pages.json
        ↓
Playwright scraper (hourly GitHub Action)
        ↓
Firebase Firestore (facebook_posts) + Storage (images)
        ↓
Next.js Facebook feed UI (/facebook)
```

## Install

```bash
npm install
npx playwright install chromium
```

Copy environment variables:

```bash
cp .env.example .env.local
```

Fill in Firebase client values (`NEXT_PUBLIC_FIREBASE_*`) for the app UI, and scraper-only values for local scraping.

## Configure Playwright

The scraper uses headless Chromium via Playwright.

Local install:

```bash
npx playwright install chromium
```

Run the scraper:

```bash
npm run scrape:facebook
```

### Optional: Facebook login cookies

Facebook often blocks anonymous scraping. For better results, export a Playwright storage state JSON from a logged-in browser session and set:

```bash
FACEBOOK_COOKIES_JSON='{"cookies":[...],"origins":[]}'
```

In GitHub Actions, store the same JSON in the `FACEBOOK_COOKIES_JSON` secret.

## Add Facebook Pages

Edit `data/facebook-pages.json`:

```json
[
  {
    "pageId": "BBCNews",
    "pageName": "BBC News",
    "url": "https://www.facebook.com/BBCNews"
  }
]
```

- `pageId`: slug used in URLs and Firestore
- `pageName`: display name in the UI
- `url`: full public Facebook Page URL

## Configure GitHub Secrets

In your GitHub repository, add these secrets:

| Secret | Description |
|--------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full Firebase service account JSON (single line) |
| `FIREBASE_STORAGE_BUCKET` | e.g. `your-project.appspot.com` |
| `FACEBOOK_COOKIES_JSON` | Optional Playwright storage state for authenticated scraping |

Never commit service account credentials. The Admin SDK is only used in `scripts/facebook-scraper/`.

## Run Locally

1. Configure `.env.local` with Firebase client + scraper env vars
2. Publish Firestore rules from `firestore.rules`
3. Run scraper: `npm run scrape:facebook`
4. Start app: `npm run dev`
5. Open [http://localhost:3000/facebook](http://localhost:3000/facebook)

## GitHub Actions

Workflow file: `.github/workflows/facebook-scraper.yml`

- Runs every hour (`0 * * * *`)
- Supports manual runs via **Actions → Facebook Scraper → Run workflow**

Each run:

1. Installs dependencies and Playwright Chromium
2. Reads pages from `data/facebook-pages.json`
3. Scrapes latest posts per page
4. Skips duplicates by `postId`
5. Uploads images to Firebase Storage when possible
6. Saves new posts to Firestore
7. Continues if one page fails and logs errors

## Firestore Structure

Collection: `facebook_posts`

Document ID: `postId` (unique per Facebook post)

```json
{
  "pageId": "BBCNews",
  "pageName": "BBC News",
  "postId": "1234567890",
  "postUrl": "https://www.facebook.com/BBCNews/posts/...",
  "caption": "Post text",
  "imageUrl": "https://storage.googleapis.com/...",
  "createdTime": "2026-07-09T10:00:00.000Z",
  "scrapedAt": "2026-07-09T10:05:00.000Z",
  "source": "facebook"
}
```

### Security rules

- Client: read-only access to `facebook_posts`
- Scraper: writes via Firebase Admin SDK (bypasses rules)
- Admin credentials stay in GitHub Secrets / local `.env.local` only

## UI

The reusable `FacebookFeed` component provides:

- Infinite scroll (20 posts per page)
- Dark mode compatible styling
- Responsive layout
- Image preview, caption, published date
- Open original post button
- Loading skeleton, error state, empty state
- Newest posts first

Bottom navigation includes a **Facebook** tab at `/facebook`.

## Troubleshooting

- **No posts scraped**: Facebook may require cookies. Set `FACEBOOK_COOKIES_JSON`.
- **Images missing**: Some posts are text-only; others may block hotlinking before upload.
- **Firebase read errors**: Ensure `NEXT_PUBLIC_FIREBASE_*` is configured and rules are published.
- **Duplicate posts**: Prevented automatically using `postId` as the Firestore document ID.
