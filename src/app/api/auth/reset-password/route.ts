import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbQueries, db } from '@/lib/database';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = dbQueries.getUserByEmail.get(email) as any;
        
        if (!user) {
            // Don't reveal if email exists or not for security
            return NextResponse.json(
                { message: 'If an account with that email exists, a password reset email has been sent.' },
                { status: 200 }
            );
        }

        // Generate a secure temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Update user's password
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
          .run(hashedPassword, email);

        // Send password reset email
        if (process.env.SENDGRID_API_KEY) {
            const msg = {
                to: email,
                from: process.env.SENDGRID_FROM_EMAIL || 'morphd35@gmail.com',
                subject: 'Travel Conductor - Password Reset',
                html: `
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                        <h2 style="color: #2563eb;">Password Reset - Travel Conductor</h2>
                        
                        <p>Hello ${user.first_name},</p>
                        
                        <p>We received a request to reset your password for your Travel Conductor account.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Your temporary password is:</strong></p>
                            <p style="font-size: 18px; font-weight: bold; color: #dc2626; letter-spacing: 2px; font-family: monospace;">
                                ${tempPassword}
                            </p>
                        </div>
                        
                        <p><strong>Next steps:</strong></p>
                        <ol>
                            <li>Go to <a href="https://www.travelconductor.com" style="color: #2563eb;">travelconductor.com</a></li>
                            <li>Sign in with your email and the temporary password above</li>
                            <li>Immediately change your password in your account settings</li>
                        </ol>
                        
                        <p style="color: #dc2626; font-weight: bold;">⚠️ Important Security Notes:</p>
                        <ul style="color: #4b5563;">
                            <li>This temporary password will work until you change it</li>
                            <li>Please change it immediately after signing in</li>
                            <li>If you didn't request this reset, please contact support</li>
                        </ul>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">
                        
                        <p style="color: #6b7280; font-size: 14px;">
                            This email was sent from Travel Conductor. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                    </div>
                `,
                text: `
Password Reset - Travel Conductor

Hello ${user.first_name},

We received a request to reset your password for your Travel Conductor account.

Your temporary password is: ${tempPassword}

Next steps:
1. Go to travelconductor.com
2. Sign in with your email and the temporary password above
3. Immediately change your password in your account settings

Important: Please change this temporary password immediately after signing in for security.

If you didn't request this reset, you can safely ignore this email.
                `
            };

            try {
                await sgMail.send(msg);
                console.log(`Password reset email sent to ${email}`);
            } catch (emailError) {
                console.error('Failed to send password reset email:', emailError);
                // Don't reveal email sending failure to prevent enumeration attacks
            }
        }

        return NextResponse.json({
            message: 'If an account with that email exists, a password reset email has been sent.'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Password reset failed' },
            { status: 500 }
        );
    }
}
