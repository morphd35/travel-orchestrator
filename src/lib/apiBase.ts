/**
 * Helper to route API calls to the correct endpoint
 * - Local dev: uses /api/* (standard Next.js API routes)
 * - Preview/Production: uses /edge/* (bypasses platform proxy rewriting)
 */
export function apiPath(path: string): string {
  // Check if we're in preview mode (set via environment variable)
  const useEdge = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1';
  
  if (useEdge) {
    // Replace /api/ with /edge/ to bypass proxy rewriting
    return path.replace(/^\/api\//, '/edge/');
  }
  
  // Local dev: use standard /api/ routes
  return path;
}
