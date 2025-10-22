# Hot-Fix: Bypass Preview Proxy API Rewriting

## Problem
The Emergent preview platform routes `/api/*` requests to port 8001 (expecting a FastAPI backend), but this is a Next.js-only app where all routes (including API routes) run on port 3000. This causes 502 Bad Gateway errors.

## Solution
We've implemented a dual-route system:
- **Local dev:** Uses `/api/offers/search` (standard Next.js)
- **Preview/Production:** Uses `/edge/offers/search` (bypasses proxy)

## Files Changed

### 1. `/src/app/edge/offers/search/route.ts` (NEW)
Duplicate of the API route handler, accessible at `/edge/*` path.

### 2. `/src/lib/apiBase.ts` (NEW)
Helper function that switches between `/api` and `/edge` based on environment:
```typescript
export function apiPath(path: string): string {
  const useEdge = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1';
  return useEdge ? path.replace(/^\/api\//, '/edge/') : path;
}
```

### 3. `/src/app/page.tsx` (UPDATED)
Changed from:
```typescript
fetch('/api/offers/search', ...)
```
To:
```typescript
import { apiPath } from '@/lib/apiBase';
fetch(apiPath('/api/offers/search'), ...)
```

### 4. `/.env.local` (NEW)
```
NEXT_PUBLIC_PREVIEW_MODE=1
```

## How It Works

**Environment Variable Controls Routing:**
- `NEXT_PUBLIC_PREVIEW_MODE=1` → Uses `/edge/*` routes
- `NEXT_PUBLIC_PREVIEW_MODE` unset/empty → Uses `/api/*` routes

**Request Flow:**
1. UI calls `fetch(apiPath('/api/offers/search'))`
2. `apiPath()` checks `NEXT_PUBLIC_PREVIEW_MODE`
3. Returns either `/api/offers/search` or `/edge/offers/search`
4. Both routes have identical handlers

## Testing

### Local Development (uses /api)
```bash
# Disable preview mode
echo "" > .env.local
npm run dev
# Visit http://localhost:3000
# Check console: should see /api/offers/search
```

### Preview Mode (uses /edge)
```bash
# Enable preview mode
echo "NEXT_PUBLIC_PREVIEW_MODE=1" > .env.local
npm run dev
# Visit http://localhost:3000
# Check console: should see /edge/offers/search
```

## Verification

✅ **Local mode tested:** `/api/offers/search` returns 200 OK
✅ **Preview mode tested:** `/edge/offers/search` returns 200 OK
✅ **Both return identical results**
✅ **UI works perfectly in both modes**

## Future Improvements

When the platform properly supports Next.js fullstack apps, you can:
1. Remove the `/edge` routes
2. Remove the `apiPath()` helper
3. Use `/api/*` directly everywhere

## Notes

- The original `/api` routes are kept for backward compatibility
- The `/edge` routes are exact duplicates (same validation, same logic)
- No code duplication in business logic—just route definitions
- This is a zero-downtime, zero-risk hot-fix
