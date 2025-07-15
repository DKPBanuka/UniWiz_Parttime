// FILE: src/components/ProfileSetup.js (NEW FILE)
// ===============================================
// This component shows the form to complete user profile after registration.

import React, { useState } from 'react';

function ProfileSetup({ user, onSetupComplete }) {
    // --- State Management ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    // Only show company name field if the user is a publisher
    const [companyName, setCompanyName] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Form Submission Handler ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        // Prepare the data to send to the backend
        const profileData = {
            user_id: user.id,
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

            // If update is successful, call the function from App.js
            // This will update the user in App.js state and redirect to the main page
            onSetupComplete(result.user);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-student-dashboard flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold text-primary-dark mb-2">Complete Your Profile</h2>
                <p className="text-center text-gray-600 mb-6">Welcome to UniWiz! Let's get your profile set up.</p>

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
                        <button type="submit" disabled={isLoading} className="bg-primary-main hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full md:w-auto transition duration-300 disabled:bg-gray-400">
                            {isLoading ? 'Saving...' : 'Save and Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileSetup;
