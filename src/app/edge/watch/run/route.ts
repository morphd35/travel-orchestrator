import { NextRequest, NextResponse } from 'next/server';
import { listWatches } from '@/lib/watchStore';

// Import trigger functionality directly
async function triggerWatchInternal(watchId: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
        // Call the trigger route internally
        const triggerUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/edge/watch/${watchId}/trigger`;

        const response = await fetch(triggerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'sweep-runner/1.0'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `HTTP ${response.status}: ${errorText}` };
        }

        const result = await response.json();
        return { success: true, result };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * POST /edge/watch/run
 * Sweep endpoint to run all active watches
 */
export async function POST(req: NextRequest) {
    const startTime = new Date();

    try {
        console.log('🧹 Starting watch sweep at', startTime.toISOString());

        // Load all watches for anonymous user (for now)
        const allWatches = listWatches('anon');
        const activeWatches = allWatches.filter(w => w.active);

        console.log(`📊 Found ${allWatches.length} total watches, ${activeWatches.length} active`);

        if (activeWatches.length === 0) {
            return NextResponse.json({
                success: true,
                summary: {
                    total: 0,
                    notified: 0,
                    noop: 0,
                    errors: 0
                },
                timestamp: startTime.toISOString(),
                duration: Date.now() - startTime.getTime()
            });
        }

        let notified = 0;
        let noop = 0;
        let errors = 0;
        const results: any[] = [];

        // Process each active watch
        for (const watch of activeWatches) {
            console.log(`🔍 Processing watch: ${watch.id} (${watch.origin} → ${watch.destination})`);

            const triggerResult = await triggerWatchInternal(watch.id);

            if (triggerResult.success) {
                const result = triggerResult.result;
                results.push({
                    watchId: watch.id,
                    route: `${watch.origin} → ${watch.destination}`,
                    success: true,
                    action: result.action || 'unknown',
                    priceChange: result.priceChange,
                    currentPrice: result.currentPrice
                });

                if (result.action === 'NOTIFY') {
                    notified++;
                    console.log(`📧 Notification sent for ${watch.origin} → ${watch.destination}`);
                } else {
                    noop++;
                    console.log(`✅ No action needed for ${watch.origin} → ${watch.destination}`);
                }
            } else {
                errors++;
                results.push({
                    watchId: watch.id,
                    route: `${watch.origin} → ${watch.destination}`,
                    success: false,
                    error: triggerResult.error
                });
                console.log(`❌ Error processing ${watch.origin} → ${watch.destination}: ${triggerResult.error}`);
            }

            // Small delay between requests to avoid overwhelming APIs
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const summary = {
            total: activeWatches.length,
            notified,
            noop,
            errors
        };

        console.log(`🧹 Sweep completed in ${duration}ms:`, summary);

        return NextResponse.json({
            success: true,
            summary,
            timestamp: startTime.toISOString(),
            duration,
            results: results.length <= 10 ? results : results.slice(0, 10) // Limit results in response
        });

    } catch (error: any) {
        console.error('❌ Sweep failed:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            timestamp: startTime.toISOString(),
            duration: Date.now() - startTime.getTime()
        }, { status: 500 });
    }
}

/**
 * GET /edge/watch/run
 * Get information about the sweep endpoint
 */
export async function GET(req: NextRequest) {
    const allWatches = listWatches('anon');
    const activeWatches = allWatches.filter(w => w.active);

    return NextResponse.json({
        info: 'Watch sweep endpoint - POST to run all active watches',
        stats: {
            totalWatches: allWatches.length,
            activeWatches: activeWatches.length,
            lastRun: null // Could store this in a database/cache
        },
        schedule: {
            target: '09:00 and 16:00 America/Chicago',
            timezone: 'America/Chicago'
        }
    });
}
