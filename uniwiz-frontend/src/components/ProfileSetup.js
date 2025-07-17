// FILE: src/components/ProfileSetup.js (FIXED - User ID is required error)
// ===============================================
// This component displays the form to complete user profile after registration.
// Modifications: Company name is auto-filled and a welcome tour-like experience has been added.
// FIXED: Added defensive checks for user prop and ensured user.id is always passed.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Import Framer Motion for animations

function ProfileSetup({ user, onSetupComplete }) {
    // --- State Management for Form Fields ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    // Only show company name field if the user is a publisher
    const [companyName, setCompanyName] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize form data when the component mounts or user prop changes
    useEffect(() => {
        // FIXED: Only proceed if user object and user.id exist
        if (user && user.id) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            // Auto-fill company name if the user is a publisher
            if (user.role === 'publisher') {
                setCompanyName(user.company_name || '');
            }
        } else {
            // If user or user.id is missing, set an error or handle gracefully
            setError("User data is missing. Please log in again.");
            setIsLoading(false); // Ensure loading is off if there's an error
        }
    }, [user]); // Re-run this effect when the user prop changes

    // --- Form Submission Handler ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        // FIXED: Ensure user and user.id are available before proceeding with submission
        if (!user || !user.id) {
            setError("User ID is missing. Please refresh the page or log in again.");
            setIsLoading(false);
            return;
        }

        // Prepare data to send to the backend
        const profileData = {
            user_id: user.id, // Ensure user.id is always included
            first_name: firstName,
            last_name: lastName,
        };

        // If the user is a publisher, add the company name to the data
        // And ensure it's not empty if the role is publisher
        if (user.role === 'publisher') {
            if (!companyName.trim()) {
                setError("Company Name is required for publishers.");
                setIsLoading(false);
                return;
            }
            profileData.company_name = companyName;
        }

        try {
            const apiUrl = 'http://uniwiz.test/update_profile.php';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile.');
            }

            // If update is successful, call the function passed from App.js
            // This will update the user in App.js state and redirect to the main page.
            onSetupComplete(result.user);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Show a loading state or error if user data is not yet available
    if (!user || !user.id) {
        return (
            <div className="min-h-screen bg-bg-student-dashboard flex justify-center items-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg text-center">
                    {error ? (
                        <p className="text-red-500 text-lg">{error}</p>
                    ) : (
                        <p className="text-gray-600 text-lg">Loading user data...</p>
                    )}
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-bg-student-dashboard flex justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg"
            >
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-primary-dark mb-2">
                        <motion.span
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        >
                            Complete Your Profile!
                        </motion.span>
                    </h2>
                    <p className="text-center text-gray-600 mb-4">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Welcome to UniWiz! Let's get your profile set up.
                        </motion.span>
                    </p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-sm text-gray-500 italic"
                    >
                        This little bit of information will make you more visible to other users.
                    </motion.p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first-name">First Name</label>
                            <input id="first-name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last-name">Last Name</label>
                            <input id="last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700" required />
                        </div>
                    </div>

                    {/* Conditional field for publishers */}
                    {user.role === 'publisher' && (
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company-name">Company Name</label>
                            {/* Made required conditionally based on role */}
                            <input id="company-name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700" required={user.role === 'publisher'} />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    
                    <div className="flex items-center justify-center mt-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary-main hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full md:w-auto transition duration-300 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Saving...' : 'Save and Continue'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default ProfileSetup;