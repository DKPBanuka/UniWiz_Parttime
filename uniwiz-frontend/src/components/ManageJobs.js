// FILE: src/components/ManageJobs.js (Fixed Infinite Loop)
// ==============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Reusable Notification Component (Toast) ---
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

// --- Reusable Confirmation Modal Component ---
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

// --- Edit Job Modal Component ---
const EditJobModal = ({ isOpen, onClose, jobData, onUpdate, categories }) => {
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (jobData) {
            setFormData({
                ...jobData,
                start_date: jobData.start_date ? new Date(jobData.start_date).toISOString().split('T')[0] : '',
                end_date: jobData.end_date ? new Date(jobData.end_date).toISOString().split('T')[0] : '',
            });
        }
    }, [jobData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://uniwiz.test/update_job.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            onUpdate(result.message, 'success');
            onClose();
        } catch (err) {
            onUpdate(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-dark-blue-text mb-6">Edit Job: <span className="font-light">{jobData.title}</span></h2> {/* Changed text color */}
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category_id" value={formData.category_id} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                           {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Actions Dropdown Component ---
const ActionsDropdown = ({ job, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handleMenuAction = (action) => {
        onAction(job, action);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20">
                    <div className="py-1">
                        <button onClick={() => handleMenuAction('view')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Applicants</button>
                        <button onClick={() => handleMenuAction('edit')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
                        <button onClick={() => handleMenuAction('delete')} className="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-gray-100">Delete Job</button>
                    </div>
                </div>
            )}
        </div>
    );
};


function ManageJobs({ user, onViewApplicationsClick, onPostJobClick }) {
    const [myJobs, setMyJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- State for modals and notifications ---
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', actionType: 'delete', onConfirm: () => {} });
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);
    const [categories, setCategories] = useState([]);

    // **FIX**: Wrap the fetch function in useCallback to prevent re-creation on every render
    const fetchPublisherJobs = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const url = `http://uniwiz.test/get_publisher_jobs.php?publisher_id=${user.id}&search=${searchTerm}`;
            const response = await fetch(url);
            const data = await response.json();
            if (response.ok) {
                setMyJobs(data);
            } else {
                throw new Error(data.message || 'Failed to fetch jobs.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user, searchTerm]); // Dependencies for the fetch function

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://uniwiz.test/get_categories.php');
                const data = await response.json();
                if (response.ok) setCategories(data);
            } catch (err) { console.error("Failed to fetch categories:", err); }
        };
        fetchCategories();
    }, []);

    // **FIX**: This useEffect now calls the memoized fetch function
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPublisherJobs();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchPublisherJobs]); // The dependency is now the stable function itself

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    const handleJobAction = async (job, action) => {
        if (action === 'view') {
            onViewApplicationsClick(job.id);
            return;
        }
        if (action === 'edit') {
            try {
                const response = await fetch(`http://uniwiz.test/get_job_details.php?job_id=${job.id}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                setJobToEdit(data);
                setIsEditModalOpen(true);
            } catch (err) {
                showNotification(`Error fetching job details: ${err.message}`, 'error');
            }
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

    const StatusBadge = ({ status }) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
        const statusClasses = {
            active: "bg-green-100 text-green-800",
            draft: "bg-yellow-100 text-yellow-800",
            closed: "bg-red-100 text-red-800",
            expired: "bg-gray-100 text-gray-800",
        };
        return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.draft}`}>{status}</span>;
    };

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
            <ConfirmationModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
                actionType={modalState.actionType}
            />
            <EditJobModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                jobData={jobToEdit}
                categories={categories}
                onUpdate={(message, type) => {
                    showNotification(message, type);
                    if (type === 'success') {
                        fetchPublisherJobs();
                    }
                }}
            />

            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-800">Manage Jobs</h2>
                    <div className="flex items-center space-x-4">
                        <input 
                            type="text"
                            placeholder="Search by job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="shadow-sm border rounded py-2 px-4"
                        />
                        <button onClick={onPostJobClick} className="flex items-center bg-app-blue text-white font-bold py-2 px-5 rounded-lg"> {/* Changed bg color */}
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
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading jobs...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-red-500">{error}</td></tr>
                                ) : myJobs.length > 0 ? (
                                    myJobs.map(job => (
                                        <tr key={job.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm"><StatusBadge status={job.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-dark-blue-text">{job.application_count}</td> {/* Changed text color */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <ActionsDropdown job={job} onAction={handleJobAction} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No jobs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManageJobs;
