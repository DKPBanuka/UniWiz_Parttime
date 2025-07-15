// FILE: src/components/LoginPage.js (Updated with Student/Publisher terminology and Company Name for Publishers)
// =============================================
// This component provides a full-page login interface similar to the provided UI example.

import React, { useState } from 'react';

function LoginPage({ onLoginSuccess, onShowSignUp }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // State for full name or company name in signup mode
    const [role, setRole] = useState('student'); // State for role selection in signup mode
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSignUpMode, setIsSignUpMode] = useState(false); // State to toggle between login/signup forms

    // Function to toggle between Login and Sign Up modes
    const toggleMode = () => {
        setIsSignUpMode(prev => !prev);
        setError(null); // Clear any errors when switching modes
        setIsLoading(false); // Explicitly reset loading state
        setEmail(''); // Clear form fields
        setPassword('');
        setFullName(''); // Clear full name/company name field
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        // Determine the action (register or login) based on the current mode
        const action = isSignUpMode ? 'register' : 'login';
        let payload = { email, password, action };

        // If in sign-up mode, handle full name or company name based on role
        if (isSignUpMode) {
            payload.role = role;
            if (role === 'publisher') {
                // For publishers, fullName is the company name
                payload.company_name = fullName;
                payload.first_name = ''; // Set first_name to empty for publishers during signup
                payload.last_name = '';  // Set last_name to empty for publishers during signup
            } else {
                // For students, split full name into first and last name
                const nameParts = fullName.split(' ');
                payload.first_name = nameParts[0] || '';
                payload.last_name = nameParts.slice(1).join(' ') || '';
            }
        }

        try {
            const apiUrl = 'http://uniwiz.test/auth.php';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                // If API response is not OK, throw an error with the message from the backend
                throw new Error(result.message || 'An unknown error occurred.');
            }
            
            // If login or registration is successful, call the success handler
            onLoginSuccess(result.user);

        } catch (err) {
            // Catch and display any errors during the API call
            setError(err.message);
        } finally {
            // Always reset loading state after the operation completes
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Section - Branding/Marketing (visible on large screens) */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-primary-dark p-8">
                <div className="text-white text-center">
                    {/* UniWiz Logo */}
                    <img src="/logo.png" alt="UniWiz Logo" className="h-20 mx-auto mb-6" />
                    <h1 className="text-5xl font-bold leading-tight mb-4">Your Next Opportunity Awaits.</h1>
                    <p className="text-lg opacity-80 max-w-md mx-auto">
                        UniWiz is your go-to platform for part-time, daily-wage, and flexible jobs. Connect with employers for events, delivery, hospitality, and more.
                    </p>
                </div>
            </div>

            {/* Right Section - Login/Signup Form */}
            <div className="flex-1 flex items-center justify-center bg-gray-900 p-8 sm:p-12 lg:p-16">
                <div className="w-full max-w-md bg-gray-900">
                    {/* Dynamic Heading based on mode */}
                    <h2 className="text-4xl font-bold text-white mb-4 text-center lg:text-left">
                        {isSignUpMode ? 'Join UniWiz' : 'Welcome Back!'}
                    </h2>
                    {/* Dynamic Subtitle based on mode */}
                    <p className="text-gray-400 mb-8 text-center lg:text-left">
                        {isSignUpMode ? 'Create an account to find jobs or hire talent.' : 'Log in to continue your journey.'}
                    </p>

                    {/* Role Selection for Sign Up Mode */}
                    {isSignUpMode && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button 
                                type="button" // Important: type="button" to prevent form submission
                                onClick={() => setRole('student')} 
                                className={`flex items-center justify-center px-4 py-3 border rounded-lg text-white font-semibold transition-colors ${role === 'student' ? 'border-yellow-500 bg-gray-800' : 'border-gray-700 hover:bg-gray-800'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                Student {/* Changed from Job Seeker */}
                            </button>
                            <button 
                                type="button" // Important: type="button" to prevent form submission
                                onClick={() => setRole('publisher')} 
                                className={`flex items-center justify-center px-4 py-3 border rounded-lg text-white font-semibold transition-colors ${role === 'publisher' ? 'border-yellow-500 bg-gray-800' : 'border-gray-700 hover:bg-gray-800'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m8-10h1m-1 4h1m-1 4h1m-8 4v-4c0-1.49.53-2.94 1.5-4L12 9l2.5-2c.97-1.06 1.5-2.51 1.5-4V3H5v3" /></svg>
                                Publisher {/* Changed from Company */}
                            </button>
                        </div>
                    )}

                    {/* Google Sign-in Button (only in Login Mode) */}
                    {!isSignUpMode && (
                        <>
                            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 font-semibold mb-6 hover:bg-gray-50 transition-colors bg-white">
                                <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_64dp.png" alt="Google logo" className="h-5 w-5 mr-3" />
                                Continue with Google
                            </button>

                            <div className="flex items-center justify-between text-gray-500 mb-6">
                                <hr className="flex-grow border-t border-gray-700" />
                                <span className="mx-4">OR</span>
                                <hr className="flex-grow border-t border-gray-700" />
                            </div>
                        </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name / Company Name input (only in Sign Up Mode) */}
                        {isSignUpMode && (
                            <div>
                                <label className="sr-only" htmlFor="fullName">
                                    {role === 'publisher' ? 'Company Name' : 'Full Name'} {/* Dynamic label */}
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </span>
                                    <input 
                                        id="fullName" 
                                        type="text" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        className="pl-10 block w-full border border-gray-700 bg-gray-800 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:ring-primary-main focus:border-primary-main focus:outline-none" 
                                        placeholder={role === 'publisher' ? 'Company Name' : 'Full Name'} // Dynamic placeholder
                                        required={isSignUpMode} // Required only if in signup mode
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="sr-only" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.5a2.5 2.5 0 00-5 0V12" /></svg>
                                </span>
                                <input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="pl-10 block w-full border border-gray-700 bg-gray-800 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:ring-primary-main focus:border-primary-main focus:outline-none" 
                                    placeholder="Email" 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="sr-only" htmlFor="password">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z" /></svg>
                                </span>
                                <input 
                                    id="password" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="pl-10 block w-full border border-gray-700 bg-gray-800 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-500 focus:ring-primary-main focus:border-primary-main focus:outline-none" 
                                    placeholder="Password" 
                                    required 
                                />
                                {/* Eye icon for password visibility (placeholder) */}
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </span>
                            </div>
                        </div>

                        {/* Forgot Password link (only in Login Mode) */}
                        {!isSignUpMode && (
                            <div className="text-right">
                                <a href="#" className="text-sm font-semibold text-primary-main hover:text-primary-dark">Forgot Password?</a>
                            </div>
                        )}
                        
                        {/* Submit Button (dynamic text) */}
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400"
                        >
                            {isLoading ? (isSignUpMode ? 'Signing Up...' : 'Logging In...') : (isSignUpMode ? 'Sign Up' : 'Log In')}
                        </button>
                    </form>

                    {/* Toggle between Login and Sign Up */}
                    <p className="mt-8 text-center text-gray-400">
                        {isSignUpMode ? 'Already have an account?' : 'Don\'t have an account?'}
                        <button 
                            onClick={toggleMode} 
                            className="ml-1 font-bold text-primary-main hover:text-primary-dark"
                        >
                            {isSignUpMode ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
