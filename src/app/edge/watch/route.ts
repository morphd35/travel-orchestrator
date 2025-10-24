import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createWatch, listWatches } from '@/lib/watchStore';

// Validation schema for creating a watch
const CreateWatchSchema = z.object({
  userId: z.string().optional().default('anon'),
  origin: z.string().min(3, 'Origin must be at least 3 characters'),
  destination: z.string().min(3, 'Destination must be at least 3 characters'),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  maxStops: z.number().int().min(0).max(5),
  adults: z.number().int().min(1).max(9),
  currency: z.enum(['USD']),
  targetUsd: z.number().positive(),
  flexDays: z.number().int().min(0).max(30),
  active: z.boolean().default(true),
  lastBestUsd: z.number().optional(),
  lastNotifiedUsd: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = CreateWatchSchema.parse(body);
    
    // Validate date logic
    const startDate = new Date(validatedData.start);
    const endDate = new Date(validatedData.end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return Response.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }
    
    if (endDate < startDate) {
      return Response.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      );
    }
    
    // Create the watch
    const watch = createWatch(validatedData);
    
    return Response.json(watch, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { 
          error: 'Validation failed', 
          details: error.issues.map((e: z.ZodIssue) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }
    
    console.error('Error creating watch:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params, default to "anon"
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anon';
    
    const watches = listWatches(userId);
    
    return Response.json(watches);
    
  } catch (error) {
    console.error('Error listing watches:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
