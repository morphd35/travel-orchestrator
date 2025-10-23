/**
 * Price Monitoring Configuration & Best Practices
 * 
 * This file contains configuration options and recommendations for flight price monitoring
 */

export const MONITORING_FREQUENCIES = {
    // Development/Testing
    TESTING: 2 * 60 * 1000,        // 2 minutes

    // Production Options
    AGGRESSIVE: 2 * 60 * 60 * 1000,    // 2 hours (high cost)
    OPTIMAL: 4 * 60 * 60 * 1000,       // 4 hours (recommended)
    CONSERVATIVE: 6 * 60 * 60 * 1000,  // 6 hours (lower cost)
    ECONOMY: 12 * 60 * 60 * 1000,      // 12 hours (very low cost)
};

/**
 * Price Monitoring Best Practices
 * 
 * FREQUENCY RECOMMENDATIONS:
 * 
 * 1. **Every 4-6 Hours (RECOMMENDED)**
 *    - Captures 90% of meaningful price changes
 *    - Balances cost vs. value
 *    - Aligns with airline pricing schedules
 *    - ~$5-15/month in API costs per watch
 * 
 * 2. **Every 2 Hours (Aggressive)**
 *    - For high-value routes (>$2000 tickets)
 *    - When booking very soon (within 2 weeks)
 *    - Higher API costs (~$10-30/month per watch)
 * 
 * 3. **Every 12 Hours (Economy)**
 *    - For flexible travelers
 *    - Long-term watches (3+ months)
 *    - Minimal API costs (~$2-5/month per watch)
 * 
 * AIRLINE PRICING PATTERNS:
 * 
 * • **Tuesday/Wednesday**: Traditionally best days for price drops
 * • **Morning (6-9 AM)**: Airlines often release deals
 * • **Afternoon (2-4 PM)**: Business booking patterns influence prices
 * • **Evening (6-8 PM)**: Final adjustments for next day
 * 
 * COST CONSIDERATIONS:
 * 
 * • Amadeus API: ~$0.002-0.01 per call
 * • 4-hour frequency: ~180 calls/month per watch
 * • Monthly cost per watch: $0.36 - $1.80
 * • 1000 active watches: $360-1800/month in API costs
 * 
 * NOTIFICATION THRESHOLDS:
 * 
 * • **Domestic US**: $50-100 threshold
 * • **International**: $100-200 threshold  
 * • **Premium routes**: $200-500 threshold
 * • **Target price**: Usually 15-25% below current price
 * 
 * PRODUCTION DEPLOYMENT:
 * 
 * 1. Use proper cron jobs (not setInterval)
 * 2. Implement proper error handling and retries
 * 3. Add rate limiting to avoid API throttling
 * 4. Use database queue for scalability
 * 5. Monitor API costs and adjust frequency accordingly
 * 6. Implement user limits (max watches per user)
 * 
 * REAL EMAIL SERVICES:
 * 
 * • **SendGrid**: $14.95/month for 40K emails
 * • **AWS SES**: $0.10 per 1000 emails
 * • **Mailgun**: $35/month for 50K emails
 * • **Twilio**: $0.0075 per SMS
 * 
 * SCALABILITY NOTES:
 * 
 * • Cache flight search results to reduce API calls
 * • Batch process watches by route to optimize API usage
 * • Use webhook-based pricing when available (some APIs offer this)
 * • Consider partnering with price comparison sites for data
 */

export const getCurrentFrequency = (): number => {
    const env = process.env.NODE_ENV;

    if (env === 'development') {
        return MONITORING_FREQUENCIES.TESTING;
    }

    // In production, this could be configurable per user/plan
    return MONITORING_FREQUENCIES.OPTIMAL;
};

export const getRecommendedThreshold = (averagePrice: number): number => {
    if (averagePrice < 500) return 50;   // Domestic short-haul
    if (averagePrice < 1000) return 75;  // Domestic long-haul
    if (averagePrice < 2000) return 100; // International economy
    if (averagePrice < 5000) return 200; // International premium
    return 300; // Luxury/First class
};

export const formatFrequencyDescription = (milliseconds: number): string => {
    const hours = milliseconds / (60 * 60 * 1000);
    const minutes = (milliseconds % (60 * 60 * 1000)) / (60 * 1000);

    if (hours >= 1) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
};
