#!/usr/bin/env ts-node

/**
 * Cron Sweep Worker
 * 
 * Runs all active flight price watches by calling the sweep endpoint.
 * Designed to be run on a scheduler (e.g., Emergent's cron) at:
 * - 09:00 America/Chicago
 * - 16:00 America/Chicago
 * 
 * Usage:
 *   ts-node scripts/cron-sweep.ts
 *   node scripts/cron-sweep.js (if compiled)
 * 
 * Environment Variables:
 *   BASE_URL - The base URL of the travel conductor (default: http://localhost:3000)
 */

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const SWEEP_ENDPOINT = `${BASE_URL}/edge/watch/run`;

interface SweepResult {
    success: boolean;
    summary?: {
        total: number;
        notified: number;
        noop: number;
        errors: number;
    };
    timestamp?: string;
    duration?: number;
    error?: string;
}

async function runSweep(): Promise<SweepResult> {
    const startTime = new Date();

    console.log(`🧹 Starting watch sweep at ${startTime.toISOString()}`);
    console.log(`📡 Calling: ${SWEEP_ENDPOINT}`);

    try {
        const response = await fetch(SWEEP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'cron-sweep/1.0'
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(300000) // 5 minute timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json() as SweepResult;

        const endTime = new Date();
        const totalDuration = endTime.getTime() - startTime.getTime();

        console.log(`✅ Sweep completed successfully in ${totalDuration}ms`);

        if (result.summary) {
            console.log(`📊 Results: ${result.summary.total} watches processed`);
            console.log(`📧 Notifications sent: ${result.summary.notified}`);
            console.log(`✅ No action needed: ${result.summary.noop}`);
            console.log(`❌ Errors: ${result.summary.errors}`);
        }

        return result;

    } catch (error: any) {
        const endTime = new Date();
        const totalDuration = endTime.getTime() - startTime.getTime();

        console.error(`❌ Sweep failed after ${totalDuration}ms:`, error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

async function main() {
    console.log('🚀 Travel Conductor - Cron Sweep Worker');
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log('');

    try {
        const result = await runSweep();

        // Output final result as JSON for logging/monitoring
        console.log('');
        console.log('📋 Final Result:');
        console.log(JSON.stringify(result, null, 2));

        // Exit with appropriate code
        process.exit(result.success ? 0 : 1);

    } catch (error: any) {
        console.error('💥 Fatal error:', error.message);
        console.log('');
        console.log('📋 Final Result:');
        console.log(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, null, 2));

        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(1);
});

// Run if this script is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { runSweep, main };
