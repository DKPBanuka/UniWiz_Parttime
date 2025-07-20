// FILE: src/components/SignUpModal.js (Updated)
// =============================================
// We update this to call a success handler instead of just showing a message.

import React, { useState } from 'react';

// **CHANGE**: Added a new prop 'onRegisterSuccess'
function SignUpModal({ isOpen, onClose, onRegisterSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // We don't need the 'success' state anymore

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const apiUrl = 'http://uniwiz-backend.test/api/auth.php';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', email, password, role }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'An unknown error occurred.');
            }
            
            // **CHANGE**: On success, call the function passed from App.js
            // This will handle auto-login and redirection.
            onRegisterSuccess(result.user);
            onClose(); // Close the modal

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        // ... The JSX for the modal remains the same ...
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                <h2 className="text-3xl font-bold text-primary-dark mb-6">Create Your Account</h2> {/* Changed text color */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">I am a:</label>
                        <div className="flex items-center justify-around bg-gray-100 p-1 rounded-lg">
                            <button type="button" onClick={() => setRole('student')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${role === 'student' ? 'bg-primary-main text-white' : 'text-gray-600'}`}>Student</button> {/* Changed bg color */}
                            <button type="button" onClick={() => setRole('publisher')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${role === 'publisher' ? 'bg-primary-main text-white' : 'text-gray-600'}`}>Publisher</button> {/* Changed bg color */}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700" required />
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="flex items-center justify-center">
                        <button type="submit" disabled={isLoading} className="bg-primary-main hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-gray-400"> {/* Changed bg and hover bg */}
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUpModal;
