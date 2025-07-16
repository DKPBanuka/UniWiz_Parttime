// FILE: src/components/JobDetailsModal.js (FIXED)
// =====================================================================
// This component displays the full details of a single job in a modal window.

import React, { useState, useEffect, useCallback } from 'react';

// --- Reusable Loading Spinner ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-main"></div>
    </div>
);

// --- Reusable Detail Item ---
const DetailItem = ({ label, value, children }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        {children ? children : <p className="font-semibold text-gray-800 capitalize">{value || 'Not specified'}</p>}
    </div>
);

// --- Reusable Skill Badge ---
const SkillBadge = ({ skill }) => (
    <span className="bg-primary-lighter text-primary-dark font-medium px-3 py-1 rounded-full text-sm capitalize">
        {skill}
    </span>
);

function JobDetailsModal({ job, isOpen, onClose, handleApply }) {
    const [jobDetails, setJobDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchJobDetails = useCallback(async () => {
        if (!job || !job.id) {
            setError("No job selected.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`http://uniwiz.test/get_job_details.php?job_id=${job.id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch job details.");
            }
            setJobDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [job]);

    useEffect(() => {
        if (isOpen) {
            fetchJobDetails();
        }
    }, [isOpen, fetchJobDetails]);

    if (!isOpen) return null;

    const skills = jobDetails?.skills_required ? jobDetails.skills_required.split(',').map(s => s.trim()) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-bold">&times;</button>
                
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="p-8 text-center text-red-500">Error: {error}</div>
                ) : !jobDetails ? (
                    <div className="p-8 text-center text-gray-500">Job details not found.</div>
                ) : (
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-primary-dark">{jobDetails.title}</h1>
                            {/* FIX: Use company_name from the fetched jobDetails state */}
                            <p className="text-lg text-gray-600 mt-1">{jobDetails.company_name || 'A Reputed Company'}</p>
                        </div>
                        
                        {/* Description */}
                        <div>
                            <h3 className="text-xl font-bold text-primary-dark mb-2 flex items-center"><span className="mr-2">&#9776;</span> Job Description</h3>
                            <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">{jobDetails.description}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Job Details */}
                            <div className="bg-gray-50 p-6 rounded-xl border">
                                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center"><span className="mr-2">&#8505;</span> Job Details</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <DetailItem label="Job Type" value={jobDetails.job_type} />
                                    <DetailItem label="Work Mode" value={jobDetails.work_mode} />
                                    <DetailItem label="Location" value={jobDetails.location} />
                                    <DetailItem label="Working Hours" value={jobDetails.working_hours} />
                                    <DetailItem label="Payment/Salary" value={jobDetails.payment_range} />
                                    <DetailItem label="Experience Level" value={jobDetails.experience_level} />
                                    <DetailItem label="Vacancies">
                                        <p className="font-semibold text-gray-800">
                                            <span className="text-green-600 font-bold">{jobDetails.accepted_count || 0}</span> / {jobDetails.vacancies}
                                        </p>
                                    </DetailItem>
                                    <DetailItem label="Application Deadline" value={jobDetails.application_deadline ? new Date(jobDetails.application_deadline).toLocaleDateString() : 'N/A'} />
                                    <DetailItem label="Status" value={jobDetails.status} />
                                    <DetailItem label="Start Date" value={jobDetails.start_date ? new Date(jobDetails.start_date).toLocaleDateString() : 'N/A'} />
                                    <DetailItem label="End Date" value={jobDetails.end_date ? new Date(jobDetails.end_date).toLocaleDateString() : 'N/A'} />
                                    <DetailItem label="Date Posted" value={new Date(jobDetails.created_at).toLocaleString()} />
                                </div>
                            </div>

                            {/* Required Skills */}
                            <div className="bg-gray-50 p-6 rounded-xl border">
                                <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center"><span className="mr-2">&#10003;</span> Required Skills</h3>
                                {skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, index) => <SkillBadge key={index} skill={skill} />)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No specific skills required.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end pt-4 border-t mt-4">
                             <button 
                                onClick={() => {
                                    onClose(); // Close this modal
                                    handleApply(job); // Open the apply modal
                                }} 
                                className="bg-primary-main text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobDetailsModal;
