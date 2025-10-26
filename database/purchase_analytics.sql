-- Travel Purchase Analytics Schema
-- Stores real traveler purchase data for price analysis and trends

-- Main table for actual flight purchases
CREATE TABLE IF NOT EXISTS flight_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Route Information
    origin_code TEXT NOT NULL,
    destination_code TEXT NOT NULL,
    route_key TEXT NOT NULL, -- e.g., "DFW-FCO"
    
    -- Purchase Details
    purchase_date DATE NOT NULL,
    travel_date DATE NOT NULL,
    return_date DATE, -- NULL for one-way
    days_advance_booked INTEGER NOT NULL, -- Days between purchase and travel
    
    -- Pricing
    total_price_usd DECIMAL(10,2) NOT NULL,
    base_fare_usd DECIMAL(10,2) NOT NULL,
    taxes_fees_usd DECIMAL(10,2) NOT NULL,
    currency_original TEXT DEFAULT 'USD',
    
    -- Flight Details
    airline_code TEXT NOT NULL,
    booking_class TEXT, -- Y, M, H, etc.
    cabin_type TEXT DEFAULT 'economy', -- economy, premium_economy, business, first
    stops_outbound INTEGER DEFAULT 0,
    stops_return INTEGER DEFAULT 0,
    
    -- Traveler Context
    traveler_count INTEGER DEFAULT 1,
    traveler_types TEXT, -- JSON: {"adults": 2, "children": 1, "seniors": 0}
    
    -- Booking Context
    booking_channel TEXT, -- airline_direct, ota, travel_agent
    trip_purpose TEXT, -- leisure, business, unknown
    advance_purchase_category TEXT, -- last_minute, standard, advance, early_bird
    
    -- Data Source & Quality
    data_source TEXT NOT NULL, -- amadeus, arc, dot, manual
    data_quality REAL DEFAULT 1.0, -- Confidence score 0-1
    verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for fast queries
    INDEX idx_route_date (route_key, travel_date),
    INDEX idx_destination_date (destination_code, travel_date),
    INDEX idx_purchase_date (purchase_date),
    INDEX idx_advance_booking (days_advance_booked)
);

-- Route pricing statistics (computed/cached from purchases)
CREATE TABLE IF NOT EXISTS route_price_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Route & Time Period
    route_key TEXT NOT NULL,
    origin_code TEXT NOT NULL,
    destination_code TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cabin_type TEXT DEFAULT 'economy',
    
    -- Price Statistics
    sample_count INTEGER NOT NULL,
    avg_price_usd DECIMAL(10,2) NOT NULL,
    median_price_usd DECIMAL(10,2) NOT NULL,
    min_price_usd DECIMAL(10,2) NOT NULL,
    max_price_usd DECIMAL(10,2) NOT NULL,
    p25_price_usd DECIMAL(10,2), -- 25th percentile
    p75_price_usd DECIMAL(10,2), -- 75th percentile
    
    -- Booking Patterns
    avg_days_advance DECIMAL(5,1),
    most_common_airline TEXT,
    direct_flight_percentage DECIMAL(5,2),
    
    -- Computed at
    computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE(route_key, period_start, period_end, cabin_type)
);

-- Price distribution buckets for charting
CREATE TABLE IF NOT EXISTS price_distribution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    route_key TEXT NOT NULL,
    cabin_type TEXT DEFAULT 'economy',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Price bucket (e.g., $800-899, $900-999)
    price_bucket_min INTEGER NOT NULL,
    price_bucket_max INTEGER NOT NULL,
    purchase_count INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_route_bucket (route_key, period_start, period_end)
);

-- Seasonal pricing patterns
CREATE TABLE IF NOT EXISTS seasonal_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    route_key TEXT NOT NULL,
    cabin_type TEXT DEFAULT 'economy',
    
    -- Time period (month or week)
    time_period TEXT NOT NULL, -- 'jan', 'feb', 'week-1', etc.
    period_type TEXT NOT NULL, -- 'month', 'week'
    
    -- Trend data
    avg_price_usd DECIMAL(10,2) NOT NULL,
    relative_to_annual DECIMAL(5,2) NOT NULL, -- +15% above annual avg
    sample_count INTEGER NOT NULL,
    
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(route_key, cabin_type, time_period, period_type)
);

-- Data source tracking
CREATE TABLE IF NOT EXISTS data_source_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    source_name TEXT NOT NULL,
    import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    records_imported INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    data_period_start DATE,
    data_period_end DATE,
    
    -- Import metadata
    import_status TEXT DEFAULT 'success', -- success, error, partial
    error_message TEXT,
    file_hash TEXT, -- To prevent duplicate imports
    
    INDEX idx_source_date (source_name, import_date)
);
