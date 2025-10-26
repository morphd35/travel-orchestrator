import { NextRequest, NextResponse } from 'next/server';
import { userProfileManager } from '@/lib/databaseUserProfileManager';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const searches = userProfileManager.getRecentSearches(userId);
        return NextResponse.json({ searches });

    } catch (error) {
        console.error('Error fetching searches:', error);
        return NextResponse.json({ error: 'Failed to fetch searches' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, search } = await request.json();

        if (!userId || !search) {
            return NextResponse.json({ error: 'User ID and search data are required' }, { status: 400 });
        }

        userProfileManager.addRecentSearch(userId, search);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving search:', error);
        return NextResponse.json({ error: 'Failed to save search' }, { status: 500 });
    }
}
