// FILE: src/components/PublisherDashboard.js (UPDATED with Dynamic Colors & Job Vacancy Counts)
// =================================================================================
// This version now displays the publisher's average rating on the dashboard,
// and includes vacancy and accepted counts in the Job Overview section.
// It also features a modern, colorful UI for the stat cards.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Components ---

// UPDATED: StatCard now accepts dynamic color props
const StatCard = ({ title, value, icon, onClick, description, color }) => (
    <motion.div
        whileHover={{ y: -3 }}
        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-between"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-4xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            {/* UPDATED: Icon background and text color are now dynamic */}
            <motion.div
                whileHover={{ rotate: 10 }}
                className={`p-3 rounded-full ${color.bg} ${color.text}`}
            >
                {icon}
            </motion.div>
        </div>
        <button
            onClick={onClick}
            className={`text-left text-sm font-semibold mt-4 hover:underline flex items-center group ${color.text}`}
        >
            {description}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </motion.div>
);


// StarRating component (copied from CompanyProfilePage for consistency)
const StarRating = ({ rating, reviewCount, size = 'w-5 h-5', showText = false }) => {
    const totalStars = 5;
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const emptyStars = totalStars - fullStars;

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <svg key={`full_${i}`} className={`${size} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            {[...Array(emptyStars)].map((_, i) => <svg key={`empty_${i}`} className={`${size} text-gray-300`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            {showText && reviewCount > 0 && <span className="ml-2 text-sm font-bold text-gray-700">{numericRating.toFixed(1)} out of 5</span>}
            {reviewCount > 0 && !showText && <span className="ml-2 text-sm text-gray-600">({reviewCount} reviews)</span>}
        </div>
    );
};


// ApplicantRow now calls onViewProfile with application_id
const ApplicantRow = ({ applicant, onViewProfile }) => (
    <motion.div
        whileHover={{ x: 2 }}
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
        <div className="flex items-center space-x-3">
            <img
                src={applicant.profile_image_url ? `http://uniwiz.test/${applicant.profile_image_url}` : `https://ui-avatars.com/api/?name=${applicant.first_name}+${applicant.last_name}&background=E8EAF6&color=211C84`}
                alt="profile"
                className="h-10 w-10 rounded-full object-cover"
            />
            <div>
                <p className="font-semibold text-gray-800">{applicant.first_name} {applicant.last_name}</p>
                <p className="text-xs text-gray-500">Applied for: {applicant.job_title}</p>
            </div>
        </div>
        <button
            onClick={() => onViewProfile(applicant.application_id)}
            className="text-xs font-bold text-primary-main hover:text-primary-dark flex items-center"
        >
            View
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </motion.div>
);

// JobOverviewRow now displays vacancies and accepted counts
const JobOverviewRow = ({ job, onViewJob }) => {
    const statusClasses = {
        active: "bg-green-100 text-green-800",
        draft: "bg-yellow-100 text-yellow-800",
        closed: "bg-red-100 text-red-800",
    };
    
    return (
        <motion.div
            whileHover={{ x: 2 }}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
            <div>
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-xs text-gray-500">
                    {job.application_count} Applicant{job.application_count !== 1 ? 's' : ''}
                    {job.vacancies && job.accepted_count !== undefined && ( // Display vacancies if available
                        <span className="ml-2">
                            (<span className={job.accepted_count >= job.vacancies ? 'text-red-500' : 'text-green-600'}>
                                {job.accepted_count}
                            </span> / {job.vacancies} accepted)
                        </span>
                    )}
                </p>
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusClasses[job.status] || 'bg-gray-100'}`}>
                {job.status}
            </span>
        </motion.div>
    );
};

const ReviewCard = ({ review }) => {
    const Star = ({ filled }) => (
        <svg className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
    );

    return (
        <motion.div
            whileHover={{ x: 2 }}
            className="p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
            <div className="flex items-start space-x-3">
                <img
                    src={review.student_image_url ? `http://uniwiz.test/${review.student_image_url}` : `https://ui-avatars.com/api/?name=${review.first_name}+${review.last_name}&background=E8EAF6&color=211C84`}
                    alt="student profile"
                    className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800">{review.first_name} {review.last_name}</p>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => <Star key={i} filled={i < review.rating} />)}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 italic">"{review.review_text}"</p>
                </div>
            </div>
        </motion.div>
    );
};

const LoadingSkeleton = ({ count = 3 }) => (
    <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                className="h-12 w-full bg-gray-100 rounded-lg"
            />
        ))}
    </div>
);

