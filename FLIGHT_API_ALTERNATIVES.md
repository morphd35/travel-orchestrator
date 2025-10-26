# 🛫 Flight API Alternatives to Amadeus

## Current Amadeus Limitations
❌ **Missing Major Airlines**: American Airlines, Delta, British Airways  
❌ **No Budget Carriers**: Spirit, Frontier, Allegiant, Southwest  
❌ **Limited Booking**: Test environment only, production still restrictive  
❌ **High Costs**: Expensive per API call in production  

---

## 🎯 **RECOMMENDED ALTERNATIVES**

### 1. **Skyscanner Travel APIs** ⭐⭐⭐⭐⭐
**Best Overall Choice for Coverage & Booking**

- ✅ **Coverage**: 99% of airlines including AA, Delta, BA, Spirit, Southwest
- ✅ **Booking**: Full booking flow with affiliate commissions
- ✅ **Pricing**: Freemium model, revenue sharing available
- ✅ **Data Quality**: Real-time prices, comprehensive routes
- 🔗 **API**: https://developers.skyscanner.net/
- 💰 **Cost**: Free tier + revenue share (2-8% commission)

```typescript
// Example: Skyscanner API Integration
const searchFlights = async (origin, destination, date) => {
  const response = await fetch('https://api.skyscanner.com/v3/flights/live/search/create', {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': process.env.SKYSCANNER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: {
        market: 'US',
        locale: 'en-US',
        currency: 'USD',
        adults: 1,
        cabinClass: 'CABIN_CLASS_ECONOMY',
        legs: [{
          originPlaceId: { iata: origin },
          destinationPlaceId: { iata: destination },
          date: { year: 2025, month: 1, day: 15 }
        }]
      }
    })
  });
  return response.json();
};
```

---

### 2. **Aviationstack** ⭐⭐⭐⭐
**Great for Flight Data & Tracking**

- ✅ **Coverage**: Global flight data, 13,000+ airlines
- ✅ **Features**: Real-time tracking, historical data, airport info
- ✅ **Pricing**: $9.99/month for 1,000 requests
- ⚠️ **Limitation**: Flight data only, no booking
- 🔗 **API**: https://aviationstack.com/

---

### 3. **Travelport Universal API** ⭐⭐⭐⭐
**Enterprise-Grade with Full Booking**

- ✅ **Coverage**: Major airlines, 400+ airlines total
- ✅ **Booking**: Full reservation system integration
- ✅ **Features**: Fare families, seat selection, baggage
- ❌ **Complexity**: Requires certification, complex integration
- 💰 **Cost**: Enterprise pricing, contact for quotes

---

### 4. **Rapid Travel API (RapidAPI)** ⭐⭐⭐
**Multiple Providers in One Place**

- ✅ **Options**: Skyscanner, Kayak, Booking.com APIs
- ✅ **Convenience**: Single platform, multiple sources
- ✅ **Pricing**: Various tiers, some free options
- 🔗 **Platform**: https://rapidapi.com/hub/travel

Popular Travel APIs on RapidAPI:
- **SkyScanner Flight Search**: Free tier available
- **Flight Data API**: $5/month for 1,000 requests
- **Booking.com API**: Hotel + flight packages

---

### 5. **Google Travel Partner API** ⭐⭐⭐⭐⭐
**Most Comprehensive but Restrictive**

- ✅ **Coverage**: Virtually all airlines and routes
- ✅ **Quality**: Best data accuracy and freshness
- ✅ **Integration**: Powers Google Flights
- ❌ **Access**: Requires Google Travel Partner certification
- ❌ **Requirements**: Minimum $10M annual travel bookings

---

### 6. **Kiwi.com Tequila API** ⭐⭐⭐
**Good for Budget & Multi-City**

- ✅ **Specializes**: Budget airlines, complex routing
- ✅ **Features**: Virtual interlining, unique connections
- ✅ **Coverage**: Includes many LCCs (Low Cost Carriers)
- 🔗 **API**: https://tequila.kiwi.com/portal/docs

---

## 🚀 **IMPLEMENTATION STRATEGY**

### Phase 1: Quick Win (Recommended)
```bash
# Use Skyscanner via RapidAPI for immediate improvement
1. Sign up for RapidAPI: https://rapidapi.com/
2. Subscribe to Skyscanner API (Free tier: 100 requests/month)
3. Replace Amadeus calls with Skyscanner
4. Get affiliate booking links for revenue
```

### Phase 2: Multi-Source Aggregation
```typescript
// Combine multiple APIs for better coverage
const searchAllSources = async (searchParams) => {
  const results = await Promise.allSettled([
    searchSkyscanner(searchParams),
    searchAviationstack(searchParams),
    searchKiwi(searchParams)
  ]);
  return aggregateAndDedupe(results);
};
```

### Phase 3: Booking Integration
```typescript
// Direct booking flow with affiliate tracking
const bookFlight = (flightOffer) => {
  if (flightOffer.bookingUrl) {
    // Redirect to airline/OTA with affiliate tracking
    window.open(flightOffer.bookingUrl + '?ref=travel-conductor');
  }
};
```

---

## 💰 **COST COMPARISON**

| Provider | Free Tier | Paid Plans | Booking Revenue |
|----------|-----------|------------|-----------------|
| Skyscanner | 100 req/month | From $49/month | 2-8% commission |
| Aviationstack | 100 req/month | From $9.99/month | None |
| RapidAPI | Varies by API | From $5/month | Varies |
| Travelport | None | Enterprise only | Full GDS rates |
| Kiwi.com | 100 req/month | From $39/month | Affiliate program |

---

## 🏆 **RECOMMENDED NEXT STEPS**

1. **Immediate (This Week)**:
   - Replace Amadeus with Skyscanner API via RapidAPI
   - Get access to major airlines (AA, Delta, BA)
   - Add budget carriers (Spirit, Frontier, Southwest)

2. **Short Term (Next Month)**:
   - Implement affiliate booking links
   - Add multiple data sources for better coverage
   - Create booking flow with real airline redirects

3. **Long Term (3-6 Months)**:
   - Apply for Google Travel Partner API
   - Consider Travelport for enterprise features
   - Build direct airline integrations

**Want me to help implement the Skyscanner integration right now?**
