import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const ACCESS_REQUESTS_FILE = path.join(process.cwd(), 'data', 'access-requests.json');

// Ensure data directory exists
const dataDir = path.dirname(ACCESS_REQUESTS_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

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
        fs.writeFileSync(ACCESS_REQUESTS_FILE, JSON.stringify(requests, null, 2));
    } catch (error) {
        console.error('Error saving access requests:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email, message, company, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email and name are required' },
                { status: 400 }
            );
        }

        // Create access request record
        const accessRequest = {
            id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: email.toLowerCase().trim(),
            name: name.trim(),
            company: company?.trim() || '',
            message: message?.trim() || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        };

        // Load existing requests and check for duplicates
        const existingRequests = loadAccessRequests();
        const existingRequest = existingRequests.find((req: any) => req.email === accessRequest.email);

        if (existingRequest && existingRequest.status === 'pending') {
            return NextResponse.json(
                { error: 'An access request with this email is already pending review' },
                { status: 400 }
            );
        }

        // Add new request
        existingRequests.push(accessRequest);
        saveAccessRequests(existingRequests);

        // Send email notification to owner
        if (process.env.SENDGRID_API_KEY) {
            try {
                const ownerEmail = process.env.OWNER_EMAIL || 'morphd335@yahoo.com';
                const adminUrl = `${request.headers.get('origin') || 'https://www.travelconductor.com'}/admin/access-requests`;

                await sgMail.send({
                    to: ownerEmail,
                    from: process.env.SENDGRID_FROM_EMAIL || 'morphd35@gmail.com',
                    subject: '🔔 New Access Request - Travel Conductor',
                    html: `
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                            <h1 style="color: #2563eb; margin-bottom: 20px;">New Access Request</h1>
                            
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                <h2 style="margin-top: 0; color: #1e293b;">Request Details</h2>
                                <p><strong>Name:</strong> ${accessRequest.name}</p>
                                <p><strong>Email:</strong> ${accessRequest.email}</p>
                                ${accessRequest.company ? `<p><strong>Company:</strong> ${accessRequest.company}</p>` : ''}
                                <p><strong>Request ID:</strong> ${accessRequest.id}</p>
                                <p><strong>Submitted:</strong> ${new Date(accessRequest.createdAt).toLocaleString()}</p>
                            </div>

                            ${accessRequest.message ? `
                                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                    <h3 style="margin-top: 0; color: #92400e;">Message:</h3>
                                    <p style="margin-bottom: 0; color: #451a03;">${accessRequest.message}</p>
                                </div>
                            ` : ''}

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${adminUrl}" 
                                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Review Access Requests
                                </a>
                            </div>

                            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 14px; color: #475569;">
                                <p><strong>IP Address:</strong> ${accessRequest.ip}</p>
                                <p><strong>User Agent:</strong> ${accessRequest.userAgent}</p>
                            </div>
                        </div>
                    `
                });

                console.log(`✅ Access request notification sent to ${ownerEmail}`);
            } catch (emailError) {
                console.error('Failed to send access request notification:', emailError);
            }
        }

        console.log('✅ Access Request Created:', {
            id: accessRequest.id,
            email: accessRequest.email,
            name: accessRequest.name,
            company: accessRequest.company
        });

        return NextResponse.json({
            success: true,
            message: 'Access request submitted successfully! We\'ll review it and get back to you within 24 hours.',
            requestId: accessRequest.id
        });

    } catch (error) {
        console.error('Access request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: 'Access request endpoint - POST only' },
        { status: 405 }
    );
}
