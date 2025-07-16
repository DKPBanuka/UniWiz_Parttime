// FILE: src/App.js (Updated with Sidebar Locking Logic)
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';

// Import all components
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import ProfileSetup from './components/ProfileSetup';
import CreateJob from './components/CreateJob';
import StudentDashboard from './components/StudentDashboard';
import PublisherDashboard from './components/PublisherDashboard';
import ViewApplications from './components/ViewApplications';
import ApplyModal from './components/ApplyModal';
import Sidebar from './components/Sidebar'; // Publisher Sidebar
import StudentSidebar from './components/StudentSidebar'; // Student Sidebar
import TopNavbar from './components/TopNavbar';
import ManageJobs from './components/ManageJobs';
import ProfilePage from './components/ProfilePage';
import AllApplicants from './components/AllApplicants';
import SettingsPage from './components/SettingsPage';
import AppliedJobsPage from './components/AppliedJobsPage';
import LoginPage from './components/LoginPage';
import FindJobsPage from './components/FindJobsPage';
import CompanyProfilePage from './components/CompanyProfilePage';
import StudentProfilePage from './components/StudentProfilePage';
import JobDetailsPage from './components/JobDetailsPage';
import NotificationsPage from './components/NotificationsPage';
import './output.css';

// Reusable Notification Popup (Toast)
const NotificationPopup = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-20 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-transform transform translate-x-0";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-800'}`}>
            {message}
        </div>
    );
};


