// FILE: src/components/AppliedJobsPage.js (Updated for My Applications UI - Light Theme & Filtering)
// ===================================================
// This component displays the list of jobs a student has applied for,
// with status filtering tabs, now in a light theme. It can now receive an initial
// filter from its parent to set the active tab on load.

import React, { useState, useEffect, useCallback } from 'react';

// Reusable Loading spinner component
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
        border: 3px solid #E0E7FF; /* primary-lighter */
        border-top-color: #4F46E5; /* primary-main */
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
    const statusClasses = {
        applied: "bg-primary-lighter text-primary-dark",
        pending: "bg-yellow-100 text-yellow-800",
        viewed: "bg-blue-100 text-blue-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.default}`}>{status}</span>;
};


function AppliedJobsPage({ user, initialFilter, setInitialFilter }) {
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(initialFilter || 'All');

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
            } else {
                throw new Error(data.message || 'Failed to fetch your applications.');
            }
        } catch (err) {
            console.error("Failed to fetch applied job details:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

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

    // Effect to re-filter applications when activeTab or allApplications change
    useEffect(() => {
        filterApplications(allApplications, activeTab);
    }, [activeTab, allApplications, filterApplications]);

    // When the component is unmounted, reset the filter in App.js to 'All'
    useEffect(() => {
        return () => {
            if (setInitialFilter) {
                setInitialFilter('All');
            }
        };
    }, [setInitialFilter]);
    
    // Handler for changing tabs
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        // Also update the state in App.js so it's remembered if we navigate away and back
        if (setInitialFilter) {
            setInitialFilter(tab);
        }
    };

    if (!user) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold text-primary-dark">My Applications</h2>
            </div>

            <div className="bg-white p-2 rounded-lg flex space-x-2 mb-8 shadow-md border border-gray-100">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                            activeTab === tab ? 'bg-primary-main text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500"><LoadingSpinner /></td></tr>
                            ) : error ? (
                                <tr><td colSpan="5" className="text-center py-8 text-red-500">{error}</td></tr>
                            ) : filteredApplications.length > 0 ? (
                                filteredApplications.map(app => (
                                    <tr key={app.job_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.job_title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.publisher_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(app.applied_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-primary-main hover:text-primary-dark mr-3">View</button>
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
