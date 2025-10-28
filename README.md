# Travel Conductor ✈️

A comprehensive travel platform with user authentication, automated price monitoring, real-time flight search, production-ready booking capabilities, and Cars.com-inspired purchase analytics for travelers.

## 🚀 **Key Features**

### **User Authentication & Profiles**
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 👤 **User Profiles** - Personal information management with phone, email, name
- 📊 **Personal Dashboard** - View bookings, searches, and price watches in `/bookings`
- 🛡️ **Data Privacy** - User-specific data isolation and security
- ⚡ **Auto-Population** - Forms automatically fill with user data when signed in

### **Flight Operations**
- 🛫 **Real-time Flight Search** - Multi-provider integration (Amadeus primary)
- 📊 **Automated Price Monitoring** - Background watch system with email alerts
- 🎫 **Production Booking System** - Complete passenger info collection & confirmation
- 💰 **Smart Price Tracking** - Target-based notifications with flexible date ranges
- 🔄 **Multi-Provider Ready** - Database schema supports Amadeus, Skyscanner, and future APIs

### **User Experience**
- 📱 **Mobile-First Design** - Responsive booking flow and management
- 🔍 **Smart Search** - Airport autocomplete with 70+ destinations
- 📧 **Email Notifications** - Rich HTML alerts with booking deeplinks
- 🎯 **Flexible Monitoring** - Date ranges, stop preferences, passenger counts
- 🏠 **User Dashboard** - Dedicated pages for bookings (`/bookings`) and watches (`/watches`)
- 🌍 **Dynamic Destinations** - Universal destination pages supporting unlimited locations
- 📊 **Purchase Analytics** - Cars.com-style data showing what real travelers paid

### **Technical Architecture**
- 🏗️ **Production Ready** - Complete booking flow from search to confirmation
- 🔒 **Secure & Validated** - Comprehensive input validation and error handling
- ⚡ **High Performance** - Intelligent caching and background processing
- 🔄 **Production Monitoring** - Optimized 30-minute intervals with health checks
- 💾 **Advanced Analytics** - Purchase data system with price distribution visualization
- 🌐 **Universal Routing** - Dynamic destination system supporting infinite locations

## Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript
- **Database:** SQLite with better-sqlite3
- **Authentication:** JWT tokens with HTTP-only cookies, bcrypt password hashing
- **Styling:** Tailwind CSS v4
- **APIs:** Amadeus, SendGrid, Booking.com, Viator
- **Branding:** Travel Conductor ✈️ with airplane emoji logo system

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

# JWT Secret for Authentication (Required)
JWT_SECRET=your_secure_random_string_here

# Notification recipient
NOTIFY_TO=notifications@travelconductor.com
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

# Background Monitoring (Production optimized - 30 minute intervals)
# Required - Base URL for monitoring
NEXT_PUBLIC_BASE_URL=https://www.travelconductor.com
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

## 🔐 **Authentication System**

### **User Registration & Login**

**Registration Features:**
- ✅ **Secure Signup** - Email, password, first name, last name, phone (optional)
- ✅ **Password Security** - bcrypt hashing with salt rounds
- ✅ **Input Validation** - Email format, password strength, required fields
- ✅ **Duplicate Prevention** - Email uniqueness validation

**Login Features:**
- ✅ **JWT Authentication** - Secure token-based sessions
- ✅ **HTTP-Only Cookies** - XSS protection for auth tokens
- ✅ **Session Management** - Database-backed session tracking
- ✅ **Auto-Login Persistence** - Remember user sessions across browser restarts

### **User Profile Management**

