// FILE: src/components/SettingsPage.js (NEW FILE)
// ===============================================
// This component provides a placeholder for application settings.

import React from 'react';

function SettingsPage() {
    return (
        <div className="min-h-screen bg-bg-publisher-dashboard flex justify-center items-start py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-primary-dark">Application Settings</h2>
                    <p className="text-gray-500 mt-2">Manage your preferences and application configurations.</p>
                </div>
                
                <div className="space-y-8">
                    {/* General Settings Section */}
                    <div className="p-6 border rounded-xl">
                        <h3 className="text-xl font-semibold text-primary-dark mb-4 border-b pb-2">General Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="notification-toggle">Email Notifications</label>
                                <label htmlFor="notification-toggle" className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id="notification-toggle" className="sr-only" />
                                        <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                                        <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                                    </div>
                                    <div className="ml-3 text-gray-700 font-medium">Receive job application notifications via email.</div>
                                </label>
                            </div>
                            {/* Add more general settings here */}
                        </div>
                    </div>

                    {/* Account Settings Section */}
                    <div className="p-6 border rounded-xl">
                        <h3 className="text-xl font-semibold text-primary-dark mb-4 border-b pb-2">Account Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="change-password">Change Password</label>
                                <button className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition duration-300">Update Password</button>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="delete-account">Delete Account</label>
                                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition duration-300">Delete My Account</button>
                            </div>
                            {/* Add more account settings here */}
                        </div>
                    </div>

                    {/* Future Settings Sections can be added here */}
                </div>
            </div>
            {/* Simple CSS for the toggle switch */}
            <style jsx>{`
                input:checked + .block {
                    background-color: #4D55CC; /* primary-main */
                }
                input:checked + .block + .dot {
                    transform: translateX(100%);
                }
            `}</style>
        </div>
    );
}

export default SettingsPage;
