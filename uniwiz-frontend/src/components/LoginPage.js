// FILE: src/components/LoginPage.js (UPDATED with Fixed Left Side & Scrollable Right Side)
// =============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function LoginPage({ onLoginSuccess, setPage, initialState }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // useEffect to handle the initial state from another page
    useEffect(() => {
        if (initialState) {
            if (initialState.signup) {
                setIsSignUpMode(true);
            }
            if (initialState.role) {
                setRole(initialState.role);
            }
        }
    }, [initialState]);


    const toggleMode = () => {
        setIsSignUpMode(prev => !prev);
        setError(null);
        setIsLoading(false);
        setEmail('');
        setPassword('');
        setFullName('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const action = isSignUpMode ? 'register' : 'login';
        let payload = { email, password, action };

        if (isSignUpMode) {
            payload.role = role;
            if (role === 'publisher') {
                payload.company_name = fullName;
                payload.first_name = '';
                payload.last_name = '';
            } else {
                const nameParts = fullName.split(' ');
                payload.first_name = nameParts[0] || '';
                payload.last_name = nameParts.slice(1).join(' ') || '';
            }
        }

        try {
            const apiUrl = 'http://uniwiz-backend.test/api/auth.php';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'An unknown error occurred.');
            }
            
            onLoginSuccess(result.user);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- UPDATED: Changed 'min-h-screen' to 'h-screen' and added 'overflow-hidden' ---
        // This makes the entire container fixed to the screen height.
        <div className="h-screen flex bg-white overflow-hidden">
            {/* Left Section - Branding/Marketing (This will now be fixed) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary-dark to-primary-darker p-8"
            >
                <motion.div 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="text-white text-center"
                >
                    <img 
                        src="/logo.png" 
                        alt="UniWiz Logo" 
                        className="h-24 mx-auto mb-8 hover:scale-105 transition-transform duration-300" 
                    />
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.2 } }}
                        className="text-5xl font-bold leading-tight mb-6"
                    >
                        
                        Earn While You Learn
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.4 } }}
                        className="text-xl opacity-90 max-w-lg mx-auto"
                    >
                        Connecting Sri Lankan university students with verified part-time and freelance opportunities.
                    </motion.p>
                </motion.div>
            </motion.div>

            {/* Right Section - Login/Signup Form (This will now be scrollable) */}
            {/* --- UPDATED: Added 'overflow-y-auto' to make this div scrollable if content overflows --- */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-8 sm:p-12 lg:p-16 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="mb-8 text-center">
                        <img 
                            src="/logo.png" 
                            alt="UniWiz Logo" 
                            className="h-16 mx-auto mb-4 lg:hidden" 
                        />
                        <motion.h2 
                            whileHover={{ scale: 1.02 }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            {isSignUpMode ? 'Join UniWiz' : 'Welcome Back'}
                        </motion.h2>
                        <p className="text-gray-600">
                            {isSignUpMode ? 'Create your account to get started' : 'Sign in to continue'}
                        </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start"
                            >
                                <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error.includes('verify') ? 'Please verify your email address. Check your inbox or spam folder.' : error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Role Selection */}
                    {isSignUpMode && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 gap-4 mb-6"
                        >
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={() => setRole('student')} 
                                className={`flex items-center justify-center px-4 py-3 border rounded-lg font-semibold transition-all ${
                                    role === 'student' 
                                        ? 'border-primary-main bg-primary-lighter/50 text-primary-dark' 
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Student
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={() => setRole('publisher')} 
                                className={`flex items-center justify-center px-4 py-3 border rounded-lg font-semibold transition-all ${
                                    role === 'publisher' 
                                        ? 'border-primary-main bg-primary-lighter/50 text-primary-dark' 
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m8-10h1m-1 4h1m-1 4h1m-8 4v-4c0-1.49.53-2.94 1.5-4L12 9l2.5-2c.97-1.06 1.5-2.51 1.5-4V3H5v3" />
                                </svg>
                                Publisher
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Google Sign-in */}
                    {/* Removed Google button and divider */}

                    {/* Forgot Password Form */}
                    {/* REMOVE all UI related to forgot password (forms, buttons, messages) */}

                    {/* Submit Button */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name / Company Name (Sign Up mode) */}
                        {isSignUpMode && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    {role === 'publisher' ? 'Company Name' : 'Full Name'}
                                </label>
                                <div className="relative">
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-gray-900 placeholder-gray-400 focus:ring-primary-main focus:border-primary-main focus:outline-none focus:ring-2"
                                        placeholder={role === 'publisher' ? 'Enter company name' : 'Enter your full name'}
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                        {/* Email Input */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-gray-900 placeholder-gray-400 focus:ring-primary-main focus:border-primary-main focus:outline-none focus:ring-2"
                                placeholder="Enter your email"
                                required
                            />
                        </motion.div>
                        {/* Password Input */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-gray-900 placeholder-gray-400 focus:ring-primary-main focus:border-primary-main focus:outline-none focus:ring-2 pr-10"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {showPassword ? (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </>
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary-main to-primary-dark hover:from-primary-dark hover:to-primary-main text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isSignUpMode ? 'Creating Account...' : 'Signing In...'}
                                </span>
                            ) : isSignUpMode ? 'Create Account' : 'Sign In'}
                        </motion.button>
                    </form>
                    {/* Toggle Mode */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 text-center text-gray-600"
                    >
                        {isSignUpMode ? (
                            <>
                                Already have an account?{' '}
                                <button 
                                    onClick={toggleMode} 
                                    className="ml-1 font-semibold text-primary-main hover:text-primary-dark focus:outline-none"
                                >
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <>
                                Don&apos;t have an account?{' '}
                                <button 
                                    onClick={toggleMode} 
                                    className="ml-1 font-semibold text-primary-main hover:text-primary-dark focus:outline-none"
                                >
                                    Create Account
                                </button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default LoginPage;