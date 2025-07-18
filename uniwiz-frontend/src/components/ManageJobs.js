// FILE: src/components/ManageJobs.js

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// --- Reusable Components ---

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeClasses = { success: "bg-green-500", error: "bg-red-500" };
    return <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white transition-transform transform translate-x-0 z-50 ${typeClasses[type] || 'bg-gray-500'}`}>{message}</div>;
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
    </div>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, actionType = 'delete' }) => {
    if (!isOpen) return null;
    const confirmButtonClasses = {
        delete: "bg-red-600 hover:bg-red-700",
        close: "bg-yellow-500 hover:bg-yellow-600",
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg ${confirmButtonClasses[actionType] || 'bg-blue-600'}`}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

const ActionsDropdown = ({ job, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    const handleMenuAction = (action) => {
        onAction(job, action);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={buttonRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-30 p-2">
                    <button onClick={() => handleMenuAction('view')} className="w-full text-left flex items-center p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">View Applicants</button>
                    <button onClick={() => handleMenuAction('edit')} className="w-full text-left flex items-center p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Edit Job</button>
                    <div className="my-1 border-t border-gray-100"></div>
                    <button onClick={() => handleMenuAction('delete')} className="w-full text-left flex items-center p-3 text-sm text-red-600 hover:bg-red-50 rounded-lg">Delete Job</button>
                </div>
            )}
        </div>
    );
};

// --- Main ManageJobs Component ---
function ManageJobs({ user, onPostJobClick, onViewJobDetails, onEditJob, onViewApplicants }) {
    const [myJobs, setMyJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', actionType: 'delete', onConfirm: () => {} });
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });

    const fetchPublisherJobs = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const url = `http://uniwiz.test/get_publisher_jobs.php?publisher_id=${user.id}&search=${searchTerm}`;
            const response = await fetch(url);
            const data = await response.json();
            if (response.ok) setMyJobs(data);
            else throw new Error(data.message || 'Failed to fetch jobs.');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user, searchTerm]);

    useEffect(() => {
        fetchPublisherJobs();
    }, [fetchPublisherJobs]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    const handleJobAction = async (job, action) => {
        if (action === 'view') {
            onViewApplicants(job); // Navigate to ViewApplicants page
            return;
        }
        if (action === 'edit') {
            onEditJob(job); // Navigate to EditJob page
            return;
        }

        const confirmAction = async () => {
            try {
                const response = await fetch('http://uniwiz.test/manage_job_action.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ job_id: job.id, action: action }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                showNotification(result.message, 'success');
                fetchPublisherJobs();
            } catch (err) {
                showNotification(`Error: ${err.message}`, 'error');
            }
            setModalState({ ...modalState, isOpen: false });
        };

        setModalState({
            isOpen: true,
            title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            message: `Are you sure you want to ${action} the job "${job.title}"? This action cannot be undone.`,
            actionType: action,
            onConfirm: confirmAction
        });
    };

    const JobStatusBadge = ({ status }) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
        const statusClasses = {
            active: "bg-green-100 text-green-800",
            draft: "bg-yellow-100 text-yellow-800",
            closed: "bg-red-100 text-red-800",
            expired: "bg-gray-100 text-gray-800",
        };
        return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.draft}`}>{status}</span>;
    };

    const sortedJobs = useMemo(() => {
        return [...myJobs].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [myJobs, sortOrder]);

    return (
        <div className="p-8 bg-bg-publisher-dashboard min-h-screen">
            {notification.message && <Notification key={notification.key} message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '', key: 0 })} />}
            <ConfirmationModal isOpen={modalState.isOpen} onClose={() => setModalState({ ...modalState, isOpen: false })} onConfirm={modalState.onConfirm} title={modalState.title} message={modalState.message} actionType={modalState.actionType}/>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-4xl font-bold text-gray-800">Manage Jobs</h2>
                <div className="flex items-center space-x-4">
                    <input type="text" placeholder="Search by job title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="shadow-sm border rounded py-2 px-4 w-full md:w-auto" />
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="shadow-sm border rounded py-2 px-4 bg-white">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                    <button onClick={onPostJobClick} className="flex-shrink-0 flex items-center bg-primary-main text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-dark">
                        Post New Job
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vacancies</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500"><LoadingSpinner /></td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="text-center py-8 text-red-500">{error}</td></tr>
                            ) : sortedJobs.length > 0 ? (
                                sortedJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <button onClick={() => onViewJobDetails(job.id)} className="text-primary-main hover:underline">{job.title}</button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm"><JobStatusBadge status={job.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-primary-dark">{job.application_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                                            <span className={job.accepted_count >= job.vacancies ? 'text-red-500' : 'text-green-600'}>{job.accepted_count}</span> / {job.vacancies}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <ActionsDropdown job={job} onAction={handleJobAction} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No jobs found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ManageJobs;