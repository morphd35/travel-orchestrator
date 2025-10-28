# Travel Orchestrator

A comprehensive travel platform with user authentication, automated price monitoring, real-time flight search, and production-ready booking capabilities.

## 🚀 **Key Features**

### **Flight Operations**
- 🛫 **Real-time Flight Search** - Multi-provider integration (Amadeus primary)
- 📊 **Automated Price Monitoring** - Background watch system with email alerts
- 🎫 **Production Booking System** - Complete passenger info collection & confirmation
- 💰 **Smart Price Tracking** - Target-based notifications with flexible date ranges
- 🔄 **Multi-Provider Ready** - Database schema supports Amadeus, Skyscanner, and future APIs

### **User Experience**
- 📱 **Mobile-First Design** - Responsive booking flow and management
- 🔍 **Smart Search** - Airport autocomplete with 70+ destinations
- � **Email Notifications** - Rich HTML alerts with booking deeplinks
- 🎯 **Flexible Monitoring** - Date ranges, stop preferences, passenger counts

### **Technical Architecture**
- 🏗️ **Production Ready** - Complete booking flow from search to confirmation
- 🔒 **Secure & Validated** - Comprehensive input validation and error handling
- ⚡ **High Performance** - Intelligent caching and background processing
- 🔄 **Auto-Scaling** - Background monitoring with configurable intervals

## Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **APIs:** Amadeus, Booking.com, Viator

## Environment Variables

### Required (Server-side only)

```env
# Amadeus API Credentials (Required)
# Get your keys from: https://developers.amadeus.com
AMADEUS_API_KEY=your_amadeus_client_id
AMADEUS_API_SECRET=your_amadeus_client_secret
AMADEUS_HOST=https://test.api.amadeus.com

# Email Configuration (Required for notifications)
# Option 1: SendGrid (Recommended)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender@domain.com

# Option 2: Mailgun (Alternative)
# MAILGUN_API_KEY=your_mailgun_api_key
# MAILGUN_DOMAIN=your_mailgun_domain

# Notification recipient
NOTIFY_TO=notifications@yourdomain.com
```

### Optional (Server-side)

```env
# Multi-Provider Flight APIs
RAPIDAPI_KEY=your_rapidapi_key_here  # For Skyscanner integration
SKYSCANNER_API_KEY=your_rapidapi_key_here  # Alternative naming

# Viator API Key (Optional - uses mock data if not provided)
VIATOR_API_KEY=your_viator_api_key

# Booking Configuration
AMADEUS_BOOKING_ENABLED=true  # Enable direct booking in production

# Background Monitoring
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # For automatic monitoring

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
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
AMADEUS_HOST=https://test.api.amadeus.com

# Optional - Mock data used if not provided
VIATOR_API_KEY=voyagebuddy-21

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

## 🔧 **Core Systems**

### **Price Monitoring & Alerts**

**Automated Watch System:**
- ✅ **Background Processing** - Server-side monitoring every 2 minutes
- ✅ **Smart Notifications** - Target-based and significant drop alerts  
- ✅ **Rich Email Templates** - HTML emails with booking deeplinks
- ✅ **Flexible Scheduling** - Date ranges, stops, cabin preferences

**Watch Management:**
- **Create:** `POST /edge/watch` - Set up price monitoring
- **List:** `GET /edge/watch?userId=anon` - View active watches
- **Trigger:** `POST /edge/watch/{id}/trigger` - Manual price check
- **Sweep:** `POST /edge/watch/run` - Run all active watches

### **Production Booking System**

**Complete Booking Flow:**
- ✅ **4-Step Process** - Passenger info → Contact → Review → Confirmation
- ✅ **Real-time Price Confirmation** - Pre-booking price validation
- ✅ **Passenger Data Collection** - Names, DOB, documents, preferences
- ✅ **Booking Confirmation** - Reference numbers and itinerary details
- ✅ **Smart Fallback** - External booking when direct booking unavailable

**Booking API:**
- **Book Flight:** `POST /api/booking/flight` - Complete booking creation
- **Price Check:** `GET /api/booking/flight?action=price-check` - Current pricing
- **Capabilities:** `GET /api/booking/flight?action=capabilities` - System status

### **Multi-Provider Architecture**

**Database Schema:**
- ✅ **Provider Tracking** - Records which API found each deal
- ✅ **Source Links** - Direct booking URLs for external sites
- ✅ **Future-Ready** - Schema supports Amadeus, Skyscanner, and new providers

**Provider System:**
```typescript
// Watch configuration
{
  provider: "amadeus" | "skyscanner",  // Primary search provider
  lastProvider: string,                // Provider that found last deal
  lastSourceLink: string               // Booking URL for last deal
}
```

## 📊 **API Integrations**

### **Amadeus (Primary Flight Provider)**

- **Status:** ✅ Production Ready
- **Environment:** Test API (Production available)
- **Features:** 
  - Real-time flight search (20 results/query)
  - Price confirmation & booking creation
  - Seat maps and airline data
  - Global airline coverage (400+ airlines)
- **Cost:** Free tier: 100K API calls/month
- **Docs:** https://developers.amadeus.com

### **SendGrid (Email Notifications)**

- **Status:** ✅ Configured & Working
- **Features:**
  - Rich HTML email templates
  - Fare drop notifications with booking links
  - Delivery tracking and analytics
- **Cost:** Free tier: 100 emails/day
- **Sign up:** https://sendgrid.com

### **Booking.com (Hotels)**

- **Status:** ✅ Configured
- **Type:** Affiliate deeplinks
- **Features:** Hotel search with commission tracking
- **Commission:** 25-40% per booking
- **Sign up:** https://partner.booking.com

### **Viator (Activities)**

- **Status:** ⏳ Pending API activation
- **Fallback:** Mock activities for popular destinations
- **Features:** Top-rated tours and activities
- **Sign up:** https://www.viator.com/partner-api

### **Future Providers**

**Skyscanner Integration (Ready):**
- **Status:** 🔄 Database schema ready, implementation pending
- **Features:** Budget airline coverage, multi-city trips
- **Cost:** Various RapidAPI plans available

**Other Providers (Planned):**
- Google Flights API
- Direct airline APIs (AA, Delta, United)
- OTA partnerships (Expedia, Kayak)

## 📋 **Usage Guide**

### **For End Users**

**1. Search Flights:**
- Enter origin/destination airports
- Select travel dates and preferences
- View real-time results with pricing

**2. Set Price Watches:**
- Click "Watch This Route" on any search
- Set target price and flexibility
- Receive automatic email alerts

**3. Book Flights:**
- Click "Book This Flight" from email alerts
- Complete 4-step booking process
- Get confirmation with reference numbers

### **For Developers**

**1. Watch Management:**
```javascript
// Create a new price watch
POST /edge/watch
{
  "origin": "DFW",
  "destination": "LAX", 
  "start": "2025-12-01",
  "end": "2025-12-05",
  "targetUsd": 300,
  "email": "user@example.com"
}

