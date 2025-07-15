// FILE: src/components/AppliedJobsPage.js (Updated for My Applications UI - Light Theme)
// ===================================================
// This component displays the list of jobs a student has applied for,
// with status filtering tabs, now in a light theme.

import React, { useState, useEffect, useCallback } from 'react';

// Reusable Loading spinner component (from PublisherDashboard.js)
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
        border: 3px solid #B5A8D5; /* primary-lighter */
        border-top-color: #4D55CC; /* primary-main */
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Status Badge Component (from ManageJobs.js, adapted for application status)
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
    const statusClasses = {
        applied: "bg-primary-lighter text-primary-dark", // Light theme applied
        pending: "bg-yellow-100 text-yellow-800", // Light theme yellow
        viewed: "bg-primary-light text-primary-dark", // Example for "Viewed" status, using light primary
        accepted: "bg-green-100 text-green-800", // Light theme green
        rejected: "bg-red-100 text-red-800", // Light theme red
        default: "bg-gray-100 text-gray-800", // Default light gray
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.default}`}>{status}</span>;
};


function AppliedJobsPage({ user }) { // Removed appliedJobs prop as we fetch full details
    const [allApplications, setAllApplications] = useState([]); // All applications fetched
    const [filteredApplications, setFilteredApplications] = useState([]); // Applications after tab filtering
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('All'); // State for active tab

    // Tab options
    const tabs = ['All', 'Pending', 'Viewed', 'Accepted', 'Rejected'];

    // Fetch all application details for the student
    const fetchApplicationDetails = useCallback(async () => {
        if (!user || !user.id) {
            setIsLoading(false);
            setAllApplications([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://uniwiz.test/get_student_application_details.php?student_id=${user.id}`);
            const data = await response.json();

            if (response.ok) {
                setAllApplications(data);
                // Initially, filter based on the default activeTab ('All')
                filterApplications(data, 'All');
            } else {
                throw new Error(data.message || 'Failed to fetch your applications.');
            }
        } catch (err) {
            console.error("Failed to fetch applied job details:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]); // Depend on user

    // Function to filter applications based on the active tab
    const filterApplications = useCallback((applicationsToFilter, tab) => {
        if (tab === 'All') {
            setFilteredApplications(applicationsToFilter);
        } else {
            setFilteredApplications(applicationsToFilter.filter(app => app.status.toLowerCase() === tab.toLowerCase()));
        }
    }, []);

    // Effect to fetch applications on component mount or user change
    useEffect(() => {
        fetchApplicationDetails();
    }, [fetchApplicationDetails]);

    // Effect to re-filter applications when activeTab changes
    useEffect(() => {
        filterApplications(allApplications, activeTab);
    }, [activeTab, allApplications, filterApplications]); // Add filterApplications to dependencies

    if (!user) {
        return <LoadingSpinner />; // Or a message indicating user not logged in
    }

    return (
        <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800"> {/* Light background */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-primary-dark">My Applications</h2> {/* Light text color */}
            </div>

            {/* Tabs for filtering applications */}
            <div className="bg-white p-2 rounded-lg flex space-x-2 mb-8 shadow-md border border-gray-100"> {/* Light tab container */}
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                            activeTab === tab ? 'bg-primary-main text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"> {/* Light table container */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200"> {/* Light table dividers */}
                        <thead className="bg-gray-50"> {/* Light table header background */}
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200"> {/* Light table body */}
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500"><LoadingSpinner /></td></tr>
                            ) : error ? (
                                <tr><td colSpan="5" className="text-center py-8 text-red-500">{error}</td></tr>
                            ) : filteredApplications.length > 0 ? (
                                filteredApplications.map(app => (
                                    <tr key={app.job_id} className="hover:bg-gray-50"> {/* Light hover */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.job_title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.publisher_name}</td> {/* Light text color */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(app.applied_at).toLocaleDateString()}</td> {/* Light text color */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Actions for applied jobs, e.g., View Application, Withdraw Application */}
                                            <button className="text-primary-main hover:text-primary-dark mr-3">View</button>
                                            {/* <button className="text-red-500 hover:text-red-700">Withdraw</button> */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applications found for this status.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AppliedJobsPage;
