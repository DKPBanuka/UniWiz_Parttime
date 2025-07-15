// FILE: src/components/Sidebar.js (Final Version with All Links)
// =================================================================

import React from 'react';

// Reusable navigation link component
const NavLink = ({ icon, text, isActive, isCollapsed, onClick }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center py-3 rounded-lg transition-colors ${isCollapsed ? 'px-3 justify-center' : 'px-4'} ${isActive ? 'bg-[#7886C7] text-white shadow-lg' : 'text-gray-600 hover:bg-[#E8EAF6]'}`}
    >
        {icon}
        {!isCollapsed && <span className="ml-4 font-semibold">{text}</span>}
    </button>
);

function Sidebar({ user, currentPage, setPage, onLogout, isCollapsed, toggleSidebar }) {
    // Icons for the navigation links
    const dashboardIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    const jobsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    const applicantsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    const profileIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    const settingsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    const logoutIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
    const toggleIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;

    return (
        <aside className={`bg-white h-full flex-shrink-0 p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-72'}`}>
            <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && <h1 className="text-3xl font-bold text-[#2D336B]">UniWiz</h1>}
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-200">
                    {toggleIcon}
                </button>
            </div>
            
            <div className={`flex items-center p-2 rounded-xl mb-8 ${isCollapsed ? 'flex-col' : ''}`}>
                {user.profile_image_url ? (
                    <img src={`http://uniwiz.test/${user.profile_image_url}`} alt="Profile" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="bg-[#7886C7] text-white h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                        {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                )}
                {!isCollapsed && (
                    <div className="ml-4 overflow-hidden">
                        <p className="font-bold text-gray-800 truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                )}
            </div>

            <nav className="flex-grow space-y-3">
                <NavLink text="Dashboard" icon={dashboardIcon} isActive={currentPage === 'home'} isCollapsed={isCollapsed} onClick={() => setPage('home')} />
                <NavLink text="Jobs" icon={jobsIcon} isActive={currentPage === 'manage-jobs'} isCollapsed={isCollapsed} onClick={() => setPage('manage-jobs')} />
                <NavLink text="Applicants" icon={applicantsIcon} isActive={currentPage === 'applicants'} isCollapsed={isCollapsed} onClick={() => setPage('applicants')} />
                <NavLink text="Profile" icon={profileIcon} isActive={currentPage === 'profile'} isCollapsed={isCollapsed} onClick={() => setPage('profile')} />
            </nav>

            <div className="mt-auto">
                <NavLink text="Settings" icon={settingsIcon} isActive={currentPage === 'settings'} isCollapsed={isCollapsed} onClick={() => setPage('settings')} />
                <div className="border-t my-3"></div>
                <NavLink text="Log Out" icon={logoutIcon} isCollapsed={isCollapsed} onClick={onLogout} />
            </div>
        </aside>
    );
}

export default Sidebar;