// List user's watches
GET /edge/watch?userId=anon

// Trigger manual price check
POST /edge/watch/{watchId}/trigger
```

**2. Flight Booking:**
```javascript
// Check booking capabilities
GET /api/booking/flight?action=capabilities

// Confirm current price
GET /api/booking/flight?action=price-check&origin=DFW&destination=LAX&departDate=2025-12-01&total=300&carrier=AA

// Create booking
POST /api/booking/flight
{
  "searchParams": { /* flight search params */ },
  "passengers": [ /* passenger details */ ],
  "contactInfo": { /* contact info */ }
}
```

### **For Startups**

**Launch Strategy:**
1. **Phase 1:** Price monitoring and email alerts (✅ Ready)
2. **Phase 2:** External booking integration (✅ Ready) 
3. **Phase 3:** Direct booking with payment (🔄 Requires production Amadeus)
4. **Phase 4:** Multi-provider integration (🔄 Schema ready)

**Revenue Streams:**
- Booking commissions (when direct booking enabled)
- Affiliate partnerships (Booking.com configured)
- Premium monitoring features
- API access for other developers

## 🏗️ **Project Structure**

```
travel-orchestrator/
├── src/
│   ├── app/
│   │   ├── api/booking/flight/     # Booking API endpoints
│   │   ├── edge/watch/             # Watch management endpoints
│   │   ├── book/                   # Booking confirmation page
│   │   ├── watches/                # Watch management UI
│   │   ├── layout.tsx              # Root layout with navigation
│   │   └── page.tsx                # Main search interface
│   ├── components/
│   │   ├── AirportAutocomplete.tsx # Smart airport search
│   │   ├── BookingForm.tsx         # 4-step booking process
│   │   ├── Navigation.tsx          # Site navigation
│   │   └── PriceWatchModal.tsx     # Watch creation modal
│   ├── lib/
│   │   ├── amadeusClient.ts        # Core Amadeus integration
│   │   ├── amadeusBooking.ts       # Booking API client
│   │   ├── backgroundMonitor.ts    # Automatic watch monitoring
│   │   ├── database.ts             # SQLite database setup
│   │   ├── watchStore.ts           # Watch CRUD operations
│   │   ├── notifier.ts             # Email notification system
│   │   ├── unifiedFlightClient.ts  # Multi-provider architecture
│   │   └── templates/
│   │       └── notifyFareDrop.ts   # HTML email templates
│   └── middleware.ts               # Request routing & auth
├── data/
│   └── watches.db                  # SQLite database (auto-created)
├── scripts/
│   └── cron-sweep.ts               # Automated monitoring script
├── public/                         # Static assets
├── .env.local                      # Environment configuration
└── README.md                       # This file
```

## Health Check

A health check endpoint is available at `/health`:

```bash
curl http://localhost:3000/health
# {"ok":true,"ts":1698765432000,"port":3000}
```

## 🚀 **Deployment Guide**

### **Development Setup**

```bash
# 1. Clone and install
git clone https://github.com/yourusername/travel-orchestrator
cd travel-orchestrator
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API keys

