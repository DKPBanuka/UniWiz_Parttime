// FILE: src/components/FindJobsPage.js (Updated with clickable company name)
// ===============================================
// This component provides the dedicated "Find Jobs" page for students,
// including search, category, job type, date posted, and salary range filtering.

import React, { useState, useEffect, useCallback } from 'react';

// Reusable Loading spinner component (from PublisherDashboard.js)
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

function FindJobsPage({ currentUser, handleApply, appliedJobs, applyingStatus, setPage, setPublisherIdForProfile }) { // Added setPage and setPublisherIdForProfile props
        // State for jobs and filters
        const [jobs, setJobs] = useState([]); // Stores filtered jobs from backend
        const [searchTerm, setSearchTerm] = useState('');
        const [selectedCategory, setSelectedCategory] = useState('');
        const [jobTypeFilter, setJobTypeFilter] = useState('');
        const [datePostedFilter, setDatePostedFilter] = useState(''); // e.g., '24_hours', '7_days_ago'
        const [specificDateFilter, setSpecificDateFilter] = useState(''); // Specific date from calendar
        const [minSalaryFilter, setMinSalaryFilter] = useState('');
        const [maxSalaryFilter, setMaxSalaryFilter] = useState('');
        const [categories, setCategories] = useState([]);
        const [isLoadingJobs, setIsLoadingJobs] = useState(true);
        const [errorJobs, setErrorJobs] = useState(null);

        // Helper to parse salary from payment_range string
        const parseSalary = (paymentRange) => {
                if (!paymentRange) return 0;
                const match = String(paymentRange).match(/(\d[\d,\.]*)/);
                if (match) {
                        return parseFloat(match[1].replace(/,/g, ''));
                }
                return 0;
        };

        // Fetch jobs from backend with filters
        const fetchJobsWithFilters = useCallback(async () => {
                setIsLoadingJobs(true);
                setErrorJobs(null);
                try {
                        const params = new URLSearchParams();
                        if (searchTerm) params.append('search', searchTerm);
                        if (selectedCategory) params.append('category_id', String(selectedCategory));
                        if (jobTypeFilter) params.append('job_type', jobTypeFilter);
                        if (datePostedFilter) params.append('date_posted', datePostedFilter);
                        if (specificDateFilter) params.append('specific_date', specificDateFilter);

                        // Salary filters are client-side due to payment_range format
                        const apiUrl = `http://uniwiz.test/jobs.php?${params.toString()}`;
                        const response = await fetch(apiUrl);
                        if (!response.ok) throw new Error('Failed to fetch jobs.');
                        let data = await response.json();

                        // Client-side salary filtering
                        if (minSalaryFilter || maxSalaryFilter) {
                                data = data.filter(job => {
                                        const salary = parseSalary(job.payment_range);
                                        const min = parseFloat(minSalaryFilter);
                                        const max = parseFloat(maxSalaryFilter);

                                        const isMinValid = !isNaN(min) ? salary >= min : true;
                                        const isMaxValid = !isNaN(max) ? salary <= max : true;
                                        
                                        return isMinValid && isMaxValid;
                                });
                        }

                        setJobs(data);
                } catch (e) {
                        console.error("Error fetching jobs with filters:", e);
                        setErrorJobs(e.message);
                } finally {
                        setIsLoadingJobs(false);
                }
        }, [searchTerm, selectedCategory, jobTypeFilter, datePostedFilter, specificDateFilter, minSalaryFilter, maxSalaryFilter]);

        // Fetch categories from backend on mount
        useEffect(() => {
                const fetchCategories = async () => {
                        try {
                                const response = await fetch('http://uniwiz.test/get_categories.php');
                                const data = await response.json();
                                if (response.ok) {
                                        setCategories(data);
                                }
                        } catch (err) {
                                console.error("Failed to fetch categories:", err);
                        }
                };
                fetchCategories();
        }, []);

        // Debounced effect to fetch jobs when filters change
        useEffect(() => {
                const handler = setTimeout(() => {
                        fetchJobsWithFilters();
                }, 300);

                return () => {
                        clearTimeout(handler);
                };
        }, [fetchJobsWithFilters]);

        // Handle click on publisher name to view company profile
        const handleViewCompanyProfile = (publisherId) => {
                if (setPage && setPublisherIdForProfile) {
                        setPublisherIdForProfile(publisherId);
                        setPage('company-profile');
                }
        };

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {/* Search input */}
                                <div className="lg:col-span-2">
                                        <input 
                                                type="text"
                                                placeholder="Search by job title or publisher..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-main"
                                        />
                                </div>

                                {/* Category filter dropdown */}
                                <div>
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
                                </div>

                                {/* Job type filter dropdown */}
                                <div>
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

                                {/* Date posted filter dropdown */}
                                <div>
                                        <select
                                                value={datePostedFilter}
                                                onChange={(e) => setDatePostedFilter(e.target.value)}
                                                className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-main"
                                        >
                                                <option value="">Any Date Posted</option>
                                                <option value="24_hours">Last 24 Hours</option>
                                                <option value="2_days_ago">Last 2 Days</option>
                                                <option value="7_days_ago">Last 7 Days</option>
                                                <option value="30_days_ago">Last 30 Days</option>
                                        </select>
                                </div>

                                {/* Specific date filter input */}
                                <div>
                                        <input 
                                                type="date"
                                                value={specificDateFilter}
                                                onChange={(e) => setSpecificDateFilter(e.target.value)}
                                                className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-main"
                                                title="Select a specific date for job availability"
                                        />
                                </div>

                                {/* Salary range filter inputs */}
                                <div className="flex gap-2">
                                        <input 
                                                type="number"
                                                placeholder="Min Salary"
                                                value={minSalaryFilter}
                                                onChange={(e) => setMinSalaryFilter(e.target.value)}
                                                className="flex-1 p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-main"
                                        />
                                        <input 
                                                type="number"
                                                placeholder="Max Salary"
                                                value={maxSalaryFilter}
                                                onChange={(e) => setMaxSalaryFilter(e.target.value)}
                                                className="flex-1 p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-main"
                                        />
                                </div>
                        </div>

                        {/* Display filtered jobs */}
                        {isLoadingJobs ? (
                                <LoadingSpinner />
                        ) : errorJobs ? (
                                <div className="text-center text-red-500 py-16">Error loading jobs: {errorJobs}</div>
                        ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {jobs.length > 0 ? jobs.map((job) => {
                                                const hasApplied = appliedJobs.has(job.id);
                                                const isApplying = applyingStatus[job.id] === 'applying';
                                                return (
                                                        <div key={job.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 border border-gray-100">
                                                                <div className="p-6 flex flex-col h-full">
                                                                        <div className="flex-grow">
                                                                                {/* Job category badge */}
                                                                                <span className="inline-block bg-primary-light text-primary-dark text-sm font-semibold px-3 py-1 rounded-full mb-3">{job.category}</span>
                                                                                {/* Job title */}
                                                                                <h3 className="text-2xl font-bold text-primary-dark mb-2">{job.title}</h3>
                                                                                {/* Clickable publisher/company name */}
                                                                                <p className="text-gray-600 mb-4">Posted by: 
                                                                                        <button 
                                                                                                onClick={() => handleViewCompanyProfile(job.publisher_id)} 
                                                                                                className="font-semibold text-primary-main hover:text-primary-dark ml-1"
                                                                                        >
                                                                                                {job.company_name || job.publisher_name}
                                                                                        </button>
                                                                                </p>
                                                                                {/* Job details */}
                                                                                <div className="space-y-2 text-gray-700">
                                                                                        <p><strong>Type:</strong> {job.job_type}</p>
                                                                                        <p><strong>Payment:</strong> {job.payment_range}</p>
                                                                                        <p className="text-sm text-gray-500">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                                                                                        {job.start_date && <p className="text-sm text-gray-500">Available from: {new Date(job.start_date).toLocaleDateString()}</p>}
                                                                                        {job.end_date && <p className="text-sm text-gray-500">Available until: {new Date(job.end_date).toLocaleDateString()}</p>}
                                                                                </div>
                                                                        </div>
                                                                        {/* Apply button or view details */}
                                                                        <div className="mt-6 text-right">
                                                                                {currentUser && currentUser.role === 'student' ? (
                                                                                        <button onClick={() => handleApply(job)} disabled={hasApplied || isApplying} className={`font-bold py-2 px-5 rounded-lg transition duration-300 ${hasApplied ? 'bg-green-500 text-white cursor-not-allowed' : isApplying ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary-main text-white hover:bg-primary-dark'}`}>
                                                                                                {hasApplied ? 'Applied' : isApplying ? 'Applying...' : 'Apply Now'}
                                                                                        </button>
                                                                                ) : (
                                                                                        <button className="bg-gray-400 text-white font-bold py-2 px-5 rounded-lg cursor-not-allowed">View Details</button>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                        </div>
                                                );
                                        }) : (
                                                // No jobs found message
                                                <p className="col-span-3 text-center text-gray-500 py-16">No jobs found matching your criteria. Please try a different search or filter.</p>
                                        )}
                                </div>
                        )}
                </div>
        );
}

export default FindJobsPage;
