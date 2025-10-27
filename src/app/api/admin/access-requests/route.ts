import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const ACCESS_REQUESTS_FILE = path.join(process.cwd(), 'data', 'access-requests.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Load existing requests
function loadAccessRequests() {
    try {
        if (fs.existsSync(ACCESS_REQUESTS_FILE)) {
            const data = fs.readFileSync(ACCESS_REQUESTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading access requests:', error);
    }
    return [];
}

// Save access requests
function saveAccessRequests(requests: any[]) {
    try {
        const dataDir = path.dirname(ACCESS_REQUESTS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(ACCESS_REQUESTS_FILE, JSON.stringify(requests, null, 2));
    } catch (error) {
        console.error('Error saving access requests:', error);
    }
}

// Generate access code
function generateAccessCode() {
    return `partner-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
}

// Check if an access code is still valid (exists and not expired)
function isAccessCodeValid(accessCode: string): boolean {
    try {
        const requests = loadAccessRequests();
        const approvedRequest = requests.find((req: any) => 
            req.status === 'approved' && 
            req.accessCode === accessCode &&
            req.accessCodeExpiresAt
        );

        if (!approvedRequest) {
            return false;
        }

        const expirationDate = new Date(approvedRequest.accessCodeExpiresAt);
        const now = new Date();
        
        return now < expirationDate;
    } catch (error) {
        console.error('Error checking access code validity:', error);
        return false;
    }
}

// Check if user is admin
function isAdmin(request: NextRequest): boolean {
    try {
        const authToken = request.cookies.get('auth_token')?.value;
        if (!authToken) return false;

        const decoded = jwt.verify(authToken, JWT_SECRET) as any;
        return decoded.email === 'morphd335@yahoo.com';
    } catch {
        return false;
    }
}

// GET - Load all access requests (admin only)
export async function GET(request: NextRequest) {
    if (!isAdmin(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const requests = loadAccessRequests();
        return NextResponse.json({
            success: true,
            requests: requests.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        });
    } catch (error) {
        console.error('Error loading access requests:', error);
        return NextResponse.json(
            { error: 'Failed to load access requests' },
            { status: 500 }
        );
    }
}

// PUT - Approve or deny access request (admin only)
export async function PUT(request: NextRequest) {
    if (!isAdmin(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { requestId, action, reason } = await request.json();

        if (!requestId || !action || !['approve', 'deny'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request parameters' },
                { status: 400 }
            );
        }

        const requests = loadAccessRequests();
        const requestIndex = requests.findIndex((req: any) => req.id === requestId);

        if (requestIndex === -1) {
            return NextResponse.json(
                { error: 'Access request not found' },
                { status: 404 }
            );
        }

        const accessRequest = requests[requestIndex];

        if (accessRequest.status !== 'pending') {
            return NextResponse.json(
                { error: 'Access request has already been processed' },
                { status: 400 }
            );
        }

        // Update request status
        const now = new Date().toISOString();
        accessRequest.status = action === 'approve' ? 'approved' : 'denied';
        accessRequest.processedAt = now;
        accessRequest.processedBy = 'morphd335@yahoo.com';

        if (reason) {
            accessRequest.reason = reason;
        }

        if (action === 'approve') {
            // Generate access code with expiration
            accessRequest.accessCode = generateAccessCode();
            accessRequest.accessCodeCreatedAt = now;
            // Set expiration to 7 days from creation
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            accessRequest.accessCodeExpiresAt = expirationDate.toISOString();
        }

        // Save updated requests
        saveAccessRequests(requests);

        // Send email notification to requester
        if (process.env.SENDGRID_API_KEY) {
            try {
                const isApproved = action === 'approve';
                const subject = isApproved 
                    ? '✅ Access Approved - Welcome to Travel Conductor!'
                    : '❌ Access Request Update - Travel Conductor';

                const emailContent = isApproved ? `
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #16a34a; margin-bottom: 10px;">🎉 Welcome to Travel Conductor!</h1>
                            <p style="font-size: 18px; color: #374151;">Your access request has been approved</p>
                        </div>

                        <div style="background-color: #f0fdf4; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                            <h2 style="color: #15803d; margin-top: 0;">Your Access Code</h2>
                            <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
                                <code style="font-size: 24px; font-weight: bold; color: #14532d; letter-spacing: 2px;">
                                    ${accessRequest.accessCode}
                                </code>
                            </div>
                            <p style="color: #166534; margin-bottom: 0;">
                                <strong>Keep this code secure!</strong> You'll need it to access the platform.
                            </p>
                        </div>

                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                            <h3 style="color: #1e293b; margin-top: 0;">Next Steps:</h3>
                            <ol style="color: #475569; line-height: 1.6;">
                                <li>Visit <a href="https://www.travelconductor.com/access" style="color: #2563eb;">travelconductor.com/access</a></li>
                                <li>Enter your access code: <strong>${accessRequest.accessCode}</strong></li>
                                <li>Start exploring our travel platform</li>
                                <li>Create an account or sign in to get started</li>
                            </ol>
                        </div>

                        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <p style="color: #1e40af; margin: 0; font-size: 14px;">
                                <strong>Need help?</strong> Reply to this email or contact us through the platform.
                            </p>
                        </div>

                        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                Thanks for your interest in Travel Conductor!<br>
                                <strong>The Travel Conductor Team</strong>
                            </p>
                        </div>
                    </div>
                ` : `
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                        <h1 style="color: #dc2626;">Access Request Update</h1>
                        
                        <p>Hi ${accessRequest.name},</p>
                        
                        <p>Thank you for your interest in Travel Conductor. After reviewing your request, we're unable to provide access at this time.</p>
                        
                        ${reason ? `
                            <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${reason}</p>
                            </div>
                        ` : ''}
                        
                        <p>We may reconsider requests in the future as we expand our partner program. Feel free to apply again later.</p>
                        
                        <p>Best regards,<br>The Travel Conductor Team</p>
                    </div>
                `;

                await sgMail.send({
                    to: accessRequest.email,
                    from: process.env.SENDGRID_FROM_EMAIL || 'morphd35@gmail.com',
                    subject,
                    html: emailContent
                });

                console.log(`✅ ${isApproved ? 'Approval' : 'Denial'} email sent to ${accessRequest.email}`);
            } catch (emailError) {
                console.error('Failed to send notification email:', emailError);
            }
        }

        console.log(`✅ Access request ${action}d:`, {
            id: requestId,
            email: accessRequest.email,
            action,
            ...(action === 'approve' && { accessCode: accessRequest.accessCode })
        });

        return NextResponse.json({
            success: true,
            message: `Access request ${action}d successfully`,
            request: accessRequest
        });

    } catch (error) {
        console.error('Error processing access request:', error);
        return NextResponse.json(
            { error: 'Failed to process access request' },
            { status: 500 }
        );
    }
}
