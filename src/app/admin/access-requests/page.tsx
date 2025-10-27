'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AccessRequest {
  id: string;
  email: string;
  name: string;
  company?: string;
  message?: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  ip: string;
  userAgent: string;
  approvedAt?: string;
  approvedBy?: string;
  accessCode?: string;
}

export default function AccessRequestsAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');

  // Check if user is admin (you)
  useEffect(() => {
    // Don't redirect while authentication is still loading
    if (authLoading) return;
    
    if (!user || user.email !== 'morphd335@yahoo.com') {
      router.push('/');
      return;
    }
  }, [user, router, authLoading]);

  // Load access requests
  useEffect(() => {
    if (user?.email === 'morphd335@yahoo.com') {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/admin/access-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const response = await fetch('/api/admin/access-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'approve'
        })
      });

      if (response.ok) {
        await loadRequests(); // Reload data
      } else {
        const error = await response.json();
        alert('Failed to approve request: ' + error.error);
      }
    } catch (error) {
      alert('Error approving request');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (requestId: string) => {
    const reason = prompt('Reason for denial (optional):');
    
    setProcessing(requestId);
    try {
      const response = await fetch('/api/admin/access-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'deny',
          reason
        })
      });

      if (response.ok) {
        await loadRequests(); // Reload data
      } else {
        const error = await response.json();
        alert('Failed to deny request: ' + error.error);
      }
    } catch (error) {
      alert('Error denying request');
    } finally {
      setProcessing(null);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.email !== 'morphd335@yahoo.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is restricted to administrators only.</p>
          <div className="mt-4">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading access requests...</p>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter(req => 
    filter === 'all' || req.status === filter
  );

  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    denied: requests.filter(r => r.status === 'denied').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Requests</h1>
          <p className="mt-2 text-gray-600">Manage partner access requests for Travel Conductor</p>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{requests.length}</span>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-lg font-semibold text-gray-900">{requests.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{statusCounts.pending}</span>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-lg font-semibold text-gray-900">{statusCounts.pending}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{statusCounts.approved}</span>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-lg font-semibold text-gray-900">{statusCounts.approved}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{statusCounts.denied}</span>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Denied</p>
                    <p className="text-lg font-semibold text-gray-900">{statusCounts.denied}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['all', 'pending', 'approved', 'denied'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    filter === status
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status} {status !== 'all' && `(${statusCounts[status]})`}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📥</div>
            <h3 className="text-lg font-medium text-gray-900">No {filter !== 'all' ? filter : ''} requests</h3>
            <p className="text-gray-500 mt-1">
              {filter === 'all' 
                ? 'No access requests have been submitted yet.' 
                : `No ${filter} access requests.`}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <li key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-400' :
                            request.status === 'approved' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">{request.email}</p>
                            {request.company && (
                              <p className="text-sm text-gray-500">{request.company}</p>
                            )}
                          </div>
                          {request.message && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                "{request.message}"
                              </p>
                            </div>
                          )}
                          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                            <span>Submitted: {new Date(request.createdAt).toLocaleString()}</span>
                            <span>IP: {request.ip}</span>
                            {request.accessCode && (
                              <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                Code: {request.accessCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {processing === request.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeny(request.id)}
                          disabled={processing === request.id}
                          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadRequests}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Refresh Requests
          </button>
        </div>
      </div>
    </div>
  );
}
