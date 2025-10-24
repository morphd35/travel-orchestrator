import { NextRequest } from 'next/server';
import { getWatch } from '@/lib/watchStore';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate that the watch exists
    const watch = getWatch(id);
    if (!watch) {
      return Response.json(
        { error: 'Watch not found' },
        { status: 404 }
      );
    }
    
    // Check if watch is active
    if (!watch.active) {
      return Response.json(
        { error: 'Watch is not active' },
        { status: 400 }
      );
    }
    
    // For now, return 501 Not Implemented as requested
    // This will be wired up in a future prompt
    return Response.json(
      { 
        message: 'Trigger endpoint not yet implemented',
        watchId: id,
        watchDetails: {
          origin: watch.origin,
          destination: watch.destination,
          start: watch.start,
          end: watch.end,
          targetUsd: watch.targetUsd
        }
      },
      { status: 501 }
    );
    
  } catch (error) {
    console.error('Error triggering watch:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
