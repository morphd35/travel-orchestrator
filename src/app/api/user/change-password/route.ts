import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbQueries } from '@/lib/database';

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long')
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
        const validatedData = ChangePasswordSchema.parse(body);

        // Get user from database
        const user = dbQueries.getUserById.get(userId) as any;
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

        // Update password in database
        try {
            const updateQuery = `
                UPDATE users 
                SET password_hash = ?, updated_at = ?
                WHERE id = ?
            `;
            
            const stmt = require('better-sqlite3')(process.env.DATABASE_PATH || './data/travel_orchestrator.db')
                .prepare(updateQuery);
            
            const now = new Date().toISOString();
            stmt.run(newPasswordHash, now, userId);

            console.log(`✅ Password changed for user ${userId}`);

            return NextResponse.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (dbError) {
            console.warn(`⚠️ Could not update password in database (likely read-only): ${dbError}`);
            return NextResponse.json(
                { error: 'Database is currently read-only. Password changes are temporarily unavailable.' },
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

        console.error('❌ Change password error:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
