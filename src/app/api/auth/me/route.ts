import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbQueries, db } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Remove session from database by finding matching hash
    const allSessions = db.prepare(`SELECT * FROM sessions`).all() as any[];
    
    for (const sess of allSessions) {
      const isMatch = await bcrypt.compare(token, sess.token_hash);
      if (isMatch) {
        dbQueries.deleteSession.run(sess.token_hash);
        break;
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    });

    // Clear the cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    console.log(`✅ User signed out`);

    return response;

  } catch (error) {
    console.error('❌ Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if session exists in database by finding matching hash
    const now = new Date().toISOString();
    
    // Clean up expired sessions first
    dbQueries.deleteExpiredSessions.run(now);
    
    // We need to check all active sessions to find the matching hash
    // This is a limitation of bcrypt - we can't reverse-lookup
    // In production, you might want to use a different approach like storing session IDs
    const allSessions = db.prepare(`
      SELECT s.*, u.* FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > ?
    `).all(now) as any[];
    
    let session = null;
    for (const sess of allSessions) {
      const isMatch = await bcrypt.compare(token, sess.token_hash);
      if (isMatch) {
        session = sess;
        break;
      }
    }
    
    if (!session) {
      // Session not found or expired
      const response = NextResponse.json({ user: null });
      response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0
      });
      return response;
    }

    // Return user data
    const userData = {
      id: session.id,
      email: session.email,
      firstName: session.first_name,
      lastName: session.last_name,
      phone: session.phone || undefined,
      isAuthenticated: true,
      preferences: {
        preferredAirlines: JSON.parse(session.preferred_airlines || '[]'),
        preferredAirports: JSON.parse(session.preferred_airports || '[]'),
        seatPreference: session.seat_preference || 'aisle',
        mealPreference: session.meal_preference || 'standard'
      }
    };

    return NextResponse.json({ user: userData });

  } catch (error) {
    console.error('❌ Auth check error:', error);
    
    // Clear invalid token
    const response = NextResponse.json({ user: null });
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });
    
    return response;
  }
}