// --- Main Dashboard Component ---
// UPDATED: Prop renamed from onViewStudentProfile to onViewApplicantDetails
function PublisherDashboard({ user, onPostJobClick, onViewAllJobsClick, onViewApplicants, onViewApplicantDetails }) {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://uniwiz.test/get_publisher_stats.php?publisher_id=${user.id}`);
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                } else {
                    throw new Error(data.message || 'Failed to fetch dashboard stats.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    // --- Icons and Colors for StatCards ---
    const BriefcaseIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    const UsersIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    const ClockIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const PlusCircleIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const StarFilledIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
    
    // NEW: Dynamic color mapping for stat cards
    const statCardColors = {
        activeJobs: { bg: 'bg-accent-blue-light', text: 'text-accent-blue-dark' },
        totalApplicants: { bg: 'bg-accent-purple-light', text: 'text-accent-purple-dark' },
        pending: { bg: 'bg-accent-pink-light', text: 'text-accent-pink-dark' },
        newToday: { bg: 'bg-accent-teal-light', text: 'text-accent-teal-dark' },
    };


    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Welcome back, {user.first_name}!</h1>
                    <p className="text-gray-500 mt-2">Here's your activity overview</p>
                </motion.div>
                
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={onPostJobClick} className="flex items-center space-x-2 bg-primary-main text-white px-5 py-2.5 rounded-lg hover:shadow-md transition-all duration-300 hover:bg-primary-dark mt-4 md:mt-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Post New Job</span>
                </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {isLoading ? (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                                <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                                <div className="h-10 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                            </motion.div>
                        ))}
                    </>
                ) : (
                    <>
                        <StatCard title="Active Jobs" value={stats?.active_jobs ?? 0} icon={BriefcaseIcon} onClick={onViewAllJobsClick} description="Manage all jobs" color={statCardColors.activeJobs}/>
                        <StatCard title="Total Applicants" value={stats?.total_applicants ?? 0} icon={UsersIcon} onClick={() => onViewApplicants('All')} description="View all applicants" color={statCardColors.totalApplicants}/>
                        <StatCard title="Pending Applicants" value={stats?.pending_applicants ?? 0} icon={ClockIcon} onClick={() => onViewApplicants('pending')} description="Review pending applicants" color={statCardColors.pending}/>
                        <StatCard title="New Today" value={stats?.new_applicants_today ?? 0} icon={PlusCircleIcon} onClick={() => onViewApplicants('today')} description="See today's applicants" color={statCardColors.newToday}/>
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Applicants Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-main" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Recent Applicants
                    </h3>
                    {isLoading ? <LoadingSkeleton count={5} /> : (
                        <div className="space-y-2">
                            {stats?.recent_applicants && stats.recent_applicants.length > 0 ? (
                                stats.recent_applicants.map((app, i) => (
                                    <motion.div key={app.application_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <ApplicantRow applicant={app} onViewProfile={onViewApplicantDetails} />
                                    </motion.div>
                                ))
                            ) : <p className="text-gray-500 text-center py-8">No recent applicants.</p>}
                        </div>
                    )}
                </motion.div>

                {/* Jobs Overview Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-main" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Jobs Overview
                    </h3>
                    {isLoading ? <LoadingSkeleton count={5} /> : (
                        <div className="space-y-2">
                            {stats?.job_overview && stats.job_overview.length > 0 ? (
                                stats.job_overview.map((job, i) => (
                                    <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <JobOverviewRow job={job} />
                                    </motion.div>
                                ))
                            ) : <p className="text-gray-500 text-center py-8">You haven't posted any jobs yet.</p>}
                        </div>
                    )}
                </motion.div>

                {/* Latest Reviews Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-main" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        Latest Reviews
                    </h3>
                    {isLoading ? <LoadingSkeleton count={3} /> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats?.latest_reviews && stats.latest_reviews.length > 0 ? (
                                stats.latest_reviews.map((review, i) => (
                                    <motion.div key={review.review_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                        <ReviewCard review={review} />
                                    </motion.div>
                                ))
                            ) : <p className="text-gray-500 text-center py-8 col-span-3">No reviews have been submitted yet.</p>}
                        </div>
                    )}
                </motion.div>

                {/* Average Rating Display (NEW SECTION) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <h3 className="text-xl font-bold text-primary-dark mb-4 flex items-center justify-center">
                        <span className="mr-2 text-yellow-500">{StarFilledIcon}</span>
                        Your Overall Rating
                    </h3>
                    {isLoading ? (
                        <div className="h-8 w-1/2 bg-gray-200 rounded mx-auto animate-pulse"></div>
                    ) : (
                        <>
                            <p className="text-5xl font-bold text-primary-dark">
                                {stats?.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
                            </p>
                            <p className="text-lg text-gray-600 mt-2">
                                out of 5 ({stats?.total_review_count ?? 0} reviews)
                            </p>
                            <div className="flex justify-center mt-4">
                                <StarRating rating={stats?.average_rating ?? 0} size="h-6 w-6" />
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default PublisherDashboard;