**Profile Data:**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
```

**API Endpoints:**
- **Register:** `POST /api/auth/signup`
- **Login:** `POST /api/auth/signin`
- **Profile:** `GET /api/auth/me`
- **Logout:** `POST /api/auth/signout`

### **Form Auto-Population**

When users are signed in, forms automatically populate with:
- ✅ **Name Fields** - First name and last name
- ✅ **Email Fields** - User's email address
- ✅ **Phone Fields** - User's phone number (if provided)
- ✅ **Contact Information** - For bookings and price watch notifications

## 📊 **User Dashboard System**

### **Personal Bookings Page (`/bookings`)**

**Features:**
- ✅ **User-Specific Data** - Only shows authenticated user's information
- ✅ **Booking History** - View past flight bookings with details
- ✅ **Price Watches** - Monitor active price alerts
- ✅ **Recent Searches** - Track search history
- ✅ **User Profile Display** - Welcome section with user details

**Data Sources:**
- **Bookings:** `/api/user/bookings?userId=${user.id}`
- **Watches:** `/edge/watch?userId=${user.id}` (filtered by user)
- **Searches:** `/api/user/searches?userId=${user.id}`

### **Price Watches Page (`/watches`)**

**Features:**
- ✅ **Watch Management** - View, edit, delete price watches
- ✅ **Manual Triggers** - Force price checks with "Check Now" button
- ✅ **Status Toggle** - Activate/deactivate watches
- ✅ **Real-time Updates** - Live price updates and notification status

**Watch Operations:**
- **List:** Load user's watches with filtering
- **Toggle:** `PATCH /edge/watch?id=${watchId}` (active status)
- **Edit:** `PATCH /edge/watch?id=${watchId}` (target price)
- **Delete:** `DELETE /edge/watch?id=${watchId}`
- **Trigger:** `POST /edge/watch/${watchId}/trigger` (manual check)

### **Dynamic Destination System (`/destinations/[destination]`)**

**Universal Destination Support:**
- ✅ **Unlimited Destinations** - Dynamic routing supports any destination worldwide
- ✅ **Comprehensive Mapping** - Extensive domestic and international destination database
- ✅ **Smart Routing** - Automatic airport code to city name mapping
- ✅ **SEO Optimized** - Dynamic meta tags and structured data for each destination

**Supported Destinations Include:**
- **Domestic:** Las Vegas, Orlando, Miami, New York City, Los Angeles, Chicago, Atlanta
- **International:** Rome, London, Paris, Tokyo, Cancún, Barcelona, Amsterdam
- **Automatic Detection:** Works with any valid city/airport code combination

### **Purchase Analytics System (Cars.com-Inspired)**

**What Others Paid Feature:**
- ✅ **Real Purchase Data** - 90-day traveler booking insights (mock data infrastructure ready)
- ✅ **Price Distribution** - Visual charts showing actual booking price ranges
- ✅ **Statistical Analysis** - Median, average, 25th/75th percentile pricing
- ✅ **Booking Patterns** - Direct flight percentages, advance booking trends
- ✅ **Airline Insights** - Most commonly booked airlines for routes

**API Endpoints:**
- **Purchase Data:** `GET /api/analytics/purchases?origin=${origin}&destination=${destination}&cabin=${cabin}`
- **Route Analytics:** `GET /api/destinations/${destination}` (destination-specific data)

**Data Infrastructure Ready For:**
- IATA Economics integration
- ARC (Airlines Reporting Corporation) data
- DOT DB1B market data
- Amadeus Historical Pricing API
- Real-time purchase tracking

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/morphd35/travel-orchestrator
cd travel-orchestrator
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API credentials:

```env
# Required - Get from https://developers.amadeus.com
AMADEUS_API_KEY=your_amadeus_client_id
AMADEUS_API_SECRET=your_amadeus_secret
AMADEUS_HOST=https://test.api.amadeus.com

# Required - For user authentication
JWT_SECRET=your_super_secure_random_string_here

# Required - For email notifications
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender@domain.com
NOTIFY_TO=your_notification_email@domain.com

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

## 🔒 **Security Best Practices**

**⚠️ CRITICAL: Never commit API keys to git!**

