import { priceWatchDB, PriceWatch } from '@/lib/priceWatch';
import { flightCache } from '@/lib/cache';
import { getCurrentFrequency, formatFrequencyDescription } from '@/lib/monitoringConfig';
import { getAirlineName, getAirportName } from './airlineUtils';

/**
 * Price Monitoring Service
 * This would typically run as a background job (cron/worker)
 * For demo purposes, this shows the monitoring logic
 */

interface NotificationService {
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
    sendSMS(to: string, message: string): Promise<boolean>;
}

// Mock notification service - replace with real services (SendGrid, Twilio, etc.)
class MockNotificationService implements NotificationService {
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        console.log(`📧 EMAIL to ${to}:`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        return true;
    }

    async sendSMS(to: string, message: string): Promise<boolean> {
        console.log(`📱 SMS to ${to}: ${message}`);
        return true;
    }
}

class PriceMonitoringService {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new MockNotificationService();
    }

    /**
     * Send confirmation email when price watch is created
     */
    async sendWatchConfirmation(watch: PriceWatch): Promise<void> {
        const subject = `🔔 Price Watch Activated: ${watch.title}`;

        const emailBody = `
🎉 Your price watch is now active!

✈️ Route: ${watch.origin} → ${watch.destination}
📅 Monitoring Period: ${new Date(watch.watchStartDate).toLocaleDateString()} - ${new Date(watch.watchEndDate).toLocaleDateString()}
💰 Price Threshold: $${watch.priceThreshold} change
${watch.targetPrice ? `🎯 Target Price: $${watch.targetPrice}` : ''}
${watch.baselinePrice ? `📊 Current Baseline: $${watch.baselinePrice}` : ''}

🔍 How it works:
• We'll check prices every 4 hours
• You'll be notified when prices change by $${watch.priceThreshold} or more
• ${watch.targetPrice ? 'Special alert if price drops to your target price' : ''}
• Watch expires on ${new Date(watch.watchEndDate).toLocaleDateString()}

🛠️ Notification Settings:
• Method: ${watch.notificationType === 'both' ? 'Email & SMS' : watch.notificationType.toUpperCase()}
• Email: ${watch.email || 'Not set'}
• Phone: ${watch.phone || 'Not set'}

${watch.notes ? `📝 Your Notes: ${watch.notes}` : ''}

Happy deal hunting! 🧳
Your Travel Orchestrator Team

P.S. You can manage your price watches anytime at http://localhost:3000/watches
    `.trim();

        const smsMessage = `🔔 Price watch activated for ${watch.title}! We'll monitor ${watch.origin}→${watch.destination} and notify you of price changes ≥$${watch.priceThreshold}. Happy deal hunting!`;

        // Send notifications based on user preference
        if (watch.notificationType === 'email' || watch.notificationType === 'both') {
            if (watch.email) {
                await this.notificationService.sendEmail(watch.email, subject, emailBody);
            }
        }

        if (watch.notificationType === 'sms' || watch.notificationType === 'both') {
            if (watch.phone) {
                await this.notificationService.sendSMS(watch.phone, smsMessage);
            }
        }

        console.log(`📧 Confirmation sent for price watch: ${watch.title}`);
    }

    /**
     * Check all active price watches for changes
     */
    async checkAllPriceWatches(): Promise<void> {
        const activeWatches = priceWatchDB.getActiveWatches();
        console.log(`🔍 Checking ${activeWatches.length} active price watches...`);

        for (const watch of activeWatches) {
            try {
                await this.checkPriceWatch(watch);
            } catch (error) {
                console.error(`❌ Error checking watch ${watch.id}:`, error);
            }
        }
    }

    /**
     * Check a specific price watch for changes
     */
    private async checkPriceWatch(watch: PriceWatch): Promise<void> {
        console.log(`🔍 Checking prices for: ${watch.title} (${watch.origin} → ${watch.destination})`);

        // Fetch current prices (mock for demo)
        const currentPrices = await this.fetchCurrentPrices(watch);
        const bestCurrentPrice = Math.min(...currentPrices.map(p => p.price));

        // Check if baseline price exists
        if (!watch.baselinePrice) {
            // First time - set baseline
            priceWatchDB.updateWatch(watch.id, {
                baselinePrice: bestCurrentPrice,
                lastChecked: new Date().toISOString()
            });
            console.log(`📊 Set baseline price for ${watch.title}: $${bestCurrentPrice}`);
            return;
        }

        // Calculate price change
        const priceChange = bestCurrentPrice - watch.baselinePrice;
        const percentChange = (priceChange / watch.baselinePrice) * 100;

        console.log(`💰 Price check: ${watch.title}`);
        console.log(`   Baseline: $${watch.baselinePrice}`);
        console.log(`   Current:  $${bestCurrentPrice}`);
        console.log(`   Change:   $${priceChange.toFixed(2)} (${percentChange.toFixed(1)}%)`);

        // Check if notification should be sent
        const shouldNotify = Math.abs(priceChange) >= watch.priceThreshold ||
            (watch.targetPrice && bestCurrentPrice <= watch.targetPrice);

        if (shouldNotify) {
            const bestFlight = currentPrices.find(p => p.price === bestCurrentPrice);
            await this.sendPriceAlert(watch, priceChange, watch.baselinePrice, bestCurrentPrice, bestFlight);

            // Update baseline to current price to avoid spam notifications
            priceWatchDB.updateWatch(watch.id, {
                baselinePrice: bestCurrentPrice,
                lastChecked: new Date().toISOString()
            });
        } else {
            // Just update last checked time
            priceWatchDB.updateWatch(watch.id, {
                lastChecked: new Date().toISOString()
            });
        }
    }

    /**
     * Fetch current prices for a watch (mock implementation)
     */
    private async fetchCurrentPrices(watch: PriceWatch): Promise<Array<{ price: number, airline: string, flightNumber: string, departureTime: string, duration: string }>> {
        // In production, this would call the actual Amadeus API
        // For demo, simulate price fluctuations
        const basePrice = watch.baselinePrice || 800;
        const fluctuation = (Math.random() - 0.5) * 300; // ±$150 fluctuation

        return [
            {
                price: Math.max(200, basePrice + fluctuation),
                airline: 'American Airlines',
                flightNumber: 'AA1234',
                departureTime: '8:30 AM',
                duration: '2h 15m'
            },
            {
                price: Math.max(200, basePrice + fluctuation + 50),
                airline: 'United Airlines',
                flightNumber: 'UA5678',
                departureTime: '10:45 AM',
                duration: '2h 30m'
            }
        ];
    }

    /**
     * Send price alert notification
     */
    private async sendPriceAlert(
        watch: PriceWatch,
        priceChange: number,
        oldPrice: number,
        newPrice: number,
        bestFlight?: { price: number, airline: string, flightNumber: string, departureTime: string, duration: string }
    ): Promise<void> {
        const isDecrease = priceChange < 0;
        const changeType = isDecrease ? 'DROPPED' : 'INCREASED';
        const emoji = isDecrease ? '🎉💰' : '⚠️📈';

        const subject = `${emoji} Flight Price ${changeType}: ${watch.title}`;

        // Get user-friendly location names
        const originCity = getAirportName(watch.origin);
        const destinationCity = getAirportName(watch.destination);

        const emailBody = `
${emoji} Great news! The flight price for your watched route has ${isDecrease ? 'dropped' : 'increased'} significantly!

✈️ Route: ${originCity} → ${destinationCity}
📊 Price Change: $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)} (${priceChange > 0 ? '+' : ''}$${priceChange.toFixed(2)})
${isDecrease ? '🎯 This is a great time to book!' : '⏰ You might want to book soon if prices keep rising.'}

${bestFlight ? `
🏆 Best Current Option:
   Airline: ${bestFlight.airline}
   Flight: ${bestFlight.flightNumber}
   Departure: ${bestFlight.departureTime}
   Duration: ${bestFlight.duration}
   Price: $${bestFlight.price}
` : ''}

${watch.targetPrice && newPrice <= watch.targetPrice ? '🎯 TARGET PRICE REACHED! This price meets your target of $' + watch.targetPrice : ''}

Happy travels!
Your Travel Orchestrator Team
    `.trim();

        const smsMessage = `${emoji} ${watch.title}: Flight prices ${changeType} from $${oldPrice} to $${newPrice} (${priceChange > 0 ? '+' : ''}$${priceChange.toFixed(2)}). ${isDecrease ? 'Great time to book!' : 'Consider booking soon.'}`;

        // Send notifications based on user preference
        if (watch.notificationType === 'email' || watch.notificationType === 'both') {
            if (watch.email) {
                await this.notificationService.sendEmail(watch.email, subject, emailBody);
            }
        }

        if (watch.notificationType === 'sms' || watch.notificationType === 'both') {
            if (watch.phone) {
                await this.notificationService.sendSMS(watch.phone, smsMessage);
            }
        }

        // Log the alert
        priceWatchDB.createAlert({
            watchId: watch.id,
            priceChange,
            oldPrice,
            newPrice,
            triggeredAt: new Date().toISOString(),
            notificationSent: true,
            flightDetails: bestFlight || {
                airline: 'Unknown',
                flightNumber: 'N/A',
                departureTime: 'N/A',
                duration: 'N/A'
            }
        });

        console.log(`🔔 Price alert sent for ${watch.title}: ${changeType} by $${Math.abs(priceChange).toFixed(2)}`);
    }
}

// Export singleton instance
export const priceMonitor = new PriceMonitoringService();

// Auto-start monitoring (in production, use proper cron job)
if (typeof window === 'undefined') { // Only run on server
    const frequency = getCurrentFrequency();
    const frequencyDesc = formatFrequencyDescription(frequency);

    console.log('🚀 Starting price monitoring service...');
    console.log(`⏰ Monitoring frequency: every ${frequencyDesc}`);

    // Initial check after 2 minutes (let server fully start)
    setTimeout(() => {
        priceMonitor.checkAllPriceWatches();
    }, 2 * 60 * 1000);

    // Then check at configured frequency
    setInterval(() => {
        priceMonitor.checkAllPriceWatches();
    }, frequency);
}
