// FILE: src/App.js (FIXED - Missing useState declarations for notifications and popupNotification)
// =======================================================================================
// This version integrates the new Admin Dashboard, Job Management, and User Management pages.
// FIXED: Now correctly passes initial filter parameters to management pages.
// FIXED: Corrected the call to the renderPage function.
// FIXED: Corrected state variable declarations and usage for appliedJobs and jobToApply.
// UPDATED: Ensures is_verified status is available in currentUser.
// UPDATED: Added logic to check user status (active/blocked) and logout if blocked.
// FIXED: Corrected declaration of shownPopupIds to be a state variable.
// FIXED: Re-added useState declarations for notifications and popupNotification.

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
import FindJobsPage from './components/FindJobsPage';
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
  // FIXED: Correctly declare notifications and popupNotification as state variables
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
    if (!currentUser) return;

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
  }, [currentUser, showPopupNotification, shownPopupIds, setNotifications]); // Added setNotifications to dependencies


  // --- Initial Load Effect (from localStorage) ---
  useEffect(() => {
    const initializeUser = async () => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            // Re-fetch full user profile to ensure latest status and verification
            try {
                // We use the auth.php login endpoint to get the most up-to-date user object,
                // including status and is_verified. A dummy password is used as we only need the user data.
                const response = await fetch(`${API_BASE_URL}/auth.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', email: user.email, password: 'DUMMY_PASSWORD' }), 
                });
                const result = await response.json();
                if (response.ok && result.user) {
                    // Check if the user is blocked before setting currentUser
                    if (result.user.status === 'blocked') {
                        showPopupNotification("Your account has been blocked by the administrator.", 'error');
                        setCurrentUser(null);
                        localStorage.removeItem('user');
                        setPage('login');
                        return; // Stop further execution
                    }
                    setCurrentUser(result.user);
                    localStorage.setItem('user', JSON.stringify(result.user)); // Update localStorage
                    if (result.user.role === 'student') {
                        await fetchAppliedJobs(result.user.id);
                    }
                    if (!result.user.first_name || (result.user.role === 'publisher' && !result.user.company_name)) {
                        setPage('profile-setup');
                    } else {
                        setPage('home');
                    }
                } else {
                    // If re-fetch fails, fall back to stored user or login page
                    console.warn("Failed to re-fetch user data on init, using stored data or redirecting to login.");
                    // Check status of the *locally stored* user before proceeding
                    if (user.status === 'blocked') {
                        showPopupNotification("Your account has been blocked by the administrator.", 'error');
                        setCurrentUser(null);
                        localStorage.removeItem('user');
                        setPage('login');
                        return;
                    }
                    setCurrentUser(user);
                    if (user.role === 'student') {
                        await fetchAppliedJobs(user.id);
                    }
                    if (!user.first_name || (user.role === 'publisher' && !user.company_name)) {
                        setPage('profile-setup');
                    } else {
                        setPage('home');
                    }
                }
            } catch (err) {
                console.error("Error during user re-initialization:", err);
                // If API call fails, assume user is not logged in or session expired
                setCurrentUser(null);
                localStorage.removeItem('user');
                setPage('login');
            }
        } else {
            setPage('login'); 
        }
    };
    initializeUser();
  }, [fetchAppliedJobs, setPage, showPopupNotification]);

  // --- Auth & Profile Handlers ---
  const handleLoginSuccess = useCallback(async (userData) => {
    // Check if the user is blocked immediately after login success
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
    setPage('login'); 
  }, [setPage, setNotifications, setShownPopupIds]); // Added setNotifications, setShownPopupIds to dependencies

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
  // Modified handleViewJobDetails to accept job object instead of just job.id
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
        }
    }
  }, [currentUser, showPopupNotification, setPage, setNotifications]); // Added setNotifications to dependencies

  // --- Application Submission Handler ---
  const handleOpenApplyModal = useCallback((job) => {
    if (!currentUser) {
      showPopupNotification("Please log in to apply for jobs.", 'info');
      setPage('login'); 
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
    // If currentUser is null, and page is not 'login', redirect to login.
    // This handles cases where user might be blocked or deleted after initial load.
    if (!currentUser && page !== 'login') {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    switch (page) {
        case 'loading':
            return <div className="flex items-center justify-center min-h-screen"><p>Loading UniWiz...</p></div>;
        case 'login':
            return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        case 'profile-setup':
            return <ProfileSetup user={currentUser} onSetupComplete={handleProfileUpdate} />;
        default:
            // If currentUser is valid, proceed to render the appropriate dashboard/page
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