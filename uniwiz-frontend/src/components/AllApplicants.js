import React, { useState, useEffect, useCallback } from 'react';

// Reusable Notification Component (from ManageJobs.js)
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Notification disappears after 3 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white transition-transform transform translate-x-0 z-50";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-500'}`}>
            {message}
        </div>
    );
};

// Loading spinner component (from PublisherDashboard.js)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="loading-spinner">
      <div className="spinner-circle"></div>
    </div>
    <style jsx>{`
      .loading-spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
      }
      .spinner-circle {
        display: block;
        width: 100%;
        height: 100%;
        border: 3px solid #E8EAF6;
        border-top-color: #7886C7;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Status Badge Component (from ManageJobs.js)
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
    const statusClasses = {
        applied: "bg-blue-100 text-blue-800", // New status for applications
        pending: "bg-yellow-100 text-yellow-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        // Default to applied if status is not explicitly handled
        default: "bg-gray-100 text-gray-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.default}`}>{status}</span>;
};


function AllApplicants({ user }) {
    const [applicants, setApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });

    // Memoized function to fetch applications
    const fetchAllApplications = useCallback(async () => {
        if (!user || !user.id) return; // Ensure user and user.id exist
        setIsLoading(true);
        setError(null);
        try {
            // Construct URL with publisher_id and search term
            const url = `http://uniwiz.test/get_all_publisher_applications.php?publisher_id=${user.id}&search=${encodeURIComponent(searchTerm)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setApplicants(data);
            } else {
                // If response is not OK, throw an error with the message from backend
                throw new Error(data.message || 'Failed to fetch applications.');
            }
        } catch (err) {
            console.error("Failed to fetch applications:", err);
            setError(err.message);
            showNotification(`Error: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user, searchTerm]); // Dependencies: user object and search term

    // Effect to fetch applications when component mounts or search term changes
    useEffect(() => {
        // Implement debouncing for the search term
        const delayDebounceFn = setTimeout(() => {
            fetchAllApplications();
        }, 500); // 500ms delay after user stops typing

        return () => clearTimeout(delayDebounceFn); // Cleanup the timer
    }, [fetchAllApplications]); // Dependency is the memoized fetch function

    // Function to show notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    // Render nothing if user is not available (e.g., still loading in App.js)
    if (!user) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {notification.message && (
                <Notification 
                    key={notification.key}
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification({ message: '', type: '', key: 0 })}
                />
            )}

            <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4 md:mb-0">All Applicants</h2>
                    <div className="w-full md:w-auto">
                        <input 
                            type="text"
                            placeholder="Search by name or job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="shadow-sm border rounded py-2 px-4 w-full md:w-72"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Applied For</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-gray-500"><LoadingSpinner /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-red-500">{error}</td></tr>
                                ) : applicants.length > 0 ? (
                                    applicants.map(app => (
                                        <tr key={app.application_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.first_name} {app.last_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{app.job_title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm"><StatusBadge status={app.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* You can add action buttons here, e.g., View Proposal, Change Status */}
                                                <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                                                <button className="text-green-600 hover:text-green-800">Accept</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">No applicants found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AllApplicants;
