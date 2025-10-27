/**
 * Background Watch Monitor
 * 
 * This creates a background service that calls the /edge/watch/run endpoint
 * periodically to check all active watches automatically.
 * 
 * This runs only on the server side and starts when the server starts.
 */

let monitoringInterval: NodeJS.Timeout | null = null;
let isMonitoringStarted = false; // Prevent multiple instances
const MONITORING_FREQUENCY = 30 * 60 * 1000; // 30 minutes for production

async function runWatchMonitoring() {
    try {
        console.log('🔄 Running automatic watch monitoring...');

        // Use the existing sweep endpoint
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const sweepUrl = `${baseUrl}/edge/watch/run`;

        // Quick health check first in development
        if (process.env.NODE_ENV === 'development') {
            try {
                const healthCheck = await fetch(`${baseUrl}/health`, {
                    method: 'GET',
                    headers: { 'User-Agent': 'background-monitor/health-check' }
                });
                if (!healthCheck.ok) {
                    console.log('⚠️ Skipping monitoring - server not ready');
                    return;
                }
            } catch (error) {
                console.log('⚠️ Skipping monitoring - server unreachable');
                return;
            }
        }

        const response = await fetch(sweepUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'background-monitor/1.0'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Automatic monitoring completed: ${result.summary?.total || 0} watches processed`);
            if (result.summary?.notified > 0) {
                console.log(`📧 ${result.summary.notified} notifications sent`);
            }
        } else {
            // Don't log full HTML for 404s during development - just log status
            if (response.status === 404) {
                console.log(`⚠️ Automatic monitoring failed: ${response.status} (endpoint unavailable - likely during server restart)`);
            } else {
                const errorText = await response.text();
                console.log(`⚠️ Automatic monitoring failed: ${response.status} - ${errorText.substring(0, 200)}...`);
            }
        }

    } catch (error: any) {
        console.error('❌ Error in automatic monitoring:', error.message);
    }
}

// Only run on server side and prevent multiple instances
if (typeof window === 'undefined' && typeof process !== 'undefined' && !isMonitoringStarted) {
    isMonitoringStarted = true;

    console.log('🚀 Starting background watch monitoring service...');
    console.log(`⏰ Monitoring frequency: every ${MONITORING_FREQUENCY / 60 / 1000} minutes`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'unknown'}`);
    console.log(`🔗 Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`);

    // Initial check after 2 minutes in development, 5 minutes in production (let server fully start and stabilize)
    const initialDelay = process.env.NODE_ENV === 'development' ? 2 * 60 * 1000 : 5 * 60 * 1000;
    setTimeout(() => {
        runWatchMonitoring();
    }, initialDelay);

    // Then check at configured frequency
    monitoringInterval = setInterval(() => {
        runWatchMonitoring();
    }, MONITORING_FREQUENCY);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            isMonitoringStarted = false;
            console.log('⏹️ Background watch monitoring stopped');
        }
    });

    process.on('SIGTERM', () => {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            isMonitoringStarted = false;
            console.log('⏹️ Background watch monitoring stopped');
        }
    });
}

export { runWatchMonitoring };
