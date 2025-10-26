import { NextRequest, NextResponse } from 'next/server';
import { userProfileManager } from '@/lib/databaseUserProfileManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const watches = userProfileManager.getUserWatches(userId);
    return NextResponse.json({ watches });

  } catch (error) {
    console.error('Error fetching user watches:', error);
    return NextResponse.json({ error: 'Failed to fetch user watches' }, { status: 500 });
  }
}
