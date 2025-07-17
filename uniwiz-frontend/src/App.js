// FILE: src/App.js (FIXED - setPage prop passed to MessagesPage)
// =======================================================================================
// This version fixes the "setPage is not a function" error by correctly passing
// the setPage function to the MessagesPage component.

import React, { useState, useEffect, useCallback } from 'react';

// --- Component Imports ---
import LoginPage from './components/LoginPage';
import ProfileSetup from './components/ProfileSetup';
import StudentDashboard from './components/StudentDashboard';
import PublisherDashboard from './components/PublisherDashboard';
import Sidebar from './components/Sidebar';
import StudentSidebar from './components/StudentSidebar';
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
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import JobManagementAdmin from './components/admin/JobManagement';
import AdminSidebar from './components/admin/AdminSidebar';
import MessagesPage from './components/MessagesPage';

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
  
  const [selectedJobIdForDetailsPage, setSelectedJobIdForDetailsPage] = useState(null);
  const [publisherIdForProfile, setPublisherIdForProfile] = useState(null);
  const [studentIdForProfile, setStudentIdForProfile] = useState(null);
  const [applicationIdToView, setApplicationIdToView] = useState(null); 

  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  
  const [jobToApply, setJobToApply] = useState(null); 
  const [appliedJobs, setAppliedJobs] = useState(new Set()); 
  const [applyingStatus, setApplyingStatus] = useState({}); 

  const [isSidebarLocked, setIsSidebarLocked] = useState(true);
  const [applicantsPageFilter, setApplicantsPageFilter] = useState('All');
  const [appliedJobsPageFilter, setAppliedJobsPageFilter] = useState('All');

  const [notifications, setNotifications] = useState([]); 
  const [popupNotification, setPopupNotification] = useState({ message: '', type: '', key: 0 });
  const [shownPopupIds, setShownPopupIds] = useState(new Set()); 

  const showPopupNotification = useCallback((message, type = 'info') => {
      setPopupNotification({ message, type, key: Date.now() });
  }, []);
  
  const toggleSidebarLock = () => setIsSidebarLocked(prev => !prev);

  const setPage = useCallback((newPage, filter = null) => {
    setCurrentPageFilter(filter);
    setPageInternal(newPage);
  }, []);


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

  useEffect(() => {
    if (!currentUser) {
        setNotifications([]);
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
  }, [currentUser, showPopupNotification, shownPopupIds]);


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
                        setPage('login');
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
                        setPage('home');
                    }
                } else {
                    showPopupNotification(result.message || "Session expired or user not found. Please log in.", 'error');
                    setCurrentUser(null);
                    localStorage.removeItem('user');
                    setPage('find-jobs-public');
                }
            } catch (err) {
                showPopupNotification("Could not re-establish session. Please log in again.", 'error');
                setCurrentUser(null);
                localStorage.removeItem('user');
                setPage('find-jobs-public');
            }
        } else {
            setPage('find-jobs-public');
        }
    };
    initializeUser();
  }, [fetchAppliedJobs, showPopupNotification]);

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
  }, [fetchAppliedJobs, showPopupNotification]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setAppliedJobs(new Set()); 
    setNotifications([]);
    setShownPopupIds(new Set()); 
    setPage('find-jobs-public');
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
  
  const handleViewCompanyProfile = (pubId) => { setPublisherIdForProfile(pubId); setPage('company-profile'); };
  const handleViewApplicants = (filter = 'All') => { setApplicantsPageFilter(filter); setPage('applicants'); };
  const handleViewJobDetailsPage = (jobId) => { setSelectedJobIdForDetailsPage(jobId); setPage('view-job-details'); };
  const handleViewJobDetails = (job) => { setSelectedJobForDetails(job); setIsJobDetailsModalOpen(true); };
  const handleViewApplicantDetails = (applicationId) => {
      setApplicationIdToView(applicationId);
      setPage('applicants');
  };

  const handleMessageUser = () => {
      setPage('messages');
  };
  const handleMessageAdmin = () => {
      setPage('messages');
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
        } else if (pageTarget === 'user-management') {
            setPage('user-management', { filter: 'unverified' });
        } else if (pageTarget === 'job-management') {
            setPage('job-management', { filter: 'draft' });
        } else if (pageTarget === 'login') {
            handleLogout();
        }
    }
  }, [currentUser, showPopupNotification, setNotifications, handleLogout]);

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
        setApplyingStatus(prev => ({ ...prev, [jobId]: 'error' }));
        showPopupNotification(err.message, 'error');
    }
  }, [jobToApply, currentUser, showPopupNotification]);

  const renderLoggedInPageContent = () => {
      if (!currentUser) return null; 

      const commonPages = {
        'notifications': <NotificationsPage user={currentUser} notifications={notifications} onNotificationClick={handleNotificationClick} />,
        'profile': <ProfilePage user={currentUser} onProfileUpdate={handleProfileUpdate} />,
        'settings': <SettingsPage user={currentUser} onLogout={handleLogout} handleMessageAdmin={handleMessageAdmin} />,
      };
      // FIX: Pass setPage to MessagesPage
      if (page === 'messages') {
          return <MessagesPage user={currentUser} setPage={setPage} />;
      }
      if (page && commonPages[page]) return commonPages[page];

      if (currentUser.role === 'publisher') {
          switch (page) {
              case 'home': return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} onViewApplicants={handleViewApplicants} onViewApplicantDetails={handleViewApplicantDetails} />;
              case 'create-job': return <CreateJob user={currentUser} onJobPosted={() => { setPage('manage-jobs'); showPopupNotification('Job posted successfully!', 'success'); }} />;
              case 'manage-jobs': return <ManageJobs user={currentUser} onPostJobClick={() => setPage('create-job')} onViewJobDetails={handleViewJobDetailsPage} />; 
              case 'view-job-details': return <JobDetailsPage jobId={selectedJobIdForDetailsPage} onBackClick={() => setPage('manage-jobs')} />;
              case 'applicants': return <AllApplicants user={currentUser} initialFilter={applicantsPageFilter} setInitialFilter={setApplicantsPageFilter} initialApplicationId={applicationIdToView} onModalClose={() => setApplicationIdToView(null)} handleMessageStudent={handleMessageUser} />;
              case 'student-profile': return <StudentProfilePage studentId={studentIdForProfile} onBackClick={() => setPage('applicants')} />;
              default: return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} onViewApplicants={handleViewApplicants} onViewApplicantDetails={handleViewApplicantDetails} />;
          }
      } else if (currentUser.role === 'student') {
          switch (page) {
              case 'home': return <StudentDashboard currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={setPublisherIdForProfile} handleViewJobDetails={handleViewJobDetails} setAppliedJobsPageFilter={setAppliedJobsPageFilter} />;
              case 'find-jobs': return <FindJobsPage currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={handleViewCompanyProfile} handleViewJobDetails={handleViewJobDetails} />;
              case 'applied-jobs': return <AppliedJobsPage user={currentUser} handleViewJobDetails={handleViewJobDetails} initialFilter={appliedJobsPageFilter} setInitialFilter={setAppliedJobsPageFilter} />;
              case 'company-profile': return <CompanyProfilePage publisherId={publisherIdForProfile} currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} showNotification={showPopupNotification} handleViewJobDetails={handleViewJobDetails} />;
              default: return <StudentDashboard currentUser={currentUser} handleApply={handleOpenApplyModal} appliedJobs={appliedJobs} applyingStatus={applyingStatus} setPage={setPage} setPublisherIdForProfile={setPublisherIdForProfile} handleViewJobDetails={handleViewJobDetails} setAppliedJobsPageFilter={setAppliedJobsPageFilter} />;
          }
      } else if (currentUser.role === 'admin') {
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
      return null;
  };

  const renderPage = () => {
    switch (page) {
        case 'loading':
            return <div className="flex items-center justify-center min-h-screen"><p>Loading UniWiz...</p></div>;
        case 'login':
            return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        case 'profile-setup':
            return <ProfileSetup user={currentUser} onSetupComplete={handleProfileUpdate} onBackClick={() => setPage('login')} />;
        case 'find-jobs-public':
            return (
                <div className="flex flex-col h-screen bg-gray-50">
                    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-20">
                        <div className="flex items-center space-x-3">
                            <img src="/logo.png" alt="UniWiz Logo" className="h-10" />
                            <h1 className="text-xl font-bold text-primary-dark">UniWiz</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setPage('login')} className="font-semibold text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                Log In
                            </button>
                            <button onClick={() => setPage('login')} className="bg-primary-main text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                                Sign Up
                            </button>
                        </div>
                    </header>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto">
                        <FindJobsPage currentUser={null} handleApply={handleOpenApplyModal} appliedJobs={new Set()} applyingStatus={{}} setPage={setPage} setPublisherIdForProfile={handleViewCompanyProfile} handleViewJobDetails={handleViewJobDetails} />
                    </main>
                </div>
            );
        default:
            if (!currentUser) {
                return <LoginPage onLoginSuccess={handleLoginSuccess} />;
            }
            // FIX: Pass setPage to MessagesPage when rendering it full-screen
            if (page === 'messages') {
                return <MessagesPage user={currentUser} setPage={setPage} />;
            }
            return (
                <div className={`flex h-screen bg-gray-50`}>
                    {currentUser.role === 'publisher' ? (
                        <Sidebar user={currentUser} currentPage={page} setPage={setPage} onLogout={handleLogout} isLocked={isSidebarLocked} toggleLock={toggleSidebarLock} />
                    ) : currentUser.role === 'student' ? (
                        <StudentSidebar user={currentUser} currentPage={page} setPage={setPage} onLogout={handleLogout} isLocked={isSidebarLocked} toggleLock={toggleSidebarLock} />
                    ) : (
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
        handleViewCompanyProfile={handleViewCompanyProfile}
        handleMessagePublisher={handleMessageUser}
      />
    </>
  );
}

export default App;
