// FILE: src/components/AppliedJobsPage.js (Modern Light Blue Design)
// ===================================================

import React, { useState, useEffect, useCallback } from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
    const statusClasses = {
        applied: "bg-blue-50 text-blue-600",
        pending: "bg-yellow-100 text-yellow-800",
        viewed: "bg-blue-100 text-blue-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.default}`}>{status}</span>;
};

function AppliedJobsPage({ user, initialFilter, setInitialFilter, handleViewJobDetails }) {
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(initialFilter || 'All');

    const tabs = ['All', 'Pending', 'Viewed', 'Accepted', 'Rejected'];

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

    const filterApplications = useCallback((applicationsToFilter, tab) => {
        if (tab === 'All') {
            setFilteredApplications(applicationsToFilter);
        } else {
            setFilteredApplications(applicationsToFilter.filter(app => app.status.toLowerCase() === tab.toLowerCase()));
        }
    }, []);

    useEffect(() => {
        fetchApplicationDetails();
    }, [fetchApplicationDetails]);

    useEffect(() => {
        filterApplications(allApplications, activeTab);
    }, [activeTab, allApplications, filterApplications]);

    useEffect(() => {
        return () => {
            if (setInitialFilter) {
                setInitialFilter('All');
            }
        };
    }, [setInitialFilter]);
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (setInitialFilter) {
            setInitialFilter(tab);
        }
    };

    if (!user) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">My Applications</h2>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white p-1 rounded-lg flex flex-wrap gap-1 mb-6 shadow-sm border border-gray-200">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                                activeTab === tab 
                                    ? 'bg-blue-500 text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Job Title</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Company</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date Applied</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500"><LoadingSpinner /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="5" className="text-center py-8 bg-red-50 text-red-600">{error}</td></tr>
                                ) : filteredApplications.length > 0 ? (
                                    filteredApplications.map(app => (
                                        <tr key={app.job_id} className="hover:bg-blue-50 transition-colors duration-150">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.job_title}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.publisher_name}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(app.applied_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => handleViewJobDetails(app)}
                                                    className="text-blue-500 hover:text-blue-600 hover:underline transition-colors duration-200"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 bg-gray-50">No applications found for this status.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppliedJobsPage;