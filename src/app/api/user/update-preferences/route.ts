import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const UpdatePreferencesSchema = z.object({
    preferredAirlines: z.array(z.string()).default([]),
    preferredAirports: z.array(z.string()).default([]),
    seatPreference: z.enum(['aisle', 'window', 'middle']).default('aisle'),
    mealPreference: z.string().default('standard')
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(request: NextRequest) {
    try {
        // Get auth token from cookie
        const authToken = request.cookies.get('auth_token')?.value;
        if (!authToken) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify JWT token
        let userId: string;
        try {
            const decoded = jwt.verify(authToken, JWT_SECRET) as any;
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = UpdatePreferencesSchema.parse(body);

        // Update user preferences
        try {
            const updateQuery = `
                UPDATE users 
                SET preferred_airlines = ?, 
                    preferred_airports = ?, 
                    seat_preference = ?, 
                    meal_preference = ?, 
                    updated_at = ?
                WHERE id = ?
            `;
            
            const stmt = require('better-sqlite3')(process.env.DATABASE_PATH || './data/travel_orchestrator.db')
                .prepare(updateQuery);
            
            const now = new Date().toISOString();
            stmt.run(
                JSON.stringify(validatedData.preferredAirlines),
                JSON.stringify(validatedData.preferredAirports),
                validatedData.seatPreference,
                validatedData.mealPreference,
                now,
                userId
            );

            console.log(`✅ Preferences updated for user ${userId}`);

            return NextResponse.json({
                success: true,
                message: 'Preferences updated successfully'
            });

        } catch (dbError) {
            console.warn(`⚠️ Could not update preferences in database (likely read-only): ${dbError}`);
            return NextResponse.json(
                { error: 'Database is currently read-only. Preference updates are temporarily unavailable.' },
                { status: 503 }
            );
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        console.error('❌ Update preferences error:', error);
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        );
    }
}
