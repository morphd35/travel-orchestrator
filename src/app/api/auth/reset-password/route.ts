import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbQueries, db } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Reset password request body:', body);
        
        const { email } = body;

        if (!email || !email.trim()) {
            console.log('No email provided in reset request');
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = dbQueries.getUserByEmail.get(email);
        
        if (!user) {
            // Don't reveal if email exists or not for security
            return NextResponse.json(
                { message: 'If an account with that email exists, a reset link has been sent.' },
                { status: 200 }
            );
        }

        // For demo purposes, we'll generate a temporary password
        // In production, you'd send an email with a secure reset link
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Update user's password
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
          .run(hashedPassword, email);

        // In a real app, you'd send this via email
        // For demo, we'll return it in the response
        console.log(`🔑 Temporary password for ${email}: ${tempPassword}`);

        return NextResponse.json({
            message: 'Password reset successful. Check console for temporary password.',
            tempPassword: tempPassword // Remove this in production!
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Password reset failed' },
            { status: 500 }
        );
    }
}
