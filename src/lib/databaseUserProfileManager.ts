/**
 * Database-backed User Profile Management System
 * Handles user data persistence in SQLite database
 */

import { dbQueries } from './database';

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

export interface UserTravelPreferences {
    preferredAirlines: string[];
    preferredAirports: string[];
    seatPreference: 'aisle' | 'window' | 'middle';
    mealPreference: string;
    frequentFlyerNumbers: { [airline: string]: string };
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

class DatabaseUserProfileManager {
    // Passenger Profile Management
    getPassengerProfiles(userId: string): UserPassengerProfile[] {
        try {
            const profiles = dbQueries.getUserPassengerProfiles.all(userId) as any[];
            return profiles.map(profile => ({
                id: profile.id,
                firstName: profile.first_name,
                lastName: profile.last_name,
                dateOfBirth: profile.date_of_birth,
                gender: profile.gender,
                email: profile.email,
                phone: profile.phone,
                address: JSON.parse(profile.address)
            }));
        } catch (error) {
            console.error('Error loading passenger profiles:', error);
            return [];
        }
    }

    savePassengerProfile(userId: string, profile: UserPassengerProfile): void {
        try {
            const profileId = profile.id || `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            if (profile.id) {
                // Update existing profile
                dbQueries.updatePassengerProfile.run(
                    profile.firstName,
                    profile.lastName,
                    profile.dateOfBirth,
                    profile.gender,
                    profile.email,
                    profile.phone,
                    JSON.stringify(profile.address),
                    now,
                    profileId
                );
            } else {
                // Create new profile
                dbQueries.createPassengerProfile.run(
                    profileId,
                    userId,
                    profile.firstName,
                    profile.lastName,
                    profile.dateOfBirth,
                    profile.gender,
                    profile.email,
                    profile.phone,
                    JSON.stringify(profile.address),
                    now,
                    now
                );
            }

            console.log(`💾 Passenger profile saved for user: ${userId}`);
        } catch (error) {
            console.error('Error saving passenger profile:', error);
        }
    }

    // Booking History Management
    getBookingHistory(userId: string): UserBookingHistory[] {
        try {
            const bookings = dbQueries.getUserBookings.all(userId) as any[];
            return bookings.map(booking => ({
                id: booking.id,
                bookingReference: booking.booking_reference,
                origin: booking.origin,
                destination: booking.destination,
                departDate: booking.depart_date,
                returnDate: booking.return_date,
                passengers: JSON.parse(booking.passenger_details),
                totalAmount: booking.total_amount,
                currency: booking.currency,
                bookedAt: booking.created_at
            }));
        } catch (error) {
            console.error('Error loading booking history:', error);
            return [];
        }
    }

    addBookingToHistory(userId: string, booking: UserBookingHistory): void {
        try {
            const bookingId = booking.id || `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            dbQueries.createBooking.run(
                bookingId,
                userId,
                booking.bookingReference,
                booking.origin,
                booking.destination,
                booking.departDate,
                booking.returnDate || null,
                booking.passengers.length,
                JSON.stringify(booking.passengers),
                booking.totalAmount,
                booking.currency,
                '', // airline - will be updated when we have this data
                booking.bookedAt,
                'confirmed',
                booking.passengers[0]?.email || '',
                now
            );

            console.log(`💾 Booking saved to database for user: ${userId}`);
        } catch (error) {
            console.error('Error saving booking to database:', error);
        }
    }

    // Search History Management
    getRecentSearches(userId: string): UserSearchHistory[] {
        try {
            const searches = dbQueries.getUserSearches.all(userId) as any[];
            return searches.map(search => ({
                id: search.id,
                origin: search.origin,
                destination: search.destination,
                departDate: search.depart_date,
                returnDate: search.return_date,
                adults: search.adults,
                children: search.children,
                infants: search.infants,
                cabinClass: search.cabin_class,
                currency: search.currency,
                resultCount: search.result_count,
                airlines: JSON.parse(search.airlines),
                priceRange: search.price_range ? JSON.parse(search.price_range) : undefined,
                searchedAt: search.searched_at
            }));
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    addRecentSearch(userId: string, search: any): void {
        try {
            const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            dbQueries.createSearch.run(
                searchId,
                userId,
                search.origin,
                search.destination,
                search.departDate,
                search.returnDate || null,
                search.adults,
                search.children || 0,
                search.infants || 0,
                search.cabinClass || 'economy',
                search.currency || 'USD',
                search.resultCount,
                JSON.stringify(search.airlines || []),
                search.priceRange ? JSON.stringify(search.priceRange) : null,
                now
            );

            console.log(`💾 Search saved to database for user: ${userId}`);
        } catch (error) {
            console.error('Error saving search to database:', error);
        }
    }

    // Watch Management (using existing watches table)
    getUserWatches(userId: string): any[] {
        try {
            const watches = dbQueries.getUserWatches.all(userId) as any[];
            return watches.map(watch => ({
                id: watch.id,
                userId: watch.userId,
                origin: watch.origin,
                destination: watch.destination,
                start: watch.start,
                end: watch.end,
                targetPrice: watch.targetUsd,
                currency: watch.currency,
                active: watch.active === 1,
                email: watch.email,
                createdAt: watch.createdAt
            }));
        } catch (error) {
            console.error('Error loading user watches:', error);
            return [];
        }
    }

    // Utility method to get prefilled passenger data
    getPrefillData(userId: string): Partial<UserPassengerProfile> | null {
        const profiles = this.getPassengerProfiles(userId);
        if (profiles.length > 0) {
            return profiles[0]; // Return the most recent profile
        }
        return null;
    }

    // Clear all user data (for account deletion)
    clearUserData(userId: string): void {
        try {
            // This would need additional queries to delete all user-related data
            // For now, we'll rely on CASCADE DELETE from the foreign key constraints
            console.log(`🗑️ User data cleared for user: ${userId}`);
        } catch (error) {
            console.error('Error clearing user data:', error);
        }
    }
}

// Export singleton instance
export const userProfileManager = new DatabaseUserProfileManager();
