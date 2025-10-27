# Database Architecture Upgrade Plan
## Moving from SQLite to Production-Grade Database

### Current Issues with SQLite
- ❌ Read-only in Vercel production (serverless constraints)
- ❌ No concurrent write support
- ❌ Limited scalability for complex queries
- ❌ No built-in caching mechanisms
- ❌ Single file storage (backup/recovery limitations)

### Recommended Architecture: Vercel Postgres + Vercel KV

#### Primary Database: **Vercel Postgres** (Neon)
- ✅ Fully managed PostgreSQL
- ✅ Serverless scaling (pay-per-use)
- ✅ ACID transactions
- ✅ Complex relationships & joins
- ✅ Full-text search capabilities
- ✅ Built-in connection pooling
- ✅ Automatic backups

#### Caching Layer: **Vercel KV** (Redis)
- ✅ Ultra-fast key-value storage
- ✅ Session management
- ✅ Flight price caching
- ✅ Airport/airline data caching
- ✅ Real-time data storage

### Migration Strategy

#### Phase 1: Setup Vercel Postgres
```bash
# Install Vercel CLI and create database
npm i -g vercel
vercel storage create postgres travel-conductor-db
```

#### Phase 2: Schema Migration
```sql
-- Users table (enhanced)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT false,
    preferred_airlines JSONB DEFAULT '[]',
    preferred_airports JSONB DEFAULT '[]',
    seat_preference VARCHAR(20) DEFAULT 'aisle',
    meal_preference VARCHAR(50) DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (improved)
CREATE TABLE sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW()
);

-- Price watches (enhanced)
CREATE TABLE price_watches (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_date DATE,
    return_date DATE,
    passenger_count INTEGER DEFAULT 1,
    class VARCHAR(20) DEFAULT 'economy',
    target_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    alert_threshold DECIMAL(5,2) DEFAULT 0.10, -- 10% price drop
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Flight cache (new)
CREATE TABLE flight_cache (
    id VARCHAR(100) PRIMARY KEY,
    search_params_hash VARCHAR(64) NOT NULL,
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    results JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings (new)
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    flight_data JSONB NOT NULL,
    passenger_data JSONB NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics (new)
CREATE TABLE search_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_date DATE,
    return_date DATE,
    passenger_count INTEGER,
    class VARCHAR(20),
    results_count INTEGER,
    search_duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_price_watches_user_id ON price_watches(user_id);
CREATE INDEX idx_price_watches_active ON price_watches(is_active);
CREATE INDEX idx_flight_cache_params ON flight_cache(search_params_hash);
CREATE INDEX idx_flight_cache_expires ON flight_cache(expires_at);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_search_analytics_user_id ON search_analytics(user_id);
```

#### Phase 3: Code Migration
1. Install PostgreSQL client: `npm install @vercel/postgres`
2. Update environment variables
3. Create new database connection utilities
4. Migrate API endpoints one by one
5. Update authentication system
6. Test thoroughly

#### Phase 4: Caching Layer (Vercel KV)
```javascript
// Example caching for flight searches
import { kv } from '@vercel/kv';

const cacheKey = `flights:${origin}:${destination}:${date}`;
const cachedResults = await kv.get(cacheKey);

if (cachedResults) {
    return cachedResults;
}

// Fetch from API
const results = await searchFlights(params);

// Cache for 1 hour
await kv.setex(cacheKey, 3600, results);
```

### Cost Estimation
- **Vercel Postgres**: $20-50/month (depends on usage)
- **Vercel KV**: $10-20/month (depends on cache size)
- **Total**: ~$30-70/month for production-grade database

### Data We'll Eventually Need
1. **User Management**: Profiles, preferences, payment methods
2. **Flight Data**: Search history, cached results, price trends
3. **Bookings**: Confirmation details, travel documents
4. **Price Monitoring**: Watch alerts, historical prices
5. **Analytics**: Search patterns, popular routes, conversion rates
6. **Content**: Destination guides, travel tips, reviews

### Migration Timeline
- **Week 1**: Setup Vercel Postgres, migrate user system
- **Week 2**: Migrate authentication and sessions
- **Week 3**: Migrate price watches and flight caching
- **Week 4**: Add analytics and optimization

### Immediate Benefits
- ✅ Real database writes in production
- ✅ Proper session management
- ✅ Complex queries and relationships
- ✅ Automatic scaling
- ✅ Professional data architecture
