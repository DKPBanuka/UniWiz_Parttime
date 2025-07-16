// FILE: src/App.js (FIXED & ENHANCED)
// =======================================================================================
// This version standardizes all API calls to use the 'uniwiz.test' domain,
// resolving all "failed to fetch" errors. It also includes enhanced logic
// to prevent duplicate notification popups and links the dashboard/notifications
// directly to the applicant details modal.

import React, { useState, useEffect, useCallback, useRef } from 'react';

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
import ViewApplications from './components/ViewApplications';
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
import './output.css';

// --- Constants ---
const API_BASE_URL = 'http://uniwiz.test'; // Standardized API base URL

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
  const [page, setPage] = useState('loading'); // e.g., 'loading', 'login', 'home', etc.
  
  // ID states for viewing specific detail pages
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [publisherIdForProfile, setPublisherIdForProfile] = useState(null);
  const [studentIdForProfile, setStudentIdForProfile] = useState(null);
  const [applicationIdToView, setApplicationIdToView] = useState(null); // **NEW**: For opening applicant modal

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
  const [applicantsPageFilter, setApplicantsPageFilter] = useState('All'); // Filter for AllApplicants page

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [popupNotification, setPopupNotification] = useState({ message: '', type: '', key: 0 });
  const [shownPopupIds, setShownPopupIds] = useState(new Set()); // Prevents duplicate popups

  // --- Utility Functions ---
  const showPopupNotification = useCallback((message, type = 'info') => {
      setPopupNotification({ message, type, key: Date.now() });
  }, []);
  
  const toggleSidebarLock = () => setIsSidebarLocked(prev => !prev);

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
  }, [currentUser, showPopupNotification, shownPopupIds]);


  // --- Initial Load Effect (from localStorage) ---
  useEffect(() => {
    const initializeUser = async () => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            setCurrentUser(user);
            if (user.role === 'student') {
                await fetchAppliedJobs(user.id);
            }
            if (!user.first_name || (user.role === 'publisher' && !user.company_name)) {
                setPage('profile-setup');
            } else {
                setPage('home');
            }
        } else {
            setPage('login'); 
        }
    };
    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Auth & Profile Handlers ---
  const handleLoginSuccess = useCallback(async (userData) => {
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
  }, [fetchAppliedJobs, showPopupNotification]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setAppliedJobs(new Set());
    setNotifications([]);
    setShownPopupIds(new Set());
    setPage('login'); 
  }, []);

  const handleProfileUpdate = useCallback((updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    if (page === 'profile-setup') {
        setPage('home');
        showPopupNotification('Profile setup complete!', 'success');
    } else {
        showPopupNotification('Profile updated successfully!', 'success');
    }
  }, [page, showPopupNotification]);
  
  // --- Navigation & Modal Handlers ---
  const handleViewApplications = (jobId) => { setSelectedJobId(jobId); setPage('view-applications'); };
  const handleViewStudentProfile = (studentId) => { setStudentIdForProfile(studentId); setPage('student-profile'); };
  const handleViewCompanyProfile = (pubId) => { setPublisherIdForProfile(pubId); setPage('company-profile'); };
  const handleViewApplicants = (filter = 'All') => { setApplicantsPageFilter(filter); setPage('applicants'); };
  const handleViewJobDetailsPage = (jobId) => { setSelectedJobId(jobId); setPage('view-job-details'); };
  const handleViewJobDetailsModal = (job) => { setSelectedJobForDetails(job); setIsJobDetailsModalOpen(true); };

  // **NEW**: Handler to navigate to applicants page and set the ID for the modal
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
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            showPopupNotification('Could not update notification status.', 'error');
        }
    }
    // **UPDATED**: Navigate based on link, specifically for applicant view
    if (notification.link) {
        const linkParts = notification.link.split('/'); // e.g., ['', 'applicants', 'view', '123']
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
  }, [currentUser, showPopupNotification]);

  // --- Application Submission Handler ---
  const handleOpenApplyModal = useCallback((job) => {
    if (!currentUser) {
      showPopupNotification("Please log in to apply for jobs.", 'info');
      setPage('login'); 
      return;
    }
    setJobToApply(job);
    setApplyModalOpen(true);
  }, [currentUser, showPopupNotification]);

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
      if (!currentUser) return null;

      const commonPages = {
        'notifications': <NotificationsPage user={currentUser} notifications={notifications} onNotificationClick={handleNotificationClick} />,
        'profile': <ProfilePage user={currentUser} onProfileUpdate={handleProfileUpdate} />,
        'settings': <SettingsPage />,
      };
      if (commonPages[page]) return commonPages[page];

      if (currentUser.role === 'publisher') {
          switch (page) {
              case 'home': return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} onViewApplicants={handleViewApplicants} onViewApplicantDetails={handleViewApplicantDetails} />;
              case 'create-job': return <CreateJob user={currentUser} onJobPosted={() => { setPage('manage-jobs'); showPopupNotification('Job posted successfully!', 'success'); }} />;
              case 'manage-jobs': return <ManageJobs user={currentUser} onViewApplicationsClick={handleViewApplications} onPostJobClick={() => setPage('create-job')} onViewJobDetails={handleViewJobDetailsPage} />; 
              case 'view-applications': return <ViewApplications jobId={selectedJobId} onBackClick={() => setPage('manage-jobs')} onViewStudentProfile={handleViewStudentProfile} />;
              case 'view-job-details': return <JobDetailsPage jobId={selectedJobId} onBackClick={() => setPage('manage-jobs')} />;
              case 'applicants': return <AllApplicants user={currentUser} onViewStudentProfile={handleViewStudentProfile} initialFilter={applicantsPageFilter} setInitialFilter={setApplicantsPageFilter} initialApplicationId={applicationIdToView} onModalClose={() => setApplicationIdToView(null)} />;
              case 'student-profile': return <StudentProfilePage studentId={studentIdForProfile} onBackClick={() => setPage('applicants')} />;
              default: return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} onViewApplicants={handleViewApplicants} onViewApplicantDetails={handleViewApplicantDetails} />;
          }
      } else { // Student Role
          switch (page) {
              case 'home': return <StudentDashboard currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={setPublisherIdForProfile} handleViewJobDetails={handleViewJobDetailsModal} />;
              case 'find-jobs': return <FindJobsPage currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={handleViewCompanyProfile} handleViewJobDetails={handleViewJobDetailsModal} />;
              case 'applied-jobs': return <AppliedJobsPage user={currentUser} />;
              case 'company-profile': return <CompanyProfilePage publisherId={publisherIdForProfile} currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} showNotification={showPopupNotification} handleViewJobDetails={handleViewJobDetailsModal} />;
              default: return <StudentDashboard currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={setPublisherIdForProfile} handleViewJobDetails={handleViewJobDetailsModal} />;
          }
      }
  };

  const renderPage = () => {
    switch (page) {
        case 'loading':
            return <div className="flex items-center justify-center min-h-screen"><p>Loading UniWiz...</p></div>;
        case 'login':
            return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        case 'profile-setup':
            return <ProfileSetup user={currentUser} onSetupComplete={handleProfileUpdate} />;
        default:
            if (!currentUser) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            return (
                <div className={`flex h-screen bg-gray-50`}>
                    {currentUser.role === 'publisher' ? (
                        <Sidebar user={currentUser} currentPage={page} setPage={setPage} onLogout={handleLogout} isLocked={isSidebarLocked} toggleLock={toggleSidebarLock} />
                    ) : (
                        <StudentSidebar user={currentUser} currentPage={page} setPage={setPage} onLogout={handleLogout} isLocked={isSidebarLocked} toggleLock={toggleSidebarLock} />
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
        handleApply={handleOpenApplyModal}
      />
    </>
  );
}

export default App;
