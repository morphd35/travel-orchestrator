/**
 * Authentication Modal Component
 * Provides sign-in and sign-up functionality
 */

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
    const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

    const { signIn, signUp, isLoading } = useAuth();

    // Create portal target
    if (typeof window !== 'undefined' && !document.getElementById('modal-root')) {
        const modalRoot = document.createElement('div');
        modalRoot.id = 'modal-root';
        modalRoot.style.position = 'fixed';
        modalRoot.style.top = '0';
        modalRoot.style.left = '0';
        modalRoot.style.width = '100%';
        modalRoot.style.height = '100%';
        modalRoot.style.zIndex = '999999';
        modalRoot.style.pointerEvents = 'none';
        document.body.appendChild(modalRoot);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResetMessage('');
        setIsSubmitting(true);

        try {
            let result;
            if (mode === 'signin') {
                result = await signIn(email, password);
            } else if (mode === 'signup') {
                if (!firstName.trim() || !lastName.trim()) {
                    setError('First name and last name are required');
                    return;
                }
                result = await signUp(email, password, firstName.trim(), lastName.trim());
            } else if (mode === 'reset') {
                // Handle password reset
                console.log('Reset password attempt with email:', email);
                
                if (!email || !email.trim()) {
                    setError('Please enter your email address');
                    return;
                }
                
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email.trim() }),
                });

                const data = await response.json();
                console.log('Reset password response:', data);
                
                if (response.ok) {
                    setResetMessage(data.message);
                    if (data.tempPassword) {
                        setResetMessage(`${data.message}\n\nTemporary password: ${data.tempPassword}\n\nUse this password to sign in, then change it in your settings.`);
                    }
                } else {
                    setError(data.error || 'Password reset failed');
                }
                return;
            }

            if (result?.success) {
                onClose();
                // Reset form
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
                setError('');
            } else {
                setError(result?.error || 'Authentication failed');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchMode = () => {
        if (mode === 'signin') {
            setMode('signup');
        } else if (mode === 'signup') {
            setMode('signin');
        } else {
            setMode('signin');
        }
        setError('');
        setResetMessage('');
    };

    if (!isOpen || typeof window === 'undefined') return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const modalContent = (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ 
                pointerEvents: 'auto',
                zIndex: 999999
            }}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 my-4 relative border"
                style={{ zIndex: 1000000 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="john@example.com"
                        />
                    </div>

                    {mode !== 'reset' && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                            />
                            {mode === 'signup' && (
                                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {resetMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <p className="text-green-600 text-sm whitespace-pre-line">{resetMessage}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting || isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {mode === 'signin' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Resetting Password...'}
                            </div>
                        ) : (
                            mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    {mode !== 'reset' && (
                        <p className="text-sm text-gray-600">
                            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                onClick={switchMode}
                                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                            >
                                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    )}
                    
                    {mode === 'signin' && (
                        <p className="text-sm text-gray-600">
                            <button
                                onClick={() => {
                                    setMode('reset');
                                    setError('');
                                    setResetMessage('');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Forgot your password?
                            </button>
                        </p>
                    )}
                    
                    {mode === 'reset' && (
                        <p className="text-sm text-gray-600">
                            Remember your password?
                            <button
                                onClick={() => {
                                    setMode('signin');
                                    setError('');
                                    setResetMessage('');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                            >
                                Sign In
                            </button>
                        </p>
                    )}
                </div>

                {mode === 'signin' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs text-blue-700">
                            <strong>Demo Mode:</strong> Create a new account or use any email/password combination for testing.
                        </p>
                    </div>
                )}

                {mode === 'reset' && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                        <p className="text-xs text-yellow-700">
                            <strong>Password Reset:</strong> Enter your email address and we'll generate a temporary password for you.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    // Use React createPortal to render at document root
    return createPortal(modalContent, modalRoot);
}
