'use client';

import { useState, useEffect } from 'react';

interface AccessRequest {
    id: string;
    email: string;
    message: string;
    timestamp: string;
    ip?: string;
    userAgent?: string;
}

export default function AdminPage() {
    const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
    const [newAccessCode, setNewAccessCode] = useState('');
    const [accessCodes, setAccessCodes] = useState([
        'dev-access-2024',
        'partner-preview',
        'admin-access'
    ]);

    // In a real app, you'd fetch these from your database
    useEffect(() => {
        // Mock data for demonstration
        const mockRequests: AccessRequest[] = [
            {
                id: '1',
                email: 'partner@skyscanner.net',
                message: 'Interested in integrating with our flight search API',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: '2',
                email: 'business@awin.com',
                message: 'Looking to evaluate your affiliate program',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
            }
        ];
        setAccessRequests(mockRequests);
    }, []);

    const addAccessCode = () => {
        if (newAccessCode && !accessCodes.includes(newAccessCode)) {
            setAccessCodes([...accessCodes, newAccessCode]);
            setNewAccessCode('');
        }
    };

    const removeAccessCode = (code: string) => {
        setAccessCodes(accessCodes.filter(c => c !== code));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600 mt-2">Manage access codes and review partner requests</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Access Codes Management */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Codes</h2>

                        <div className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAccessCode}
                                    onChange={(e) => setNewAccessCode(e.target.value)}
                                    placeholder="New access code"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <button
                                    onClick={addAccessCode}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {accessCodes.map((code) => (
                                <div key={code} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <code className="text-sm font-mono">{code}</code>
                                    <button
                                        onClick={() => removeAccessCode(code)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Access Requests */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Access Requests ({accessRequests.length})
                        </h2>

                        <div className="space-y-4">
                            {accessRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No access requests yet</p>
                            ) : (
                                accessRequests.map((request) => (
                                    <div key={request.id} className="border border-gray-200 rounded-md p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-gray-900">{request.email}</h3>
                                            <span className="text-xs text-gray-500">
                                                {new Date(request.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {request.message && (
                                            <p className="text-gray-600 text-sm mb-3">{request.message}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const code = `partner-${Date.now()}`;
                                                    setAccessCodes([...accessCodes, code]);
                                                    alert(`Generated access code: ${code}\nSend this to ${request.email}`);
                                                }}
                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAccessRequests(accessRequests.filter(r => r.id !== request.id));
                                                }}
                                                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                            >
                                                Archive
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <a
                            href="/search"
                            className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                            <h3 className="font-medium text-emerald-900">Search App</h3>
                            <p className="text-sm text-emerald-700">Test the protected application</p>
                        </a>
                        <a
                            href="/"
                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <h3 className="font-medium text-blue-900">Landing Page</h3>
                            <p className="text-sm text-blue-700">View public landing page</p>
                        </a>
                        <a
                            href="/access"
                            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                            <h3 className="font-medium text-purple-900">Access Page</h3>
                            <p className="text-sm text-purple-700">Test access code entry</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
