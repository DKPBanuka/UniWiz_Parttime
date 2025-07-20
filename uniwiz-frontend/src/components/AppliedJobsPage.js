// FILE: src/components/AppliedJobsPage.js (UPDATED - Job Status Display)
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
        // New statuses for job posts
        closed: "bg-gray-200 text-gray-700", // For closed jobs
        deleted: "bg-red-100 text-red-800", // For deleted jobs
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

    // FIXED: Added 'Closed' and 'Deleted' tabs for job statuses
    const tabs = ['All', 'Pending', 'Viewed', 'Accepted', 'Rejected', 'Closed', 'Deleted'];

    const fetchApplicationDetails = useCallback(async () => {
        if (!user || !user.id) {
            setIsLoading(false);
            setAllApplications([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost/UniWiz_Parttime/uniwiz-backend/api/get_student_application_details.php?student_id=${user.id}`);
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
        } else if (tab === 'Closed') { // Filter by job_status for 'Closed'
            setFilteredApplications(applicationsToFilter.filter(app => app.job_status === 'closed'));
        } else if (tab === 'Deleted') { // Filter by job_status for 'Deleted' (assuming 'deleted' is a job_status)
            // Note: 'deleted' is not a formal job status in the DB enum, but if a job is deleted,
            // it won't appear in get_job_details.php. For this filter, we'll assume a 'deleted'
            // status is implied if job_status is not 'active', 'draft', or 'closed'.
            // A more robust solution would be to check if the job_id still exists in the DB.
            setFilteredApplications(applicationsToFilter.filter(app => 
                app.job_status !== 'active' && app.job_status !== 'draft' && app.job_status !== 'closed'
            ));
        }
        else { // Filter by application_status for other tabs
            setFilteredApplications(applicationsToFilter.filter(app => app.application_status.toLowerCase() === tab.toLowerCase()));
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
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Application Status</th> {/* Renamed for clarity */}
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Job Status</th> {/* NEW: Job Status Column */}
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-gray-500"><LoadingSpinner /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="6" className="text-center py-8 bg-red-50 text-red-600">{error}</td></tr>
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
                                                <StatusBadge status={app.application_status} />
                                            </td>
                                            {/* NEW: Job Status Column */}
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                                {app.job_status === 'active' && <StatusBadge status="active" />}
                                                {app.job_status === 'closed' && <StatusBadge status="closed" />}
                                                {app.job_status === 'draft' && <StatusBadge status="pending" />} {/* Treat draft as pending for student view */}
                                                {/* If job_status is not active, closed, or draft, assume it's deleted */}
                                                {!['active', 'closed', 'draft'].includes(app.job_status) && <StatusBadge status="deleted" />}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Enable/Disable View button based on job_status */}
                                                {app.job_status === 'active' ? (
                                                    <button 
                                                        onClick={() => handleViewJobDetails(app)}
                                                        className="text-blue-500 hover:text-blue-600 hover:underline transition-colors duration-200"
                                                    >
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 cursor-not-allowed">View</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 bg-gray-50">No applications found for this status.</td></tr>
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