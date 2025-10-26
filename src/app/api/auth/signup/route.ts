import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { dbQueries } from '@/lib/database';

const SignUpSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional()
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = SignUpSchema.parse(body);

        // Check if user already exists
        const existingUser = dbQueries.getUserByEmail.get(validatedData.email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(validatedData.password, 12);

        // Create user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        dbQueries.createUser.run(
            userId,
            validatedData.email,
            passwordHash,
            validatedData.firstName,
            validatedData.lastName,
            validatedData.phone || null,
            now,
            now
        );

        // Create JWT token
        const token = jwt.sign(
            { userId, email: validatedData.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Store session in database
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tokenHash = await bcrypt.hash(token, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        dbQueries.createSession.run(
            sessionId,
            userId,
            tokenHash,
            expiresAt,
            now
        );

        // Return user data (without password)
        const user = {
            id: userId,
            email: validatedData.email,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone || undefined,
            isAuthenticated: true,
            preferences: {
                preferredAirlines: [],
                preferredAirports: [],
                seatPreference: 'aisle',
                mealPreference: 'standard'
            }
        };

        console.log(`✅ User created: ${validatedData.email}`);

        const response = NextResponse.json({
            success: true,
            user,
            message: 'Account created successfully'
        });

        // Set HTTP-only cookie for token
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        console.error('❌ Sign up error:', error);
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
