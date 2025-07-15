// FILE: src/components/CompanyProfilePage.js
// =====================================================
// This component displays a company's profile and all jobs posted by them.

import React, { useState, useEffect, useCallback } from 'react';

// Reusable Loading spinner component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="loading-spinner">
            <div className="spinner-circle"></div>
        </div>
        <style jsx>{`
            .loading-spinner {
                display: inline-block;
                width: 40px;
                height: 40px;
            }
            .spinner-circle {
                display: block;
                width: 100%;
                height: 100%;
                border: 3px solid #B5A8D5; /* primary-lighter */
                border-top-color: #4D55CC; /* primary-main */
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

function CompanyProfilePage({ publisherId, currentUser, handleApply, appliedJobs, applyingStatus }) {
        const [company, setCompany] = useState(null);
        const [jobs, setJobs] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState(null);

        // Fetch company profile and jobs
        const fetchCompanyData = useCallback(async () => {
                if (!publisherId) {
                        setError("Publisher ID is missing."); // Publisher ID is missing
                        setIsLoading(false);
                        return;
                }

                setIsLoading(true);
                setError(null);
                try {
                        const apiUrl = `http://uniwiz.test/get_company_profile.php?publisher_id=${publisherId}`;
                        const response = await fetch(apiUrl);
                        const data = await response.json();

                        if (response.ok) {
                                setCompany(data.details);
                                setJobs(Array.isArray(data.jobs) ? data.jobs : []);
                        } else {
                                throw new Error(data.message || "Failed to fetch company information."); // Failed to fetch company information
                        }
                } catch (err) {
                        console.error("Error fetching company data:", err); // Error fetching company data
                        setError(err.message);
                } finally {
                        setIsLoading(false);
                }
        }, [publisherId]);

        useEffect(() => {
                fetchCompanyData();
        }, [fetchCompanyData]);

        if (isLoading) {
                return <LoadingSpinner />;
        }

        if (error) {
                return (
                        <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800">
                                <div className="text-center text-red-500 py-16">Error: {error}</div> {/* Error occurred */}
                        </div>
                );
        }

        if (!company) {
                return (
                        <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800">
                                <div className="text-center text-gray-500 py-16">Company not found.</div> {/* Company not found */}
                        </div>
                );
        }

        return (
                <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800">
                        {/* Company Profile Header */}
                        <div className="bg-white p-8 rounded-xl shadow-md mb-8 flex items-center space-x-6 border border-gray-100">
                                {company.profile_image_url ? (
                                        <img 
                                                src={`http://uniwiz.test/${company.profile_image_url}`} 
                                                alt={`${company.company_name || company.first_name}'s Profile`} 
                                                className="h-24 w-24 rounded-full object-cover shadow-sm border-2 border-primary-lighter" 
                                        />
                                ) : (
                                        <div className="h-24 w-24 rounded-full bg-primary-lighter flex items-center justify-center text-primary-dark font-bold text-4xl flex-shrink-0">
                                                {(company.company_name ? company.company_name.charAt(0) : (company.first_name || '').charAt(0)).toUpperCase()}
                                        </div>
                                )}
                                <div>
                                        <h1 className="text-4xl font-bold text-primary-dark mb-2">{company.company_name || `${company.first_name} ${company.last_name}`}</h1>
                                        <p className="text-gray-600 text-lg">{company.email}</p>
                                        {/* Add more company details here if available, e.g., description, website */}
                                </div>
                        </div>

                        {/* Jobs Posted by This Company */}
                        <h2 className="text-3xl font-bold text-primary-dark mb-6">Jobs Posted by This Company</h2> {/* Jobs posted by this company */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {jobs.length > 0 ? jobs.map((job) => {
                                        const hasApplied = appliedJobs && appliedJobs.has(job.id);
                                        const isApplying = applyingStatus && applyingStatus[job.id] === 'applying';
                                        return (
                                                <div key={job.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
                                                        <div className="p-6 flex flex-col h-full">
                                                                <div className="flex-grow">
                                                                        <span className="inline-block bg-primary-light text-primary-dark text-sm font-semibold px-3 py-1 rounded-full mb-3">{job.category}</span>
                                                                        <h3 className="text-2xl font-bold text-primary-dark mb-2">{job.title}</h3>
                                                                        <p className="text-gray-600 mb-4">Posted by: <span className="font-semibold">{company.company_name || `${company.first_name} ${company.last_name}`}</span></p> {/* Posted by */}
                                                                        <div className="space-y-2 text-gray-700">
                                                                                <p><strong>Type:</strong> {job.job_type}</p> {/* Type */}
                                                                                <p><strong>Payment:</strong> {job.payment_range}</p> {/* Payment */}
                                                                                <p className="text-sm text-gray-500">Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</p> {/* Posted date */}
                                                                                {job.start_date && <p className="text-sm text-gray-500">Available from: {new Date(job.start_date).toLocaleDateString()}</p>} {/* Available from */}
                                                                                {job.end_date && <p className="text-sm text-gray-500">Available until: {new Date(job.end_date).toLocaleDateString()}</p>} {/* Available until */}
                                                                        </div>
                                                                </div>
                                                                <div className="mt-6 text-right">
                                                                        {currentUser && currentUser.role === 'student' ? (
                                                                                <button onClick={() => handleApply(job)} disabled={hasApplied || isApplying} className={`font-bold py-2 px-5 rounded-lg transition duration-300 ${hasApplied ? 'bg-green-500 text-white cursor-not-allowed' : isApplying ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary-main text-white hover:bg-primary-dark'}`}>
                                                                                        {hasApplied ? 'Applied' : isApplying ? 'Applying...' : 'Apply Now'} {/* Applied, Applying..., Apply Now */}
                                                                                </button>
                                                                        ) : (
                                                                                <button className="bg-gray-400 text-white font-bold py-2 px-5 rounded-lg cursor-not-allowed">View Details</button>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>
                                        );
                                }) : (
                                        <p className="col-span-3 text-center text-gray-500 py-16">No jobs currently posted by this company.</p> 
                                )}
                        </div>
                </div>
        );
}

export default CompanyProfilePage;
