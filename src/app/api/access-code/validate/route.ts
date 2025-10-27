import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load access requests from file
function loadAccessRequests() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'access-requests.json');
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading access requests:', error);
        return [];
    }
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

// POST - Validate access code
export async function POST(request: NextRequest) {
    try {
        const { accessCode } = await request.json();

        if (!accessCode) {
            return NextResponse.json(
                { valid: false, error: 'Access code required' },
                { status: 400 }
            );
        }

        // Check against static access codes first (for backwards compatibility)
        const ALLOWED_ACCESS_CODES = [
            'PARTNER-MH9OC91T-6XGAYK'
        ];

        if (ALLOWED_ACCESS_CODES.includes(accessCode)) {
            return NextResponse.json({ valid: true, type: 'static' });
        }

        // Check against dynamic access codes
        const isValid = isAccessCodeValid(accessCode);
        
        return NextResponse.json({ 
            valid: isValid, 
            type: isValid ? 'dynamic' : 'invalid' 
        });

    } catch (error) {
        console.error('Access code validation error:', error);
        return NextResponse.json(
            { valid: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
