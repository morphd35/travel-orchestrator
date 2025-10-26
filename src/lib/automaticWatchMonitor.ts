/**
 * Automatic Watch Monitoring Service
 * 
 * This service runs automatic price checks for all active watches
 * using the new edge/watch system (watchStore.ts)
 */

import { listWatches } from './watchStore';

class AutomaticWatchMonitor {
    private monitoringInterval: NodeJS.Timeout | null = null;
    private readonly MONITORING_FREQUENCY = 2 * 60 * 1000; // 2 minutes for development
    private readonly BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

    constructor() {
        // Only run on server side
        if (typeof window === 'undefined') {
            this.startMonitoring();
        }
    }

    private startMonitoring(): void {
        console.log('🚀 Starting automatic watch monitoring service...');
        console.log(`⏰ Monitoring frequency: every ${this.MONITORING_FREQUENCY / 1000} seconds`);

        // Initial check after 30 seconds (let server fully start)
        setTimeout(() => {
            this.runMonitoringCycle();
        }, 30 * 1000);

        // Then check at configured frequency
        this.monitoringInterval = setInterval(() => {
            this.runMonitoringCycle();
        }, this.MONITORING_FREQUENCY);
    }

    private async runMonitoringCycle(): Promise<void> {
        try {
            console.log('🔄 Running automatic watch monitoring cycle...');

            // Get all watches for anonymous user (default user)
            const allWatches = listWatches('anon');
            const activeWatches = allWatches.filter(w => w.active);

            console.log(`📊 Found ${allWatches.length} total watches, ${activeWatches.length} active`);

            if (activeWatches.length === 0) {
                console.log('💤 No active watches to monitor');
                return;
            }

            // Process each active watch
            for (const watch of activeWatches) {
                try {
                    console.log(`🔍 Auto-checking watch: ${watch.id} (${watch.origin} → ${watch.destination})`);

                    // Call the trigger endpoint for this watch
                    const triggerUrl = `${this.BASE_URL}/edge/watch/${watch.id}/trigger`;

                    const response = await fetch(triggerUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'automatic-monitor/1.0'
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log(`✅ Auto-check completed for ${watch.origin} → ${watch.destination}: ${result.action || 'no action'}`);
                    } else {
                        const errorText = await response.text();
                        console.log(`⚠️ Auto-check failed for ${watch.origin} → ${watch.destination}: ${response.status} - ${errorText}`);
                    }

                } catch (error: any) {
                    console.error(`❌ Error auto-checking watch ${watch.id}:`, error.message);
                }

                // Small delay between requests to avoid overwhelming APIs
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log('🔄 Automatic monitoring cycle completed');

        } catch (error: any) {
            console.error('❌ Error in automatic monitoring cycle:', error.message);
        }
    }

    public stopMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('⏹️ Automatic watch monitoring stopped');
        }
    }

    public async triggerManualCheck(): Promise<void> {
        console.log('🔄 Manual monitoring cycle triggered...');
        await this.runMonitoringCycle();
    }
}

// Export singleton instance
export const automaticWatchMonitor = new AutomaticWatchMonitor();

// Handle graceful shutdown
if (typeof process !== 'undefined') {
    process.on('SIGINT', () => {
        automaticWatchMonitor.stopMonitoring();
    });

    process.on('SIGTERM', () => {
        automaticWatchMonitor.stopMonitoring();
    });
}
