// FILE: src/App.js (Updated with CompanyProfilePage)
// =====================================================

import React, { useState, useEffect } from 'react';

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
import CompanyProfilePage from './components/CompanyProfilePage'; // NEW: Import CompanyProfilePage
import './output.css';

function App() {
  // --- State Management ---
  const [page, setPage] = useState('loading');
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]); 
  const [publisherIdForProfile, setPublisherIdForProfile] = useState(null); // NEW: State to hold publisherId for CompanyProfilePage
  
  // Modal states
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  
  // Application-related states
  const [jobToApply, setJobToApply] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingStatus, setApplyingStatus] = useState({}); 
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // --- Data Fetching Functions ---
  const fetchJobs = async () => {
    try {
        const apiUrl = 'http://uniwiz.test/jobs.php';
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch jobs.');
        const data = await response.json();
        setJobs(data);
    } catch (e) {
        console.error(e);
    }
  };

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

  // --- Initial Load Effect ---
  useEffect(() => {
    const fetchInitialData = async () => {
        await fetchJobs(); 
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
  };

  const handleLoginSuccess = async (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role === 'student') {
        await fetchAppliedJobs(userData.id);
    }
    if (!userData.first_name) {
        setPage('profile-setup');
    } else {
        setPage('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppliedJobs(new Set());
    localStorage.removeItem('user');
    setPage('login'); 
  };

  const handleProfileSetupComplete = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    setPage('home');
  };

  const handleProfileUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };
  
  const handleJobPosted = () => {
      fetchJobs();
      setPage('home');
  };

  // --- Application Handlers ---
  const handleOpenApplyModal = (job) => {
    if (!currentUser) {
      alert("Please log in to apply."); 
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
    } catch (err) {
        alert(`Error: ${err.message}`);
        setApplyingStatus(prev => ({ ...prev, [jobId]: 'error' }));
    }
  };

  // --- Navigation Handler ---
  const handleViewApplications = (jobId) => {
      setSelectedJobId(jobId);
      setPage('view-applications');
  };

  // --- Page Rendering Logic for logged-in users ---
  const renderLoggedInPageContent = () => {
      if (currentUser.role === 'publisher') {
          switch (page) {
              case 'home':
                  return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} />;
              case 'create-job':
                  return <CreateJob user={currentUser} onJobPosted={() => setPage('home')} />;
              case 'manage-jobs':
                  return <ManageJobs user={currentUser} onViewApplicationsClick={handleViewApplications} onPostJobClick={() => setPage('create-job')} />; 
              case 'view-applications':
                  return <ViewApplications jobId={selectedJobId} onBackClick={() => setPage('manage-jobs')} />;
              case 'profile':
                  return <ProfilePage user={currentUser} onProfileUpdate={handleProfileUpdate} />;
              case 'applicants':
                  return <AllApplicants user={currentUser} />;
              case 'settings':
                  return <SettingsPage />;
              default:
                  return <PublisherDashboard user={currentUser} onPostJobClick={() => setPage('create-job')} onViewAllJobsClick={() => setPage('manage-jobs')} />;
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
                            setPage={setPage} // Pass setPage to FindJobsPage
                            setPublisherIdForProfile={setPublisherIdForProfile} // Pass setPublisherIdForProfile
                         />;
              case 'applied-jobs':
                  return <AppliedJobsPage user={currentUser} />;
              case 'profile':
                  return <ProfilePage user={currentUser} onProfileUpdate={handleProfileUpdate} />;
              case 'settings':
                  return <SettingsPage />;
              case 'company-profile': // NEW: Route for Company Profile Page
                  return <CompanyProfilePage 
                            publisherId={publisherIdForProfile} 
                            currentUser={currentUser}
                            handleApply={handleOpenApplyModal}
                            appliedJobs={appliedJobs}
                            applyingStatus={applyingStatus}
                         />;
              default:
                  return <StudentDashboard currentUser={currentUser} />;
          }
      }
  };

  // --- Main Render Logic ---
  const renderPage = () => {
    if (page === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    
    if (page === 'login' || !currentUser) {
        return (
            <LoginPage 
                onLoginSuccess={handleLoginSuccess} 
                onShowSignUp={() => setSignUpModalOpen(true)} 
            />
        );
    }

    // --- Profile Setup View (for both roles) ---
    if (page === 'profile-setup') {
        return <ProfileSetup user={currentUser} onSetupComplete={handleProfileSetupComplete} />;
    }
    
    // --- Logged-In User Views (Unified Layout with role-specific sidebar) ---
    return (
        <div className={`flex h-screen ${currentUser.role === 'publisher' ? 'bg-bg-publisher-dashboard' : 'bg-bg-student-dashboard'}`}>
            {currentUser.role === 'publisher' ? (
                <Sidebar // Publisher's Sidebar
                    user={currentUser} 
                    currentPage={page} 
                    setPage={setPage} 
                    onLogout={handleLogout}
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            ) : (
                <StudentSidebar // Student's Sidebar
                    user={currentUser} 
                    currentPage={page} 
                    setPage={setPage} 
                    onLogout={handleLogout}
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            )}
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar user={currentUser} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {renderLoggedInPageContent()}
                </main>
            </div>
        </div>
    );
  };

  return (
    <>
      {renderPage()}
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setSignUpModalOpen(false)} onRegisterSuccess={handleRegisterSuccess} />
      <ApplyModal 
        isOpen={isApplyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        jobTitle={jobToApply?.title}
        onSubmit={handleSubmitApplication}
      />
    </>
  );
}

export default App;
