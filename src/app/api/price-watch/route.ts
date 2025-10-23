import { NextRequest, NextResponse } from 'next/server';
import { priceWatchDB, PriceWatchRequest } from '@/lib/priceWatch';
import { priceMonitor } from '@/lib/priceMonitor';

export async function POST(req: NextRequest) {
    try {
        const body: PriceWatchRequest = await req.json();

        // Validate required fields
        const {
            origin,
            destination,
            adults,
            children = 0,
            seniors = 0,
            watchDuration,
            priceThreshold,
            notificationType,
            title
        } = body;

        if (!origin || !destination || !adults || !watchDuration || !priceThreshold || !notificationType || !title) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate notification contact info
        if (notificationType === 'email' || notificationType === 'both') {
            if (!body.email || !body.email.includes('@')) {
                return NextResponse.json(
                    { error: 'Valid email address required for email notifications' },
                    { status: 400 }
                );
            }
        }

        if (notificationType === 'sms' || notificationType === 'both') {
            if (!body.phone || body.phone.length < 10) {
                return NextResponse.json(
                    { error: 'Valid phone number required for SMS notifications' },
                    { status: 400 }
                );
            }
        }

        // Calculate watch period
        const now = new Date();
        const watchEndDate = new Date(now.getTime() + (watchDuration * 24 * 60 * 60 * 1000));

        // Get current baseline price (optional - could be from the flight card)
        let baselinePrice: number | undefined;
        try {
            // This would typically fetch current price from Amadeus
            // For now, we'll use a mock baseline
            baselinePrice = 500 + Math.random() * 800; // Mock price between $500-$1300
        } catch (error) {
            console.log('Could not fetch baseline price:', error);
        }

        // Create the price watch
        const watch = priceWatchDB.createWatch({
            userId: 'user_demo', // In production, get from auth session
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            departureDate: body.departureDate,
            returnDate: body.returnDate,
            adults,
            children,
            seniors,
            watchStartDate: now.toISOString(),
            watchEndDate: watchEndDate.toISOString(),
            priceThreshold,
            baselinePrice,
            targetPrice: body.targetPrice,
            notificationType,
            email: body.email,
            phone: body.phone,
            isActive: true,
            title,
            notes: body.notes,
        });

        console.log(`🔔 Price watch created: ${watch.title}`);
        console.log(`📊 Watching ${watch.origin} → ${watch.destination} for ${watchDuration} days`);
        console.log(`💰 Will notify on price changes ≥ $${priceThreshold}`);

        // Send confirmation email
        try {
            await priceMonitor.sendWatchConfirmation(watch);
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
            // Don't fail the watch creation if email fails
        }

        return NextResponse.json({
            success: true,
            watch: {
                id: watch.id,
                title: watch.title,
                route: `${watch.origin} → ${watch.destination}`,
                watchDuration,
                priceThreshold,
                baselinePrice: watch.baselinePrice,
                targetPrice: watch.targetPrice,
                notificationType: watch.notificationType,
                watchEndDate: watch.watchEndDate,
            }
        });

    } catch (error: any) {
        console.error('Price watch creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create price watch' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId') || 'user_demo';

        const watches = priceWatchDB.getUserWatches(userId);

        return NextResponse.json({
            watches: watches.map(w => ({
                id: w.id,
                title: w.title,
                route: `${w.origin} → ${w.destination}`,
                watchEndDate: w.watchEndDate,
                isActive: w.isActive,
                baselinePrice: w.baselinePrice,
                targetPrice: w.targetPrice,
                priceThreshold: w.priceThreshold,
                notificationType: w.notificationType,
                createdAt: w.createdAt,
                lastChecked: w.lastChecked,
            }))
        });

    } catch (error: any) {
        console.error('Get price watches error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get price watches' },
            { status: 500 }
        );
    }
}
