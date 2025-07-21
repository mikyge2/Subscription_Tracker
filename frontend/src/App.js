import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    CreditCard,
    Trash2,
    Edit3,
    Eye,
    EyeOff,
    LogOut,
    User,
    Bell,
    DollarSign,
    RefreshCw
} from 'lucide-react';

const API_BASE = 'https://f9673bfde627.ngrok-free.app/api/v1';

const SubscriptionTracker = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('login');
    const [subscriptions, setSubscriptions] = useState([]);
    const [upcomingRenewals, setUpcomingRenewals] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingSubscription, setEditingSubscription] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form states
    const [authForm, setAuthForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [subscriptionForm, setSubscriptionForm] = useState({
        name: '',
        price: '',
        currency: 'USD',
        frequency: 'monthly',
        category: 'entertainment',
        startDate: '',
        payment: 'Credit Card'
    });

    // Form validation
    const validateAuthForm = () => {
        if (currentView === 'signup' && !authForm.name.trim()) {
            setError('Full name is required');
            return false;
        }
        if (!authForm.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!authForm.password || authForm.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const validateSubscriptionForm = () => {
        if (!subscriptionForm.name.trim()) {
            setError('Service name is required');
            return false;
        }
        if (!subscriptionForm.price || subscriptionForm.price <= 0) {
            setError('Valid price is required');
            return false;
        }
        if (!subscriptionForm.startDate) {
            setError('Start date is required');
            return false;
        }
        return true;
    };

    // API Functions
    const apiCall = async (endpoint, method = 'GET', body = null) => {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            // Add auth token if available
            const token = localStorage.getItem('authToken');
            if (token) {
                options.headers.Authorization = `Bearer ${token}`;
            }

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_BASE}${endpoint}`, options);

            // Handle different error types
            if (response.status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
                setCurrentView('login');
                throw new Error('Session expired. Please login again.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                throw new Error('Network error. Please check your connection.');
            }
            throw err;
        }
    };

    // Load user data with useCallback to fix dependency warning
    const loadUserData = useCallback(async (userId) => {
        try {
            const [subsResponse, renewalsResponse] = await Promise.all([
                apiCall(`/subscriptions/user/${userId}`),
                apiCall(`/subscriptions/upcoming-user-renewals/${userId}`)
            ]);

            setSubscriptions(subsResponse.data || []);
            setUpcomingRenewals(renewalsResponse.data || []);
        } catch (err) {
            console.error('Error loading user data:', err);
            setError('Failed to load subscription data');
        }
    }, []);

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');

        if (token && user) {
            try {
                const parsedUser = JSON.parse(user);
                setCurrentUser(parsedUser);
                setCurrentView('dashboard');
                loadUserData(parsedUser._id);
            } catch (err) {
                console.error('Error parsing stored user:', err);
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
            }
        }
    }, [loadUserData]);

    const handleSignUp = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!validateAuthForm()) return;

        setLoading(true);
        setError('');

        try {
            await apiCall('/auth/sign-up/', 'POST', authForm);
            setSuccess('Account created successfully! Please sign in.');
            setCurrentView('login');
            setAuthForm({ name: '', email: '', password: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!validateAuthForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await apiCall('/auth/sign-in/', 'POST', {
                email: authForm.email,
                password: authForm.password
            });

            // Store token and user if API returns them
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            }

            setCurrentUser(response.data.user);
            setCurrentView('dashboard');
            setAuthForm({ name: '', email: '', password: '' });
            loadUserData(response.data.user._id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await apiCall(`/auth/sign-out/${currentUser._id}`, 'POST');
        } catch (err) {
            console.error('Sign out error:', err);
        } finally {
            // Clear local storage and state regardless of API call result
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            setCurrentView('login');
            setSubscriptions([]);
            setUpcomingRenewals([]);
        }
    };

    const handleAddSubscription = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!validateSubscriptionForm()) return;

        setLoading(true);
        setError('');

        try {
            await apiCall('/subscriptions/', 'POST', {
                ...subscriptionForm,
                userId: currentUser._id
            });
            setSuccess('Subscription added successfully!');
            setShowAddForm(false);
            resetSubscriptionForm();
            loadUserData(currentUser._id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubscription = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!validateSubscriptionForm()) return;

        setLoading(true);
        setError('');

        try {
            await apiCall(`/subscriptions/${editingSubscription._id}`, 'PUT', {
                ...subscriptionForm,
                userId: currentUser._id
            });
            setSuccess('Subscription updated successfully!');
            setEditingSubscription(null);
            setShowAddForm(false);
            resetSubscriptionForm();
            loadUserData(currentUser._id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubscription = async (id) => {
        // Replace window.confirm with explicit confirmation
        const shouldDelete = window.confirm('Are you sure you want to delete this subscription?'); // eslint-disable-line no-restricted-globals
        if (!shouldDelete) return;

        setLoading(true);
        try {
            await apiCall(`/subscriptions/${id}`, 'DELETE');
            setSuccess('Subscription deleted successfully!');
            loadUserData(currentUser._id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async (id) => {
        // Replace window.confirm with explicit confirmation
        const shouldCancel = window.confirm('Are you sure you want to cancel this subscription?'); // eslint-disable-line no-restricted-globals
        if (!shouldCancel) return;

        setLoading(true);
        try {
            await apiCall(`/subscriptions/cancel/${id}`, 'PUT');
            setSuccess('Subscription cancelled successfully!');
            loadUserData(currentUser._id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalCost = () => {
        return subscriptions.reduce((total, sub) => {
            const monthlyPrice = sub.frequency === 'yearly' ? sub.price / 12 : sub.price;
            return total + monthlyPrice;
        }, 0);
    };

    const startEditSubscription = (subscription) => {
        setEditingSubscription(subscription);
        setSubscriptionForm({
            name: subscription.name,
            price: subscription.price,
            currency: subscription.currency,
            frequency: subscription.frequency,
            category: subscription.category,
            startDate: subscription.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : '',
            payment: subscription.payment
        });
        setShowAddForm(true);
    };

    const resetSubscriptionForm = () => {
        setSubscriptionForm({
            name: '',
            price: '',
            currency: 'USD',
            frequency: 'monthly',
            category: 'entertainment',
            startDate: '',
            payment: 'Credit Card'
        });
    };

    const cancelEdit = () => {
        setShowAddForm(false);
        setEditingSubscription(null);
        resetSubscriptionForm();
        setError('');
    };

    // Clear messages after 3 seconds
    useEffect(() => {
        let timeoutId;
        if (error || success) {
            timeoutId = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [error, success]);

    if (currentView === 'login' || currentView === 'signup') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">SubsTracker</h1>
                            <p className="text-gray-300">Manage your subscriptions with style</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={currentView === 'login' ? handleSignIn : handleSignUp}>
                            <div className="space-y-4">
                                {currentView === 'signup' && (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={authForm.name}
                                            onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={authForm.email}
                                        onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={authForm.password}
                                        onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <RefreshCw className="animate-spin w-5 h-5 mx-auto" /> : (currentView === 'login' ? 'Sign In' : 'Sign Up')}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setCurrentView(currentView === 'login' ? 'signup' : 'login');
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                {currentView === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-white">SubsTracker</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-300">
                                <User className="w-5 h-5" />
                                <span>{currentUser?.name}</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="text-gray-300 hover:text-white transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
                        {success}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Total Subscriptions</p>
                                <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Monthly Cost</p>
                                <p className="text-2xl font-bold text-white">${calculateTotalCost().toFixed(2)}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Upcoming Renewals</p>
                                <p className="text-2xl font-bold text-white">{upcomingRenewals.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <Bell className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Subscription Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Your Subscriptions</h2>
                    <button
                        onClick={() => {
                            setShowAddForm(true);
                            setEditingSubscription(null);
                            resetSubscriptionForm();
                            setError('');
                        }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:from-purple-600 hover:to-blue-600 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Subscription</span>
                    </button>
                </div>

                {/* Add/Edit Subscription Form */}
                {showAddForm && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
                        </h3>
                        <form onSubmit={editingSubscription ? handleUpdateSubscription : handleAddSubscription}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        value={subscriptionForm.name}
                                        onChange={(e) => setSubscriptionForm({...subscriptionForm, name: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={subscriptionForm.price}
                                        onChange={(e) => setSubscriptionForm({...subscriptionForm, price: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Currency</label>
                                    <select
                                        value={subscriptionForm.currency}
                                        onChange={(e) => setSubscriptionForm({...subscriptionForm, currency: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Frequency</label>
                                    <select
                                        value={subscriptionForm.frequency}
                                        onChange={(e) => setSubscriptionForm({...subscriptionForm, frequency: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Category</label>
                                    <select
                                        value={subscriptionForm.category}
                                        onChange={(e) => setSubscriptionForm({...subscriptionForm, category: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="entertainment">Entertainment</option>
                                        <option value="productivity">Productivity</option>
                                        <option value="lifestyle">Lifestyle</option>
                                        <option value="education">Education</option>
                                        <option value="business">Business</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={subscriptionForm.startDate}
                                        onChange={(e) => setSubscriptionForm({...subscriptionForm, startDate: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-300 text-sm mb-2">Payment Method</label>
                                    <select
                                        value={subscriptionForm.payment}
                                        onChange={(e) => setSubscriptionForm({...subscriptionForm, payment: e.target.value})}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="PayPal">PayPal</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 flex space-x-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : (editingSubscription ? 'Update' : 'Add')} Subscription
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Subscriptions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.map((subscription) => (
                        <div key={subscription._id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{subscription.name}</h3>
                                    <p className="text-gray-300 text-sm capitalize">{subscription.category}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => startEditSubscription(subscription)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSubscription(subscription._id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Price:</span>
                                    <span className="text-white font-semibold">{subscription.currency} {subscription.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Frequency:</span>
                                    <span className="text-white capitalize">{subscription.frequency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Payment:</span>
                                    <span className="text-white">{subscription.payment}</span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleCancelSubscription(subscription._id)}
                                    className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {subscriptions.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-300 text-lg">No subscriptions yet</p>
                        <p className="text-gray-500">Add your first subscription to get started</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SubscriptionTracker;
