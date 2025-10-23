/**
 * Price Watch System - Database Schema & Types
 * Tracks flight price changes and notifies users when thresholds are met
 */

export interface PriceWatch {
    id: string;
    userId: string;
    origin: string;
    destination: string;
    departureDate?: string; // Optional - for flexible date watching
    returnDate?: string;
    adults: number;
    children: number;
    seniors: number;

    // Watch parameters
    watchStartDate: string;
    watchEndDate: string;
    priceThreshold: number; // Dollar amount change to trigger notification
    baselinePrice?: number; // Initial price when watch was created
    targetPrice?: number; // User's desired price point

    // Notification preferences
    notificationType: 'email' | 'sms' | 'both';
    email?: string;
    phone?: string;

    // Status
    isActive: boolean;
    createdAt: string;
    lastChecked?: string;

    // Metadata
    title: string; // User-friendly name like "Rome Trip - Summer 2025"
    notes?: string;
}

export interface PriceAlert {
    id: string;
    watchId: string;
    priceChange: number; // Positive for increase, negative for decrease
    oldPrice: number;
    newPrice: number;
    triggeredAt: string;
    notificationSent: boolean;
    flightDetails: {
        airline: string;
        flightNumber: string;
        departureTime: string;
        duration: string;
    };
}

export interface PriceWatchRequest {
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string;
    adults: number;
    children: number;
    seniors: number;
    watchDuration: number; // Days to watch
    priceThreshold: number;
    targetPrice?: number;
    notificationType: 'email' | 'sms' | 'both';
    email?: string;
    phone?: string;
    title: string;
    notes?: string;
}

// Mock database - in production, use PostgreSQL/MongoDB
class MockPriceWatchDB {
    private watches: Map<string, PriceWatch> = new Map();
    private alerts: Map<string, PriceAlert> = new Map();

    createWatch(watchData: Omit<PriceWatch, 'id' | 'createdAt'>): PriceWatch {
        const id = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const watch: PriceWatch = {
            ...watchData,
            id,
            createdAt: new Date().toISOString(),
        };

        this.watches.set(id, watch);
        console.log(`📊 Created price watch: ${watch.title} (${watch.origin} → ${watch.destination})`);
        return watch;
    }

    getWatch(id: string): PriceWatch | null {
        return this.watches.get(id) || null;
    }

    getUserWatches(userId: string): PriceWatch[] {
        return Array.from(this.watches.values()).filter(w => w.userId === userId);
    }

    getActiveWatches(): PriceWatch[] {
        const now = new Date();
        return Array.from(this.watches.values()).filter(w =>
            w.isActive && new Date(w.watchEndDate) > now
        );
    }

    updateWatch(id: string, updates: Partial<PriceWatch>): boolean {
        const watch = this.watches.get(id);
        if (!watch) return false;

        this.watches.set(id, { ...watch, ...updates });
        return true;
    }

    deleteWatch(id: string): boolean {
        return this.watches.delete(id);
    }

    createAlert(alertData: Omit<PriceAlert, 'id'>): PriceAlert {
        const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const alert: PriceAlert = {
            ...alertData,
            id,
        };

        this.alerts.set(id, alert);
        return alert;
    }

    getWatchAlerts(watchId: string): PriceAlert[] {
        return Array.from(this.alerts.values()).filter(a => a.watchId === watchId);
    }
}

export const priceWatchDB = new MockPriceWatchDB();
