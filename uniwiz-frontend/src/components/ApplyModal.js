// FILE: src/components/ApplyModal.js (Updated - Fixed Button Styling)
// =================================================================

import React, { useState } from 'react';

function ApplyModal({ isOpen, onClose, jobTitle, onSubmit }) {
    const [proposal, setProposal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        // onSubmit ශ්‍රිතය (App.js වෙතින්) API ඇමතුම හසුරුවනු ඇත
        await onSubmit(proposal);
        setIsLoading(false);
        onClose(); // ඉදිරිපත් කිරීමෙන් පසු modal එක වසන්න
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                {/* UPDATED: Changed text color class to primary-dark */}
                <h2 className="text-2xl font-bold text-primary-dark mb-2">Apply for: {jobTitle}</h2>
                <p className="text-gray-600 mb-6">Write a short proposal to explain why you are the best fit for this job (Optional).</p>

                <div className="space-y-4">
                    <textarea
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        // UPDATED: Changed focus ring color to primary-main
                        className="shadow-sm border rounded w-full py-3 px-4 h-40 focus:outline-none focus:ring-2 focus:ring-primary-main"
                        placeholder="Explain your skills and interest..."
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            // UPDATED: Changed background and hover background colors to primary-main and primary-dark
                            className="bg-primary-main hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplyModal;
