/**
 * Background Watch Monitor
 * 
 * This creates a background service that calls the /edge/watch/run endpoint
 * periodically to check all active watches automatically.
 * 
 * This runs only on the server side and starts when the server starts.
 */

let monitoringInterval: NodeJS.Timeout | null = null;
const MONITORING_FREQUENCY = 2 * 60 * 1000; // 2 minutes for development

async function runWatchMonitoring() {
    try {
        console.log('🔄 Running automatic watch monitoring...');
        
        // Use the existing sweep endpoint
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const sweepUrl = `${baseUrl}/edge/watch/run`;
        
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
            const errorText = await response.text();
            console.log(`⚠️ Automatic monitoring failed: ${response.status} - ${errorText}`);
        }

    } catch (error: any) {
        console.error('❌ Error in automatic monitoring:', error.message);
    }
}

// Only run on server side
if (typeof window === 'undefined' && typeof process !== 'undefined') {
    console.log('🚀 Starting background watch monitoring service...');
    console.log(`⏰ Monitoring frequency: every ${MONITORING_FREQUENCY / 1000} seconds`);
    
    // Initial check after 1 minute (let server fully start)
    setTimeout(() => {
        runWatchMonitoring();
    }, 60 * 1000);

    // Then check at configured frequency
    monitoringInterval = setInterval(() => {
        runWatchMonitoring();
    }, MONITORING_FREQUENCY);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            console.log('⏹️ Background watch monitoring stopped');
        }
    });

    process.on('SIGTERM', () => {
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            console.log('⏹️ Background watch monitoring stopped');
        }
    });
}

export { runWatchMonitoring };
