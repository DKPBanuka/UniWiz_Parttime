// FILE: src/components/StudentDashboard.js (Updated - Dashboard Only)
// ===================================================

import React, { useState, useEffect } from 'react';

// Custom animated card component for stats
const StatCard = ({ title, value, icon, delay = 0 }) => (
  <div 
    className="stat-card bg-white p-6 rounded-xl shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    style={{ animationDelay: `${delay * 100}ms` }}
  >
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    <div className="bg-primary-lighter p-3 rounded-full text-primary-dark">
      {icon}
    </div>
  </div>
);

// Skeleton loader for stats
const StatCardSkeleton = ({ delay = 0 }) => (
  <div 
    className="stat-card bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between"
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

// Loading spinner component (from PublisherDashboard.js)
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


function StudentDashboard({ currentUser }) { // Removed jobs, handleApply, appliedJobs, applyingStatus props
    const [stats, setStats] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    // Fetch student stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!currentUser || !currentUser.id) return;
            setIsLoadingStats(true);
            setErrorStats(null);
            try {
                const response = await fetch(`http://uniwiz.test/get_student_stats.php?student_id=${currentUser.id}`);
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                } else {
                    throw new Error(data.message || 'Failed to fetch student stats.');
                }
            } catch (err) {
                console.error("Failed to fetch student stats:", err);
                setErrorStats(err.message);
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, [currentUser]);

    // SVG Icons for Stat Cards
    const ApplicationsSentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
    const ProfileViewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
    const OffersReceivedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;


    return (
        <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">Welcome, {currentUser?.first_name}!</h1>
                    <p className="text-gray-600 mt-2">Here's a quick overview of your job search.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {isLoadingStats ? (
                    <>
                        <StatCardSkeleton delay={0} />
                        <StatCardSkeleton delay={1} />
                        <StatCardSkeleton delay={2} />
                    </>
                ) : errorStats ? (
                    <div className="lg:col-span-3 text-center text-red-500 py-8">Error loading stats: {errorStats}</div>
                ) : (
                    <>
                        <StatCard 
                            title="Applications Sent" 
                            value={stats?.applications_sent ?? 0} 
                            icon={<ApplicationsSentIcon />} 
                            delay={0}
                        />
                        <StatCard 
                            title="Profile Views" 
                            value={stats?.profile_views ?? 0} 
                            icon={<ProfileViewsIcon />} 
                            delay={1}
                        />
                        <StatCard 
                            title="Offers Received" 
                            value={stats?.offers_received ?? 0} 
                            icon={<OffersReceivedIcon />} 
                            delay={2}
                        />
                    </>
                )}
            </div>

            {/* No longer displaying "Find Jobs" section directly here. It's now in FindJobsPage.js */}
            <h3 className="text-2xl font-bold text-primary-dark mb-6">Recommended Jobs</h3>
            <p className="text-gray-600">This section could show personalized job recommendations based on your profile or past applications. Please navigate to the "Find Jobs" page to explore all available opportunities.</p>
            {/* Placeholder for recommended jobs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
                    <p className="text-gray-500">No specific recommendations yet. Use "Find Jobs" to explore!</p>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
