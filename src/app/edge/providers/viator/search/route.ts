import { NextRequest, NextResponse } from 'next/server';

const VIATOR_API_KEY = process.env.VIATOR_API_KEY || '';
const VIATOR_BASE_URL = 'https://api.viator.com/partner';

interface ViatorSearchRequest {
  destination: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

interface Activity {
  title: string;
  fromPrice: number;
  currency: string;
  url: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
}

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    if (!VIATOR_API_KEY) {
      return NextResponse.json(
        { 
          activities: [],
          message: 'Activities coming soon - Viator API key not configured'
        },
        { status: 200 }
      );
    }

    const body: ViatorSearchRequest = await req.json();
    const { destination, startDate, endDate, limit = 3 } = body;

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Call Viator Product Search API using free-text search
    // Build query parameters
    const params = new URLSearchParams({
      searchTerm: destination,
      topX: `1-${limit + 5}`, // Get extra to filter
      sortOrder: 'REVIEW_AVG_RATING_D', // Descending rating
      currency: 'USD',
    });

    const response = await fetch(`${VIATOR_BASE_URL}/v1/search/freetext?${params.toString()}`, {
      method: 'GET',
      headers: {
        'exp-api-key': VIATOR_API_KEY,
        'Accept': 'application/json',
        'Accept-Language': 'en-US',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Viator API error:', errorText);
      
      return NextResponse.json(
        { 
          activities: [],
          message: 'Unable to fetch activities at this time'
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const products = data.products || [];

    // Parse and filter top-rated activities
    const activities: Activity[] = products
      .filter((p: any) => {
        // Filter for high-rated activities (4+ stars)
        const rating = p.reviews?.combinedAverageRating || 0;
        return rating >= 4.0;
      })
      .slice(0, limit)
      .map((product: any) => {
        const pricing = product.pricing?.summary || {};
        const reviews = product.reviews || {};
        
        return {
          title: product.title || 'Untitled Activity',
          fromPrice: pricing.fromPrice || 0,
          currency: product.pricing?.currency || 'USD',
          url: constructBookingUrl(product.productUrl || '', product.productCode || ''),
          description: product.description || '',
          imageUrl: product.images?.[0]?.variants?.[0]?.url || product.primaryImage || '',
          rating: reviews.combinedAverageRating || 0,
          reviewCount: reviews.totalReviews || 0,
        };
      });

    return NextResponse.json({
      activities,
      totalCount: products.length,
      message: activities.length === 0 ? 'No activities found for this destination' : undefined,
    });

  } catch (error: any) {
    console.error('Viator search error:', error);
    
    return NextResponse.json(
      {
        activities: [],
        message: 'Activities coming soon'
      },
      { status: 200 }
    );
  }
}

/**
 * Construct partner-tracked booking URL
 */
function constructBookingUrl(baseUrl: string, productCode: string): string {
  if (!baseUrl) {
    return `https://www.viator.com/tours/${productCode}`;
  }
  
  // Add partner tracking parameters if needed
  // Format: ?medium=api
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}medium=api`;
}
