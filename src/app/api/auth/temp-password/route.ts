import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Generate a simple temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

        // Create a temporary token that contains the password info
        const tempToken = jwt.sign({
            email: email.trim(),
            tempPassword: tempPassword,
            type: 'temp_password',
            exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
        }, JWT_SECRET);

        console.log(`Generated temp password for ${email}: ${tempPassword}`);
        console.log(`Temp token: ${tempToken.substring(0, 20)}...`);

        return NextResponse.json({
            message: 'Temporary password generated',
            tempPassword: tempPassword,
            tempToken: tempToken
        });

    } catch (error) {
        console.error('Temp password generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate temporary password' },
            { status: 500 }
        );
    }
}
