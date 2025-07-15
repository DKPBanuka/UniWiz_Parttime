// FILE: src/components/PublisherDashboard.js (Modern UI/UX Version with Real Data)
// =================================================================================

import React, { useState, useEffect } from 'react';

// Custom animated card component using CSS transitions
const StatCard = ({ title, value, icon, delay = 0 }) => (
  <div 
    className="stat-card bg-white p-6 rounded-2xl shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    style={{ animationDelay: `${delay * 100}ms` }}
  >
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-dark-blue-text mt-1">{value}</p> {/* Changed text color */}
    </div>
    <div className="bg-app-bg-light p-3 rounded-full text-dark-blue-text"> {/* Changed bg and text color */}
      {icon}
    </div>
  </div>
);

// Skeleton loader for stats
const StatCardSkeleton = ({ delay = 0 }) => (
  <div 
    className="stat-card bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between"
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

// Applicant card component
const ApplicantCard = ({ applicant, index }) => (
  <div 
    className="applicant-card flex items-center justify-between p-4 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-full bg-app-bg-light flex items-center justify-center text-dark-blue-text font-medium"> {/* Changed bg and text color */}
        {applicant.first_name.charAt(0)}{applicant.last_name.charAt(0)}
      </div>
      <div>
        <p className="font-semibold text-gray-800">{applicant.first_name} {applicant.last_name}</p>
        <p className="text-sm text-gray-500">Applied for: <span className="text-dark-blue-text">{applicant.job_title}</span></p> {/* Changed text color */}
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {new Date(applicant.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>
  </div>
);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="loading-spinner">
      <div className="spinner-circle"></div>
    </div>
  </div>
);

function PublisherDashboard({ user, onPostJobClick, onViewAllJobsClick }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        // Fetching REAL data from the backend
        const response = await fetch(`http://uniwiz.test/get_publisher_stats.php?publisher_id=${user.id}`);
        const data = await response.json();
        if (response.ok) {
            setStats(data);
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard stats.');
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const newApplicantsValue = stats?.new_applicants_today ?? 0;
  const displayNewApplicants = newApplicantsValue > 0 ? `+${newApplicantsValue}` : newApplicantsValue;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm border border-red-100">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Could not load dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // SVG icons
  const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  );
  const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A10.004 10.004 0 0012 13a10.004 10.004 0 00-3-7.197M15 21a6 6 0 00-9-5.197" /></svg>
  );
  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  );
  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Welcome back, {user.first_name}</h1>
          <p className="text-gray-500 mt-2">Here's what's happening with your job postings today</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={onPostJobClick}
            className="flex items-center space-x-2 bg-app-blue text-white px-4 py-2.5 rounded-lg hover:shadow-md transition-all duration-300 hover:bg-dark-blue-text" // Changed bg and hover bg
          >
            <PlusIcon />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <>
            <StatCardSkeleton delay={0} />
            <StatCardSkeleton delay={1} />
            <StatCardSkeleton delay={2} />
          </>
        ) : (
          <>
            <StatCard 
              title="Active Jobs" 
              value={stats?.active_jobs ?? 0} 
              icon={<BriefcaseIcon />} 
              delay={0}
            />
            <StatCard 
              title="Total Applicants" 
              value={stats?.total_applicants ?? 0} 
              icon={<UsersIcon />} 
              delay={1}
            />
            <StatCard 
              title="New Today" 
              value={displayNewApplicants} 
              icon={<UsersIcon />} 
              delay={2}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-dark-blue-text"> {/* Changed text color */}
              Recent Applicants
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <LoadingSpinner />
            ) : stats?.recent_applicants.length > 0 ? (
              stats.recent_applicants.map((app, index) => (
                <ApplicantCard key={index} applicant={app} index={index} />
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-1">No recent applicants</h4>
                <p className="text-gray-500">Your job postings haven't received any new applications yet.</p>
              </div>
            )}
          </div>
          {stats?.recent_applicants.length > 0 && (
            <div className="p-4 border-t border-gray-100 text-center">
              <button 
                onClick={onViewAllJobsClick}
                className="text-dark-blue-text hover:text-blue-800 text-sm font-medium" // Changed text color
              >
                View all jobs and applicants
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-dark-blue-text mb-4">Quick Actions</h3> {/* Changed text color */}
            <div className="space-y-3">
              <button 
                onClick={onPostJobClick}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-app-bg-light text-dark-blue-text flex items-center justify-center"> {/* Changed bg and text color */}
                    <PlusIcon />
                  </div>
                  <span className="font-medium text-gray-800">Post New Job</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              
              <button 
                onClick={onViewAllJobsClick}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-app-bg-light text-dark-blue-text flex items-center justify-center"> {/* Changed bg and text color */}
                    <MenuIcon />
                  </div>
                  <span className="font-medium text-gray-800">Manage Jobs</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        .stat-card, .applicant-card {
          opacity: 0;
          animation: fadeInUp 0.5s forwards;
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .loading-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
        }
        
        .spinner-circle {
          display: block;
          width: 100%;
          height: 100%;
          border: 3px solid #B5A8D5; /* Changed border color */
          border-top-color: #4D55CC; /* Changed border top color */
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PublisherDashboard;