function App() {
  // --- State Management ---
  const [page, setPage] = useState('loading');
  const [currentUser, setCurrentUser] = useState(null);
  
  // ID states for viewing specific pages
  const [publisherIdForProfile, setPublisherIdForProfile] = useState(null);
  const [studentIdForProfile, setStudentIdForProfile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Modal states
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  
  // Application-related states
  const [jobToApply, setJobToApply] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingStatus, setApplyingStatus] = useState({}); 

  // --- NEW: Sidebar state for locking/pinning ---
  const [isSidebarLocked, setIsSidebarLocked] = useState(true); // Default to locked/expanded

  // Filter state for the AllApplicants page
  const [applicantsPageFilter, setApplicantsPageFilter] = useState('All');

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState(null);
  const [popupNotification, setPopupNotification] = useState({ message: '', type: '', key: 0 });

  // --- Utility Functions ---
  const showPopupNotification = (message, type = 'info') => {
      setPopupNotification({ message, type, key: Date.now() });
  };
  
  const toggleSidebarLock = () => {
      setIsSidebarLocked(prev => !prev);
  };


  // --- Data Fetching Functions ---
  const fetchAppliedJobs = async (userId) => {
    try {
        const response = await fetch(`http://uniwiz.test/get_applied_jobs.php?user_id=${userId}`);
        const appliedIds = await response.json();
        if (response.ok) {
            setAppliedJobs(new Set(appliedIds.map(id => parseInt(id, 10))));
        }
    } catch (err) {
        console.error("Could not fetch applied jobs:", err);
    }
  };
  
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingNotifications(true);
    try {
        const response = await fetch(`http://uniwiz.test/get_notifications.php?user_id=${currentUser.id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications.');
        
        const newUnread = data.filter(n => !n.is_read && !notifications.some(oldN => oldN.id === n.id));
        if (newUnread.length > 0) {
            showPopupNotification(`You have ${newUnread.length} new notification(s)!`, 'info');
        }

        setNotifications(data);
    } catch (err) {
        setNotificationError(err.message);
        showPopupNotification(err.message, 'error');
    } finally {
        setIsLoadingNotifications(false);
    }
  }, [currentUser, notifications]);

  useEffect(() => {
    if (currentUser) {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }
  }, [currentUser, fetchNotifications]);


  // --- Initial Load Effect ---
  useEffect(() => {
    const fetchInitialData = async () => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            setCurrentUser(user);
            if (user.role === 'student') {
                await fetchAppliedJobs(user.id);
            }
            if (!user.first_name) {
                setPage('profile-setup');
            } else {
                setPage('home');
            }
        } else {
            setPage('login'); 
        }
    };
    fetchInitialData();
  }, []);

  // --- Auth Handlers ---
  const handleRegisterSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setPage('profile-setup');
    showPopupNotification('Registration successful! Please complete your profile.', 'success');
  };

  const handleLoginSuccess = async (userData) => {
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppliedJobs(new Set());
    setNotifications([]);
    localStorage.removeItem('user');
    setPage('login'); 
  };

  const handleProfileSetupComplete = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    setPage('home');
    showPopupNotification('Profile setup complete!', 'success');
  };

  const handleProfileUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    showPopupNotification('Profile updated successfully!', 'success');
  };
  
  // --- Navigation & Notification Handlers ---
  const handleViewApplications = (jobId) => {
      setSelectedJobId(jobId);
      setPage('view-applications');
  };
  
  const handleViewStudentProfile = (studentId) => {
      setStudentIdForProfile(studentId);
      setPage('student-profile');
  };

  const handleViewApplicants = (filter = 'All') => {
      setApplicantsPageFilter(filter);
      setPage('applicants');
  };

  const handleViewJobDetails = (jobId) => {
    setSelectedJobId(jobId);
    setPage('view-job-details');
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
        try {
            await fetch('http://uniwiz.test/mark_notification_read.php', {
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
    if (notification.link) {
        const linkParts = notification.link.split('/');
        const pageTarget = linkParts[1];
        const id = linkParts[2];

        if (pageTarget === 'applicants') setPage('applicants');
        if (pageTarget === 'applied-jobs') setPage('applied-jobs');
        if (pageTarget === 'student-profile' && id) {
            setStudentIdForProfile(id);
            setPage('student-profile');
        }
    }
  };

  // --- Application Handlers ---
  const handleOpenApplyModal = (job) => {
    if (!currentUser) {
      showPopupNotification("Please log in to apply for jobs.", 'info');
      setPage('login'); 
      return;
    }
    setJobToApply(job);
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (proposal) => {
    if (!jobToApply || !currentUser) return;
    const jobId = jobToApply.id;
    setApplyingStatus(prev => ({ ...prev, [jobId]: 'applying' }));
    try {
        const apiUrl = 'http://uniwiz.test/applications.php';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, job_id: jobId, proposal: proposal }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Could not submit application.');
        setAppliedJobs(prev => new Set(prev).add(jobId));
        setApplyingStatus(prev => ({ ...prev, [jobId]: 'applied' }));
        showPopupNotification('Application submitted successfully!', 'success');
    } catch (err) {
        console.error(`Error: ${err.message}`);
        setApplyingStatus(prev => ({ ...prev, [jobId]: 'error' }));
        showPopupNotification(err.message, 'error');
    }
  };

  // --- Page Rendering Logic for logged-in users ---
  const renderLoggedInPageContent = () => {
      if (!currentUser) return null;

      const commonPages = {
        'notifications': <NotificationsPage user={currentUser} notifications={notifications} isLoading={isLoadingNotifications} error={notificationError} onNotificationClick={handleNotificationClick} />,
        'profile': <ProfilePage user={currentUser} onProfileUpdate={handleProfileUpdate} />,
        'settings': <SettingsPage />,
      };
      if (commonPages[page]) {
          return commonPages[page];
      }

      if (currentUser.role === 'publisher') {
          switch (page) {
              case 'home':
                  return <PublisherDashboard 
                      user={currentUser} 
                      onPostJobClick={() => setPage('create-job')} 
                      onViewAllJobsClick={() => setPage('manage-jobs')}
                      onViewApplicants={handleViewApplicants}
                      onViewStudentProfile={handleViewStudentProfile}
                  />;
              case 'create-job':
                  return <CreateJob user={currentUser} onJobPosted={() => { setPage('manage-jobs'); showPopupNotification('Job posted successfully!', 'success'); }} />;
              case 'manage-jobs':
                  return <ManageJobs user={currentUser} onViewApplicationsClick={handleViewApplications} onPostJobClick={() => setPage('create-job')} onViewJobDetails={handleViewJobDetails} />; 
              case 'view-applications':
                  return <ViewApplications jobId={selectedJobId} onBackClick={() => setPage('manage-jobs')} onViewStudentProfile={handleViewStudentProfile} />;
              case 'view-job-details':
                  return <JobDetailsPage jobId={selectedJobId} onBackClick={() => setPage('manage-jobs')} />;
              case 'applicants':
                  return <AllApplicants 
                      user={currentUser} 
                      onViewStudentProfile={handleViewStudentProfile}
                      initialFilter={applicantsPageFilter}
                      setInitialFilter={setApplicantsPageFilter}
                  />;
              case 'student-profile':
                  return <StudentProfilePage studentId={studentIdForProfile} onBackClick={() => setPage('applicants')} />;
              default:
                  return <PublisherDashboard 
                      user={currentUser} 
                      onPostJobClick={() => setPage('create-job')} 
                      onViewAllJobsClick={() => setPage('manage-jobs')}
                      onViewApplicants={handleViewApplicants}
                      onViewStudentProfile={handleViewStudentProfile}
                  />;
          }
      } else { // currentUser.role === 'student'
          switch (page) {
              case 'home':
                  return <StudentDashboard currentUser={currentUser} />; 
              case 'find-jobs':
                  return <FindJobsPage 
                            currentUser={currentUser} 
                            handleApply={handleOpenApplyModal} 
                            appliedJobs={appliedJobs} 
                            applyingStatus={applyingStatus}
                            setPage={setPage}
                            setPublisherIdForProfile={setPublisherIdForProfile}
                         />;
              case 'applied-jobs':
                  return <AppliedJobsPage user={currentUser} />;
              case 'company-profile':
                  return <CompanyProfilePage 
                            publisherId={publisherIdForProfile} 
                            currentUser={currentUser}
                            handleApply={handleOpenApplyModal}
                            appliedJobs={appliedJobs}
                            applyingStatus={applyingStatus}
                            showNotification={showPopupNotification}
                         />;
              default:
                  return <StudentDashboard currentUser={currentUser} />;
          }
      }
  };

  // --- Main Render Logic ---
  const renderPage = () => {
    if (page === 'loading') {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
    }
    
    if (page === 'login' || !currentUser) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} onShowSignUp={() => setSignUpModalOpen(true)} />;
    }

    if (page === 'profile-setup') {
        return <ProfileSetup user={currentUser} onSetupComplete={handleProfileSetupComplete} />;
    }
    
    return (
        <div className={`flex h-screen ${currentUser.role === 'publisher' ? 'bg-bg-publisher-dashboard' : 'bg-bg-student-dashboard'}`}>
            {currentUser.role === 'publisher' ? (
                <Sidebar 
                    user={currentUser}
                    currentPage={page} 
                    setPage={setPage} 
                    onLogout={handleLogout} 
                    isLocked={isSidebarLocked} 
                    toggleLock={toggleSidebarLock} 
                />
            ) : (
                <StudentSidebar 
                    user={currentUser}
                    currentPage={page} 
                    setPage={setPage} 
                    onLogout={handleLogout} 
                    isLocked={isSidebarLocked} 
                    toggleLock={toggleSidebarLock} 
                />
            )}
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar user={currentUser} setPage={setPage} notifications={notifications} onNotificationClick={handleNotificationClick} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {renderLoggedInPageContent()}
                </main>
            </div>
        </div>
    );
  };

  return (
    <>
      {popupNotification.message && (
          <NotificationPopup
              key={popupNotification.key}
              message={popupNotification.message}
              type={popupNotification.type}
              onClose={() => setPopupNotification({ message: '', type: '', key: 0 })}
          />
      )}
      {renderPage()}
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setSignUpModalOpen(false)} onRegisterSuccess={handleRegisterSuccess} />
      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setApplyModalOpen(false)} jobTitle={jobToApply?.title} onSubmit={handleSubmitApplication} />
    </>
  );
}

export default App;
