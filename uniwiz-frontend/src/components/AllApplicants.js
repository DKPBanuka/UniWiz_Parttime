// FILE: src/components/AllApplicants.js (FIXED)
// =====================================================================
// This file contains the component to display all applicants for a publisher.
// The fix ensures that all buttons on the applicant cards are now functional.

import React, { useState, useEffect, useCallback } from 'react';

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const typeClasses = { success: "bg-green-500", error: "bg-red-500" };
    return (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-all ${typeClasses[type] || 'bg-gray-500'}`}>
            {message}
        </div>
    );
};

// --- Loading Spinner ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
    </div>
);

// --- Status Badge ---
const StatusBadge = ({ status }) => {
    const statusMap = {
        pending: "bg-yellow-100 text-yellow-800",
        viewed: "bg-blue-100 text-blue-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800"
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusMap[status] || statusMap.default}`}>{status}</span>;
};

// --- Applicant Detail Modal ---
const ApplicantDetailModal = ({ applicant, onClose, onStatusChange, onViewFullProfile }) => {
    if (!applicant) return null;

    const DetailItem = ({ label, value, isLink = false }) => (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            {isLink && value ? (
                 <a href={`http://uniwiz.test/${value}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-main hover:underline">
                    View CV
                 </a>
            ) : (
                <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-40 p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                
                <div className="flex items-start space-x-6">
                    <img 
                        src={applicant.profile_image_url ? `http://uniwiz.test/${applicant.profile_image_url}` : `https://placehold.co/100x100/E8EAF6/211C84?text=${applicant.first_name.charAt(0)}`} 
                        alt="Profile" 
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div className="flex-grow">
                        <h2 className="text-3xl font-bold text-primary-dark">{applicant.first_name} {applicant.last_name}</h2>
                        <p className="text-gray-600">{applicant.email}</p>
                        <p className="text-sm text-gray-500 mt-1">Applied for: <span className="font-semibold">{applicant.job_title}</span></p>
                        <p className="text-sm text-gray-500">Applied on: <span className="font-semibold">{new Date(applicant.applied_at).toLocaleDateString()}</span></p>
                    </div>
                </div>

                <div className="border-t my-6"></div>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Proposal</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{applicant.proposal || 'No proposal provided.'}</p>
                    </div>

                    <div>
                         <h3 className="text-lg font-bold text-gray-800 mb-4">Student Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="University" value={applicant.university_name} />
                            <DetailItem label="Field of Study" value={applicant.field_of_study} />
                            <DetailItem label="Year of Study" value={applicant.year_of_study} />
                            <DetailItem label="Languages" value={applicant.languages_spoken} />
                            <div className="md:col-span-2"><DetailItem label="Skills" value={applicant.skills} /></div>
                            <div className="md:col-span-2"><DetailItem label="CV / Resume" value={applicant.cv_url} isLink={true} /></div>
                         </div>
                    </div>
                </div>

                <div className="border-t mt-6 pt-4 flex justify-between items-center">
                    <button onClick={() => onViewFullProfile(applicant.student_id)} className="font-semibold text-primary-main hover:text-primary-dark transition-colors">
                        View Full Profile Page
                    </button>
                    <div className="flex space-x-3">
                        <button onClick={() => onStatusChange(applicant.application_id, 'rejected')} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                        <button onClick={() => onStatusChange(applicant.application_id, 'accepted')} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">Accept</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- FIX: ApplicantCard now receives handler functions as props ---
const ApplicantCard = ({ applicant, handleUpdateStatus, onViewStudentProfile, handleViewDetails }) => {
    const renderActions = () => {
        if (applicant.status === 'accepted') {
            return <p className="text-sm font-bold text-green-600">Application Accepted</p>;
        }
        if (applicant.status === 'rejected') {
            return <p className="text-sm font-bold text-red-600">Application Rejected</p>;
        }
        return (
            <>
                <button onClick={() => handleUpdateStatus(applicant.application_id, 'rejected')} className="text-sm font-semibold text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50">Reject</button>
                <button onClick={() => handleUpdateStatus(applicant.application_id, 'accepted')} className="text-sm font-semibold text-green-600 hover:text-green-800 px-3 py-1 rounded-md hover:bg-green-50">Accept</button>
            </>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 flex flex-col space-y-4 hover:shadow-lg transition-shadow duration-300 relative">
            {applicant.status === 'pending' && (
                <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 justify-center items-center text-white text-xs font-bold">New</span>
                </span>
            )}
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 min-w-0">
                    <img 
                        src={applicant.profile_image_url ? `http://uniwiz.test/${applicant.profile_image_url}` : `https://placehold.co/64x64/E8EAF6/211C84?text=${applicant.first_name.charAt(0)}`} 
                        alt="profile" 
                        className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                        <button onClick={() => onViewStudentProfile(applicant.student_id)} className="font-bold text-lg text-primary-dark text-left hover:underline truncate block w-full">
                            {applicant.first_name} {applicant.last_name}
                        </button>
                        <p className="text-sm text-gray-600 truncate">Applied for: {applicant.job_title}</p>
                    </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <StatusBadge status={applicant.status} />
                </div>
            </div>
            <div className="flex justify-end items-center space-x-2 pt-3 border-t">
                {renderActions()}
                <button onClick={() => handleViewDetails(applicant)} className="text-sm font-semibold bg-primary-main text-white px-4 py-1.5 rounded-md hover:bg-primary-dark">View Details</button>
            </div>
        </div>
    );
};

// --- Main AllApplicants Component ---
function AllApplicants({ user, onViewStudentProfile, initialFilter, setInitialFilter }) {
    const [allApplicants, setAllApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilter || 'All');
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    const fetchAllApplications = useCallback(async () => {
        if (!user || !user.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                publisher_id: user.id,
                search: searchTerm,
                status: statusFilter,
            });
            const url = `http://uniwiz.test/get_all_publisher_applications.php?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch applicants.');
            setAllApplicants(data);
        } catch (err) {
            setError(err.message);
            showNotification(`Error: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user, searchTerm, statusFilter]);

    const handleUpdateStatus = useCallback(async (applicationId, newStatus, showNotif = true) => {
        try {
            const response = await fetch('http://uniwiz.test/update_application_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId, status: newStatus }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            if (showNotif) {
                showNotification(`Application status updated to ${newStatus}.`, 'success');
            }
            fetchAllApplications();
        } catch (err) {
             if (showNotif) {
                showNotification(`Error: ${err.message}`, 'error');
             }
        }
    }, [fetchAllApplications]);

    const handleViewDetails = useCallback(async (applicant) => {
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
        if (applicant.status === 'pending') {
            await handleUpdateStatus(applicant.application_id, 'viewed', false);
        }
    }, [handleUpdateStatus]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAllApplications();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchAllApplications]);

    useEffect(() => {
        return () => {
            if (setInitialFilter) {
                setInitialFilter('All');
            }
        };
    }, [setInitialFilter]);

    const tabs = ['All', 'pending', 'viewed', 'accepted', 'rejected'];
    if (initialFilter === 'today' && !tabs.includes('today')) {
        tabs.push('today');
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
            {isModalOpen && (
                <ApplicantDetailModal 
                    applicant={selectedApplicant} 
                    onClose={() => setIsModalOpen(false)}
                    onStatusChange={handleUpdateStatus}
                    onViewFullProfile={onViewStudentProfile}
                />
            )}

            <div className="p-8 bg-bg-publisher-dashboard min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-4xl font-bold text-gray-800">All Applicants</h2>
                    <div className="w-full md:w-auto">
                        <input 
                            type="text"
                            placeholder="Search by name, job, or skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="shadow-sm border rounded-lg py-2 px-4 w-full md:w-72"
                        />
                    </div>
                </div>

                <div className="bg-white p-2 rounded-lg flex space-x-2 mb-8 shadow-sm border border-gray-100 w-full overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors capitalize whitespace-nowrap ${
                                statusFilter === tab ? 'bg-primary-main text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab === 'today' ? "Today's" : tab}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-center py-16 text-red-500 bg-white rounded-xl shadow-md">{error}</div>
                ) : allApplicants.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* --- FIX: Pass handler functions to ApplicantCard --- */}
                        {allApplicants.map(app => (
                            <ApplicantCard 
                                key={app.application_id} 
                                applicant={app} 
                                handleUpdateStatus={handleUpdateStatus}
                                onViewStudentProfile={onViewStudentProfile}
                                handleViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">No Applicants Found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default AllApplicants;
