/**
 * User Preferences & Data Prefill System
 * Stores user travel preferences and passenger data for quick booking
 */

interface PassengerProfile {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE';
    email: string;
    phone: {
        countryCode: string;
        number: string;
    };
    address: {
        lines: string[];
        postalCode: string;
        cityName: string;
        countryCode: string;
    };
    documents?: {
        type: 'PASSPORT' | 'IDENTITY_CARD';
        number: string;
        expiryDate: string;
        issuanceCountry: string;
        nationality: string;
    }[];
    isFrequentFlyer?: boolean;
    createdAt: string;
    lastUsed: string;
}

interface TravelPreferences {
    favoriteAirports: string[];
    preferredCarriers: string[];
    seatPreference: 'WINDOW' | 'AISLE' | 'NO_PREFERENCE';
    mealPreference?: string;
    specialRequests: string[];
    defaultCurrency: string;
    emailNotifications: boolean;
    priceAlertThreshold: number;
}

interface UserProfile {
    id: string;
    passengers: PassengerProfile[];
    preferences: TravelPreferences;
    recentSearches: {
        origin: string;
        destination: string;
        searchDate: string;
        count: number;
    }[];
    createdAt: string;
    lastActive: string;
}

const STORAGE_KEY = 'travel_orchestrator_profile';

export class UserProfileManager {
    private static instance: UserProfileManager;

    static getInstance(): UserProfileManager {
        if (!UserProfileManager.instance) {
            UserProfileManager.instance = new UserProfileManager();
        }
        return UserProfileManager.instance;
    }

    /**
     * Get current user profile or create default
     */
    getUserProfile(): UserProfile {
        if (typeof window === 'undefined') {
            return this.createDefaultProfile();
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const profile = JSON.parse(stored) as UserProfile;
                // Update last active
                profile.lastActive = new Date().toISOString();
                this.saveUserProfile(profile);
                return profile;
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }

        return this.createDefaultProfile();
    }

    /**
     * Save user profile to localStorage
     */
    saveUserProfile(profile: UserProfile): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }

    /**
     * Add or update passenger profile
     */
    savePassengerProfile(passenger: Omit<PassengerProfile, 'id' | 'createdAt' | 'lastUsed'>): PassengerProfile {
        const profile = this.getUserProfile();

        const existingIndex = profile.passengers.findIndex(p =>
            p.firstName === passenger.firstName &&
            p.lastName === passenger.lastName &&
            p.dateOfBirth === passenger.dateOfBirth
        );

        const now = new Date().toISOString();
        const passengerProfile: PassengerProfile = {
            ...passenger,
            id: existingIndex >= 0 ? profile.passengers[existingIndex].id : Date.now().toString(),
            createdAt: existingIndex >= 0 ? profile.passengers[existingIndex].createdAt : now,
            lastUsed: now
        };

        if (existingIndex >= 0) {
            profile.passengers[existingIndex] = passengerProfile;
        } else {
            profile.passengers.push(passengerProfile);
        }

        // Keep only last 10 passengers, sorted by last used
        profile.passengers.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
        profile.passengers = profile.passengers.slice(0, 10);

        this.saveUserProfile(profile);
        return passengerProfile;
    }

    /**
     * Get recent passenger profiles for prefilling
     */
    getRecentPassengers(limit: number = 5): PassengerProfile[] {
        const profile = this.getUserProfile();
        return profile.passengers
            .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
            .slice(0, limit);
    }

    /**
     * Update travel preferences
     */
    updatePreferences(preferences: Partial<TravelPreferences>): void {
        const profile = this.getUserProfile();
        profile.preferences = { ...profile.preferences, ...preferences };
        this.saveUserProfile(profile);
    }

    /**
     * Add to recent searches
     */
    addRecentSearch(origin: string, destination: string): void {
        const profile = this.getUserProfile();

        const existingIndex = profile.recentSearches.findIndex(s =>
            s.origin === origin && s.destination === destination
        );

        if (existingIndex >= 0) {
            profile.recentSearches[existingIndex].count++;
            profile.recentSearches[existingIndex].searchDate = new Date().toISOString();
        } else {
            profile.recentSearches.push({
                origin,
                destination,
                searchDate: new Date().toISOString(),
                count: 1
            });
        }

        // Keep only top 20 searches, sorted by frequency and recency
        profile.recentSearches.sort((a, b) => {
            const scoreA = a.count * 0.7 + (new Date(a.searchDate).getTime() / 1000000000) * 0.3;
            const scoreB = b.count * 0.7 + (new Date(b.searchDate).getTime() / 1000000000) * 0.3;
            return scoreB - scoreA;
        });
        profile.recentSearches = profile.recentSearches.slice(0, 20);

        this.saveUserProfile(profile);
    }

    /**
     * Get popular route suggestions
     */
    getPopularRoutes(): { origin: string; destination: string; count: number }[] {
        const profile = this.getUserProfile();
        return profile.recentSearches.slice(0, 6);
    }

    /**
     * Create default user profile
     */
    private createDefaultProfile(): UserProfile {
        return {
            id: Date.now().toString(),
            passengers: [],
            preferences: {
                favoriteAirports: [],
                preferredCarriers: [],
                seatPreference: 'NO_PREFERENCE',
                specialRequests: [],
                defaultCurrency: 'USD',
                emailNotifications: true,
                priceAlertThreshold: 0.1 // 10%
            },
            recentSearches: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
    }

    /**
     * Clear all user data
     */
    clearUserData(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

// Export singleton instance
export const userProfileManager = UserProfileManager.getInstance();
