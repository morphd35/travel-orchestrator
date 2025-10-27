import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQueries } from '@/lib/database';
import jwt from 'jsonwebtoken';

const UpdateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional()
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
        const validatedData = UpdateProfileSchema.parse(body);

        // Check if email is already taken by another user
        const existingUser = dbQueries.getUserByEmail.get(validatedData.email) as any;
        if (existingUser && existingUser.id !== userId) {
            return NextResponse.json(
                { error: 'Email is already in use by another account' },
                { status: 400 }
            );
        }

        // Update user profile
        try {
            const updateQuery = `
                UPDATE users 
                SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = ?
                WHERE id = ?
            `;
            
            const stmt = require('better-sqlite3')(process.env.DATABASE_PATH || './data/travel_orchestrator.db')
                .prepare(updateQuery);
            
            const now = new Date().toISOString();
            stmt.run(
                validatedData.firstName,
                validatedData.lastName,
                validatedData.email,
                validatedData.phone || null,
                now,
                userId
            );

            console.log(`✅ Profile updated for user ${userId}`);

            return NextResponse.json({
                success: true,
                message: 'Profile updated successfully'
            });

        } catch (dbError) {
            console.warn(`⚠️ Could not update profile in database (likely read-only): ${dbError}`);
            return NextResponse.json(
                { error: 'Database is currently read-only. Profile updates are temporarily unavailable.' },
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

        console.error('❌ Update profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
