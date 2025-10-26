/**
 * User-Specific Profile Management System
 * Handles passenger data, preferences, and recent searches with user authentication
 */

import { User } from './auth';

export interface UserPassengerProfile {
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

class UserProfileManager {
    private getStorageKey(userId: string, type: string): string {
        return `travel_orchestrator_${userId}_${type}`;
    }

    // Passenger Profile Management
    getPassengerProfiles(userId: string): UserPassengerProfile[] {
        try {
            const stored = localStorage.getItem(this.getStorageKey(userId, 'passengers'));
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading passenger profiles:', error);
            return [];
        }
    }

    savePassengerProfile(userId: string, profile: UserPassengerProfile): void {
        try {
            const profiles = this.getPassengerProfiles(userId);
            const existingIndex = profiles.findIndex(
                p => p.email === profile.email ||
                    (p.firstName === profile.firstName && p.lastName === profile.lastName)
            );

            if (existingIndex >= 0) {
                profiles[existingIndex] = profile;
            } else {
                profiles.push(profile);
            }

            // Keep only the 5 most recent profiles
            if (profiles.length > 5) {
                profiles.splice(0, profiles.length - 5);
            }

            localStorage.setItem(this.getStorageKey(userId, 'passengers'), JSON.stringify(profiles));
        } catch (error) {
            console.error('Error saving passenger profile:', error);
        }
    }

    // Travel Preferences Management
    getTravelPreferences(userId: string): UserTravelPreferences {
        try {
            const stored = localStorage.getItem(this.getStorageKey(userId, 'preferences'));
            return stored ? JSON.parse(stored) : {
                preferredAirlines: [],
                preferredAirports: [],
                seatPreference: 'aisle',
                mealPreference: 'standard',
                frequentFlyerNumbers: {}
            };
        } catch (error) {
            console.error('Error loading travel preferences:', error);
            return {
                preferredAirlines: [],
                preferredAirports: [],
                seatPreference: 'aisle',
                mealPreference: 'standard',
                frequentFlyerNumbers: {}
            };
        }
    }

    saveTravelPreferences(userId: string, preferences: UserTravelPreferences): void {
        try {
            localStorage.setItem(this.getStorageKey(userId, 'preferences'), JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving travel preferences:', error);
        }
    }

    // Booking History Management
    getBookingHistory(userId: string): UserBookingHistory[] {
        try {
            const stored = localStorage.getItem(this.getStorageKey(userId, 'bookings'));
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading booking history:', error);
            return [];
        }
    }

    addBookingToHistory(userId: string, booking: UserBookingHistory): void {
        try {
            const history = this.getBookingHistory(userId);
            history.unshift(booking); // Add to beginning

            // Keep only the 20 most recent bookings
            if (history.length > 20) {
                history.splice(20);
            }

            localStorage.setItem(this.getStorageKey(userId, 'bookings'), JSON.stringify(history));
        } catch (error) {
            console.error('Error saving booking to history:', error);
        }
    }

    // Watch Management (user-specific)
    getUserWatches(userId: string): any[] {
        try {
            const stored = localStorage.getItem(this.getStorageKey(userId, 'watches'));
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading user watches:', error);
            return [];
        }
    }

    saveUserWatch(userId: string, watch: any): void {
        try {
            const watches = this.getUserWatches(userId);
            watches.push({
                ...watch,
                id: `watch_${Date.now()}`,
                userId,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem(this.getStorageKey(userId, 'watches'), JSON.stringify(watches));
        } catch (error) {
            console.error('Error saving user watch:', error);
        }
    }

    removeUserWatch(userId: string, watchId: string): void {
        try {
            const watches = this.getUserWatches(userId);
            const filtered = watches.filter(w => w.id !== watchId);
            localStorage.setItem(this.getStorageKey(userId, 'watches'), JSON.stringify(filtered));
        } catch (error) {
            console.error('Error removing user watch:', error);
        }
    }

    // Recent Searches (user-specific)
    getRecentSearches(userId: string): any[] {
        try {
            const stored = localStorage.getItem(this.getStorageKey(userId, 'searches'));
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recent searches:', error);
            return [];
        }
    }

    addRecentSearch(userId: string, search: any): void {
        try {
            const searches = this.getRecentSearches(userId);

            // Remove duplicates
            const filtered = searches.filter(s =>
                !(s.origin === search.origin &&
                    s.destination === search.destination &&
                    s.departDate === search.departDate)
            );

            filtered.unshift({
                ...search,
                searchedAt: new Date().toISOString()
            });

            // Keep only 10 recent searches
            if (filtered.length > 10) {
                filtered.splice(10);
            }

            localStorage.setItem(this.getStorageKey(userId, 'searches'), JSON.stringify(filtered));
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    }

    // Utility method to get prefilled passenger data
    getPrefillData(userId: string): Partial<UserPassengerProfile> | null {
        const profiles = this.getPassengerProfiles(userId);
        if (profiles.length > 0) {
            // Return the most recently used profile
            return profiles[profiles.length - 1];
        }
        return null;
    }

    // Clear all user data (for sign out)
    clearUserData(userId: string): void {
        const keys = ['passengers', 'preferences', 'bookings', 'watches', 'searches'];
        keys.forEach(key => {
            localStorage.removeItem(this.getStorageKey(userId, key));
        });
    }
}

// Export singleton instance
export const userProfileManager = new UserProfileManager();
