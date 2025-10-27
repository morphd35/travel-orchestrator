import { NextRequest, NextResponse } from 'next/server';
import { dbQueries, db } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        // Check specific user
        const user = dbQueries.getUserByEmail.get('morphd335@yahoo.com') as any;

        // Get all users (for debugging)
        const allUsers = db.prepare('SELECT email, first_name, last_name, created_at FROM users LIMIT 10').all();

        return NextResponse.json({
            message: 'Database status',
            targetUser: user ? 'exists' : 'not found',
            userDetails: user ? { email: user.email, firstName: user.first_name } : null,
            totalUsers: allUsers.length,
            allUsers: allUsers
        });
    } catch (error) {
        console.error('Database check error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Database check failed',
            details: errorMessage
        }, { status: 500 });
    }
}
