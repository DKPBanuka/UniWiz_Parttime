// FILE: src/components/TopNavbar.js (ENHANCED with Notification Icon & Badge)
// =================================================================================

import React from 'react';

function TopNavbar({ user, setPage, unreadCount }) {
    const iconButton = "relative p-2 rounded-full hover:bg-gray-200 transition-colors";

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
            {/* This empty div pushes other items to the right */}
            <div className="flex-1"></div> 
            
            <div className="flex items-center space-x-4">
                <button onClick={() => setPage('notifications')} className={iconButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <div className="h-8 w-px bg-gray-200"></div> {/* Divider */}
                <div className="flex items-center space-x-3">
                    {user.profile_image_url ? (
                        <img src={`http://uniwiz.test/${user.profile_image_url}`} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="bg-primary-main text-white h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg">
                            {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                     <div>
                        <p className="font-semibold text-sm text-gray-800">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TopNavbar;