# 3. Start development
npm run dev
# Open http://localhost:3000
```

### **Production Deployment**

**Environment Requirements:**
```env
# Required - Flight Search & Booking
AMADEUS_API_KEY=your_production_api_key
AMADEUS_API_SECRET=your_production_secret
AMADEUS_HOST=https://api.amadeus.com  # Production endpoint

# Required - Email Notifications
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
NOTIFY_TO=alerts@yourdomain.com

# Required - Base URL for monitoring
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Optional - Enable direct booking
AMADEUS_BOOKING_ENABLED=true

# Optional - Multi-provider
RAPIDAPI_KEY=your_rapidapi_key
```

**Build & Deploy:**
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Or deploy to Vercel/Netlify/etc.
```

### **Monitoring Setup**

**1. Cron Jobs:**
```bash
# Add to crontab for automated monitoring
0 9,16 * * * cd /path/to/app && node scripts/cron-sweep.js
```

**2. Health Monitoring:**
```bash
# Check system health
curl https://yourdomain.com/health

# Monitor watch processing
curl -X POST https://yourdomain.com/edge/watch/run
```

**3. Email Deliverability:**
- Verify sender domain in SendGrid
- Configure SPF/DKIM records
- Monitor bounce rates

## 🔧 **Troubleshooting**

### **Common Issues**

**"Missing required environment variable"**
- ✅ Create `.env.local` with all required variables
- ✅ Restart development server after changes
- ✅ Check environment validation at startup

**"Flights not loading"**
- ✅ Verify `AMADEUS_API_KEY` and `AMADEUS_API_SECRET`
- ✅ Use valid 3-letter airport codes (LAX, JFK, DFW)
- ✅ Ensure departure dates are in the future
- ✅ Check Amadeus API quota limits

**"Watch notifications not working"**
- ✅ Configure `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`
- ✅ Verify sender email in SendGrid dashboard
- ✅ Check spam folder for test emails
- ✅ Ensure `NOTIFY_TO` is set for notifications

**"Booking form not appearing"**
- ✅ Set `AMADEUS_BOOKING_ENABLED=true` in production
- ✅ Verify booking API capabilities endpoint
- ✅ Check browser console for JavaScript errors

**"Database errors"**
- ✅ Ensure `data/` directory has write permissions
- ✅ Check SQLite database file creation
- ✅ Verify database migrations ran successfully

### **API Limits & Costs**

**Amadeus (Free Tier):**
- ✅ 100,000 API calls/month
- ⚠️ Rate limit: 10 calls/second
- 💰 Production: Contact for pricing

**SendGrid (Free Tier):**
- ✅ 100 emails/day
- ✅ 40,000 emails first 30 days
- 💰 Pro: $19.95/month for 100K emails

**Performance Optimization:**
- ✅ Implement caching (10-minute TTL included)
- ✅ Rate limiting protection built-in  
- ✅ Background processing for watches
- ✅ Efficient database queries with indexing

### **Support & Development**

**Getting Help:**
- 📖 Check documentation and error messages
- 🐛 Search GitHub issues
- 💬 Create detailed bug reports with:
  - Environment details
  - Error messages
  - Steps to reproduce
  - Expected vs actual behavior

**Contributing:**
- 🔀 Fork repository and create feature branch
- ✅ Add tests for new functionality
- 📝 Update documentation for changes
- 🔍 Follow existing code style and patterns

## 🤖 **Automated Monitoring System**

### **Background Processing**

The system runs continuous background monitoring:

- ✅ **Server-Side Automation** - Automatic watch triggers every 2 minutes
- ✅ **No Manual Intervention** - Watches run automatically when created
- ✅ **Smart Notifications** - Only sends alerts for significant price drops
- ✅ **Rate Limiting Protection** - Handles API limits gracefully

### **Watch Sweep System**

**Manual Sweep Endpoint:**
```bash
POST /edge/watch/run  # Runs all active price watches
```

**Response Format:**
```json
{
  "success": true,
  "summary": {
    "total": 5,
    "notified": 2, 
    "noop": 3,
    "errors": 0
  },
  "timestamp": "2025-10-24T15:00:00.000Z",
  "duration": 12500
}
```

### **Cron Integration**

**Included Cron Worker:**
```bash
# Run manual sweep
ts-node scripts/cron-sweep.ts

# Production usage
node scripts/cron-sweep.js
```

**Environment for Cron:**
```env
BASE_URL=https://your-domain.com  # Target for sweep endpoint
```

**Recommended Schedule:**
```bash
# Morning sweep - catch overnight changes
0 15 * * * cd /path/to/app && ts-node scripts/cron-sweep.ts

# Afternoon sweep - catch business day adjustments  
0 22 * * * cd /path/to/app && ts-node scripts/cron-sweep.ts
```

### **Monitoring Dashboard**

Track system performance:
- **Watch Status** - Active/inactive watch counts
- **Notification Stats** - Email delivery and open rates
- **API Usage** - Request counts and rate limiting
- **Error Tracking** - Failed watches and API errors

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Amadeus for Developers](https://developers.amadeus.com)
- [Booking.com Partner Program](https://partner.booking.com)
- [Viator Partner API](https://www.viator.com/partner-api)

## License

MIT
