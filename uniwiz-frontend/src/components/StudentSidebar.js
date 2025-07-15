// FILE: src/components/StudentSidebar.js (Updated for Student UI)
// ===================================================
// This component provides the sidebar navigation for student users.

import React, { useState, useEffect } from 'react';

// Reusable navigation link component (light theme for students)
const NavLink = ({ icon, text, isActive, isCollapsed, onClick }) => {
    const baseClasses = `w-full flex items-center py-3 rounded-lg transition-colors ${isCollapsed ? 'px-3 justify-center' : 'px-4'}`;
    // Student theme: light background, primary colors for active/hover
    const dynamicClasses = isActive ? 'bg-primary-lighter text-primary-dark shadow-lg' : 'text-gray-600 hover:bg-gray-100';

    return (
        <button 
            onClick={onClick} 
            className={`${baseClasses} ${dynamicClasses}`} 
        >
            {icon}
            {!isCollapsed && <span className="ml-4 font-semibold">{text}</span>}
        </button>
    );
};

function StudentSidebar({ user, currentPage, setPage, onLogout, isCollapsed, toggleSidebar }) {
    // Removed state for categories, searchTerm, selectedCategory as they will be on the main page.
    // Removed useEffect for fetching categories.

    // Icons for the navigation links
    const dashboardIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    const appliedJobsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
    const profileIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    const settingsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const logoutIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
    const toggleIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
    const findJobsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;


    return (
        <aside className={`bg-white h-full flex-shrink-0 p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-72'}`}> {/* Light background for student sidebar */}
            <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {/* Reverted to h1 for UniWiz text in sidebar */}
                {!isCollapsed && <h1 className="text-3xl font-bold text-primary-dark">UniWiz</h1>}
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-200 text-gray-600"> {/* Toggle icon color */}
                    {toggleIcon}
                </button>
            </div>
            
            <div className={`flex items-center p-2 rounded-xl mb-8 ${isCollapsed ? 'flex-col' : ''}`}>
                {user.profile_image_url ? (
                    <img src={`http://uniwiz.test/${user.profile_image_url}`} alt="Profile" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="bg-primary-main text-white h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"> {/* Profile initial circle color */}
                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                )}
                {!isCollapsed && (
                    <div className="ml-4 overflow-hidden">
                        <p className="font-bold text-gray-800 truncate">{user.first_name} {user.last_name}</p> {/* Profile name text color */}
                        <p className="text-sm text-gray-500 truncate">{user.email}</p> {/* Profile email text color */}
                    </div>
                )}
            </div>

            <nav className="flex-grow space-y-3">
                {/* Student specific navigation links */}
                <NavLink text="Dashboard" icon={dashboardIcon} isActive={currentPage === 'home'} isCollapsed={isCollapsed} onClick={() => setPage('home')} />
                <NavLink text="Find Jobs" icon={findJobsIcon} isActive={currentPage === 'find-jobs'} isCollapsed={isCollapsed} onClick={() => setPage('find-jobs')} /> {/* Updated to 'find-jobs' page */}
                <NavLink text="My Applications" icon={appliedJobsIcon} isActive={currentPage === 'applied-jobs'} isCollapsed={isCollapsed} onClick={() => setPage('applied-jobs')} />
                <NavLink text="My Profile" icon={profileIcon} isActive={currentPage === 'profile'} isCollapsed={isCollapsed} onClick={() => setPage('profile')} />
                <NavLink text="Settings" icon={settingsIcon} isActive={currentPage === 'settings'} isCollapsed={isCollapsed} onClick={() => setPage('settings')} />
            </nav>

            {/* Removed "Find Jobs" section with search and categories from sidebar */}

            <div className="mt-auto">
                <div className="border-t border-gray-200 my-3"></div> {/* Light theme border */}
                <NavLink text="Log Out" icon={logoutIcon} isCollapsed={isCollapsed} onClick={onLogout} />
            </div>
        </aside>
    );
}

export default StudentSidebar;
