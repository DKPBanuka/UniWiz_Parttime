// FILE: src/components/FindJobsPage.js (Full Code)
// =================================================================================
// This component displays all available jobs, with sections for recommended jobs
// and all other jobs, including search, filtering, and "load more" functionality.

import React, { useState, useEffect, useCallback } from 'react';

// Reusable Loading spinner component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
    </div>
);

// Reusable Job Card component
const JobCard = ({ job, currentUser, handleApply, appliedJobs, applyingStatus, handleViewCompanyProfile, handleViewJobDetails }) => {
    const hasApplied = appliedJobs && appliedJobs.has(job.id);
    const isApplying = applyingStatus && applyingStatus[job.id] === 'applying';
    
    // Use category_name if available (from recommendation), otherwise use category
    const categoryName = job.category_name || job.category;
    // Ensure there's always a name to display for the publisher
    const displayName = job.company_name || job.publisher_name || 'A Reputed Company';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
            <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                    <span className="inline-block bg-primary-light text-primary-dark text-sm font-semibold px-3 py-1 rounded-full mb-3">{categoryName}</span>
                    <h3 className="text-2xl font-bold text-primary-dark mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">
                        Posted by: 
                        <button 
                            onClick={() => handleViewCompanyProfile(job.publisher_id)} 
                            className="font-semibold text-primary-main hover:text-primary-dark ml-1"
                        >
                            {displayName}
                        </button>
                    </p>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Type:</strong> {job.job_type}</p>
                        <p><strong>Payment:</strong> {job.payment_range}</p>
                    </div>
                </div>
                {/* Action buttons area */}
                <div className="mt-6 pt-4 border-t flex justify-end items-center space-x-3">
                    <button 
                        onClick={() => handleViewJobDetails(job)}
                        className="font-bold py-2 px-5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-300"
                    >
                        View
                    </button>
                    {currentUser && currentUser.role === 'student' && (
                        <button 
                            onClick={() => handleApply(job)} 
                            disabled={hasApplied || isApplying} 
                            className={`font-bold py-2 px-5 rounded-lg transition duration-300 ${hasApplied ? 'bg-green-500 text-white cursor-not-allowed' : isApplying ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary-main text-white hover:bg-primary-dark'}`}
                        >
                            {hasApplied ? 'Applied' : isApplying ? 'Applying...' : 'Apply Now'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


function FindJobsPage({ currentUser, handleApply, appliedJobs, applyingStatus, setPage, setPublisherIdForProfile, handleViewJobDetails }) {
    // State for all jobs and filters
    const [allJobs, setAllJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for "Load More" functionality
    const [visibleJobsCount, setVisibleJobsCount] = useState(6);
    const JOBS_PER_LOAD = 6;

    // Fetch jobs and recommendations
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all jobs
            const jobsResponse = await fetch(`http://uniwiz.test/jobs.php`);
            if (!jobsResponse.ok) throw new Error('Failed to fetch jobs.');
            const jobsData = await jobsResponse.json();
            
            // Fetch recommended jobs
            const recResponse = await fetch(`http://uniwiz.test/get_recommended_jobs.php?student_id=${currentUser.id}`);
            if (!recResponse.ok) throw new Error('Failed to fetch recommendations.');
            const recData = await recResponse.json();

            // Filter out recommended jobs from the main list to avoid duplicates
            const recommendedJobIds = new Set(recData.map(j => j.id));
            const filteredAllJobs = jobsData.filter(job => !recommendedJobIds.has(job.id));

            setAllJobs(filteredAllJobs);
            setRecommendedJobs(recData);

        } catch (e) {
            console.error("Error fetching data:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser.id]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://uniwiz.test/get_categories.php');
                const data = await response.json();
                if (response.ok) setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchData();
        fetchCategories();
    }, [fetchData]);

    const handleViewCompanyProfile = (publisherId) => {
        if (setPage && setPublisherIdForProfile) {
            setPublisherIdForProfile(publisherId);
            setPage('company-profile');
        }
    };
    
    // Filter logic for the main job list
    const filteredJobs = allJobs.filter(job => {
        const searchTermMatch = searchTerm === '' || 
                                job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (job.company_name && job.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const categoryMatch = selectedCategory === '' || String(job.category_id) === String(selectedCategory);
        const jobTypeMatch = jobTypeFilter === '' || job.job_type === jobTypeFilter;
        return searchTermMatch && categoryMatch && jobTypeMatch;
    });

    return (
        <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">Find Your Next Job</h1>
                    <p className="text-gray-600 mt-2">Explore opportunities that match your skills and interests.</p>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-6 bg-white rounded-xl shadow-md">
                <input 
                    type="text"
                    placeholder="Search by job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-main"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-main"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-main"
                >
                    <option value="">All Job Types</option>
                    <option value="freelance">Freelance</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="task-based">Task-based</option>
                    <option value="full-time">Full-time</option>
                </select>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="text-center text-red-500 py-16">Failed to load jobs: {error}</div>
            ) : (
                <>
                    {/* Recommended Jobs Section */}
                    {recommendedJobs.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-primary-dark mb-4">Recommended For You</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {recommendedJobs.map(job => (
                                    <JobCard 
                                        key={`rec-${job.id}`} 
                                        job={job} 
                                        currentUser={currentUser} 
                                        handleApply={handleApply} 
                                        appliedJobs={appliedJobs} 
                                        applyingStatus={applyingStatus} 
                                        handleViewCompanyProfile={handleViewCompanyProfile}
                                        handleViewJobDetails={handleViewJobDetails}
                                    />
                                ))}
                            </div>
                            <hr className="my-8 border-gray-300" />
                        </div>
                    )}

                    {/* All Other Jobs Section */}
                    <h2 className="text-2xl font-bold text-primary-dark mb-4">All Jobs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredJobs.length > 0 ? filteredJobs.slice(0, visibleJobsCount).map(job => (
                            <JobCard 
                                key={job.id} 
                                job={job} 
                                currentUser={currentUser} 
                                handleApply={handleApply} 
                                appliedJobs={appliedJobs} 
                                applyingStatus={applyingStatus} 
                                handleViewCompanyProfile={handleViewCompanyProfile}
                                handleViewJobDetails={handleViewJobDetails}
                            />
                        )) : (
                            <p className="col-span-3 text-center text-gray-500 py-16">No jobs found matching your criteria.</p>
                        )}
                    </div>

                    {/* "Load More" Button */}
                    {filteredJobs.length > visibleJobsCount && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => setVisibleJobsCount(prevCount => prevCount + JOBS_PER_LOAD)}
                                className="bg-primary-main text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Load More Jobs
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default FindJobsPage;
