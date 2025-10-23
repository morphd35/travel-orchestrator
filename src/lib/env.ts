/**
 * Environment Variable Guards
 * 
 * Server-side only - validates and provides typed access to environment variables
 * Throws clear errors if required variables are missing
 */

const isServer = typeof window === 'undefined';

/**
 * Get required server-side environment variable
 * Throws error if missing (only on server, not during build)
 */
function getRequiredServerEnv(key: string, description: string): string {
  // Only validate on server at runtime (not during build)
  if (!isServer) {
    throw new Error(`${key} should only be accessed on the server`);
  }

  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Description: ${description}\n` +
      `Please add ${key} to your .env.local file`
    );
  }
  
  return value;
}

/**
 * Get optional server-side environment variable with default
 */
function getOptionalServerEnv(key: string, defaultValue: string): string {
  if (!isServer) {
    return defaultValue;
  }
  
  return process.env[key] || defaultValue;
}

/**
 * Amadeus API Configuration (Server-side only)
 */
export function getAmadeusApiKey(): string {
  return getRequiredServerEnv(
    'AMADEUS_API_KEY',
    'Amadeus API Key (Client ID) from https://developers.amadeus.com'
  );
}

export function getAmadeusApiSecret(): string {
  return getRequiredServerEnv(
    'AMADEUS_API_SECRET',
    'Amadeus API Secret (Client Secret) from https://developers.amadeus.com'
  );
}

export function getAmadeusHost(): string {
  return getOptionalServerEnv(
    'AMADEUS_HOST',
    'https://test.api.amadeus.com'
  );
}

/**
 * Viator API Configuration (Server-side only, optional)
 */
export function getViatorApiKey(): string | null {
  if (!isServer) {
    return null;
  }
  
  const key = process.env.VIATOR_API_KEY;
  
  if (!key || key.trim() === '') {
    console.warn('⚠️  VIATOR_API_KEY not configured - using mock activities');
    return null;
  }
  
  return key;
}

/**
 * Booking.com Configuration (Client-side, optional)
 */
export function getBookingAffiliateId(): string {
  // This is a NEXT_PUBLIC_ var, safe for client-side
  return process.env.NEXT_PUBLIC_BOOKING_AID || '1234567';
}

/**
 * Preview Mode Configuration (Client-side)
 */
export function isPreviewMode(): boolean {
  return process.env.NEXT_PUBLIC_PREVIEW_MODE === '1';
}

/**
 * Validate all required environment variables on server startup
 * Call this from API routes to ensure proper configuration
 */
export function validateServerEnv(): { valid: boolean; errors: string[] } {
  if (!isServer) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  // Check required Amadeus variables
  try {
    getAmadeusApiKey();
  } catch (e: any) {
    errors.push(e.message);
  }

  try {
    getAmadeusApiSecret();
  } catch (e: any) {
    errors.push(e.message);
  }

  // Viator is optional - just check if configured
  const viatorKey = getViatorApiKey();
  if (!viatorKey) {
    console.log('ℹ️  Viator API not configured - activities will use mock data');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log environment configuration status (useful for debugging)
 */
export function logEnvStatus(): void {
  if (!isServer) {
    console.log('🌐 Client-side environment:');
    console.log('  - Preview Mode:', isPreviewMode() ? 'ENABLED' : 'DISABLED');
    console.log('  - Booking AID:', getBookingAffiliateId());
    return;
  }

  console.log('🔧 Server-side environment:');
  console.log('  - Amadeus API Key:', process.env.AMADEUS_API_KEY ? '✅ Configured' : '❌ Missing');
  console.log('  - Amadeus API Secret:', process.env.AMADEUS_API_SECRET ? '✅ Configured' : '❌ Missing');
  console.log('  - Amadeus Host:', getAmadeusHost());
  console.log('  - Viator API Key:', getViatorApiKey() ? '✅ Configured' : '⚠️  Not configured (using mocks)');
  console.log('  - Booking AID:', getBookingAffiliateId());
}
