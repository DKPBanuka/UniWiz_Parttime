// FILE: src/components/PublisherDashboard.js (Enhanced UI/UX Version)
// =================================================================================

import React, { useState, useEffect } from 'react';

// --- Reusable Components ---

const StatCard = ({ title, value, icon, onClick, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-4xl font-bold text-primary-dark mt-1">{value}</p>
            </div>
            <div className="bg-primary-lighter p-3 rounded-full text-primary-dark">
                {icon}
            </div>
        </div>
        <button onClick={onClick} className="text-left text-sm text-primary-main font-semibold mt-4 hover:underline">
            {description}
        </button>
    </div>
);

const ApplicantRow = ({ applicant, onViewProfile }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
            <img 
                src={applicant.profile_image_url ? `http://uniwiz.test/${applicant.profile_image_url}` : `https://placehold.co/40x40/E8EAF6/211C84?text=${applicant.first_name.charAt(0)}`} 
                alt="profile" 
                className="h-10 w-10 rounded-full object-cover"
            />
            <div>
                <p className="font-semibold text-gray-800">{applicant.first_name} {applicant.last_name}</p>
                <p className="text-xs text-gray-500">Applied for: {applicant.job_title}</p>
            </div>
        </div>
        <button onClick={() => onViewProfile(applicant.student_id)} className="text-xs font-bold text-primary-main hover:text-primary-dark">
            View Profile
        </button>
    </div>
);

const JobOverviewRow = ({ job, onViewJob }) => {
    const statusClasses = {
        active: "bg-green-100 text-green-800",
        draft: "bg-yellow-100 text-yellow-800",
        closed: "bg-red-100 text-red-800",
    };
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div>
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-xs text-gray-500">{job.application_count} Applicant(s)</p>
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusClasses[job.status] || 'bg-gray-100'}`}>
                {job.status}
            </span>
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="space-y-3">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-5/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
    </div>
);

// --- Main Dashboard Component ---

function PublisherDashboard({ user, onPostJobClick, onViewAllJobsClick, onViewApplicants, onViewStudentProfile }) {
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

    // Icons
    const BriefcaseIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    const UsersIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A10.004 10.004 0 0012 13a10.004 10.004 0 00-3-7.197M15 21a6 6 0 00-9-5.197" /></svg>;
    const ClockIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const PlusCircleIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

    return (
        <div className="p-8 bg-bg-publisher-dashboard min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Welcome back, {user.first_name}!</h1>
                    <p className="text-gray-500 mt-2">Here's your activity overview.</p>
                </div>
                <button 
                    onClick={onPostJobClick}
                    className="flex items-center space-x-2 bg-primary-main text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 hover:bg-primary-dark mt-4 md:mt-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>Post New Job</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Active Jobs" value={stats?.active_jobs ?? 0} icon={BriefcaseIcon} onClick={onViewAllJobsClick} description="Manage all jobs" />
                <StatCard title="Total Applicants" value={stats?.total_applicants ?? 0} icon={UsersIcon} onClick={() => onViewApplicants('All')} description="View all applicants"/>
                <StatCard title="Pending Applicants" value={stats?.pending_applicants ?? 0} icon={ClockIcon} onClick={() => onViewApplicants('pending')} description="Review pending applicants" />
                <StatCard title="New Today" value={stats?.new_applicants_today ?? 0} icon={PlusCircleIcon} onClick={() => onViewApplicants('today')} description="See today's applicants" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-primary-dark mb-4">Recent Applicants</h3>
                    {isLoading ? <LoadingSkeleton /> : (
                        <div className="space-y-2">
                            {stats?.recent_applicants.length > 0 ? (
                                stats.recent_applicants.map(app => <ApplicantRow key={app.student_id} applicant={app} onViewProfile={onViewStudentProfile} />)
                            ) : <p className="text-gray-500 text-center py-8">No recent applicants.</p>}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-primary-dark mb-4">Jobs Overview</h3>
                    {isLoading ? <LoadingSkeleton /> : (
                        <div className="space-y-2">
                            {stats?.job_overview.length > 0 ? (
                                stats.job_overview.map(job => <JobOverviewRow key={job.id} job={job} />)
                            ) : <p className="text-gray-500 text-center py-8">You haven't posted any jobs yet.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PublisherDashboard;
