// FILE: src/App.js (UPDATED - Visitor Mode Implementation)
// =======================================================================================
// This version implements a "Visitor Mode" allowing non-logged-in users to browse jobs.

import React, { useState, useEffect, useCallback } from 'react';

// --- Component Imports ---
import LoginPage from './components/LoginPage';
import ProfileSetup from './components/ProfileSetup';
import StudentDashboard from './components/StudentDashboard';
import PublisherDashboard from './components/PublisherDashboard';
import Sidebar from './components/Sidebar'; // Publisher Sidebar
import StudentSidebar from './components/StudentSidebar'; // Student Sidebar
import TopNavbar from './components/TopNavbar';
import ManageJobs from './components/ManageJobs';
import CreateJob from './components/CreateJob';
import AllApplicants from './components/AllApplicants';
import FindJobsPage from './components/FindJobsPage'; // This will be the public page
import AppliedJobsPage from './components/AppliedJobsPage';
import ProfilePage from './components/ProfilePage';
import CompanyProfilePage from './components/CompanyProfilePage';
import StudentProfilePage from './components/StudentProfilePage';
import JobDetailsPage from './components/JobDetailsPage';
import NotificationsPage from './components/NotificationsPage';
import SettingsPage from './components/SettingsPage';
import ApplyModal from './components/ApplyModal';
import JobDetailsModal from './components/JobDetailsModal';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import JobManagementAdmin from './components/admin/JobManagement'; // Renamed to avoid conflict with publisher's ManageJobs
import AdminSidebar from './components/admin/AdminSidebar'; // NEW: Added missing import for AdminSidebar

import './output.css';

// --- Constants ---
const API_BASE_URL = 'http://uniwiz.test';

// --- Reusable Notification Popup (Toast) ---
const NotificationPopup = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };
    const baseClasses = "fixed top-20 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-transform transform translate-x-0";

    return (
        <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-800'}`}>
            {message}
        </div>
    );
};

