# Travel Orchestrator

A modern travel booking platform that aggregates flights, hotels, and activities from multiple providers.

## Features

- 🛫 **Real-time Flight Search** - Powered by Amadeus API
- 🏨 **Hotel Integration** - Booking.com affiliate deeplinks
- 🎯 **Activities & Tours** - Viator partner integration
- 🔍 **Smart Search** - City/airport autocomplete with 70+ destinations
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 💰 **Monetization Ready** - Affiliate tracking for all bookings

## Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **APIs:** Amadeus, Booking.com, Viator

## Environment Variables

### Required (Server-side only)

These variables are **required** for the app to function. Add them to `.env.local`:

```env
# Amadeus API Credentials (Required)
# Get your keys from: https://developers.amadeus.com
AMADEUS_API_KEY=your_amadeus_client_id
AMADEUS_API_SECRET=your_amadeus_client_secret
AMADEUS_HOST=https://test.api.amadeus.com
```

### Optional (Server-side)

```env
# Viator API Key (Optional - uses mock data if not provided)
# Get your key from: https://www.viator.com/partner-api
VIATOR_API_KEY=your_viator_api_key
```

### Optional (Client-side)

These variables are prefixed with `NEXT_PUBLIC_` and are safe for client-side use:

```env
# Booking.com Affiliate ID (Optional - defaults to demo ID)
# Sign up at: https://partner.booking.com
NEXT_PUBLIC_BOOKING_AID=your_booking_affiliate_id

# Preview Mode (For Emergent platform deployment)
# Set to '1' to use /edge/* routes instead of /api/*
NEXT_PUBLIC_PREVIEW_MODE=1
```

## Getting Started

### 1. Clone and Install

```bash
npm install
# or
yarn install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API credentials:

```env
# Required - Get from https://developers.amadeus.com
AMADEUS_API_KEY=zNswPAhnek7wGKJWGFOKseE8mOM6kRHS
AMADEUS_API_SECRET=BNKrPStwLtNywXj7
AMADEUS_HOST=https://test.api.amadeus.com

# Optional - Mock data used if not provided
VIATOR_API_KEY=8e597c56-c615-4686-b56b-8dfc744ddefc

# Optional - Defaults to demo ID
NEXT_PUBLIC_BOOKING_AID=1234567

# For Emergent preview deployment
NEXT_PUBLIC_PREVIEW_MODE=1
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Validation

The app includes robust environment variable guards:

- **Server-side secrets** (AMADEUS_*, VIATOR_*) are never bundled in client code
- **Clear error messages** if required variables are missing
- **Automatic validation** on server startup
- **Graceful fallbacks** for optional variables

If required environment variables are missing, you'll see clear errors in the console:

```
❌ Environment validation failed:
  - Missing required environment variable: AMADEUS_API_KEY
    Description: Amadeus API Key (Client ID) from https://developers.amadeus.com
    Please add AMADEUS_API_KEY to your .env.local file
```

## Deployment

### Local Development

1. Set environment variables in `.env.local`
2. Run `npm run dev`
3. App uses `/api/*` routes

### Emergent Preview Deployment

1. Set `NEXT_PUBLIC_PREVIEW_MODE=1` in environment
2. Configure all API keys
3. App uses `/edge/*` routes to bypass platform proxy

### Environment Variable Requirements by Environment

**Local Development:**
- ✅ Required: `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`
- ⚠️ Optional: `AMADEUS_HOST` (defaults to test.api.amadeus.com)
- ⚠️ Optional: `VIATOR_API_KEY` (uses mock data if missing)
- ⚠️ Optional: `NEXT_PUBLIC_BOOKING_AID` (defaults to demo ID)

**Preview/Production:**
- ✅ Required: `NEXT_PUBLIC_PREVIEW_MODE=1`
- ✅ Required: `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`
- ✅ Recommended: `AMADEUS_HOST` (set to production URL for live data)
- ⚠️ Optional: `VIATOR_API_KEY`
- ⚠️ Optional: `NEXT_PUBLIC_BOOKING_AID`

## API Integrations

### Amadeus (Flights)

- **Status:** ✅ Working
- **Environment:** Test API
- **Features:** Real-time flight search, 20 results per query
- **Cost:** Free in test environment
- **Docs:** https://developers.amadeus.com

### Booking.com (Hotels)

- **Status:** ✅ Configured
- **Type:** Affiliate deeplinks
- **Features:** Hotel search with commission tracking
- **Sign up:** https://partner.booking.com
- **Commission:** 25-40% per booking

### Viator (Activities)

- **Status:** ⏳ Pending API activation
- **Fallback:** Mock activities for popular destinations
- **Features:** Top-rated tours and activities
- **Sign up:** https://www.viator.com/partner-api

## Project Structure

```
/app
├── src/
│   ├── app/
│   │   ├── api/          # API routes (local dev)
│   │   ├── edge/         # Edge routes (preview)
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main search page
│   ├── components/
│   │   └── AirportAutocomplete.tsx
│   ├── lib/
│   │   ├── airportSearch.ts   # Airport data
│   │   ├── apiBase.ts         # Route helper
│   │   ├── booking.ts         # Booking.com utils
│   │   ├── env.ts             # Environment guards
│   │   └── iataCity.ts        # IATA mappings
│   └── ...
├── .env.local            # Environment variables (git-ignored)
└── README.md
```

## Health Check

A health check endpoint is available at `/health`:

```bash
curl http://localhost:3000/health
# {"ok":true,"ts":1698765432000,"port":3000}
```

## Troubleshooting

### "Missing required environment variable" Error

Make sure you've created `.env.local` with all required variables.

### Flights Not Loading

Check that:
1. `AMADEUS_API_KEY` and `AMADEUS_API_SECRET` are set correctly
2. You're using valid airport codes (3 letters: LAX, JFK, etc.)
3. Dates are in the future

### Activities Not Showing

Activities are optional. If `VIATOR_API_KEY` is not set, mock activities are shown for popular destinations (Cancun, Cabo, Rome).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Amadeus for Developers](https://developers.amadeus.com)
- [Booking.com Partner Program](https://partner.booking.com)
- [Viator Partner API](https://www.viator.com/partner-api)

## License

MIT
