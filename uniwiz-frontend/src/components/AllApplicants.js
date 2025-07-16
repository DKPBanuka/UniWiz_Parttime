// FILE: src/components/AllApplicants.js (ENHANCED with new Profile Modal & Direct Linking)
// ==================================================================================
// This version replaces the navigation to a separate profile page with a detailed
// popup modal, improving the publisher's workflow. It now displays all available
// student details in the modal and can be opened directly via a prop.

import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Reusable Components ---

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

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
    </div>
);

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

// --- Enhanced Applicant Detail Modal with all details ---
const ApplicantDetailModal = ({ applicant, onClose, onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(applicant ? applicant.status : '');
    const modalRef = useRef();

    // Automatically mark as 'viewed' when modal opens
    useEffect(() => {
        if (applicant && applicant.status === 'pending') {
            onStatusChange(applicant.application_id, 'viewed', false); // Don't show popup
            setCurrentStatus('viewed');
        } else if (applicant) {
            setCurrentStatus(applicant.status);
        }
    }, [applicant, onStatusChange]);

    // Close modal on escape key press
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);


    if (!applicant) return null;

    const handleStatusButtonClick = (newStatus) => {
        onStatusChange(applicant.application_id, newStatus, true); // Show popup
        setCurrentStatus(newStatus);
    };
    
    const canTakeAction = currentStatus === 'pending' || currentStatus === 'viewed';
    const skills = applicant.skills ? applicant.skills.split(',').map(s => s.trim()) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-40 p-4" onClick={onClose}>
            <div ref={modalRef} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-3xl font-bold z-10">&times;</button>
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 border-b pb-6 mb-6">
                    <div className="flex items-center gap-6">
                        <img 
                            src={applicant.profile_image_url ? `http://uniwiz.test/${applicant.profile_image_url}` : `https://placehold.co/100x100/E8EAF6/211C84?text=${applicant.first_name.charAt(0)}`} 
                            alt="Profile" 
                            className="h-24 w-24 rounded-full object-cover border-4 border-primary-lighter shadow-md"
                        />
                        <div>
                            <h2 className="text-3xl font-bold text-primary-dark">{applicant.first_name} {applicant.last_name}</h2>
                            <p className="text-gray-600">{applicant.field_of_study || 'Student'}</p>
                            <p className="text-sm text-gray-500 mt-1">Email: <span className="font-semibold">{applicant.email}</span></p>
                            <p className="text-sm text-gray-500">Applied for: <span className="font-semibold">{applicant.job_title}</span> on <span className="font-semibold">{new Date(applicant.applied_at).toLocaleDateString()}</span></p>
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center md:items-end gap-3">
                        <StatusBadge status={currentStatus} />
                        {canTakeAction && (
                            <div className="flex space-x-2 mt-2">
                                <button onClick={() => handleStatusButtonClick('rejected')} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm">Reject</button>
                                <button onClick={() => handleStatusButtonClick('accepted')} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm">Accept</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Proposal</h3>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{applicant.proposal || 'No proposal provided.'}</p>
                        </div>
                        <div>
                             <h3 className="text-lg font-bold text-gray-800 mb-2">Educational Background</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                                <p><strong className="font-medium text-gray-500 block">University:</strong> {applicant.university_name || 'N/A'}</p>
                                <p><strong className="font-medium text-gray-500 block">Field of Study:</strong> {applicant.field_of_study || 'N/A'}</p>
                                <p><strong className="font-medium text-gray-500 block">Year of Study:</strong> {applicant.year_of_study || 'N/A'}</p>
                             </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.length > 0 ? skills.map((skill, index) => (
                                    <span key={index} className="bg-primary-lighter text-primary-dark font-medium px-3 py-1 rounded-full text-sm">{skill}</span>
                                )) : <p className="text-gray-500 text-sm">No skills specified.</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Languages</h3>
                             <p className="text-gray-700">{applicant.languages_spoken || 'Not specified'}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Resume / CV</h3>
                            {applicant.cv_url ? (
                                <a href={`http://uniwiz.test/${applicant.cv_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-primary-main text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                                    Download CV
                                </a>
                            ) : (
                                <p className="text-gray-500 text-sm">CV has not been uploaded.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- ApplicantCard Component ---
const ApplicantCard = ({ applicant, onStatusChange, onViewDetails }) => {
    
    const handleActionClick = (e, status) => {
        e.stopPropagation(); // Prevent modal from opening
        onStatusChange(applicant.application_id, status, true);
    };

    return (
        <div onClick={() => onViewDetails(applicant)} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 flex flex-col space-y-4 hover:shadow-lg hover:border-primary-main transition-all duration-300 cursor-pointer relative">
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
                        <p className="font-bold text-lg text-primary-dark truncate">{applicant.first_name} {applicant.last_name}</p>
                        <p className="text-sm text-gray-600 truncate">Applied for: {applicant.job_title}</p>
                    </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <StatusBadge status={applicant.status} />
                </div>
            </div>
            {(applicant.status === 'pending' || applicant.status === 'viewed') && (
                 <div className="flex justify-end items-center space-x-2 pt-3 border-t">
                    <button onClick={(e) => handleActionClick(e, 'rejected')} className="text-sm font-semibold text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50">Reject</button>
                    <button onClick={(e) => handleActionClick(e, 'accepted')} className="text-sm font-semibold text-green-600 hover:text-green-800 px-3 py-1 rounded-md hover:bg-green-50">Accept</button>
                </div>
            )}
        </div>
    );
};

// --- Main AllApplicants Component ---
// **UPDATED**: Added initialApplicationId and onModalClose props
function AllApplicants({ user, onStatusChange, initialFilter, setInitialFilter, initialApplicationId, onModalClose }) {
    const [allApplicants, setAllApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialFilter || 'All');
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    
    // Ref to ensure modal is only opened once per navigation
    const modalOpenedRef = useRef(false);

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

    // **NEW**: Effect to open the modal automatically if an ID is passed
    useEffect(() => {
        if (initialApplicationId && allApplicants.length > 0 && !modalOpenedRef.current) {
            const applicantToShow = allApplicants.find(app => app.application_id === initialApplicationId);
            if (applicantToShow) {
                setSelectedApplicant(applicantToShow);
                setIsModalOpen(true);
                modalOpenedRef.current = true; // Mark as opened
            }
        }
    }, [initialApplicationId, allApplicants]);
    
    // **NEW**: Handler to close the modal and reset the state in App.js
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApplicant(null);
        if (onModalClose) {
            onModalClose();
        }
        modalOpenedRef.current = false; // Reset ref for next time
    };

    const handleViewDetails = (applicant) => {
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
    };
    
    const handleModalStatusChange = (applicationId, newStatus, showNotif) => {
        onStatusChange(applicationId, newStatus, showNotif);
        setAllApplicants(prev => 
            prev.map(app => 
                app.application_id === applicationId ? { ...app, status: newStatus } : app
            )
        );
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAllApplications();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchAllApplications]);

    useEffect(() => {
        return () => {
            if (setInitialFilter) setInitialFilter('All');
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
                    onClose={handleCloseModal}
                    onStatusChange={handleModalStatusChange}
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
                        {allApplicants.map(app => (
                            <ApplicantCard 
                                key={app.application_id} 
                                applicant={app} 
                                onStatusChange={onStatusChange}
                                onViewDetails={handleViewDetails}
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
