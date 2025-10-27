'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'ocean';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    themes: Array<{
        id: Theme;
        name: string;
        description: string;
    }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
    {
        id: 'dark' as Theme,
        name: 'Dark',
        description: 'Easy on the eyes with rich contrasts'
    },
    {
        id: 'ocean' as Theme,
        name: 'Ocean',
        description: 'Medium contrast with ocean blues'
    },
    {
        id: 'light' as Theme,
        name: 'Light',
        description: 'Clean and bright interface'
    }
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Load theme from localStorage on initial load
        const savedTheme = localStorage.getItem('travel-theme') as Theme;
        if (savedTheme && themes.some(t => t.id === savedTheme)) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        // Save to localStorage
        localStorage.setItem('travel-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
