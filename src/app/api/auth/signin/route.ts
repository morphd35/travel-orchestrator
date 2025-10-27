import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { dbQueries } from '@/lib/database';
import { getTempPassword, clearTempPassword } from '@/lib/tempPasswordStore';

const SignInSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = SignInSchema.parse(body);

        // Find user by email
        const user = dbQueries.getUserByEmail.get(validatedData.email) as any;
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check for temporary password first (for password reset)
        const tempPassword = getTempPassword(validatedData.email);
        let isPasswordValid = false;
        
        if (tempPassword) {
            // Check if the provided password matches the temporary password
            isPasswordValid = await bcrypt.compare(validatedData.password, tempPassword);
            if (isPasswordValid) {
                // Clear the temporary password after successful login
                clearTempPassword(validatedData.email);
                console.log(`User ${validatedData.email} logged in with temporary password`);
            }
        }
        
        // If not a temp password, check regular password
        if (!isPasswordValid) {
            isPasswordValid = await bcrypt.compare(validatedData.password, user.password_hash);
        }
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Store session in database
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tokenHash = await bcrypt.hash(token, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
        const now = new Date().toISOString();

        dbQueries.createSession.run(
            sessionId,
            user.id,
            tokenHash,
            expiresAt,
            now
        );

        // Return user data (without password)
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone || undefined,
            isAuthenticated: true,
            preferences: {
                preferredAirlines: JSON.parse(user.preferred_airlines || '[]'),
                preferredAirports: JSON.parse(user.preferred_airports || '[]'),
                seatPreference: user.seat_preference || 'aisle',
                mealPreference: user.meal_preference || 'standard'
            }
        };

        console.log(`✅ User signed in: ${user.email}`);

        const response = NextResponse.json({
            success: true,
            user: userData,
            message: 'Signed in successfully'
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

        console.error('❌ Sign in error:', error);
        return NextResponse.json(
            { error: 'Failed to sign in' },
            { status: 500 }
        );
    }
}
