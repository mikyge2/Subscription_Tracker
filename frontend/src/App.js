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
    RefreshCw,
    X,
    Calendar,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const API_BASE = 'https://subscriptiontracker-production-c3ff.up.railway.app/api/v1';

// Custom Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Notification Toast Component
const Toast = ({ message, type = 'info', isVisible, onClose }) => {
    if (!isVisible) return null;

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <AlertCircle className="w-5 h-5" />
    };

    const colors = {
        success: 'from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-300',
        error: 'from-red-500/20 to-rose-500/20 border-red-500/50 text-red-300',
        info: 'from-blue-500/20 to-indigo-500/20 border-blue-500/50 text-blue-300'
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`bg-gradient-to-r ${colors[type]} border rounded-xl p-4 flex items-center space-x-3 shadow-2xl backdrop-blur-lg animate-pulse`}>
                {icons[type]}
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 text-gray-300 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const SubscriptionTracker = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('login');
    const [subscriptions, setSubscriptions] = useState([]);
    const [upcomingRenewals, setUpcomingRenewals] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRenewalsModal, setShowRenewalsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // Toast notification state
    const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

    // Form states
    const [authForm, setAuthForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [userEditForm, setUserEditForm] = useState({
        name: '',
        email: ''
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

    // Show toast notification
    const showToast = (message, type = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // Form validation
    const validateAuthForm = () => {
        if (currentView === 'signup' && !authForm.name.trim()) {
            showToast('Full name is required', 'error');
            return false;
        }
        if (!authForm.email.trim()) {
            showToast('Email is required', 'error');
            return false;
        }
        if (!authForm.password || authForm.password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return false;
        }
        return true;
    };

    const validateSubscriptionForm = () => {
        if (!subscriptionForm.name.trim()) {
            showToast('Service name is required', 'error');
            return false;
        }
        if (!subscriptionForm.price || subscriptionForm.price <= 0) {
            showToast('Valid price is required', 'error');
            return false;
        }
        if (!subscriptionForm.startDate) {
            showToast('Start date is required', 'error');
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
                    'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'application/json',
                },
            };

            const token = localStorage.getItem('authToken');
            if (token) {
                options.headers.Authorization = `Bearer ${token}`;
            }

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_BASE}${endpoint}`, options);

            if (response.status === 401) {
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
            showToast('Failed to load subscription data', 'error');
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
                setUserEditForm({ name: parsedUser.name, email: parsedUser.email });
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

        try {
            await apiCall('/auth/sign-up/', 'POST', authForm);
            showToast('Account created successfully! Please sign in.', 'success');
            setCurrentView('login');
            setAuthForm({ name: '', email: '', password: '' });
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!validateAuthForm()) return;

        setLoading(true);

        try {
            const response = await apiCall('/auth/sign-in/', 'POST', {
                email: authForm.email,
                password: authForm.password
            });

            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            }

            setCurrentUser(response.data.user);
            setUserEditForm({ name: response.data.user.name, email: response.data.user.email });
            setCurrentView('dashboard');
            setAuthForm({ name: '', email: '', password: '' });
            loadUserData(response.data.user._id);
            showToast('Welcome back!', 'success');
        } catch (err) {
            showToast(err.message, 'error');
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
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
            setCurrentView('login');
            setSubscriptions([]);
            setUpcomingRenewals([]);
            showToast('Signed out successfully', 'info');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiCall(`/users/${currentUser._id}`, 'PUT', userEditForm);
            const updatedUser = { ...currentUser, ...userEditForm };
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setShowUserModal(false);
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubscription = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!validateSubscriptionForm()) return;

        setLoading(true);

        try {
            await apiCall('/subscriptions/', 'POST', {
                ...subscriptionForm,
                userId: currentUser._id
            });
            showToast('Subscription added successfully!', 'success');
            setShowAddForm(false);
            resetSubscriptionForm();
            loadUserData(currentUser._id);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubscription = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!validateSubscriptionForm()) return;

        setLoading(true);

        try {
            await apiCall(`/subscriptions/${editingSubscription._id}`, 'PUT', {
                ...subscriptionForm,
                userId: currentUser._id
            });
            showToast('Subscription updated successfully!', 'success');
            setEditingSubscription(null);
            setShowAddForm(false);
            resetSubscriptionForm();
            loadUserData(currentUser._id);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showConfirmDialog = (action, message) => {
        setConfirmAction({ action, message });
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction.action();
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleDeleteSubscription = async (id) => {
        const deleteAction = async () => {
            setLoading(true);
            try {
                await apiCall(`/subscriptions/${id}`, 'DELETE');
                showToast('Subscription deleted successfully!', 'success');
                loadUserData(currentUser._id);
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        showConfirmDialog(deleteAction, 'Are you sure you want to delete this subscription?');
    };

    const handleCancelSubscription = async (id) => {
        const cancelAction = async () => {
            setLoading(true);
            try {
                await apiCall(`/subscriptions/cancel/${id}`, 'PUT');
                showToast('Subscription cancelled successfully!', 'success');
                loadUserData(currentUser._id);
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        showConfirmDialog(cancelAction, 'Are you sure you want to cancel this subscription?');
    };

    // Separate active and cancelled subscriptions
    const activeSubscriptions = subscriptions.filter(sub => sub.status !== 'cancelled');
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');

    const calculateTotalCost = () => {
        return activeSubscriptions.reduce((total, sub) => {
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
    };

    // Auto-hide toast after 4 seconds
    useEffect(() => {
        if (toast.isVisible) {
            const timer = setTimeout(hideToast, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.isVisible]);

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
                                }}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                {currentView === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </div>
                </div>

                <Toast {...toast} onClose={hideToast} />
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
                            <button
                                onClick={() => setShowUserModal(true)}
                                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span>{currentUser?.name}</span>
                            </button>
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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Active Subscriptions</p>
                                <p className="text-2xl font-bold text-white">{activeSubscriptions.length}</p>
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
                            <button
                                onClick={() => setShowRenewalsModal(true)}
                                className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center hover:bg-purple-500/30 transition-colors"
                            >
                                <Bell className="w-6 h-6 text-purple-400" />
                            </button>
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
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {loading && <RefreshCw className="animate-spin w-4 h-4" />}
                                        <span>{editingSubscription ? 'Update' : 'Add'} Subscription</span>
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

                {/* Active Subscriptions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {activeSubscriptions.map((subscription) => (
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

                {activeSubscriptions.length === 0 && (
                    <div className="text-center py-12 mb-8">
                        <div className="w-16 h-16 bg-gray-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-300 text-lg">No active subscriptions yet</p>
                        <p className="text-gray-500">Add your first subscription to get started</p>
                    </div>
                )}

                {/* Cancelled Subscriptions Section */}
                {cancelledSubscriptions.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Cancelled Subscriptions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cancelledSubscriptions.map((subscription) => (
                                <div key={subscription._id} className="relative bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 opacity-75">
                                    {/* CANCELLED Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="transform -rotate-12 text-red-500/30 text-4xl font-bold">
                                            CANCELLED
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-400 line-through">{subscription.name}</h3>
                                                <p className="text-gray-500 text-sm capitalize">{subscription.category}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSubscription(subscription._id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Price:</span>
                                                <span className="text-gray-400 line-through">{subscription.currency} {subscription.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Frequency:</span>
                                                <span className="text-gray-400 capitalize line-through">{subscription.frequency}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Payment:</span>
                                                <span className="text-gray-400 line-through">{subscription.payment}</span>
                                            </div>
                                        </div>

                                        <div className="bg-red-500/20 text-red-400 py-2 rounded-lg text-center">
                                            Cancelled
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* User Profile Modal */}
            <Modal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title="User Profile"
            >
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Full Name</label>
                        <input
                            type="text"
                            value={userEditForm.name}
                            onChange={(e) => setUserEditForm({...userEditForm, name: e.target.value})}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Email</label>
                        <input
                            type="email"
                            value={userEditForm.email}
                            onChange={(e) => setUserEditForm({...userEditForm, email: e.target.value})}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading && <RefreshCw className="animate-spin w-4 h-4" />}
                            <span>Update Profile</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUserModal(false)}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Upcoming Renewals Modal */}
            <Modal
                isOpen={showRenewalsModal}
                onClose={() => setShowRenewalsModal(false)}
                title="Upcoming Renewals"
            >
                <div className="space-y-4">
                    {upcomingRenewals.length > 0 ? (
                        upcomingRenewals.map((renewal, index) => (
                            <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white">{renewal.name}</h3>
                                    <span className="text-sm text-purple-400 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(renewal.nextRenewal).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Amount:</span>
                                    <span className="text-white font-medium">{renewal.currency} {renewal.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Frequency:</span>
                                    <span className="text-white capitalize">{renewal.frequency}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-300">No upcoming renewals</p>
                            <p className="text-gray-500 text-sm">All your subscriptions are up to date</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirm Action"
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-yellow-400">
                        <AlertCircle className="w-6 h-6" />
                        <p className="text-white">{confirmAction?.message}</p>
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={handleConfirm}
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Yes, Confirm
                        </button>
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            <Toast {...toast} onClose={hideToast} />
        </div>
    );
};

export default SubscriptionTracker;
