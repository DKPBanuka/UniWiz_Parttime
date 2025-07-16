// FILE: src/components/StudentSidebar.js (Updated for Student UI with Locking & Hover UX and New UI)
// ===================================================
// This component provides the sidebar navigation for student users.

import React, { useState, useEffect } from 'react';

// Reusable navigation link component with Tooltip
const NavLink = ({ icon, text, isActive, isExpanded, onClick, isLogout = false }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            className={`w-full flex items-center transition-colors 
                ${!isExpanded ? 'px-3 justify-center' : 'px-4'} 
                ${isActive
                    ? 'bg-gray-50 border border-primary-main text-primary-dark shadow-lg py-4 rounded-xl' // New active style from image
                    : isLogout
                        ? 'text-red-500 hover:bg-red-50 py-3 rounded-lg' // Red for logout
                        : 'text-gray-600 hover:bg-primary-lighter py-3 rounded-lg' // Default inactive
                }
            `}
        >
            {icon}
            {isExpanded && <span className="ml-4 font-semibold">{text}</span>}
        </button>
        {!isExpanded && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                {text}
            </div>
        )}
    </div>
);

function StudentSidebar({ user, currentPage, setPage, onLogout, isLocked, toggleLock }) {
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = isLocked || isHovered;

    // Icons for the navigation links
    const dashboardIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    const appliedJobsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
    const profileIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    const settingsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const logoutIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
    const findJobsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
    // Icons for locking/unlocking
    const pinIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-8-8v8m-4-4h16" /></svg>;
    const unpinIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-main" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 3.636a1 1 0 011.414 0L10 7.172l3.536-3.536a1 1 0 111.414 1.414L11.414 8.586l3.536 3.536a1 1 0 11-1.414 1.414L10 10.414l-3.536 3.536a1 1 0 11-1.414-1.414L8.586 8.586 5.05 5.05a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

    return (
        <aside
            className={`bg-white h-full flex-shrink-0 p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isExpanded ? 'w-72' : 'w-24'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between mb-8">
                {isExpanded && (
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="UniWiz Logo" className="h-10" />
                        <h1 className="text-2xl font-bold text-primary-dark">UniWiz</h1>
                    </div>
                )}
                {!isExpanded && (
                    <div className="flex justify-center w-full">
                        <img src="/logo.png" alt="UniWiz Logo" className="h-10" />
                    </div>
                )}
                <button onClick={toggleLock} className={`p-2 rounded-full hover:bg-gray-200 ${!isExpanded ? 'hidden' : ''}`} title={isLocked ? "Unlock Sidebar" : "Lock Sidebar"}>
                    {isLocked ? unpinIcon : pinIcon}
                </button>
            </div>
            
            {/* User profile section removed to match provided Sidebar.js structure */}

            <nav className="flex-grow space-y-3">
                {/* Student specific navigation links, using isExpanded */}
                <NavLink text="Dashboard" icon={dashboardIcon} isActive={currentPage === 'home'} isExpanded={isExpanded} onClick={() => setPage('home')} />
                <NavLink text="Find Jobs" icon={findJobsIcon} isActive={currentPage === 'find-jobs'} isExpanded={isExpanded} onClick={() => setPage('find-jobs')} />
                <NavLink text="My Applications" icon={appliedJobsIcon} isActive={currentPage === 'applied-jobs'} isExpanded={isExpanded} onClick={() => setPage('applied-jobs')} />
                <NavLink text="My Profile" icon={profileIcon} isActive={currentPage === 'profile'} isExpanded={isExpanded} onClick={() => setPage('profile')} />
                <NavLink text="Settings" icon={settingsIcon} isActive={currentPage === 'settings'} isExpanded={isExpanded} onClick={() => setPage('settings')} />
            </nav>

            <div className="mt-auto">
                <div className="border-t my-3"></div>
                <NavLink text="Log Out" icon={logoutIcon} isExpanded={isExpanded} onClick={onLogout} isLogout={true} />
            </div>
        </aside>
    );
}

export default StudentSidebar;