function App() {
  // --- State Management ---
  const [currentUser, setCurrentUser] = useState(null);
  // UPDATED: Initial page for visitors can be 'find-jobs' or 'login' depending on design
  // Let's start at 'find-jobs' as the public landing page.
  const [page, setPageInternal] = useState('loading'); 
  const [currentPageFilter, setCurrentPageFilter] = useState(null);
  
  // ID states for viewing specific detail pages
  const [selectedJobIdForDetailsPage, setSelectedJobIdForDetailsPage] = useState(null);
  const [publisherIdForProfile, setPublisherIdForProfile] = useState(null);
  const [studentIdForProfile, setStudentIdForProfile] = useState(null);
  const [applicationIdToView, setApplicationIdToView] = useState(null); 

  // Modal states
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  
  // Application-related states (for students)
  const [jobToApply, setJobToApply] = useState(null); 
  const [appliedJobs, setAppliedJobs] = useState(new Set()); 
  const [applyingStatus, setApplyingStatus] = useState({}); 

  // UI State
  const [isSidebarLocked, setIsSidebarLocked] = useState(true);
  const [applicantsPageFilter, setApplicantsPageFilter] = useState('All');
  const [appliedJobsPageFilter, setAppliedJobsPageFilter] = useState('All');

  // Notification States
  const [notifications, setNotifications] = useState([]); 
  const [popupNotification, setPopupNotification] = useState({ message: '', type: '', key: 0 });
  const [shownPopupIds, setShownPopupIds] = useState(new Set()); 

  // --- Utility Functions ---
  const showPopupNotification = useCallback((message, type = 'info') => {
      setPopupNotification({ message, type, key: Date.now() });
  }, []);
  
  const toggleSidebarLock = () => setIsSidebarLocked(prev => !prev);

  // NEW: Wrapper for setPageInternal to handle filters
  const setPage = useCallback((newPage, filter = null) => {
    setCurrentPageFilter(filter);
    setPageInternal(newPage);
  }, []);


  // --- Data Fetching Functions ---
  const fetchAppliedJobs = useCallback(async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/get_applied_jobs.php?user_id=${userId}`);
        const appliedIds = await response.json();
        if (response.ok) {
            setAppliedJobs(new Set(appliedIds.map(id => parseInt(id, 10))));
        } else {
            throw new Error(appliedIds.message || 'Could not fetch applied jobs');
        }
    } catch (err) {
        console.error("Fetch Applied Jobs Error:", err);
    }
  }, []);

  // --- Effect for Polling Notifications ---
  useEffect(() => {
    // Only fetch notifications if a user is logged in
    if (!currentUser) {
        setNotifications([]); // Clear notifications if logged out
        return;
    }

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_notifications.php?user_id=${currentUser.id}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications.');
            
            setNotifications(data);

            const newNotificationsForPopup = data.filter(n => !n.is_read && !shownPopupIds.has(n.id));

            if (newNotificationsForPopup.length > 0) {
                showPopupNotification(`You have ${newNotificationsForPopup.length} new notification(s)!`, 'info');
                setShownPopupIds(prevIds => {
                    const newIds = new Set(prevIds);
                    newNotificationsForPopup.forEach(n => newIds.add(n.id));
                    return newIds;
                });
            }
        } catch (err) {
            console.error("Fetch Notifications Error:", err.message);
        }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 

    return () => clearInterval(interval);
  }, [currentUser, showPopupNotification, shownPopupIds, setNotifications]);


  // --- Initial Load Effect (from localStorage) ---
  useEffect(() => {
    const initializeUser = async () => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            try {
                const response = await fetch(`${API_BASE_URL}/get_user_profile_by_id.php?user_id=${user.id}`);
                const result = await response.json();
                
                if (response.ok && result.user) {
                    if (result.user.status === 'blocked') {
                        showPopupNotification("Your account has been blocked by the administrator.", 'error');
                        setCurrentUser(null);
                        localStorage.removeItem('user');
                        setPage('login'); // Redirect to login if blocked
                        return;
                    }
                    setCurrentUser(result.user);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    if (result.user.role === 'student') {
                        await fetchAppliedJobs(result.user.id);
                    }
                    if (!result.user.first_name || (result.user.role === 'publisher' && !result.user.company_name)) {
                        setPage('profile-setup');
                    } else {
                        setPage('home'); // Logged in, go to home dashboard
                    }
                } else {
                    console.warn("Failed to re-fetch user data by ID, redirecting to public view.");
                    showPopupNotification(result.message || "Session expired or user not found. Please log in.", 'error');
                    setCurrentUser(null);
                    localStorage.removeItem('user');
                    setPage('find-jobs-public'); // Redirect to public Find Jobs
                }
            } catch (err) {
                console.error("Error during user re-initialization:", err);
                showPopupNotification("Could not re-establish session. Please log in again.", 'error');
                setCurrentUser(null);
                localStorage.removeItem('user');
                setPage('find-jobs-public'); // Redirect to public Find Jobs on error
            }
        } else {
            setPage('find-jobs-public'); // No user in localStorage, go to public Find Jobs
        }
    };
    initializeUser();
  }, [fetchAppliedJobs, setPage, showPopupNotification]);

  // --- Auth & Profile Handlers ---
  const handleLoginSuccess = useCallback(async (userData) => {
    if (userData.status === 'blocked') {
        showPopupNotification("Your account has been blocked by the administrator.", 'error');
        setCurrentUser(null);
        localStorage.removeItem('user');
        setPage('login');
        return;
    }

    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role === 'student') {
        await fetchAppliedJobs(userData.id);
    }
    if (!userData.first_name || (userData.role === 'publisher' && !userData.company_name)) {
        setPage('profile-setup');
    } else {
        setPage('home');
    }
    showPopupNotification(`Welcome back, ${userData.first_name}!`, 'success');
  }, [fetchAppliedJobs, showPopupNotification, setPage]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setAppliedJobs(new Set()); 
    setNotifications([]);
    setShownPopupIds(new Set()); 
    setPage('find-jobs-public'); // Redirect to public Find Jobs after logout
  }, [setPage, setNotifications, setShownPopupIds]);

  const handleProfileUpdate = useCallback((updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    if (page === 'profile-setup') {
        setPage('home');
        showPopupNotification('Profile setup complete!', 'success');
    } else {
        showPopupNotification('Profile updated successfully!', 'success');
    }
  }, [page, showPopupNotification, setPage]);
  
  // --- Navigation & Modal Handlers ---
  const handleViewCompanyProfile = (pubId) => { setPublisherIdForProfile(pubId); setPage('company-profile'); };
  const handleViewApplicants = (filter = 'All') => { setApplicantsPageFilter(filter); setPage('applicants'); };
  const handleViewJobDetailsPage = (jobId) => { setSelectedJobIdForDetailsPage(jobId); setPage('view-job-details'); };
  const handleViewJobDetails = (job) => { setSelectedJobForDetails(job); setIsJobDetailsModalOpen(true); };
  const handleViewApplicantDetails = (applicationId) => {
      setApplicationIdToView(applicationId);
      setPage('applicants');
  };

  const handleNotificationClick = useCallback(async (notification) => {
    if (!notification.is_read) {
        try {
            await fetch(`${API_BASE_URL}/mark_notification_read.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: notification.id, user_id: currentUser.id })
            });
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n));
        }
        catch (err) {
            console.error("Failed to mark notification as read:", err);
            showPopupNotification('Could not update notification status.', 'error');
        }
    }
    if (notification.link) {
        const linkParts = notification.link.split('/'); 
        const pageTarget = linkParts[1];
        const action = linkParts[2];
        const id = linkParts[3];

        if (pageTarget === 'applicants' && action === 'view' && id) {
            handleViewApplicantDetails(parseInt(id, 10));
        } else if (pageTarget === 'applicants') {
            setPage('applicants');
        } else if (pageTarget === 'applied-jobs') {
            setPage('applied-jobs');
        } else if (pageTarget === 'user-management') { // For admin notifications
            setPage('user-management', { filter: 'unverified' }); // Example: direct to unverified users
        } else if (pageTarget === 'job-management') { // For admin notifications
            setPage('job-management', { filter: 'draft' }); // Example: direct to pending jobs
        } else if (pageTarget === 'login') { // For blocked users
            handleLogout(); // Force logout if account is blocked
        }
    }
  }, [currentUser, showPopupNotification, setPage, setNotifications, handleLogout]);

  // --- Application Submission Handler ---
  const handleOpenApplyModal = useCallback((job) => {
    if (!currentUser) {
      showPopupNotification("Please log in to apply for jobs.", 'info');
      setPage('login'); // Redirect to login if not logged in
      return;
    }
    setJobToApply(job); 
    setApplyModalOpen(true);
  }, [currentUser, showPopupNotification, setPage]);

  const handleSubmitApplication = useCallback(async (proposal) => {
    if (!jobToApply || !currentUser) return; 
    const jobId = jobToApply.id;
    setApplyingStatus(prev => ({ ...prev, [jobId]: 'applying' }));
    try {
        const response = await fetch(`${API_BASE_URL}/applications.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, job_id: jobId, proposal }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Could not submit application.');
        
        setAppliedJobs(prev => new Set(prev).add(jobId)); 
        setApplyingStatus(prev => ({ ...prev, [jobId]: 'applied' }));
        showPopupNotification('Application submitted successfully!', 'success');
    } catch (err) {
        console.error(`Application Error: ${err.message}`);
        setApplyingStatus(prev => ({ ...prev, [jobId]: 'error' }));
        showPopupNotification(err.message, 'error');
    }
  }, [jobToApply, currentUser, showPopupNotification]);

  // --- Page Rendering Logic ---
  const renderLoggedInPageContent = () => {
      // If user is null (e.g., after logout or blocked), don't render content
      if (!currentUser) return null; 

      const commonPages = {
        'notifications': <NotificationsPage user={currentUser} notifications={notifications} onNotificationClick={handleNotificationClick} />,
        'profile': <ProfilePage user={currentUser} onProfileUpdate={handleProfileUpdate} />,
        'settings': <SettingsPage user={currentUser} onLogout={handleLogout} />,
      };
      if (page && commonPages[page]) return commonPages[page];

      if (currentUser.role === 'publisher') {
          switch (page) {
              case 'home': return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} onViewApplicants={handleViewApplicants} onViewApplicantDetails={handleViewApplicantDetails} />;
              case 'create-job': return <CreateJob user={currentUser} onJobPosted={() => { setPage('manage-jobs'); showPopupNotification('Job posted successfully!', 'success'); }} />;
              case 'manage-jobs': return <ManageJobs user={currentUser} onPostJobClick={() => setPage('create-job')} onViewJobDetails={handleViewJobDetailsPage} />; 
              case 'view-job-details': return <JobDetailsPage jobId={selectedJobIdForDetailsPage} onBackClick={() => setPage('manage-jobs')} />;
              case 'applicants': return <AllApplicants user={currentUser} initialFilter={applicantsPageFilter} setInitialFilter={setApplicantsPageFilter} initialApplicationId={applicationIdToView} onModalClose={() => setApplicationIdToView(null)} />;
              case 'student-profile': return <StudentProfilePage studentId={studentIdForProfile} onBackClick={() => setPage('applicants')} />;
              default: return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} onViewApplicants={handleViewApplicants} onViewApplicantDetails={handleViewApplicantDetails} />;
          }
      } else if (currentUser.role === 'student') { // Student Role
          switch (page) {
              case 'home': return <StudentDashboard currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={setPublisherIdForProfile} handleViewJobDetails={handleViewJobDetails} setAppliedJobsPageFilter={setAppliedJobsPageFilter} />;
              case 'find-jobs': return <FindJobsPage currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={handleViewCompanyProfile} handleViewJobDetails={handleViewJobDetails} />;
              case 'applied-jobs': return <AppliedJobsPage user={currentUser} handleViewJobDetails={handleViewJobDetails} initialFilter={appliedJobsPageFilter} setInitialFilter={setAppliedJobsPageFilter} />;
              case 'company-profile': return <CompanyProfilePage publisherId={publisherIdForProfile} currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} showNotification={showPopupNotification} handleViewJobDetails={handleViewJobDetails} />;
              default: return <StudentDashboard currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={setPublisherIdForProfile} handleViewJobDetails={handleViewJobDetails} setAppliedJobsPageFilter={setAppliedJobsPageFilter} />;
          }
      } else if (currentUser.role === 'admin') { // Admin Role
          switch (page) {
              case 'home': return <AdminDashboard setPage={setPage} />;
              case 'user-management': return <UserManagement user={currentUser} setPage={setPage} setStudentIdForProfile={setStudentIdForProfile} setPublisherIdForProfile={setPublisherIdForProfile} initialFilter={currentPageFilter} />;
              case 'job-management': return <JobManagementAdmin user={currentUser} setPage={setPage} setSelectedJobIdForDetailsPage={setSelectedJobIdForDetailsPage} initialFilter={currentPageFilter} />;
              case 'student-profile': return <StudentProfilePage studentId={studentIdForProfile} onBackClick={() => setPage('user-management')} />;
              case 'company-profile': return <CompanyProfilePage publisherId={publisherIdForProfile} currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} showNotification={showPopupNotification} handleViewJobDetails={handleViewJobDetails} />;
              case 'view-job-details': return <JobDetailsPage jobId={selectedJobIdForDetailsPage} onBackClick={() => setPage('job-management')} />;
              default: return <AdminDashboard setPage={setPage} />;
          }
      }
      return null; // Should not happen
  };

  const renderPage = () => {
    switch (page) {
        case 'loading':
            return <div className="flex items-center justify-center min-h-screen"><p>Loading UniWiz...</p></div>;
        case 'login':
            return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        case 'profile-setup':
            return <ProfileSetup user={currentUser} onSetupComplete={handleProfileUpdate} onBackClick={() => setPage('login')} />;
        // NEW: Public Find Jobs page
        case 'find-jobs-public':
            return (
                <div className="flex flex-col h-screen bg-gray-50">
                    {/* Public Top Navbar (simplified for visitors) */}
                    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-20">
                        <div className="flex items-center space-x-3">
                            <img src="/logo.png" alt="UniWiz Logo" className="h-10" />
                            <h1 className="text-xl font-bold text-primary-dark">UniWiz</h1>
                        </div>
                        <div>
                            <button onClick={() => setPage('login')} className="bg-primary-main text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                                Log In / Sign Up
                            </button>
                        </div>
                    </header>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto">
                        {/* Pass null for currentUser as no one is logged in */}
                        <FindJobsPage currentUser={null} handleApply={handleOpenApplyModal} appliedJobs={new Set()} applyingStatus={{}} setPage={setPage} setPublisherIdForProfile={setPublisherIdForProfile} handleViewJobDetails={handleViewJobDetails} />
                    </main>
                </div>
            );
        default:
            // If currentUser is valid, proceed to render the appropriate dashboard/page
            // If currentUser is null here, it means they were redirected from initializeUser or handleLogout
            // and should already be on 'find-jobs-public' or 'login'.
            if (!currentUser) {
                // Fallback to login if somehow a restricted page is accessed without currentUser
                return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            }
            return (
                <div className={`flex h-screen bg-gray-50`}>
                    {currentUser.role === 'publisher' ? (
                        <Sidebar user={currentUser} currentPage={page} setPage={setPage} onLogout={handleLogout} isLocked={isSidebarLocked} toggleLock={toggleSidebarLock} />
                    ) : currentUser.role === 'student' ? (
                        <StudentSidebar user={currentUser} currentPage={page} setPage={setPage} onLogout={handleLogout} isLocked={isSidebarLocked} toggleLock={toggleSidebarLock} />
                    ) : ( // Admin Sidebar
                        <AdminSidebar user={currentUser} currentPage={page} setPage={setPage} onLogout={handleLogout} isLocked={isSidebarLocked} toggleLock={toggleSidebarLock} />
                    )}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Pass notifications only if currentUser exists */}
                        <TopNavbar user={currentUser} setPage={setPage} notifications={notifications} onNotificationClick={handleNotificationClick} />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto">
                            {renderLoggedInPageContent()}
                        </main>
                    </div>
                </div>
            );
    }
  };

  return (
    <>
      {popupNotification.message && (
          <NotificationPopup
              key={popupNotification.key}
              message={popupNotification.message}
              type={popupNotification.type}
              onClose={() => setPopupNotification(p => ({ ...p, message: '' }))}
          />
      )}
      {renderPage()}
      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setApplyModalOpen(false)} jobTitle={jobToApply?.title} onSubmit={handleSubmitApplication} />
      <JobDetailsModal 
        isOpen={isJobDetailsModalOpen} 
        onClose={() => setIsJobDetailsModalOpen(false)} 
        job={selectedJobForDetails}
        currentUser={currentUser}
        handleApply={handleOpenApplyModal}
      />
    </>
  );
}

export default App;
