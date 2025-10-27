import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { dbQueries } from '@/lib/database';

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

        // Emergency access for locked-out user - temporary bypass
        let isPasswordValid = false;

        // Temporary emergency password for morphd335@yahoo.com
        if (validatedData.email === 'morphd335@yahoo.com' && validatedData.password === 'EMERGENCY123') {
            isPasswordValid = true;
            console.log(`✅ Emergency access granted for ${validatedData.email}`);
        } else {
            // Check for deterministic temporary password (works across serverless function calls)
            // Generate the same temporary password that would have been created in the last 15 minutes
            const currentTimestamp = Math.floor(Date.now() / (15 * 60 * 1000));
            const previousTimestamp = currentTimestamp - 1; // Also check previous 15-minute window

            console.log(`Sign-in attempt for ${validatedData.email} with password: ${validatedData.password}`);
            console.log(`Current timestamp: ${currentTimestamp}, Previous: ${previousTimestamp}`);

            for (const timestamp of [currentTimestamp, previousTimestamp]) {
                const tempPasswordSeed = `${validatedData.email}-${timestamp}-${process.env.JWT_SECRET}`;
                const expectedTempPassword = require('crypto').createHash('md5').update(tempPasswordSeed).digest('hex').slice(0, 8).toUpperCase();

                console.log(`Checking timestamp ${timestamp}: expected password = ${expectedTempPassword}`);

                if (validatedData.password === expectedTempPassword) {
                    isPasswordValid = true;
                    console.log(`✅ User ${validatedData.email} logged in with temporary password (timestamp: ${timestamp})`);
                    break;
                }
            }
        }

        // If not a temp password, check regular password
        if (!isPasswordValid) {
            console.log(`Checking regular password for ${validatedData.email}`);
            isPasswordValid = await bcrypt.compare(validatedData.password, user.password_hash);
            console.log(`Regular password match: ${isPasswordValid}`);

            // If regular password doesn't match, check for JWT-stored password (for read-only DB workaround)
            if (!isPasswordValid) {
                const authToken = request.cookies.get('auth_token')?.value;
                if (authToken) {
                    try {
                        const decoded = jwt.verify(authToken, JWT_SECRET) as any;
                        if (decoded.passwordHash && decoded.email === validatedData.email) {
                            const jwtPasswordMatch = await bcrypt.compare(validatedData.password, decoded.passwordHash);
                            if (jwtPasswordMatch) {
                                isPasswordValid = true;
                                console.log(`✅ Password matched JWT-stored hash for ${validatedData.email}`);
                            }
                        }
                    } catch (jwtError) {
                        console.log(`JWT token invalid or expired: ${jwtError}`);
                    }
                }
            }
        }

        if (!isPasswordValid) {
            console.log(`❌ Password validation failed for ${validatedData.email}`);
            console.log(`Provided password: "${validatedData.password}"`);
            console.log(`Expected temp passwords were logged above`);
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

        // Store session in database (only if database is writable)
        try {
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
            console.log(`✅ Session created for ${user.email}`);
        } catch (sessionError) {
            console.warn(`⚠️ Could not create session in database (likely read-only): ${sessionError}`);
            // Continue anyway - token-based auth will still work
        }

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
