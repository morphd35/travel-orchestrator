import { NextRequest } from 'next/server';
import { sendEmail, sendTestEmail } from '@/lib/notifier';
import { renderFareEmail, renderFareEmailText } from '@/lib/templates/notifyFareDrop';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'test';
        const to = searchParams.get('to') || process.env.NOTIFY_TO;

        if (!to) {
            return Response.json(
                { error: 'No recipient specified. Set NOTIFY_TO env var or use ?to=email@example.com' },
                { status: 400 }
            );
        }

        if (action === 'test') {
            // Send simple test email
            const result = await sendTestEmail(to);

            return Response.json({
                success: true,
                message: 'Test email sent successfully',
                recipient: to,
                messageId: result.messageId,
                provider: result.provider,
            });

        } else if (action === 'fare') {
            // Send sample fare notification email
            const sampleData = {
                origin: 'NYC',
                destination: 'LAX',
                depart: '2025-12-15',
                returnDate: '2025-12-22',
                total: 299.99,
                currency: 'USD',
                carrier: 'AA',
                stops: { out: 0, back: 1 },
                deeplinkUrl: 'http://localhost:3010/?o=NYC&d=LAX&ds=2025-12-15&rs=2025-12-22',
                targetPrice: 350,
            };

            const result = await sendEmail({
                to,
                subject: `Fare drop: ${sampleData.origin} → ${sampleData.destination} $${sampleData.total}`,
                html: renderFareEmail(sampleData),
                text: renderFareEmailText(sampleData),
            });

            return Response.json({
                success: true,
                message: 'Sample fare notification sent successfully',
                recipient: to,
                messageId: result.messageId,
                provider: result.provider,
                sampleData,
            });

        } else {
            return Response.json(
                { error: 'Invalid action. Use ?action=test or ?action=fare' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('❌ Email test error:', error);

        return Response.json(
            {
                error: 'Email test failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
