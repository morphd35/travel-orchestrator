import { NextRequest, NextResponse } from 'next/server';
import { userProfileManager } from '@/lib/databaseUserProfileManager';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const profiles = userProfileManager.getPassengerProfiles(userId);
        return NextResponse.json({ profiles });

    } catch (error) {
        console.error('Error fetching passenger profiles:', error);
        return NextResponse.json({ error: 'Failed to fetch passenger profiles' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, profile } = await request.json();

        if (!userId || !profile) {
            return NextResponse.json({ error: 'User ID and profile data are required' }, { status: 400 });
        }

        userProfileManager.savePassengerProfile(userId, profile);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving passenger profile:', error);
        return NextResponse.json({ error: 'Failed to save passenger profile' }, { status: 500 });
    }
}
