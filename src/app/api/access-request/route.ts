import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, message } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Log the access request (in production, you'd save to database/send email)
        console.log('Access Request:', {
            email,
            message,
            timestamp: new Date().toISOString(),
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent')
        });

        // In production, you could:
        // 1. Save to database
        // 2. Send email notification
        // 3. Integrate with CRM
        // 4. Add to mailing list

        return NextResponse.json(
            { success: true, message: 'Access request received' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Access request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: 'Access request endpoint - POST only' },
        { status: 405 }
    );
}
