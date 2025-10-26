import { NextRequest, NextResponse } from 'next/server';
import { userProfileManager } from '@/lib/databaseUserProfileManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const bookings = userProfileManager.getBookingHistory(userId);
    return NextResponse.json({ bookings });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, booking } = await request.json();

    if (!userId || !booking) {
      return NextResponse.json({ error: 'User ID and booking data are required' }, { status: 400 });
    }

    userProfileManager.addBookingToHistory(userId, booking);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving booking:', error);
    return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
  }
}