- Always use `.env.local` for sensitive environment variables
- Copy `.env.example` to `.env.local` and fill in your actual values
- Verify `.env*` files are in your `.gitignore`
- Use environment variables in production (Vercel automatically uses them)
- Regenerate API keys immediately if accidentally exposed

**Environment Variable Security:**
- `AMADEUS_API_KEY` - Never hardcode in source files
- `SENDGRID_API_KEY` - Keep in environment variables only
- `JWT_SECRET` - Generate a strong random secret
- Use different keys for development/production environments

### 4. Test User Authentication

**Create a test user:**
```bash
# Sign up via UI at http://localhost:3000
# Or use API directly:
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890"
  }'
```

**Test auto-population:**
1. Sign in with your test user
2. Search for flights - forms should auto-fill with your name/email
3. Try creating a price watch - email field should be pre-populated

## 🔧 **Core Systems**

### **Price Monitoring & Alerts**

**Production-Optimized Watch System:**
- ✅ **Background Processing** - Server-side monitoring every 30 minutes (production optimized)
- ✅ **Health Check Integration** - Development environment monitoring with /api/health checks
- ✅ **User-Specific Filtering** - Watches filtered by authenticated user ID
- ✅ **Smart Notifications** - Target-based and significant drop alerts  
- ✅ **Rich Email Templates** - HTML emails with booking deeplinks
- ✅ **Flexible Scheduling** - Date ranges, stops, cabin preferences

**Watch Management:**
- **Create:** `POST /edge/watch` - Set up price monitoring (requires authentication)
- **List:** `GET /edge/watch?userId=${user.id}` - View user's active watches
- **Trigger:** `POST /edge/watch/{id}/trigger` - Manual price check
- **Sweep:** `POST /edge/watch/run` - Run all active watches

### **Production Booking System**

**Complete Booking Flow:**
- ✅ **4-Step Process** - Passenger info → Contact → Review → Confirmation
- ✅ **User Integration** - Auto-populate passenger details from profile
- ✅ **Real-time Price Confirmation** - Pre-booking price validation
- ✅ **Passenger Data Collection** - Names, DOB, documents, preferences
- ✅ **Booking Confirmation** - Reference numbers and itinerary details
- ✅ **Smart Fallback** - External booking when direct booking unavailable

**Booking API:**
- **Book Flight:** `POST /api/booking/flight` - Complete booking creation
- **Price Check:** `GET /api/booking/flight?action=price-check` - Current pricing
- **Capabilities:** `GET /api/booking/flight?action=capabilities` - System status

### **User Data Architecture**

**Database Schema:**
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- User-specific bookings
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  -- booking details...
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- User-specific searches
CREATE TABLE searches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  -- search details...
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Watch system (existing with user filtering)
-- Uses userId field for user-specific filtering
```

## 📋 **Usage Guide**

### **For End Users**

**1. Account Management:**
- Register at the main page with email/password
- Sign in to access personalized features
- View profile and data in `/bookings` dashboard

**2. Search Flights:**
- Enter origin/destination airports (auto-fills name/email when signed in)
- Select travel dates and preferences
- View real-time results with pricing

**3. Set Price Watches:**
- Click "Watch This Route" on any search (requires sign-in)
- Set target price and flexibility (email auto-populated)
- Receive automatic email alerts
- Manage watches in `/watches` page

**4. Book Flights:**
- Click "Book This Flight" from email alerts
- Complete 4-step booking process (passenger info auto-filled)
- Get confirmation with reference numbers
- View booking history in `/bookings`

**5. Research Destinations:**
- Explore dynamic destination pages at `/destinations/{city-name}`
- View "What Others Paid" purchase analytics for any route
- See price distributions, booking patterns, and traveler insights
- Access comprehensive destination information and travel data

### **For Developers**

**1. Authentication Integration:**
```javascript
// Check user authentication status
const { user, isLoading } = useAuth();

