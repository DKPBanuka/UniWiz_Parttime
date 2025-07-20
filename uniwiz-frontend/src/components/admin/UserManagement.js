// FILE: src/components/admin/UserManagement.js (UPDATED - Compact Filters)
// =======================================================
// This page allows administrators to view, search, manage, block/unblock,
// and verify/unverify users, delete users, and now also view full user profiles.

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Reusable Notification Component (Toast)
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeClasses = { success: "bg-green-500", error: "bg-red-500" };
    return (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-all ${typeClasses[type] || 'bg-gray-500'}`}>
            {message}
        </div>
    );
};

// Reusable Loading Spinner
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
    </div>
);

// Reusable Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'red', isLoading = false }) => {
    if (!isOpen) return null;

    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700',
        blue: 'bg-primary-main hover:bg-primary-dark',
        green: 'bg-green-600 hover:bg-green-700'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} disabled={isLoading} className={`px-4 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 ${colorClasses[confirmColor]}`}>
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Actions Dropdown Component for User Management
const ActionsDropdown = ({ user, adminUser, onAction, onViewProfile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside both the dropdown and the button that toggles it
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuAction = (actionType) => {
        onAction(user.id, actionType);
        setIsOpen(false); // Close dropdown after action
    };

    const handleViewDetailsClick = () => {
        onViewProfile(user);
        setIsOpen(false); // Close dropdown after action
    };

    // Do not show dropdown for the admin's own account
    if (adminUser && user.id === adminUser.id) {
        return <span className="text-gray-400 italic">Self</span>;
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(prev => !prev)} // Toggle dropdown state
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary-main"
                id={`options-menu-${user.id}`}
                aria-haspopup="true"
                aria-expanded={isOpen} // Set aria-expanded based on isOpen state
            >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20" // Increased z-index
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby={`options-menu-${user.id}`}
                >
                    <div className="py-1" role="none">
                        {user.status === 'active' ? (
                            <button onClick={() => handleMenuAction('block')} className="text-red-600 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" role="menuitem">Block</button>
                        ) : (
                            <button onClick={() => handleMenuAction('unblock')} className="text-green-600 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" role="menuitem">Unblock</button>
                        )}
                        {user.is_verified ? (
                            <button onClick={() => handleMenuAction('unverify')} className="text-gray-600 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" role="menuitem">Unverify</button>
                        ) : (
                            <button onClick={() => handleMenuAction('verify')} className="text-blue-600 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" role="menuitem">Verify</button>
                        )}
                        <button onClick={() => handleMenuAction('delete')} className="text-red-600 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" role="menuitem">Delete</button>
                        {(user.role === 'student' || user.role === 'publisher') && (
                            <button onClick={handleViewDetailsClick} className="text-primary-main block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" role="menuitem">View Details</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


function UserManagement({ user: adminUser, setPage, setStudentIdForProfile, setPublisherIdForProfile, initialFilter }) { // NEW: Added initialFilter prop
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Initial state based on initialFilter prop
    const [roleFilter, setRoleFilter] = useState('All');
    const [verificationStatusFilter, setVerificationStatusFilter] = useState('All');
    const [accountStatusFilter, setAccountStatusFilter] = useState('All');

    const [sortOrder, setSortOrder] = useState('newest'); 
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({});

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    // FIXED: Apply initialFilter when component mounts or initialFilter changes
    useEffect(() => {
        if (initialFilter) {
            if (initialFilter.filter === 'unverified') {
                setVerificationStatusFilter('unverified');
                setRoleFilter('All'); // Reset other filters for clarity
                setAccountStatusFilter('All');
            } else if (initialFilter.filter === 'blocked') {
                setAccountStatusFilter('blocked');
                setRoleFilter('All'); // Reset other filters for clarity
                setVerificationStatusFilter('All');
            } else {
                // If a general role filter is passed (e.g., from AdminDashboard)
                setRoleFilter(initialFilter.filter);
                setVerificationStatusFilter('All');
                setAccountStatusFilter('All');
            }
        }
    }, [initialFilter]);


    const fetchAllUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('search', searchTerm);
            params.append('sort_order', sortOrder);

            // Add role filter if not 'All'
            if (roleFilter !== 'All') {
                params.append('role', roleFilter);
            }

            // Add verification status filter if not 'All'
            if (verificationStatusFilter === 'verified') {
                params.append('is_verified', 1);
            } else if (verificationStatusFilter === 'unverified') {
                params.append('is_verified', 0);
            }

            // Add account status filter if not 'All'
            if (accountStatusFilter === 'active') {
                params.append('status', 'active');
            } else if (accountStatusFilter === 'blocked') {
                params.append('status', 'blocked');
            }

            const response = await fetch(`http://uniwiz-backend.test/api/get_all_users_admin.php?${params.toString()}`);
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                throw new Error(data.message || 'Failed to fetch users.');
            }
        } catch (err) {
            setError(err.message);
            showNotification(`Error: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, roleFilter, verificationStatusFilter, accountStatusFilter, sortOrder]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAllUsers();
        }, 300); // Debounce search input
        return () => clearTimeout(delayDebounceFn);
    }, [fetchAllUsers]);

    // Handler for user actions (Block/Unblock, Verify/Unverify, Delete)
    const handleUserAction = async (targetUserId, actionType, confirm = true) => {
        if (!adminUser || !adminUser.id) {
            showNotification("Admin user not identified. Cannot perform action.", "error");
            return;
        }

        let statusToUpdate = null;
        let isVerifiedToUpdate = null;
        let actionMessage = "";
        let confirmBtnText = "Confirm";
        let confirmBtnColor = "red";
        let apiUrl = '';
        let payload = {};

        switch (actionType) {
            case 'block':
                statusToUpdate = 'blocked';
                actionMessage = `Are you sure you want to block this user? They will not be able to log in.`;
                confirmBtnText = "Block User";
                confirmBtnColor = "red";
                apiUrl = 'http://uniwiz-backend.test/api/update_user_status_admin.php';
                payload = { target_user_id: targetUserId, admin_id: adminUser.id, status: statusToUpdate };
                break;
            case 'unblock':
                statusToUpdate = 'active';
                actionMessage = `Are you sure you want to unblock this user? They will regain access.`;
                confirmBtnText = "Unblock User";
                confirmBtnColor = "green";
                apiUrl = 'http://uniwiz-backend.test/api/update_user_status_admin.php';
                payload = { target_user_id: targetUserId, admin_id: adminUser.id, status: statusToUpdate };
                break;
            case 'verify':
                isVerifiedToUpdate = 1;
                actionMessage = `Are you sure you want to verify this user?`;
                confirmBtnText = "Verify User";
                confirmBtnColor = "blue";
                apiUrl = 'http://uniwiz-backend.test/api/update_user_status_admin.php';
                payload = { target_user_id: targetUserId, admin_id: adminUser.id, is_verified: isVerifiedToUpdate };
                break;
            case 'unverify':
                isVerifiedToUpdate = 0;
                actionMessage = `Are you sure you want to unverify this user?`;
                confirmBtnText = "Unverify User";
                confirmBtnColor = "red";
                apiUrl = 'http://uniwiz-backend.test/api/update_user_status_admin.php';
                payload = { target_user_id: targetUserId, admin_id: adminUser.id, is_verified: isVerifiedToUpdate };
                break;
            case 'delete':
                actionMessage = `Are you sure you want to permanently delete this user? This action cannot be undone.`;
                confirmBtnText = "Delete User";
                confirmBtnColor = "red";
                apiUrl = 'http://uniwiz-backend.test/api/delete_user_admin.php';
                payload = { target_user_id: targetUserId, admin_id: adminUser.id };
                break;
            default:
                showNotification("Invalid action.", "error");
                return;
        }

        const performUpdate = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                
                showNotification(result.message, 'success');
                fetchAllUsers(); // Re-fetch users to update the list
                setIsConfirmModalOpen(false); // Close modal on success

            } catch (err) {
                showNotification(`Error: ${err.message}`, 'error');
                setIsLoading(false); // Hide loading on error
            }
        };

        if (confirm) {
            setModalConfig({
                title: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} User`,
                message: actionMessage,
                onConfirm: performUpdate,
                confirmText: confirmBtnText,
                confirmColor: confirmBtnColor,
            });
            setIsConfirmModalOpen(true);
        } else {
            performUpdate(); // For actions that don't need confirmation (e.g., direct status toggle if implemented)
        }
    };

    // Handle viewing user profiles
    const handleViewProfile = (user) => {
        if (user.role === 'student') {
            setStudentIdForProfile(user.id);
            setPage('student-profile');
        } else if (user.role === 'publisher') {
            setPublisherIdForProfile(user.id);
            setPage('company-profile');
        } else {
            showNotification("Cannot view profile for this user role.", "info");
        }
    };

    // Options for the new dropdown filters
    const roleOptions = [
        { value: 'All', label: 'All Roles' },
        { value: 'student', label: 'Students' },
        { value: 'publisher', label: 'Publishers' },
        { value: 'admin', label: 'Admins' },
    ];

    const verificationOptions = [
        { value: 'All', label: 'All Verification' },
        { value: 'verified', label: 'Verified' },
        { value: 'unverified', label: 'Unverified' },
    ];

    const accountStatusOptions = [
        { value: 'All', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'blocked', label: 'Blocked' },
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
    ];

    return (
        <>
            {notification.message && (
                <Notification 
                    key={notification.key}
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification({ message: '', type: '', key: 0 })}
                />
            )}
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
                isLoading={isLoading}
            />

            <div className="p-8 bg-gray-50 min-h-screen">
                <h1 className="text-4xl font-bold text-primary-dark mb-8">User Management</h1>

                {/* UPDATED: Compact filter bar in one line with horizontal scroll */}
                <div className="mb-6 bg-white p-3 rounded-xl shadow-sm border overflow-x-auto">
                    <div className="flex items-center gap-3 min-w-max">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="shadow-sm border rounded-lg py-1.5 px-4 text-m w-64"
                        />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="shadow-sm border rounded-lg py-1.5 px-4 bg-white text-m"
                        >
                            {roleOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <select
                            value={verificationStatusFilter}
                            onChange={(e) => setVerificationStatusFilter(e.target.value)}
                            className="shadow-sm border rounded-lg py-1.5 px-4 bg-white text-m"
                        >
                            {verificationOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <select
                            value={accountStatusFilter}
                            onChange={(e) => setAccountStatusFilter(e.target.value)}
                            className="shadow-sm border rounded-lg py-1.5 px-4 bg-white text-m"
                        >
                            {accountStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="shadow-sm border rounded-lg py-1.5 px-4 bg-white text-m"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="7" className="text-center py-8"><LoadingSpinner /></td></tr>
                                ) : error ? (
                                    <tr><td colSpan="7" className="text-center py-8 text-red-500">{error}</td></tr>
                                ) : users.length > 0 ? (
                                    users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-full object-cover" 
                                                            src={user.profile_image_url ? `http://uniwiz-backend.test/api/${user.profile_image_url}` : `https://placehold.co/40x40/E8EAF6/211C84?text=${user.first_name.charAt(0)}`} 
                                                            alt={`${user.first_name}'s profile`} 
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                                        {user.company_name && <div className="text-xs text-gray-500">{user.company_name}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {/* Verification Badge */}
                                                {user.is_verified ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        Verified
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <ActionsDropdown 
                                                    user={user} 
                                                    adminUser={adminUser} 
                                                    onAction={handleUserAction} 
                                                    onViewProfile={handleViewProfile} 
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">No users found matching your criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserManagement;
