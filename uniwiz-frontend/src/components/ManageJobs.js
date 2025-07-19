// FILE: src/components/ManageJobs.js (UPDATED with Clickable Applicant Rows)
// ==============================================================================
// This component now allows clicking on the entire applicant row in the table
// to view their details, instead of using a separate "View" button.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Sri Lanka Districts List
const sriLankaDistricts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
    "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
    "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya"
];

// --- Reusable Components (Self-contained for this component) ---

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white transition-transform transform translate-x-0 z-50";
    const typeClasses = { success: "bg-green-500", error: "bg-red-500" };
    return <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-500'}`}>{message}</div>;
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

const ApplicantDetailModal = ({ applicant, onClose, onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(applicant ? applicant.status : '');
    const modalRef = useRef();

    useEffect(() => {
        if (applicant && applicant.status === 'pending') {
            onStatusChange(applicant.application_id, 'viewed', false);
            setCurrentStatus('viewed');
        } else if (applicant) {
            setCurrentStatus(applicant.status);
        }
    }, [applicant, onStatusChange]);

    useEffect(() => {
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!applicant) return null;

    const handleStatusButtonClick = (newStatus) => {
        onStatusChange(applicant.application_id, newStatus, true);
        setCurrentStatus(newStatus);
    };
    
    const canTakeAction = currentStatus === 'pending' || currentStatus === 'viewed';
    const skills = applicant.skills ? applicant.skills.split(',').map(s => s.trim()) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-40 p-4" onClick={onClose}>
            <div ref={modalRef} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-3xl font-bold z-10">&times;</button>
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 border-b pb-6 mb-6">
                    <div className="flex items-center gap-6">
                        <img src={applicant.profile_image_url ? `http://uniwiz.test/${applicant.profile_image_url}` : `https://placehold.co/100x100/E8EAF6/211C84?text=${applicant.first_name.charAt(0)}`} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-primary-lighter shadow-md" />
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

// --- View for Applicants of a Single Job (TABLE VIEW) ---
const ApplicantsForJobView = ({ job, onBack, onStatusChange }) => {
    const [applicants, setApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchApplicants = async () => {
            if (!job || !job.id) return;
            setIsLoading(true);
            setError(null);
            try {
                const url = `http://uniwiz.test/get_all_publisher_applications.php?job_id=${job.id}`;
                const response = await fetch(url);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch applicants.');
                setApplicants(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplicants();
    }, [job]);

    const handleViewDetails = (applicant) => {
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApplicant(null);
    };
    
    const handleStatusUpdate = (e, applicationId, newStatus) => {
        e.stopPropagation(); // Prevent row click from firing when a button is clicked
        onStatusChange(applicationId, newStatus, true);
        setApplicants(prev => 
            prev.map(app => 
                app.application_id === applicationId ? { ...app, status: newStatus } : app
            )
        );
    };

    return (
        <>
            {isModalOpen && (
                <ApplicantDetailModal 
                    applicant={selectedApplicant} 
                    onClose={handleCloseModal}
                    onStatusChange={onStatusChange} // Pass the original handler to the modal
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <button onClick={onBack} className="text-primary-main hover:text-primary-dark font-semibold flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Jobs List
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800">Applicants for: <span className="italic">{job.title}</span></h2>
                </div>
            </div>
            
            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="text-center py-16 text-red-500 bg-white rounded-xl shadow-md">{error}</div>
            ) : applicants.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applicants.map(applicant => (
                                    <tr key={applicant.application_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(applicant)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full object-cover" src={applicant.profile_image_url ? `http://uniwiz.test/${applicant.profile_image_url}` : `https://placehold.co/40x40/E8EAF6/211C84?text=${applicant.first_name.charAt(0)}`} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{applicant.first_name} {applicant.last_name}</div>
                                                    <div className="text-sm text-gray-500">{applicant.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(applicant.applied_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={applicant.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {(applicant.status === 'pending' || applicant.status === 'viewed') && (
                                                <>
                                                    <button onClick={(e) => handleStatusUpdate(e, applicant.application_id, 'accepted')} className="text-green-600 hover:text-green-800 font-semibold">Accept</button>
                                                    <button onClick={(e) => handleStatusUpdate(e, applicant.application_id, 'rejected')} className="text-red-600 hover:text-red-800 font-semibold">Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700">No Applicants Found</h3>
                    <p className="text-gray-500 mt-2">There are currently no applications for this job.</p>
                </div>
            )}
        </>
    );
};


// --- Confirmation Modal ---
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

// --- Edit Job Modal ---
const EditJobModal = ({ isOpen, onClose, jobData, onUpdate, categories }) => {
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSkill, setCurrentSkill] = useState('');

    useEffect(() => {
        if (jobData) {
            setFormData({
                ...jobData,
                start_date: jobData.start_date ? new Date(jobData.start_date).toISOString().split('T')[0] : '',
                end_date: jobData.end_date ? new Date(jobData.end_date).toISOString().split('T')[0] : '',
                application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline).toISOString().split('T')[0] : '',
                skills: jobData.skills ? Array.isArray(jobData.skills) ? jobData.skills : jobData.skills.split(',').map(s => s.trim()) : [],
            });
        }
    }, [jobData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' && currentSkill.trim()) {
            if (!formData.skills.includes(currentSkill.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, currentSkill.trim()]
                }));
            }
            setCurrentSkill('');
            e.preventDefault();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const submissionData = { ...formData, location: formData.work_mode === 'remote' ? null : formData.location };
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
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-primary-dark mb-6">Edit Job: <span className="font-light">{jobData.title}</span></h2>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
                    {/* Core Details Section */}
                    <div className="p-6 border rounded-xl">
                        <h3 className="text-xl font-semibold text-primary-dark mb-4">Core Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-title">Job Title</label>
                                <input id="edit-title" name="title" type="text" value={formData.title} onChange={handleChange} className="shadow-sm border rounded w-full py-3 px-4" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-description">Job Description</label>
                                <textarea id="edit-description" name="description" value={formData.description} onChange={handleChange} rows="6" className="shadow-sm border rounded w-full py-3 px-4" required></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-category">Category</label>
                                    <select id="edit-category" name="categoryId" value={formData.categoryId} onChange={handleChange} className="shadow-sm bg-white border rounded w-full py-3 px-4" required>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-job-type">Job Type</label>
                                    <select id="edit-job-type" name="jobType" value={formData.jobType} onChange={handleChange} className="shadow-sm bg-white border rounded w-full py-3 px-4">
                                        <option value="part-time">Part-time</option>
                                        <option value="freelance">Freelance</option>
                                        <option value="task-based">Task-based</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Logistics Section */}
                    <div className="p-6 border rounded-xl">
                         <h3 className="text-xl font-semibold text-primary-dark mb-4">Job Logistics</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-work-mode">Work Mode</label>
                                <select id="edit-work-mode" name="workMode" value={formData.workMode} onChange={handleChange} className="shadow-sm bg-white border rounded w-full py-3 px-4">
                                    <option value="on-site">On-site</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            {formData.workMode !== 'remote' && (
                                <>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-district">District</label>
                                        <select id="edit-district" name="district" value={formData.district} onChange={handleChange} className="shadow-sm bg-white border rounded w-full py-3 px-4" required>
                                            <option value="">Select a District</option>
                                            {sriLankaDistricts.sort().map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-location">Specific Location / Address</label>
                                        <input id="edit-location" name="location" type="text" value={formData.location} onChange={handleChange} placeholder="e.g., Town Hall, Colombo 07" className="shadow-sm border rounded w-full py-3 px-4" />
                                    </div>
                                </>
                            )}
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-application-deadline">Application Deadline</label>
                                <input id="edit-application-deadline" name="applicationDeadline" type="date" value={formData.applicationDeadline} onChange={handleChange} className="shadow-sm border rounded w-full py-3 px-4 text-gray-500" />
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-working-hours">Working Hours</label>
                                <input id="edit-working-hours" name="workingHours" type="text" value={formData.workingHours} onChange={handleChange} placeholder="e.g., 20 hours/week" className="shadow-sm border rounded w-full py-3 px-4" />
                            </div>
                         </div>
                    </div>
                    
                    {/* Specifics Section */}
                    <div className="p-6 border rounded-xl">
                        <h3 className="text-xl font-semibold text-primary-dark mb-4">Specifics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Payment Type</label>
                                <select name="paymentType" value={formData.paymentType} onChange={handleChange} className="shadow-sm bg-white border rounded w-full py-3 px-4">
                                    <option value="range">Range</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="negotiable">Negotiable</option>
                                </select>
                            </div>
                            {formData.paymentType === 'range' && (
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <input type="number" name="priceMin" value={formData.priceMin} onChange={handleChange} placeholder="Min Price (Rs.)" className="shadow-sm border rounded py-3 px-4" />
                                    <input type="number" name="priceMax" value={formData.priceMax} onChange={handleChange} placeholder="Max Price (Rs.)" className="shadow-sm border rounded py-3 px-4" />
                                </div>
                            )}
                            {formData.paymentType === 'fixed' && (
                                <div className="md:col-span-2">
                                    <input type="number" name="fixedPrice" value={formData.fixedPrice} onChange={handleChange} placeholder="Fixed Price (Rs.)" className="shadow-sm border rounded w-full py-3 px-4" />
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-skills">Required Skills</label>
                                <div className="flex flex-wrap gap-2 items-center p-2 border rounded-lg">
                                    {formData.skills.map((skill, index) => (
                                        <div key={index} className="flex items-center bg-primary-lighter text-primary-dark px-3 py-1 rounded-full text-sm">
                                            <span>{skill}</span>
                                            <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-primary-dark hover:text-red-500">&times;</button>
                                        </div>
                                    ))}
                                    <input id="edit-skills" type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Type a skill and press Enter" className="flex-grow p-1 outline-none" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-vacancies">Number of Vacancies</label>
                                <input id="edit-vacancies" name="vacancies" type="number" min="1" value={formData.vacancies} onChange={handleChange} className="shadow-sm border rounded w-full py-3 px-4" />
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="edit-experience">Experience Level</label>
                                <select id="edit-experience" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="shadow-sm bg-white border rounded w-full py-3 px-4">
                                    <option value="any">Any</option>
                                    <option value="entry-level">Entry-level</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2">Job Duration</label>
                                <div className="flex items-center space-x-4">
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="shadow-sm border rounded py-3 px-4 text-gray-500"/>
                                    {!formData.isSingleDay && <span>to</span>}
                                    {!formData.isSingleDay && <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="shadow-sm border rounded py-3 px-4 text-gray-500"/>}
                                    <label><input type="checkbox" name="isSingleDay" checked={formData.isSingleDay} onChange={handleChange} className="mr-2"/> Single Day Job</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-primary-main text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Actions Dropdown ---
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
function ManageJobs({ user, onPostJobClick, onViewJobDetails }) {
    const [myJobs, setMyJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); 

    // State to control which view is active
    const [viewingJob, setViewingJob] = useState(null); // Will hold the job object

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
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://uniwiz.test/get_categories.php');
                const data = await response.json();
                if (response.ok) setCategories(data);
            } catch (err) { console.error("Failed to fetch categories:", err); }
        };
        fetchCategories();
    }, [fetchPublisherJobs]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    const handleStatusChange = async (applicationId, newStatus, showNotif = true) => {
        try {
            const response = await fetch(`http://uniwiz.test/update_application_status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId, status: newStatus }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            if (showNotif) showNotification(result.message, 'success');
        } catch (err) {
            if (showNotif) showNotification(`Error: ${err.message}`, 'error');
        }
    };

    const handleJobAction = async (job, action) => {
        if (action === 'view') {
            setViewingJob(job); // Set the job to view applicants for
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
                    if (type === 'success') fetchPublisherJobs();
                }}
            />

            {/* Conditional rendering based on `viewingJob` state */}
            {viewingJob ? (
                <ApplicantsForJobView 
                    job={viewingJob} 
                    onBack={() => setViewingJob(null)}
                    onStatusChange={handleStatusChange}
                />
            ) : (
                <>
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
                </>
            )}
        </div>
    );
}

export default ManageJobs;
