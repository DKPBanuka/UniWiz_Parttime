// FILE: src/components/admin/AdminDashboard.js (NEW FILE)
// =======================================================
// Main dashboard/landing page for the Administrator.

import React from 'react';

// A reusable card for displaying stats
const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between hover:shadow-lg transition-shadow border-l-4" style={{borderColor: colorClass}}>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="text-4xl" style={{color: colorClass}}>
            {icon}
        </div>
    </div>
);


function AdminDashboard() {
    // In a real application, you would fetch these stats from an API
    const stats = {
        totalUsers: 152,
        totalJobs: 78,
        pendingApprovals: 5,
        totalStudents: 120,
        totalPublishers: 32,
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-primary-dark mb-8">Administrator Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" colorClass="#4F46E5" />
                <StatCard title="Total Jobs Posted" value={stats.totalJobs} icon="💼" colorClass="#10B981" />
                <StatCard title="Jobs Pending Approval" value={stats.pendingApprovals} icon="⏳" colorClass="#F59E0B" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-primary-dark mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Manage Users</button>
                        <button className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Review Job Postings</button>
                        <button className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Manage Categories</button>
                    </div>
                </div>

                {/* System Overview Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-primary-dark mb-4">System Overview</h2>
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
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
