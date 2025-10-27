'use client';

import React from 'react';
import { useTheme } from '@/lib/themeContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme, themes } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="travel-modal">
            <div className="travel-modal-content max-w-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-light travel-text-primary tracking-wide">Settings</h2>
                    <button
                        onClick={onClose}
                        className="travel-text-secondary hover:travel-text-primary transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Theme Selection */}
                    <div>
                        <h3 className="travel-label mb-3">Interface Theme</h3>
                        <div className="space-y-3">
                            {themes.map((themeOption) => (
                                <label
                                    key={themeOption.id}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${theme === themeOption.id
                                            ? 'border-emerald-400 bg-emerald-50/10'
                                            : 'border-gray-600/30 hover:border-gray-500'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={themeOption.id}
                                        checked={theme === themeOption.id}
                                        onChange={(e) => setTheme(e.target.value as any)}
                                        className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 focus:ring-2"
                                    />
                                    <div className="ml-3">
                                        <div className="travel-text-primary font-medium">{themeOption.name}</div>
                                        <div className="travel-text-muted text-sm">{themeOption.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Future Settings */}
                    <div>
                        <h3 className="travel-label mb-3">Preferences</h3>
                        <div className="space-y-3 opacity-50">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600/30">
                                <div>
                                    <div className="travel-text-primary font-medium">Email Notifications</div>
                                    <div className="travel-text-muted text-sm">Price alerts and booking updates</div>
                                </div>
                                <div className="text-sm travel-text-muted">Coming Soon</div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600/30">
                                <div>
                                    <div className="travel-text-primary font-medium">Currency</div>
                                    <div className="travel-text-muted text-sm">Display prices in your preferred currency</div>
                                </div>
                                <div className="text-sm travel-text-muted">Coming Soon</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
