// FILE: src/components/admin/ReportManagement.js (UPDATED with Direct Profile Linking)
// =======================================================
// This page allows administrators to view and manage user-submitted reports.
// User links now navigate directly to the respective profile pages.

import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://uniwiz-backend.test/api';

// Reusable components
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusMap = {
        pending: "bg-yellow-100 text-yellow-800",
        resolved: "bg-green-100 text-green-800",
        dismissed: "bg-gray-100 text-gray-800",
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusMap[status] || statusMap.default}`}>{status}</span>;
};

// UPDATED: Added props to handle profile navigation
function ReportManagement({ user, setPage, setStudentIdForProfile, setPublisherIdForProfile }) {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/get_reports_admin.php`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch reports.');
            setReports(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleStatusUpdate = async (reportId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/update_report_status_admin.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_id: reportId,
                    status: newStatus,
                    admin_id: user.id
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            // Refresh the reports list
            fetchReports();
        } catch (err) {
            alert(`Error updating status: ${err.message}`);
        }
    };
    
    // UPDATED: Function now navigates directly to the correct profile page based on user role.
    const handleViewProfile = (reportedUser) => {
        if (reportedUser.role === 'student') {
            setStudentIdForProfile(reportedUser.id);
            setPage('student-profile');
        } else if (reportedUser.role === 'publisher') {
            setPublisherIdForProfile(reportedUser.id);
            setPage('company-profile');
        } else {
            // Fallback for admin or other roles - navigate to user management
            const userName = `${reportedUser.first_name} ${reportedUser.last_name}`;
            setPage('user-management', { filter: 'All', search: userName });
        }
    };


    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-primary-dark mb-8">User Reports</h1>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-8"><LoadingSpinner /></td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="text-center py-8 text-red-500">{error}</td></tr>
                            ) : reports.length > 0 ? (
                                reports.map(report => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {/* UPDATED: Passes the full user object with role to the handler */}
                                            <button onClick={() => handleViewProfile({id: report.reporter_id, first_name: report.reporter_first_name, last_name: report.reporter_last_name, role: report.reporter_role})} className="text-primary-main hover:underline">
                                                {report.reporter_first_name} {report.reporter_last_name}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* UPDATED: Passes the full user object with role to the handler */}
                                            <button onClick={() => handleViewProfile({id: report.reported_id, first_name: report.reported_first_name, last_name: report.reported_last_name, role: report.reported_role})} className="text-primary-main hover:underline">
                                                {report.reported_first_name} {report.reported_last_name}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title={report.reason}>{report.reason}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={report.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(report.id, 'resolved')} className="text-green-600 hover:text-green-800">Resolve</button>
                                                    <button onClick={() => handleStatusUpdate(report.id, 'dismissed')} className="text-gray-600 hover:text-gray-800">Dismiss</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No reports found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ReportManagement;