// User object structure
{
  id: "user_1234567890_abc123",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
```

**2. User-Specific Data Queries:**
```javascript
// Fetch user's bookings
GET /api/user/bookings?userId=${user.id}

// Fetch user's watches (filtered by userId)
GET /edge/watch?userId=${user.id}

// Fetch user's searches
GET /api/user/searches?userId=${user.id}
```

**3. Watch Management:**
```javascript
// Create a new price watch (authenticated)
POST /edge/watch
{
  "userId": "user_1234567890_abc123",
  "origin": "DFW",
  "destination": "LAX", 
  "start": "2025-12-01",
  "end": "2025-12-05",
  "targetUsd": 300,
  "email": "user@example.com"
}

// List user's watches (filtered)
GET /edge/watch?userId=user_1234567890_abc123

// Trigger manual price check
POST /edge/watch/{watchId}/trigger
```

## 🏗️ **Project Structure**

```
travel-conductor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/                    # Authentication endpoints
│   │   │   │   ├── signup/route.ts     # User registration
│   │   │   │   ├── signin/route.ts     # User login
│   │   │   │   ├── signout/route.ts    # User logout
│   │   │   │   └── me/route.ts         # Get current user
│   │   │   ├── user/                   # User-specific data
│   │   │   │   ├── bookings/route.ts   # User's booking history
│   │   │   │   └── searches/route.ts   # User's search history
│   │   │   ├── analytics/              # Purchase analytics system
│   │   │   │   └── purchases/route.ts  # Cars.com-style purchase data
│   │   │   ├── destinations/route.ts   # Dynamic destination data
│   │   │   ├── health/route.ts         # Health checks for monitoring
│   │   │   └── booking/flight/         # Booking API endpoints
│   │   ├── edge/watch/                 # Watch management endpoints
│   │   ├── destinations/               # Dynamic destination system
│   │   │   └── [destination]/         # Universal destination pages
│   │   │       └── page.tsx           # Dynamic routing for any destination
│   │   ├── bookings/                   # User dashboard page
│   │   │   └── page.tsx               # Bookings, watches, searches
│   │   ├── watches/                    # Watch management page
│   │   │   └── page.tsx               # Full watch CRUD interface
│   │   ├── book/                       # Booking confirmation page
│   │   ├── layout.tsx                  # Root layout with navigation
│   │   └── page.tsx                    # Main search interface
│   ├── components/
│   │   ├── AuthModal.tsx               # Sign in/sign up modal
│   │   ├── AirportAutocomplete.tsx     # Smart airport search
│   │   ├── BookingForm.tsx             # 4-step booking process (auto-fill)
│   │   ├── Navigation.tsx              # Site navigation with auth
│   │   ├── GlobalNavigation.tsx        # Enhanced nav with user menu ✈️
│   │   ├── PriceWatchModal.tsx         # Watch creation modal (auto-fill)
│   │   ├── WhatOthersPaid.tsx          # Cars.com-style purchase analytics
│   │   └── DestinationPageTemplate.tsx # Universal destination page template
│   ├── lib/
│   │   ├── auth.tsx                    # Authentication context & hooks
│   │   ├── database.ts                 # SQLite database with user tables
│   │   ├── amadeusClient.ts            # Core Amadeus integration
│   │   ├── amadeusBooking.ts           # Booking API client
│   │   ├── backgroundMonitor.ts        # Automatic watch monitoring
│   │   ├── watchStore.ts               # Watch CRUD operations
│   │   ├── notifier.ts                 # Email notification system
│   │   ├── unifiedFlightClient.ts      # Multi-provider architecture
│   │   └── templates/
│   │       └── notifyFareDrop.ts       # HTML email templates
│   └── middleware.ts                   # Request routing & auth
├── data/
│   ├── travel_orchestrator.db          # Main SQLite database (auto-created)
│   └── watches.db                      # Watch data (auto-created)
├── scripts/
│   └── cron-sweep.ts                   # Automated monitoring script
├── public/                             # Static assets
├── .env.local                          # Environment configuration
└── README.md                           # This file
```

## 🔧 **Troubleshooting**

### **Authentication Issues**

**"User not found" or login failures:**
- ✅ Ensure database is created in `data/` directory
- ✅ Check JWT_SECRET is set in `.env.local`
- ✅ Verify email/password combination is correct
- ✅ Clear browser cookies and try again

**"Forms not auto-populating":**
- ✅ Confirm user is signed in (check `/bookings` page)
- ✅ Verify authentication context is working
- ✅ Check browser console for JavaScript errors
- ✅ Ensure user profile has required fields (name, email)

**"Watches not showing for user":**
- ✅ Confirm user is authenticated
- ✅ Check if watches were created with correct userId
- ✅ Verify API calls include `userId` parameter
- ✅ Test API directly: `GET /edge/watch?userId=your_user_id`

### **Database Issues**

**"Database creation errors":**
- ✅ Ensure `data/` directory exists and has write permissions
- ✅ Check SQLite database files are created automatically
- ✅ Verify database migrations ran successfully on first run

**"Session/auth token issues":**
- ✅ Clear browser cookies and localStorage
- ✅ Check JWT_SECRET is consistent across restarts
- ✅ Verify session table is created in database

### **Common Issues**

**"Missing required environment variable"**
- ✅ Create `.env.local` with all required variables including JWT_SECRET
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
- ✅ Ensure user email address is correct in profile

## Environment Validation

The app includes robust environment variable guards:

- **Server-side secrets** (AMADEUS_*, JWT_SECRET) are never bundled in client code
- **Clear error messages** if required variables are missing
- **Automatic validation** on server startup
- **Graceful fallbacks** for optional variables

If required environment variables are missing, you'll see clear errors in the console:

```
❌ Environment validation failed:
  - Missing required environment variable: JWT_SECRET
    Description: Secret key for JWT token signing
    Please add JWT_SECRET to your .env.local file
```

## 🚀 **Deployment Guide**

### **Production Environment Requirements**

```env
# Required - Flight Search & Booking
AMADEUS_API_KEY=your_production_api_key
AMADEUS_API_SECRET=your_production_secret
AMADEUS_HOST=https://api.amadeus.com  # Production endpoint

# Required - Authentication
JWT_SECRET=your_super_secure_production_jwt_secret

# Required - Email Notifications
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@travelconductor.com
NOTIFY_TO=alerts@travelconductor.com

# Required - Base URL for monitoring
NEXT_PUBLIC_BASE_URL=https://www.travelconductor.com

# Optional - Enable direct booking
AMADEUS_BOOKING_ENABLED=true
```

### **Database Setup**

**Development:**
- SQLite databases auto-created in `data/` directory
- No manual setup required

**Production:**
- Ensure `data/` directory has write permissions
- Consider automated backups for user data
- Monitor database size and performance

**Database Files:**
- `travel_orchestrator.db` - Main database (users, sessions, bookings, searches)
- `watches.db` - Price watch system data
- `purchase_analytics.sql` - Schema for Cars.com-style purchase analytics

## Production Monitoring

The platform includes production-optimized background monitoring:

- **Frequency:** 30-minute intervals (optimized from 2-minute testing intervals)
- **Health Checks:** Automatic `/api/health` endpoint validation in development
- **Error Handling:** Improved logging and 404 error prevention
- **Performance:** Reduced API load while maintaining effective price monitoring

## Health Check

A health check endpoint is available at `/health`:

```bash
curl http://localhost:3000/health
# {"ok":true,"ts":1698765432000,"port":3000}
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Amadeus for Developers](https://developers.amadeus.com)
- [JWT Authentication Guide](https://jwt.io/introduction)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SendGrid API Documentation](https://docs.sendgrid.com/)

## License

MIT
