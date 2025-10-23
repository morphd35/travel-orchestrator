import { NextRequest, NextResponse } from 'next/server';
import { getViatorApiKey } from '@/lib/env';

const VIATOR_API_KEY = getViatorApiKey();
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

    // For now, return mock activities for popular destinations
    // TODO: Replace with real Viator API once access is properly configured
    const mockActivities = getMockActivities(destination, limit);
    
    if (mockActivities.length > 0) {
      return NextResponse.json({
        activities: mockActivities,
        totalCount: mockActivities.length,
        message: 'Showing popular activities (Demo mode - Real Viator integration pending API access)',
      });
    }

    // If not a known destination, return coming soon message
    return NextResponse.json(
      { 
        activities: [],
        message: 'Activities coming soon for this destination'
      },
      { status: 200 }
    );

    /* Real Viator API code - Enable once API access is working
    const params = new URLSearchParams({
      searchTerm: destination,
      topX: `1-${limit + 5}`,
      sortOrder: 'REVIEW_AVG_RATING_D',
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
    const products = data.data || [];
    */

    const products: any[] = [];

    // Parse and filter top-rated activities
    const activities: Activity[] = products
      .filter((p: any) => {
        // Filter for high-rated activities (4+ stars)
        const rating = p.rating || 0;
        return rating >= 4.0;
      })
      .slice(0, limit)
      .map((product: any) => {
        return {
          title: product.title || 'Untitled Activity',
          fromPrice: product.price || 0,
          currency: product.currencyCode || 'USD',
          url: constructBookingUrl(product.productUrlName || '', product.code || ''),
          description: product.shortDescription || product.description || '',
          imageUrl: product.thumbnailHiResURL || product.thumbnailURL || '',
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
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
 * Get mock activities for popular destinations (temporary until Viator API is configured)
 */
function getMockActivities(destination: string, limit: number): Activity[] {
  const destLower = destination.toLowerCase();
  
  const activitiesDB: Record<string, Activity[]> = {
    'cancun': [
      {
        title: 'Chichen Itza Day Trip from Cancun',
        fromPrice: 89,
        currency: 'USD',
        url: 'https://www.viator.com?pid=P00103649',
        description: 'Explore the ancient Mayan ruins',
        imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400',
        rating: 4.7,
        reviewCount: 2341,
      },
      {
        title: 'Isla Mujeres Catamaran Cruise',
        fromPrice: 75,
        currency: 'USD',
        url: 'https://www.viator.com?pid=P00103649',
        description: 'Sail to beautiful Isla Mujeres',
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        rating: 4.6,
        reviewCount: 1892,
      },
      {
        title: 'Tulum and Cenote Adventure',
        fromPrice: 95,
        currency: 'USD',
        url: 'https://www.viator.com?pid=P00103649',
        description: 'Visit Tulum ruins and swim in cenotes',
        imageUrl: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=400',
        rating: 4.5,
        reviewCount: 1567,
      },
    ],
    'cabo': [
      {
        title: 'Los Cabos Arch Boat Tour',
        fromPrice: 65,
        currency: 'USD',
        url: 'https://www.viator.com?pid=P00103649',
        description: 'See the famous Cabo Arch',
        imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400',
        rating: 4.8,
        reviewCount: 987,
      },
      {
        title: 'Sunset Dinner Cruise',
        fromPrice: 110,
        currency: 'USD',
        url: 'https://www.viator.com?pid=P00103649',
        description: 'Romantic sunset cruise with dinner',
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
        rating: 4.7,
        reviewCount: 756,
      },
    ],
    'rome': [
      {
        title: 'Colosseum and Roman Forum Tour',
        fromPrice: 55,
        currency: 'USD',
        url: 'https://www.viator.com?pid=P00103649',
        description: 'Skip-the-line Colosseum access',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
        rating: 4.9,
        reviewCount: 3245,
      },
      {
        title: 'Vatican Museums and Sistine Chapel',
        fromPrice: 60,
        currency: 'USD',
        url: 'https://www.viator.com?pid=P00103649',
        description: 'Guided Vatican tour',
        imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400',
        rating: 4.8,
        reviewCount: 2987,
      },
    ],
  };

  // Find matching destination
  for (const [key, activities] of Object.entries(activitiesDB)) {
    if (destLower.includes(key) || key.includes(destLower)) {
      return activities.slice(0, limit);
    }
  }

  return [];
}

/**
 * Construct partner-tracked booking URL
 */
function constructBookingUrl(productUrlName: string, productCode: string): string {
  if (!productUrlName && !productCode) {
    return 'https://www.viator.com';
  }
  
  // Construct Viator URL with product URL name or code
  const baseUrl = productUrlName 
    ? `https://www.viator.com/${productUrlName}`
    : `https://www.viator.com/tours/${productCode}`;
  
  // Add partner tracking parameters
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}pid=P00103649&medium=api`;
}
