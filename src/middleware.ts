import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed access codes (you can manage this)
const ALLOWED_ACCESS_CODES = [
  'dev-access-2024',
  'partner-preview',
  'admin-access'
];

const ALLOWED_EMAILS = [
  'your-email@domain.com', // Replace with your email
  // Add partner emails here
];

// Public paths that don't require access
const PUBLIC_PATHS = [
  '/',
  '/access',
  '/about',
  '/privacy',
  '/terms',
  '/admin' // For managing access during development
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname === path)) {
    return NextResponse.next();
  }

  // Check for access in cookies
  const accessCode = request.cookies.get('travel-access-code')?.value;
  const userEmail = request.cookies.get('travel-user-email')?.value;
  const authToken = request.cookies.get('auth_token')?.value;

  // Allow if user is authenticated (has valid auth token)
  if (authToken) {
    return NextResponse.next();
  }

  // Allow if has valid access code
  if (accessCode && ALLOWED_ACCESS_CODES.includes(accessCode)) {
    return NextResponse.next();
  }

  // Allow if user email is in allowed list
  if (userEmail && ALLOWED_EMAILS.includes(userEmail)) {
    return NextResponse.next();
  }

  // Redirect to access page for protected paths
  return NextResponse.redirect(new URL('/access', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
