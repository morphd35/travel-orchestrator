import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import AuthModal from './AuthModal';

interface PassengerInfo {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE';
    email: string;
    phone: {
        countryCode: string;
        number: string;
    };
    documents?: {
        type: 'PASSPORT' | 'IDENTITY_CARD';
        number: string;
        expiryDate: string;
        issuanceCountry: string;
        nationality: string;
    }[];
}

interface BookingFormProps {
    flightDetails: {
        origin: string;
        destination: string;
        depart: string;
        returnDate?: string;
        total: number;
        currency: string;
        carrier: string;
        adults: number;
    };
    onBookingComplete: (bookingConfirmation: any) => void;
    onCancel: () => void;
}

export default function BookingForm({ flightDetails, onBookingComplete, onCancel }: BookingFormProps) {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

    const [passengers, setPassengers] = useState<PassengerInfo[]>(
        Array.from({ length: flightDetails.adults }, () => ({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'MALE' as const,
            email: '', // Will use contactInfo email
            phone: {   // Will use contactInfo phone
                countryCode: '1',
                number: ''
            }
        }))
    );

    const [recentPassengers, setRecentPassengers] = useState<any[]>([]);

    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: {
            countryCode: '1',
            number: ''
        },
        address: {
            lines: [''],
            postalCode: '',
            cityName: '',
            countryCode: 'US'
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'passenger-info' | 'contact-info' | 'review' | 'processing'>('passenger-info');
    const [bookingCapabilities, setBookingCapabilities] = useState<any>(null);

    // Show authentication requirement if user is not signed in
    if (!user) {
        return (
            <>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="text-blue-500 text-5xl mb-4">🔐</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
                            <p className="text-gray-600 mb-6">
                                Please sign in to your account to book flights and manage your travel history.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Sign In / Sign Up
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    initialMode={authMode}
                />
            </>
        );
    }

    // Check booking capabilities and auto-populate user data when user is available
    useEffect(() => {
        fetch('/api/booking/flight?action=capabilities')
            .then(res => res.json())
            .then(data => setBookingCapabilities(data))
            .catch(err => console.error('Error fetching capabilities:', err));

        // Auto-populate forms with user information when authenticated
        if (user) {
            // Auto-populate contact information
            setContactInfo(prev => ({
                ...prev,
                email: user.email || prev.email,
                phone: {
                    ...prev.phone,
                    number: user.phone ? user.phone.replace(/^\+?1/, '') : prev.phone.number // Remove country code if present
                }
            }));

            // Auto-populate first passenger with user's name (assuming they're booking for themselves)
            if (passengers.length > 0) {
                setPassengers(prev => {
                    const updated = [...prev];
                    // Only auto-populate if the first passenger fields are empty
                    if (!updated[0].firstName && !updated[0].lastName) {
                        updated[0] = {
                            ...updated[0],
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            email: user.email || updated[0].email,
                            phone: {
                                ...updated[0].phone,
                                number: user.phone ? user.phone.replace(/^\+?1/, '') : updated[0].phone.number
                            }
                        };
                    }
                    return updated;
                });
            }
        }
    }, [user]);

    const updatePassenger = (index: number, field: string, value: any) => {
        const updatedPassengers = [...passengers];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            const parentValue = updatedPassengers[index][parent as keyof PassengerInfo];
            updatedPassengers[index] = {
                ...updatedPassengers[index],
                [parent]: {
                    ...(typeof parentValue === 'object' ? parentValue : {}),
                    [child]: value
                }
            };
        } else {
            updatedPassengers[index] = {
                ...updatedPassengers[index],
                [field]: value
            };
        }
        setPassengers(updatedPassengers);
    };

    const isPassengerValid = (passenger: PassengerInfo) => {
        return passenger.firstName &&
            passenger.lastName &&
            passenger.dateOfBirth;
    };

    const canProceedFromPassengerInfo = () => {
        return passengers.every(isPassengerValid);
    };

    const canProceedFromContactInfo = () => {
        return contactInfo.email &&
            contactInfo.phone.number &&
            contactInfo.address.lines[0] &&
            contactInfo.address.cityName &&
            contactInfo.address.postalCode;
    };

    const handlePriceCheck = async () => {
        try {
            const params = new URLSearchParams({
                action: 'price-check',
                origin: flightDetails.origin,
                destination: flightDetails.destination,
                departDate: flightDetails.depart,
                adults: flightDetails.adults.toString(),
                total: flightDetails.total.toString(),
                currency: flightDetails.currency,
                carrier: flightDetails.carrier
            });

            if (flightDetails.returnDate) {
                params.set('returnDate', flightDetails.returnDate);
            }

            const response = await fetch(`/api/booking/flight?${params}`);
            const data = await response.json();

            if (!data.available) {
                throw new Error('FLIGHT_UNAVAILABLE');
            }

            if (data.priceConfirmation.priceChanged) {
                const priceChange = data.priceConfirmation.currentPrice.amount - data.priceConfirmation.originalPrice.amount;
                if (Math.abs(priceChange) > 10) { // More than $10 change
                    throw new Error(`Price has changed by ${data.priceConfirmation.currency} ${priceChange.toFixed(2)}. Please review the new price.`);
                }
            }

            return data;
        } catch (error) {
            throw error;
        }
    };

    const handleBooking = async () => {
        setLoading(true);
        setError(null);
        setStep('processing');

        try {
            // First, check current price
            await handlePriceCheck();

            // Prepare booking request - populate passenger contact info
            const passengersWithContact = passengers.map(passenger => ({
                ...passenger,
                email: contactInfo.email,
                phone: contactInfo.phone
            }));

            const bookingRequest = {
                userId: user.id, // Include user ID for profile management
                searchParams: {
                    origin: flightDetails.origin,
                    destination: flightDetails.destination,
                    departDate: flightDetails.depart,
                    returnDate: flightDetails.returnDate,
                    adults: flightDetails.adults,
                    currency: flightDetails.currency
                },
                originalOffer: {
                    total: flightDetails.total,
                    currency: flightDetails.currency,
                    carrier: flightDetails.carrier
                },
                passengers: passengersWithContact,
                contactInfo
            };

            const response = await fetch('/api/booking/flight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingRequest)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    // Price changed
                    throw new Error(data.message || 'Price has changed during booking');
                }
                throw new Error(data.message || 'Booking failed');
            }

            console.log('✅ Booking successful:', data.booking);

            // Passenger profiles will be saved server-side in the booking API
            // This keeps the client-side simple and avoids database import issues

            // Redirect to confirmation page with booking details
            const params = new URLSearchParams({
                ref: data.booking.bookingReference || data.booking.id || 'N/A',
                amount: flightDetails.total.toString(),
                currency: flightDetails.currency
            });
            window.location.href = `/confirmation?${params.toString()}`;

            // Still call the parent callback for any additional handling
            onBookingComplete(data.booking);

        } catch (error: any) {
            console.error('❌ Booking error:', error);

            // Handle specific error types with user-friendly messages
            if (error.message === 'FLIGHT_UNAVAILABLE') {
                setError('⚠️ This flight is no longer available. Flight offers expire quickly. Please search for new flights.');
            } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
                setError('⏰ Request timed out. The booking service is currently slow. Please try again or search for new flights.');
            } else if (error.message.includes('Price has changed')) {
                setError(`💰 ${error.message} Would you like to continue with the new price?`);
            } else if (error.message.includes('Price confirmation')) {
                setError('⚠️ Unable to confirm current flight prices. Please search for new flights to see the latest availability and pricing.');
            } else {
                setError(`❌ Booking failed: ${error.message}. Please try again or search for new flights.`);
            }

            setStep('review'); // Go back to review step
        } finally {
            setLoading(false);
        }
    };

    // Show booking not available message
    if (bookingCapabilities && !bookingCapabilities.enabled) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="text-center">
                        <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Coming Soon</h2>
                        <p className="text-gray-600 mb-6">
                            Direct flight booking is currently being set up and will be available soon.
                            For now, you can use the flight details to book directly with the airline.
                        </p>

                        {bookingCapabilities.capabilities && (
                            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-semibold text-blue-800 mb-2">Current Status:</h3>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    {bookingCapabilities.capabilities.limitations?.map((limitation: string, index: number) => (
                                        <li key={index}>• {limitation}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Continue with External Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Complete Your Booking</h2>
                            <p className="text-blue-100 mt-1">
                                {flightDetails.origin} → {flightDetails.destination} • {flightDetails.currency} {flightDetails.total}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-blue-100 hover:text-white text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center mt-6 space-x-4">
                        {['passenger-info', 'contact-info', 'review', 'processing'].map((stepName, index) => (
                            <div key={stepName} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === stepName ? 'bg-white text-blue-600' :
                                        ['passenger-info', 'contact-info', 'review'].indexOf(step) > index ? 'bg-blue-800 text-blue-200' :
                                            'bg-blue-500 text-blue-100'
                                    }`}>
                                    {index + 1}
                                </div>
                                {index < 3 && <div className="w-8 h-0.5 bg-blue-400 mx-2" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-red-400 text-xl">⚠️</span>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-red-800 font-medium">Booking Error</p>
                                    <p className="text-red-700 text-sm mt-1">{error}</p>

                                    {/* Action buttons for flight availability errors */}
                                    {(error.includes('no longer available') || error.includes('timeout') || error.includes('confirm current flight prices')) && (
                                        <div className="mt-3 flex space-x-3">
                                            <button
                                                onClick={() => window.location.href = `/?o=${flightDetails.origin}&d=${flightDetails.destination}&ds=${flightDetails.depart}&rs=${flightDetails.returnDate || ''}&adults=${flightDetails.adults}`}
                                                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                🔍 Search New Flights
                                            </button>
                                            <button
                                                onClick={() => setError(null)}
                                                className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Passenger Information */}
                    {step === 'passenger-info' && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6">
                                Passenger Information ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})
                            </h3>

                            {passengers.map((passenger, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
                                    <h4 className="text-lg font-semibold text-gray-700 mb-4">
                                        Passenger {index + 1}
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={passenger.firstName}
                                                onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter first name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={passenger.lastName}
                                                onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter last name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date of Birth *
                                            </label>
                                            <input
                                                type="date"
                                                value={passenger.dateOfBirth}
                                                onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender *
                                            </label>
                                            <select
                                                value={passenger.gender}
                                                onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                            </select>
                                        </div>


                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between">
                                <button
                                    onClick={onCancel}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setStep('contact-info')}
                                    disabled={!canProceedFromPassengerInfo()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next: Contact Info
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Information */}
                    {step === 'contact-info' && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={contactInfo.email}
                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="contact@example.com"
                                    />
                                    <p className="text-gray-500 text-sm mt-1">
                                        Booking confirmation will be sent to this email
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Phone *
                                    </label>
                                    <div className="flex">
                                        <select
                                            value={contactInfo.phone.countryCode}
                                            onChange={(e) => setContactInfo({
                                                ...contactInfo,
                                                phone: { ...contactInfo.phone, countryCode: e.target.value }
                                            })}
                                            className="px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="1">+1</option>
                                            <option value="44">+44</option>
                                            <option value="33">+33</option>
                                            <option value="49">+49</option>
                                        </select>
                                        <input
                                            type="tel"
                                            value={contactInfo.phone.number}
                                            onChange={(e) => setContactInfo({
                                                ...contactInfo,
                                                phone: { ...contactInfo.phone, number: e.target.value }
                                            })}
                                            className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-lg font-medium text-gray-800 mb-4">Billing Address *</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={contactInfo.address.lines[0]}
                                            onChange={(e) => setContactInfo({
                                                ...contactInfo,
                                                address: { ...contactInfo.address, lines: [e.target.value] }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={contactInfo.address.cityName}
                                            onChange={(e) => setContactInfo({
                                                ...contactInfo,
                                                address: { ...contactInfo.address, cityName: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="New York"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Postal Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={contactInfo.address.postalCode}
                                            onChange={(e) => setContactInfo({
                                                ...contactInfo,
                                                address: { ...contactInfo.address, postalCode: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="10001"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country *
                                        </label>
                                        <select
                                            value={contactInfo.address.countryCode}
                                            onChange={(e) => setContactInfo({
                                                ...contactInfo,
                                                address: { ...contactInfo.address, countryCode: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="US">United States</option>
                                            <option value="CA">Canada</option>
                                            <option value="GB">United Kingdom</option>
                                            <option value="FR">France</option>
                                            <option value="DE">Germany</option>
                                            <option value="AU">Australia</option>
                                            <option value="JP">Japan</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() => setStep('passenger-info')}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep('review')}
                                    disabled={!canProceedFromContactInfo()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Review Booking
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 'review' && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Review Your Booking</h3>

                            {/* Flight Summary */}
                            <div className="bg-blue-50 rounded-lg p-6 mb-6">
                                <h4 className="text-lg font-semibold text-blue-800 mb-4">Flight Details</h4>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-600 font-medium">Route:</span>
                                        <span className="ml-2">{flightDetails.origin} → {flightDetails.destination}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-600 font-medium">Price:</span>
                                        <span className="ml-2 font-bold">{flightDetails.currency} {flightDetails.total}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-600 font-medium">Departure:</span>
                                        <span className="ml-2">{flightDetails.depart}</span>
                                    </div>
                                    {flightDetails.returnDate && (
                                        <div>
                                            <span className="text-blue-600 font-medium">Return:</span>
                                            <span className="ml-2">{flightDetails.returnDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Passenger Summary */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Passengers</h4>
                                {passengers.map((passenger, index) => (
                                    <div key={index} className="mb-2 text-sm">
                                        <span className="font-medium">{index + 1}. </span>
                                        {passenger.firstName} {passenger.lastName} ({passenger.gender}) - {passenger.email}
                                    </div>
                                ))}
                            </div>

                            {/* Important Notice */}
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <span className="text-yellow-400 text-xl">⚠️</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-yellow-800 font-medium">Important</p>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Please verify all passenger information is correct. Changes after booking may incur additional fees.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep('contact-info')}
                                    disabled={loading}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleBooking}
                                    disabled={loading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                                >
                                    {loading ? 'Processing...' : `Book Flight - ${flightDetails.currency} ${flightDetails.total}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Processing */}
                    {step === 'processing' && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Processing Your Booking</h3>
                            <p className="text-gray-600">
                                Please wait while we confirm your flight and process your booking...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
