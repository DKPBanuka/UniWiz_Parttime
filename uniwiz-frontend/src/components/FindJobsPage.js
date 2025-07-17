// FILE: src/components/FindJobsPage.js (UPDATED with More Compact Filters)
// =================================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Constants ---
const API_BASE_URL = 'http://uniwiz.test';
const MAX_SALARY = 200000;

// --- Reusable Components ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const categoryColors = {
    'Graphic Design': 'bg-pink-100 text-pink-800',
    'Content Writing': 'bg-teal-100 text-teal-800',
    'Web Development': 'bg-blue-100 text-blue-800',
    'IT & Software Development': 'bg-indigo-100 text-indigo-800',
    'Tutoring': 'bg-purple-100 text-purple-800',
    'Event Support': 'bg-amber-100 text-amber-800',
    'Data Entry & Admin': 'bg-slate-100 text-slate-800',
    'Digital Marketing & SEO': 'bg-pink-100 text-pink-800',
    'Writing & Translation': 'bg-teal-100 text-teal-800',
    'default': 'bg-gray-100 text-gray-800'
};

const JobCard = ({ job, currentUser, handleApply, handleViewCompanyProfile, handleViewJobDetails, applyingStatus }) => {
    const categoryName = job.category_name || job.category;
    const displayName = job.company_name || job.publisher_name || 'A Reputed Company';
    const categoryColorClass = categoryColors[categoryName] || categoryColors.default;

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-CA');
    };

    const postedDate = formatDate(job.created_at);
    const startDate = formatDate(job.start_date);
    const endDate = formatDate(job.end_date);
    
    const isSingleDayJob = startDate && (startDate === endDate || !endDate);

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 border border-gray-100 hover:border-blue-300 hover:shadow-md">
            <div className="p-5 flex flex-col h-full">
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-3">
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${categoryColorClass}`}>
                            {categoryName}
                        </span>
                        <span className="text-xs text-gray-500">
                            Posted: {postedDate}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        By: <button onClick={() => handleViewCompanyProfile(job.publisher_id)} className="font-semibold text-blue-500 hover:text-blue-600 ml-1">{displayName}</button>
                    </p>
                    <div className="space-y-1 text-gray-700 text-sm">
                        <p><strong>Type:</strong> {job.job_type}</p>
                        <p><strong>Payment:</strong> {job.payment_range}</p>
                        {isSingleDayJob ? (
                             <p><strong>Date:</strong> {startDate}</p>
                        ) : (startDate && 
                             <p><strong>Duration:</strong> {startDate} to {endDate || 'Ongoing'}</p>
                        )}
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end items-center">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleViewJobDetails(job)} className="font-medium py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-300 text-sm">Details</button>
                        {currentUser && !applyingStatus[job.id] && ( 
                            <button onClick={() => handleApply(job)} className="font-medium py-2 px-4 rounded-lg transition duration-300 bg-blue-500 text-white hover:bg-blue-600 text-sm">Apply Now</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main FindJobsPage Component ---
function FindJobsPage({ currentUser, handleApply, setPage, setPublisherIdForProfile, handleViewJobDetails, applyingStatus }) {
    const [allJobs, setAllJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleJobsCount, setVisibleJobsCount] = useState(9);

    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [minSalary, setMinSalary] = useState(0);
    const [postedDateFilter, setPostedDateFilter] = useState('anytime');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [jobDateFrom, setJobDateFrom] = useState('');
    const [jobDateTo, setJobDateTo] = useState('');
    
    const [categories, setCategories] = useState([]);
    const JOBS_PER_LOAD = 9;
    
    const sriLankaDistricts = [
        "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
        "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
        "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
        "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
    ];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const studentIdParam = currentUser ? `student_id=${currentUser.id}` : '';
            const jobsResponse = await fetch(`${API_BASE_URL}/jobs.php?${studentIdParam}`);
            if (!jobsResponse.ok) throw new Error('Failed to fetch jobs.');
            const jobsData = await jobsResponse.json();
            setAllJobs(jobsData);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/get_categories.php`);
                const data = await response.json();
                if (response.ok) setCategories(data);
            } catch (err) { console.error("Failed to fetch categories:", err); }
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
        const searchTermMatch = searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || (job.company_name && job.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const categoryMatch = selectedCategory === '' || String(job.category_id) === String(selectedCategory);
        const jobTypeMatch = jobTypeFilter === '' || job.job_type === jobTypeFilter;
        const paymentValue = parseInt(job.payment_range.replace(/[^0-9]/g, ''), 10) || 0;
        const salaryMatch = paymentValue >= minSalary;
        const districtMatch = selectedDistrict === '' || (job.location && job.location.toLowerCase().includes(selectedDistrict.toLowerCase()));

        const now = new Date();
        const createdDate = new Date(job.created_at);
        let postedDateMatch = true;
        if (postedDateFilter === '24hours') postedDateMatch = now - createdDate <= 24 * 60 * 60 * 1000;
        else if (postedDateFilter === '7days') postedDateMatch = now - createdDate <= 7 * 24 * 60 * 60 * 1000;
        else if (postedDateFilter === '30days') postedDateMatch = now - createdDate <= 30 * 24 * 60 * 60 * 1000;

        const jobStartDate = job.start_date ? new Date(job.start_date) : null;
        const jobEndDate = job.end_date ? new Date(job.end_date) : jobStartDate;
        const filterFrom = jobDateFrom ? new Date(jobDateFrom) : null;
        const filterTo = jobDateTo ? new Date(jobDateTo) : null;
        let durationMatch = true;
        if (jobStartDate && filterFrom && filterTo) {
            durationMatch = (jobStartDate <= filterTo && jobEndDate >= filterFrom);
        } else if (filterFrom) {
            durationMatch = jobEndDate >= filterFrom;
        } else if (filterTo) {
            durationMatch = jobStartDate <= filterTo;
        }
        
        return searchTermMatch && categoryMatch && jobTypeMatch && salaryMatch && postedDateMatch && districtMatch && durationMatch;
    });
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setJobTypeFilter('');
        setMinSalary(0);
        setPostedDateFilter('anytime');
        setSelectedDistrict('');
        setJobDateFrom('');
        setJobDateTo('');
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Find Your Next Job</h1>
                    <p className="text-gray-600 mt-2">Use the filters below to find your perfect match.</p>
                </div>
            </div>

            {/* UPDATED: Compact Filter Section */}
            <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                    {/* Row 1: Primary Filters */}
                    <input type="text" placeholder="Search by job, company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="lg:col-span-2 w-full p-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-400" />
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-2 rounded-lg border bg-white focus:ring-1 focus:ring-blue-400">
                        <option value="">All Categories</option>
                        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                    <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)} className="w-full p-2 rounded-lg border bg-white focus:ring-1 focus:ring-blue-400">
                        <option value="">All Job Types</option>
                        <option value="freelance">Freelance</option><option value="part-time">Part-time</option><option value="internship">Internship</option><option value="task-based">Task-based</option><option value="full-time">Full-time</option>
                    </select>
                    <button onClick={handleResetFilters} className="w-full p-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Reset</button>

                    {/* Row 2: Secondary Filters */}
                    <div className="lg:col-span-2 space-y-1">
                        <label className="block font-medium text-gray-700 text-xs">Job Start / End Date</label>
                        <div className="flex items-center border rounded-lg p-2 focus-within:ring-1 focus-within:ring-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <input type="date" value={jobDateFrom} onChange={(e) => setJobDateFrom(e.target.value)} className="w-full bg-transparent outline-none text-gray-600"/>
                            <span className="mx-2 text-gray-400">to</span>
                            <input type="date" value={jobDateTo} onChange={(e) => setJobDateTo(e.target.value)} className="w-full bg-transparent outline-none text-gray-600"/>
                        </div>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="block font-medium text-gray-700 text-xs">District</label>
                            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full p-2 rounded-lg border bg-white focus:ring-1 focus:ring-blue-400">
                                <option value="">All Districts</option>
                                {sriLankaDistricts.sort().map(dist => (<option key={dist} value={dist}>{dist}</option>))}
                            </select>
                        </div>
                        <div className="space-y-1">
                             <label className="block font-medium text-gray-700 text-xs">Posted Date</label>
                            <select value={postedDateFilter} onChange={(e) => setPostedDateFilter(e.target.value)} className="w-full p-2 rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                                <option value="anytime">Anytime</option>
                                <option value="24hours">Last 24 hours</option>
                                <option value="7days">Last 7 days</option>
                                <option value="30days">Last 30 days</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Salary Slider */}
                    <div className="lg:col-span-full space-y-1">
                        <label className="block font-medium text-gray-700 text-xs">Minimum Salary (LKR)</label>
                        <div className="flex items-center gap-2">
                             <input type="range" min="0" max={MAX_SALARY} step="5000" value={minSalary} onChange={(e) => setMinSalary(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                            <span className="font-bold text-blue-600 w-24 text-center bg-gray-100 p-1.5 rounded-md text-xs">Rs. {minSalary.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? <LoadingSpinner /> : error ? <div className="text-center text-red-500 py-16 bg-white rounded-xl">{`Failed to load jobs: ${error}`}</div> : (
                <>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Available Jobs ({filteredJobs.length} found)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredJobs.length > 0 ? filteredJobs.slice(0, visibleJobsCount).map(job => (
                            <JobCard 
                                key={job.id} 
                                job={job} 
                                currentUser={currentUser} 
                                handleApply={handleApply} 
                                handleViewCompanyProfile={handleViewCompanyProfile} 
                                handleViewJobDetails={handleViewJobDetails} 
                                applyingStatus={applyingStatus} 
                            />
                        )) : (
                            <div className="col-span-3 text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border">No jobs found matching your criteria.</div>
                        )}
                    </div>
                    {visibleJobsCount < filteredJobs.length && (
                        <div className="text-center mt-8">
                            <button onClick={() => setVisibleJobsCount(prev => prev + JOBS_PER_LOAD)} className="bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-blue-600 shadow-sm">Load More</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default FindJobsPage;
