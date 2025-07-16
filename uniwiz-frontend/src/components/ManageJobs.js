// FILE: src/components/ManageJobs.js (ENHANCED with Vacancy Column and Sorting)
// ==============================================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for portals

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

// --- Edit Job Modal Component (ENHANCED) ---
const EditJobModal = ({ isOpen, onClose, jobData, onUpdate, categories }) => {
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (jobData) {
            setFormData({
                ...jobData,
                start_date: jobData.start_date ? new Date(jobData.start_date).toISOString().split('T')[0] : '',
                end_date: jobData.end_date ? new Date(jobData.end_date).toISOString().split('T')[0] : '',
                application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline).toISOString().split('T')[0] : '',
            });
        }
    }, [jobData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const submissionData = {
                ...formData,
                location: formData.work_mode === 'remote' ? null : formData.location
            };

            const response = await fetch('http://uniwiz.test/update_job.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
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
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-dark-blue-text mb-6">Edit Job: <span className="font-light">{jobData.title}</span></h2>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
                    {/* Core Details */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-600 mb-3">Core Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                            <div className="md:col-span-2">
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
                    </div>
                     {/* Job Logistics */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-600 mb-3">Job Logistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Work Mode</label>
                                <select name="work_mode" value={formData.work_mode} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                                    <option value="on-site">On-site</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            {formData.work_mode !== 'remote' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                                <input type="date" name="application_deadline" value={formData.application_deadline || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                                <input type="text" name="working_hours" value={formData.working_hours || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                        </div>
                    </div>
                     {/* Specifics */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-600 mb-3">Specifics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment / Salary</label>
                                <input type="text" name="payment_range" value={formData.payment_range || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Number of Vacancies</label>
                                <input type="number" name="vacancies" min="1" value={formData.vacancies || 1} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                                <select name="experience_level" value={formData.experience_level || 'any'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                                    <option value="any">Any Experience</option>
                                    <option value="no-experience">No Experience Required</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                </select>
                            </div>
                        </div>
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


// --- Actions Dropdown Component (Portal Version) ---
const ActionsDropdown = ({ job, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleMenuAction = (action) => {
        onAction(job, action);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - 224,
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const MenuItem = ({ icon, text, onClick, isDestructive = false }) => (
        <button
            onClick={onClick}
            className={`w-full text-left flex items-center p-3 text-sm transition-colors duration-150 rounded-lg ${
                isDestructive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
            <span className={`mr-3 ${isDestructive ? 'text-red-500' : 'text-gray-400'}`}>{icon}</span>
            <span className="font-medium">{text}</span>
        </button>
    );

    const viewIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
    const editIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
    const deleteIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

    const DropdownMenu = () => {
        if (!position) return null;
        return ReactDOM.createPortal(
            <div
                ref={dropdownRef}
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
                className="fixed bg-white rounded-xl shadow-lg border z-30 p-2 w-56"
            >
                <MenuItem icon={viewIcon} text="View Applicants" onClick={() => handleMenuAction('view')} />
                <MenuItem icon={editIcon} text="Edit Job" onClick={() => handleMenuAction('edit')} />
                <div className="my-1 border-t border-gray-100"></div>
                <MenuItem icon={deleteIcon} text="Delete Job" onClick={() => handleMenuAction('delete')} isDestructive={true} />
            </div>,
            document.body
        );
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>
            {isOpen && <DropdownMenu />}
        </>
    );
};


function ManageJobs({ user, onViewApplicationsClick, onPostJobClick, onViewJobDetails }) {
    const [myJobs, setMyJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // **NEW**: State for sorting

    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', actionType: 'delete', onConfirm: () => {} });
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);
    const [categories, setCategories] = useState([]);

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
    }, [user, searchTerm]);

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

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPublisherJobs();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchPublisherJobs]);

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

    // **NEW**: Memoized sorted jobs list
    const sortedJobs = useMemo(() => {
        return [...myJobs].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [myJobs, sortOrder]);


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
                        {/* **NEW**: Sort Order Dropdown */}
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="shadow-sm border rounded py-2 px-4 bg-white"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                        <button onClick={onPostJobClick} className="flex items-center bg-app-blue text-white font-bold py-2 px-5 rounded-lg hover:bg-dark-blue-text">
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
                                    {/* **NEW**: Vacancies Column Header */}
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vacancies</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading jobs...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-red-500">{error}</td></tr>
                                ) : sortedJobs.length > 0 ? (
                                    sortedJobs.map(job => (
                                        <tr key={job.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <button onClick={() => onViewJobDetails(job.id)} className="text-primary-main hover:underline">
                                                    {job.title}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm"><StatusBadge status={job.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-dark-blue-text">{job.application_count}</td>
                                            {/* **NEW**: Vacancies Column Data */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                                                <span className={job.accepted_count >= job.vacancies ? 'text-red-500' : 'text-green-600'}>
                                                    {job.accepted_count}
                                                </span> / {job.vacancies}
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
        </>
    );
}

export default ManageJobs;
