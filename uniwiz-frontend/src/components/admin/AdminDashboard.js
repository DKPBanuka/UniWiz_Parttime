// FILE: src/components/admin/AdminDashboard.js (FIXED - Filter Passing to setPage)
// =======================================================
// Main dashboard/landing page for the Administrator.

import React, { useState, useEffect } from 'react';

// A reusable card for displaying stats
const StatCard = ({ title, value, icon, colorClass, onClick, description }) => (
    <div 
        className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-l-4" 
        style={{borderColor: colorClass}}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            <div className="text-4xl" style={{color: colorClass}}>
                {icon}
            </div>
        </div>
        {onClick && description && (
            <button 
                onClick={onClick} 
                className="text-left text-sm text-primary-main font-semibold mt-4 hover:underline flex items-center group"
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
        )}
    </div>
);

// Loading skeleton for StatCard
const StatCardSkeleton = ({ colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between animate-pulse border-l-4" style={{borderColor: colorClass}}>
        <div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
    </div>
);


function AdminDashboard({ setPage }) { // Added setPage prop for navigation
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        jobsPendingApproval: 0,
        totalStudents: 0,
        totalPublishers: 0,
        unverifiedUsers: 0, // NEW: Added unverifiedUsers to state
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdminStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://uniwiz.test/get_admin_stats.php');
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                } else {
                    throw new Error(data.message || 'Failed to fetch admin stats.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdminStats();
    }, []);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-primary-dark mb-8">Administrator Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {isLoading ? (
                    <>
                        <StatCardSkeleton colorClass="#4F46E5" />
                        <StatCardSkeleton colorClass="#10B981" />
                        <StatCardSkeleton colorClass="#F59E0B" />
                        <StatCardSkeleton colorClass="#EF4444" /> {/* Skeleton for new card */}
                    </>
                ) : error ? (
                    <div className="lg:col-span-3 text-center text-red-500 py-8 bg-white rounded-xl shadow-md">Error: {error}</div>
                ) : (
                    <>
                        <StatCard title="Total Users" value={stats.totalUsers} icon="則" colorClass="#4F46E5" description="Manage all users" onClick={() => setPage('user-management', { filter: 'All' })} />
                        <StatCard title="Total Jobs Posted" value={stats.totalJobs} icon="直" colorClass="#10B981" description="Manage all jobs" onClick={() => setPage('job-management', { filter: 'All' })} />
                        <StatCard title="Jobs Pending Approval" value={stats.jobsPendingApproval} icon="竢ｳ" colorClass="#F59E0B" description="Review pending jobs" onClick={() => setPage('job-management', { filter: 'draft' })} />
                        <StatCard title="Unverified Users" value={stats.unverifiedUsers} icon="圻" colorClass="#EF4444" description="Review unverified accounts" onClick={() => setPage('user-management', { filter: 'unverified' })} /> {/* NEW CARD */}
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-primary-dark mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button onClick={() => setPage('user-management', { filter: 'All' })} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Manage Users</button>
                        <button onClick={() => setPage('job-management', { filter: 'All' })} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Review Job Postings</button>
                        {/* <button className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Manage Categories</button> */}
                    </div>
                </div>

                {/* System Overview Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-primary-dark mb-4">System Overview</h2>
                    {isLoading ? (
                        <div className="space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-500">Could not load system overview.</p>
                    ) : (
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center">
                                <span className="text-gray-600">Students:</span>
                                <span className="font-bold text-lg text-primary-main">{stats.totalStudents}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-gray-600">Publishers:</span>
                                <span className="font-bold text-lg text-primary-main">{stats.totalPublishers}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-gray-600">Platform Status:</span>
                                <span className="font-bold text-lg text-green-500">Online</span>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;