// FILE: src/components/FindJobsPage.js (Modern Light Blue Design)
// =================================================================================

import React, { useState, useEffect, useCallback } from 'react';

// --- Reusable Components ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
    const statusClasses = {
        pending: "bg-yellow-100 text-yellow-800",
        viewed: "bg-blue-100 text-blue-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800"
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.default}`}>{status}</span>;
};

const JobCard = ({ job, currentUser, handleApply, handleViewCompanyProfile, handleViewJobDetails }) => {
    const applicationStatus = job.application_status;
    const categoryName = job.category_name || job.category;
    const displayName = job.company_name || job.publisher_name || 'A Reputed Company';

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-md">
            <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                    <span className="inline-block bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                        {categoryName}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">
                        Posted by: 
                        <button 
                            onClick={() => handleViewCompanyProfile(job.publisher_id)} 
                            className="font-semibold text-blue-500 hover:text-blue-600 ml-1"
                        >
                            {displayName}
                        </button>
                    </p>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Type:</strong> {job.job_type}</p>
                        <p><strong>Payment:</strong> {job.payment_range}</p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                        {applicationStatus && (
                            <StatusBadge status={applicationStatus} />
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handleViewJobDetails(job)}
                            className="font-medium py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300 text-sm"
                        >
                            View
                        </button>
                        {currentUser && currentUser.role === 'student' && !applicationStatus && (
                            <button 
                                onClick={() => handleApply(job)} 
                                className="font-medium py-2 px-4 rounded-lg transition duration-300 bg-blue-500 text-white hover:bg-blue-600 text-sm"
                            >
                                Apply Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function FindJobsPage({ currentUser, handleApply, setPage, setPublisherIdForProfile, handleViewJobDetails }) {
    const [allJobs, setAllJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleJobsCount, setVisibleJobsCount] = useState(6);
    const JOBS_PER_LOAD = 6;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const jobsResponse = await fetch(`http://uniwiz.test/jobs.php?student_id=${currentUser.id}`);
            if (!jobsResponse.ok) throw new Error('Failed to fetch jobs.');
            const jobsData = await jobsResponse.json();
            setAllJobs(jobsData);
        } catch (e) {
            console.error("Error fetching data:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser.id]);

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
    
    const filteredJobs = allJobs.filter(job => {
        const searchTermMatch = searchTerm === '' || 
                            job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (job.company_name && job.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const categoryMatch = selectedCategory === '' || String(job.category_id) === String(selectedCategory);
        const jobTypeMatch = jobTypeFilter === '' || job.job_type === jobTypeFilter;
        return searchTermMatch && categoryMatch && jobTypeMatch;
    });

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-800">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Find Your Next Job</h1>
                    <p className="text-gray-600 mt-2">Explore opportunities that match your skills and interests.</p>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <input 
                    type="text"
                    placeholder="Search by job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
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
                <div className="text-center text-red-500 py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                    Failed to load jobs: {error}
                </div>
            ) : (
                <>
                    {/* All Jobs Section */}
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Available Jobs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredJobs.length > 0 ? filteredJobs.slice(0, visibleJobsCount).map(job => (
                            <JobCard 
                                key={job.id} 
                                job={job} 
                                currentUser={currentUser} 
                                handleApply={handleApply} 
                                handleViewCompanyProfile={handleViewCompanyProfile}
                                handleViewJobDetails={handleViewJobDetails}
                            />
                        )) : (
                            <div className="col-span-3 text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                                No jobs found matching your criteria.
                            </div>
                        )}
                    </div>

                    {/* "Load More" Button */}
                    {filteredJobs.length > visibleJobsCount && (
                        <div className="text-center mt-8">
                            <button
                                onClick={() => setVisibleJobsCount(prevCount => prevCount + JOBS_PER_LOAD)}
                                className="bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
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