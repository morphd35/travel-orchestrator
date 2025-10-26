/**
 * User Authentication Context
 * Manages user sign-in, sign-up, and session state
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isAuthenticated: boolean;
    preferences?: {
        preferredAirlines?: string[];
        preferredAirports?: string[];
        seatPreference?: 'aisle' | 'window' | 'middle';
        mealPreference?: string;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
    updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from server session on component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                
                if (data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Sign in failed' };
            }
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: 'Sign in failed. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Sign up failed' };
            }
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: 'Sign up failed. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await fetch('/api/auth/me', { method: 'POST' });
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setUser(null);
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (user) {
            // Update local state immediately for better UX
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            
            // TODO: Implement API call to update user profile in database
            // For now, we'll just update the local state
            console.log('Profile update:', updates);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
