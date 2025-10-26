/**
 * Client-side User Profile Manager
 * Makes API calls to server-side database operations
 */

export interface UserPassengerProfile {
    id?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'Other';
    email: string;
    phone: string;
    address: {
        lines: string[];
        city: string;
        postal: string;
        country: string;
    };
}

export interface UserBookingHistory {
    id: string;
    bookingReference: string;
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    passengers: UserPassengerProfile[];
    totalAmount: number;
    currency: string;
    bookedAt: string;
}

export interface UserSearchHistory {
    id: string;
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    cabinClass: string;
    currency: string;
    resultCount: number;
    airlines: string[];
    priceRange?: { min: number; max: number };
    searchedAt: string;
}

class ClientUserProfileManager {
    // Passenger Profile Management
    async getPassengerProfiles(userId: string): Promise<UserPassengerProfile[]> {
        try {
            const response = await fetch(`/api/user/passenger-profiles?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch passenger profiles');
            const data = await response.json();
            return data.profiles || [];
        } catch (error) {
            console.error('Error loading passenger profiles:', error);
            return [];
        }
    }

    async savePassengerProfile(userId: string, profile: UserPassengerProfile): Promise<void> {
        try {
            const response = await fetch('/api/user/passenger-profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, profile })
            });
            if (!response.ok) throw new Error('Failed to save passenger profile');
            console.log(`💾 Passenger profile saved for user: ${userId}`);
        } catch (error) {
            console.error('Error saving passenger profile:', error);
        }
    }

    // Booking History Management
    async getBookingHistory(userId: string): Promise<UserBookingHistory[]> {
        try {
            const response = await fetch(`/api/user/bookings?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch booking history');
            const data = await response.json();
            return data.bookings || [];
        } catch (error) {
            console.error('Error loading booking history:', error);
            return [];
        }
    }

    async addBookingToHistory(userId: string, booking: UserBookingHistory): Promise<void> {
        try {
            const response = await fetch('/api/user/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, booking })
            });
            if (!response.ok) throw new Error('Failed to save booking');
            console.log(`💾 Booking saved to database for user: ${userId}`);
        } catch (error) {
            console.error('Error saving booking to database:', error);
        }
    }

    // Search History Management
    async getRecentSearches(userId: string): Promise<UserSearchHistory[]> {
        try {
            const response = await fetch(`/api/user/searches?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch search history');
            const data = await response.json();
            return data.searches || [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    async addRecentSearch(userId: string, search: any): Promise<void> {
        try {
            const response = await fetch('/api/user/searches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, search })
            });
            if (!response.ok) throw new Error('Failed to save search');
            console.log(`💾 Search saved to database for user: ${userId}`);
        } catch (error) {
            console.error('Error saving search to database:', error);
        }
    }

    // Watch Management
    async getUserWatches(userId: string): Promise<any[]> {
        try {
            const response = await fetch(`/api/user/watches?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user watches');
            const data = await response.json();
            return data.watches || [];
        } catch (error) {
            console.error('Error loading user watches:', error);
            return [];
        }
    }

    // Utility method to get prefilled passenger data
    async getPrefillData(userId: string): Promise<Partial<UserPassengerProfile> | null> {
        const profiles = await this.getPassengerProfiles(userId);
        if (profiles.length > 0) {
            return profiles[0]; // Return the most recent profile
        }
        return null;
    }
}

// Export singleton instance
export const userProfileManager = new ClientUserProfileManager();
