// FILE: src/components/StudentDashboard.js (Updated with Light Blue Color Scheme)
// =================================================================================

import React, { useState, useEffect, useCallback } from 'react';

// --- Reusable Components ---

const StatCard = ({ title, value, icon, delay = 0, onLinkClick, description }) => (
  <div
    className="stat-card bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-blue-200"
    style={{ animationDelay: `${delay * 100}ms` }}
  >
    <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-full text-blue-500">
            {icon}
        </div>
    </div>
    <button onClick={onLinkClick} className="text-left text-sm text-blue-500 font-semibold mt-4 hover:underline flex items-center group">
        {description}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
  </div>
);

const ProfileCompletionCard = ({ percentage, setPage }) => (
    <div onClick={() => setPage('profile')} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-blue-200 cursor-pointer">
        <p className="text-sm font-medium text-gray-600">Profile Completion</p>
        <div className="flex items-center mt-2">
            <p className="text-3xl font-bold text-gray-800 mr-3">{percentage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
        <button className="text-sm font-semibold text-blue-500 hover:underline mt-4">
            {percentage < 100 ? 'Complete your profile to stand out!' : 'Your profile is looking great!'}
        </button>
    </div>
);

const StatCardSkeleton = ({ delay = 0 }) => (
  <div
    className="stat-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
    style={{ animationDelay: `${delay * 100}ms` }}
  >
    <div>
      <div className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="bg-gray-100 p-3 rounded-full">
      <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
    </div>
);

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
    const statusClasses = {
        pending: "bg-yellow-100 text-yellow-800",
        viewed: "bg-blue-100 text-blue-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        applied: "bg-blue-50 text-blue-600",
        default: "bg-gray-100 text-gray-800"
    };
    return <span className={`${baseClasses} ${statusClasses[status] || statusClasses.default}`}>{status}</span>;
};

const JobCard = ({ job, currentUser, handleApply, handleViewCompanyProfile, handleViewJobDetails }) => {
    const applicationStatus = job.application_status;
    const categoryName = job.category_name || job.category;
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md">
            <div className="p-6 flex flex-col h-full">
                <div className="flex-grow">
                    <span className="inline-block bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full mb-3">{categoryName}</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">
                        Posted by:
                        <button
                            onClick={() => handleViewCompanyProfile(job.publisher_id)}
                            className="font-semibold text-blue-500 hover:text-blue-600 ml-1"
                        >
                            {job.company_name || job.publisher_name}
                        </button>
                    </p>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Type:</strong> {job.job_type}</p>
                        <p><strong>Payment (Wage):</strong> {job.payment_range}</p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
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
                                className={'bg-blue-500 text-white hover:bg-blue-600 font-medium py-2 px-4 rounded-lg transition duration-300 text-sm'}
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


function StudentDashboard({ currentUser, handleApply, setPage, setPublisherIdForProfile, handleViewJobDetails, setAppliedJobsPageFilter }) {
    const [stats, setStats] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [errorJobs, setErrorJobs] = useState(null);

    // Fetch student statistics
    useEffect(() => {
        const fetchStats = async () => {
            if (!currentUser || !currentUser.id) return;
            setIsLoadingStats(true);
            try {
                const response = await fetch(`http://uniwiz.test/get_student_stats.php?student_id=${currentUser.id}`);
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                } else {
                    throw new Error(data.message || 'Failed to fetch student stats.');
                }
            } catch (err) {
                setErrorStats(err.message);
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, [currentUser]);

    // Fetch recommended jobs
    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            if (!currentUser || !currentUser.id) return;
            setIsLoadingJobs(true);
            try {
                const response = await fetch(`http://uniwiz.test/get_recommended_jobs.php?student_id=${currentUser.id}`);
                const data = await response.json();
                if (response.ok) {
                    setRecommendedJobs(data);
                } else {
                    throw new Error(data.message || 'Failed to fetch recommended jobs.');
                }
            } catch (err) {
                setErrorJobs(err.message);
            } finally {
                setIsLoadingJobs(false);
            }
        };
        fetchRecommendedJobs();
    }, [currentUser]);


    const handleViewCompanyProfile = (publisherId) => {
        if (setPage && setPublisherIdForProfile) {
            setPublisherIdForProfile(publisherId);
            setPage('company-profile');
        }
    };
    
    const handleStatLinkClick = (filter) => {
        setAppliedJobsPageFilter(filter);
        setPage('applied-jobs');
    };

    const ApplicationsSentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
    const AcceptedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const ProfileViewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-gray-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome, {currentUser?.first_name}!</h1>
                    <p className="text-gray-600 mt-2">Here's a quick overview of your job search.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {isLoadingStats ? (
                    <>
                        <StatCardSkeleton delay={0} />
                        <StatCardSkeleton delay={1} />
                        <StatCardSkeleton delay={2} />
                        <StatCardSkeleton delay={3} />
                    </>
                ) : errorStats ? (
                    <div className="lg:col-span-4 text-center text-red-500 py-8 bg-white rounded-xl shadow-sm border border-gray-100">Error loading stats: {errorStats}</div>
                ) : (
                    <>
                        <StatCard 
                            title="Applications Sent" 
                            value={stats?.applications_sent ?? 0} 
                            icon={<ApplicationsSentIcon />} 
                            delay={0}
                            description="View all applications"
                            onLinkClick={() => handleStatLinkClick('All')} 
                        />
                        <StatCard 
                            title="Applications Accepted" 
                            value={stats?.applications_accepted ?? 0} 
                            icon={<AcceptedIcon />} 
                            delay={1}
                            description="View accepted applications"
                            onLinkClick={() => handleStatLinkClick('Accepted')} 
                        />
                        <StatCard 
                            title="Profile Views" 
                            value={stats?.profile_views ?? 0} 
                            icon={<ProfileViewsIcon />} 
                            delay={2}
                            description="View applications by status"
                            onLinkClick={() => handleStatLinkClick('Viewed')} 
                        />
                        <ProfileCompletionCard percentage={stats?.profile_completion_percentage ?? 0} setPage={setPage} />
                    </>
                )}
            </div>

            {/* Recommended Jobs Section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recommended For You</h2>
                <button onClick={() => setPage('find-jobs')} className="font-semibold text-blue-500 hover:underline">
                    View All Jobs
                </button>
            </div>

            {isLoadingJobs ? (
                <LoadingSpinner />
            ) : errorJobs ? (
                 <div className="text-center text-red-500 py-16 bg-white rounded-xl shadow-sm border border-gray-100">{errorJobs}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recommendedJobs.length > 0 ? recommendedJobs.map(job => (
                        <JobCard
                            key={`rec-${job.id}`}
                            job={job}
                            currentUser={currentUser}
                            handleApply={handleApply}
                            handleViewCompanyProfile={handleViewCompanyProfile}
                            handleViewJobDetails={handleViewJobDetails}
                        />
                    )) : (
                        <div className="col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
                            <p className="text-gray-500">No specific recommendations yet. Use "Find Jobs" to explore!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;