import React, { useState, useEffect } from 'react';

// --- Constants ---
const API_BASE_URL = 'http://uniwiz-backend.test/api';

// Enhanced FeatureCard with modern styling
const FeatureCard = ({ icon, title, text }) => (
    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
            </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
);

// Enhanced HowItWorksStep with modern styling
const HowItWorksStep = ({ number, title, text, color }) => (
    <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl font-bold text-white ${color} shadow-lg`}>
            {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 px-4 leading-relaxed">{text}</p>
    </div>
);

// Enhanced JobCard with modern styling
const JobCard = ({ job, setPage }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full border border-gray-100">
        <div className="flex items-center mb-5">
            <img
                src={job.profile_image_url ? `${API_BASE_URL}/${job.profile_image_url}` : 'https://placehold.co/100x100/E2E8F0/4A5568?text=Logo'}
                alt={`${job.company_name} logo`}
                className="w-16 h-16 rounded-xl mr-4 object-cover border border-gray-200"
            />
            <div>
                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                <p className="text-gray-600 font-medium">{job.company_name}</p>
            </div>
        </div>
        <div className="flex-grow mb-5">
            <p className="text-gray-700 mb-2 line-clamp-3 leading-relaxed">{job.description}</p>
        </div>
        <div className="mt-auto pt-5 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{job.job_type}</span>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {job.location || 'Remote'}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-green-600 font-bold text-lg">{job.payment_range}</p>
                <button 
                    onClick={() => setPage('login', { signup: true, role: 'student' })} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    Apply Now
                </button>
            </div>
        </div>
    </div>
);

const LandingPage = ({ setPage }) => {
    const [activeTab, setActiveTab] = useState('students');
    const [jobs, setJobs] = useState([]);
    const [footerLinks, setFooterLinks] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Fetch public jobs
        fetch(`${API_BASE_URL}/get_public_jobs.php`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setJobs(data);
                }
            })
            .catch(error => console.error('Error fetching jobs:', error));
        
        // Fetch footer links
        fetch(`${API_BASE_URL}/get_site_settings.php`)
            .then(response => response.json())
            .then(data => {
                setFooterLinks(data);
            })
            .catch(error => console.error('Error fetching footer links:', error));

        // Handle scroll for header
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-gray-50 text-gray-800 font-sans antialiased">
            {/* Enhanced Header with glass morphism and smooth transition */}
            <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
                <nav className="container mx-auto px-6 py-2 flex justify-between items-center">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="UniWiz Logo" className="h-12" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">UniWiz</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setPage('login')} 
                            className="font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300 hidden sm:inline-block"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => setPage('login', { signup: true, role: 'student' })} 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Sign Up
                        </button>
                    </div>
                </nav>
            </header>

            <main className="pt-16">
                {/* Enhanced Hero Section with gradient overlay and floating elements */}
                <section className="relative h-screen min-h-[600px] flex items-center text-white overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')"}}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/80"></div>
                    
                    {/* Floating circles decoration */}
                    <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-blue-500/20 blur-xl"></div>
                    <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-blue-400/20 blur-xl"></div>
                    
                    <div className="relative container mx-auto px-6 text-center z-10">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in">
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Earn While</span> <span className="bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">You Learn</span>
                        </h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100 mb-10 leading-relaxed">
                            Connecting Sri Lankan university students with verified part-time and freelance opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button 
                                onClick={() => setPage('login', { signup: true, role: 'student' })} 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                I'm a Student
                            </button>
                            <button 
                                onClick={() => setPage('login', { signup: true, role: 'publisher' })} 
                                className="bg-white text-blue-600 font-semibold py-4 px-8 rounded-xl text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                I'm Hiring
                            </button>
                        </div>
                    </div>
                    
                    {/* Scroll indicator */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </div>
                </section>

                {/* Why Choose UniWiz Section with animated features */}
                <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-blue-200/20 blur-3xl"></div>
                    
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <div className="inline-block mb-2 bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1 rounded-full">
                            Why Choose Us
                        </div>
                        <h2 className="text-4xl font-bold mb-6">The UniWiz Advantage</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-16">
                            Designed specifically for Sri Lankan university students and employers who value talent and flexibility.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                                title="Verified Opportunities" 
                                text="Every job is verified by our team to ensure legitimacy and fair compensation for students." 
                            />
                            <FeatureCard 
                                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                title="Flexible Scheduling" 
                                text="Find opportunities that fit around your class schedule and academic commitments." 
                            />
                            <FeatureCard 
                                icon="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-9.422L12 14z" 
                                title="Student-Focused" 
                                text="Built specifically for university students with features that support your academic journey." 
                            />
                        </div>
                    </div>
                </section>

                {/* How It Works Section with tabbed interface */}
                <section className="py-20 bg-white relative overflow-hidden">
                    <div className="absolute -top-40 right-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
                    
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <div className="inline-block mb-2 bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1 rounded-full">
                            Simple Process
                        </div>
                        <h2 className="text-4xl font-bold mb-6">How It Works</h2>
                        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                            {activeTab === 'students' ? 
                                'Find the perfect part-time job in just a few steps' : 
                                'Connect with talented university students quickly and easily'}
                        </p>
                        
                        {/* Enhanced tab switcher */}
                        <div className="flex justify-center mb-16">
                            <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => setActiveTab('students')} 
                                    className={`py-3 px-8 font-semibold rounded-xl transition-all duration-300 ${activeTab === 'students' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600'}`}
                                >
                                    For Students
                                </button>
                                <button 
                                    onClick={() => setActiveTab('employers')} 
                                    className={`py-3 px-8 font-semibold rounded-xl transition-all duration-300 ${activeTab === 'employers' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md' : 'text-gray-700 hover:text-green-600'}`}
                                >
                                    For Employers
                                </button>
                            </div>
                        </div>
                        
                        {activeTab === 'students' && (
                            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                <HowItWorksStep 
                                    number="1" 
                                    title="Create Your Profile" 
                                    text="Sign up and build your student profile with your skills, availability, and university details." 
                                    color="bg-gradient-to-r from-blue-500 to-blue-600" 
                                />
                                <HowItWorksStep 
                                    number="2" 
                                    title="Browse Opportunities" 
                                    text="Explore verified job listings that match your skills and schedule preferences." 
                                    color="bg-gradient-to-r from-blue-500 to-blue-600" 
                                />
                                <HowItWorksStep 
                                    number="3" 
                                    title="Apply & Connect" 
                                    text="Submit applications and communicate directly with potential employers." 
                                    color="bg-gradient-to-r from-blue-500 to-blue-600" 
                                />
                            </div>
                        )}
                        {activeTab === 'employers' && (
                            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                <HowItWorksStep 
                                    number="1" 
                                    title="Create Company Profile" 
                                    text="Set up your company profile and choose a subscription plan that fits your hiring needs." 
                                    color="bg-gradient-to-r from-green-500 to-green-600" 
                                />
                                <HowItWorksStep 
                                    number="2" 
                                    title="Post Job Opportunities" 
                                    text="Create detailed job listings specifying skills, hours, and compensation for university students." 
                                    color="bg-gradient-to-r from-green-500 to-green-600" 
                                />
                                <HowItWorksStep 
                                    number="3" 
                                    title="Review & Hire" 
                                    text="Evaluate student applications, communicate with candidates, and find your perfect match." 
                                    color="bg-gradient-to-r from-green-500 to-green-600" 
                                />
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Latest Active Jobs Section with enhanced cards */}
                <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-2 bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1 rounded-full">
                                Opportunities
                            </div>
                            <h2 className="text-4xl font-bold mb-4">Latest Job Openings</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Browse through our curated selection of student-friendly jobs
                            </p>
                        </div>
                        
                        {jobs.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {jobs.map(job => <JobCard key={job.id} job={job} setPage={setPage} />)}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No active jobs available</h3>
                                <p className="text-gray-500 max-w-md mx-auto">We're currently updating our job listings. Please check back later for new opportunities.</p>
                            </div>
                        )}
                        
                        <div className="text-center mt-16">
                            <button 
                                onClick={() => setPage('public-jobs')} 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center"
                            >
                                View All Jobs
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Enhanced Testimonials Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-2 bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1 rounded-full">
                                Testimonials
                            </div>
                            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Hear from students and employers who found success with UniWiz
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-start mb-6">
                                    <img 
                                        src="https://placehold.co/100x100/E2E8F0/4A5568?text=AP" 
                                        alt="Amal Perera" 
                                        className="w-14 h-14 rounded-xl mr-4 object-cover border-2 border-blue-100" 
                                    />
                                    <div>
                                        <p className="font-bold text-lg">Amal Perera</p>
                                        <p className="text-sm text-gray-500">Computer Science Student, University of Colombo</p>
                                        <div className="flex mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed italic relative pl-6">
                                    <svg className="w-6 h-6 text-blue-200 absolute left-0 top-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                    </svg>
                                    "UniWiz helped me find a part-time web development job that perfectly fits around my class schedule. I'm gaining real-world experience while earning money to support my studies. The platform is incredibly easy to use!"
                                </p>
                            </div>
                            
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-start mb-6">
                                    <img 
                                        src="https://placehold.co/100x100/E2E8F0/4A5568?text=SJ" 
                                        alt="Sarah Johnson" 
                                        className="w-14 h-14 rounded-xl mr-4 object-cover border-2 border-blue-100" 
                                    />
                                    <div>
                                        <p className="font-bold text-lg">Sarah Johnson</p>
                                        <p className="text-sm text-gray-500">HR Manager, TechSolutions Lanka</p>
                                        <div className="flex mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed italic relative pl-6">
                                    <svg className="w-6 h-6 text-blue-200 absolute left-0 top-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                    </svg>
                                    "As a growing tech company, we needed access to bright, motivated talent. UniWiz has been instrumental in helping us find qualified student workers who bring fresh perspectives to our projects. The subscription model gives us great flexibility."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Join UniWiz today and take the first step towards balancing work and study.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button 
                                onClick={() => setPage('login', { signup: true, role: 'student' })} 
                                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Sign up as Student
                            </button>
                            <button 
                                onClick={() => setPage('login', { signup: true, role: 'publisher' })} 
                                className="bg-green-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-green-400"
                            >
                                Sign up as Employer
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Enhanced Footer */}
            <footer className="bg-gray-900 text-gray-300">
                <div className="container mx-auto px-6 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
                        <div className="col-span-2">
                            <div className="flex items-center mb-6">
                                <img src="/logo.png" alt="UniWiz Logo" className="h-12" />
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">UniWiz</h2>
                            </div>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Connecting Sri Lankan university students with verified part-time and freelance opportunities.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        
                        {footerLinks ? (
                            <>
                                {Object.keys(footerLinks).map(category => (
                                    <div key={category}>
                                        <h4 className="text-white font-semibold text-lg mb-4 uppercase tracking-wider">{category}</h4>
                                        <ul className="space-y-2">
                                            {footerLinks[category].map((link, index) => (
                                                <li key={index}>
                                                    <a href={link.url} className="text-gray-400 hover:text-white transition-colors duration-300">{link.text}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                
                                <div>
                                    <h4 className="text-white font-semibold text-lg mb-4 uppercase tracking-wider">Platform</h4>
                                    <ul className="space-y-2">
                                        <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">How it Works</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Browse Jobs</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">FAQ</a></li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="col-span-3">
                                <p>Loading footer links...</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} UniWiz. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;