import React, { useState, useEffect } from 'react';

// This component no longer needs 'Link' or 'useNavigate' from 'react-router-dom'

// --- Constants ---
// IMPORTANT: Make sure this URL matches the one in your App.js
const API_BASE_URL = 'http://uniwiz.test';

// Helper component for individual feature cards
const FeatureCard = ({ icon, title, text }) => (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{text}</p>
    </div>
);

// Helper component for "How it Works" steps
const HowItWorksStep = ({ number, title, text, color }) => (
    <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white ${color}`}>
            {number}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 px-4">{text}</p>
    </div>
);

// Helper component for Job Cards
const JobCard = ({ job, setPage }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col hover:scale-105 transition-transform duration-300">
        <div className="flex items-center mb-4">
            <img
                src={job.profile_image_url ? `${API_BASE_URL}/${job.profile_image_url}` : 'https://placehold.co/100x100/E2E8F0/4A5568?text=Logo'}
                alt={`${job.company_name} logo`}
                className="w-14 h-14 rounded-full mr-4 object-cover"
            />
            <div>
                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                <p className="text-gray-600 font-medium">{job.company_name}</p>
            </div>
        </div>
        <div className="flex-grow">
             <p className="text-gray-700 mb-2 line-clamp-3">{job.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
             <p className="text-sm text-gray-500 mb-1"><span className="font-semibold">Type:</span> {job.job_type}</p>
             <p className="text-sm text-gray-500 mb-2"><span className="font-semibold">Location:</span> {job.location || 'Not specified'}</p>
             <p className="text-green-600 font-bold mb-4">{job.payment_range}</p>
        </div>
        <button onClick={() => setPage('login')} className="w-full text-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            View & Apply
        </button>
    </div>
);


const LandingPage = ({ setPage }) => {
    const [activeTab, setActiveTab] = useState('students');
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/get_public_jobs.php`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setJobs(data);
                }
            })
            .catch(error => console.error('Error fetching jobs:', error));
    }, []);

    return (
        <div className="bg-gray-50 text-gray-800 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">UniWiz</h1>
                    <div>
                        <button onClick={() => setPage('login')} className="font-semibold text-gray-600 hover:text-blue-600 mr-4">Login</button>
                        <button onClick={() => setPage('login')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Sign Up
                        </button>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative h-[60vh] min-h-[500px] flex items-center text-white">
                     <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')"}}></div>
                     <div className="absolute inset-0 bg-black/50"></div>
                     <div className="relative container mx-auto px-6 text-center">
                        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">Earn While You Learn</h2>
                        <p className="text-xl md:text-2xl mt-4 max-w-3xl mx-auto text-gray-200">Connecting Sri Lankan university students with verified part-time and freelance opportunities.</p>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={() => setPage('login')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-transform hover:scale-105">I'm a Student</button>
                            <button onClick={() => setPage('login')} className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-100 transition-transform hover:scale-105">I'm Hiring</button>
                        </div>
                    </div>
                </section>

                {/* Why Choose UniWiz Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold mb-4">Why Choose UniWiz?</h2>
                        <p className="text-lg text-gray-600 mb-12">The perfect platform for students and employers to connect</p>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" title="Verified Opportunities" text="Every job is verified by our team to ensure legitimacy and fair compensation for students." />
                            <FeatureCard icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" title="Flexible Scheduling" text="Find opportunities that fit around your class schedule and academic commitments." />
                            <FeatureCard icon="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-9.422L12 14z" title="Student-Focused" text="Built specifically for university students with features that support your academic journey." />
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600 mb-8">{activeTab === 'students' ? 'Find the perfect part-time job in just a few steps' : 'Connect with talented university students quickly and easily'}</p>
                        <div className="flex justify-center mb-12">
                            <button onClick={() => setActiveTab('students')} className={`py-2 px-6 font-semibold rounded-l-lg ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>For Students</button>
                            <button onClick={() => setActiveTab('employers')} className={`py-2 px-6 font-semibold rounded-r-lg ${activeTab === 'employers' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}>For Employers</button>
                        </div>
                        {activeTab === 'students' && (
                            <div className="grid md:grid-cols-3 gap-8">
                                <HowItWorksStep number="1" title="Create Your Profile" text="Sign up and build your student profile with your skills, availability, and university details." color="bg-blue-500" />
                                <HowItWorksStep number="2" title="Browse Opportunities" text="Explore verified job listings that match your skills and schedule preferences." color="bg-blue-500" />
                                <HowItWorksStep number="3" title="Apply & Connect" text="Submit applications and communicate directly with potential employers." color="bg-blue-500" />
                            </div>
                        )}
                        {activeTab === 'employers' && (
                            <div className="grid md:grid-cols-3 gap-8">
                                <HowItWorksStep number="1" title="Create Company Profile" text="Set up your company profile and choose a subscription plan that fits your hiring needs." color="bg-green-500" />
                                <HowItWorksStep number="2" title="Post Job Opportunities" text="Create detailed job listings specifying skills, hours, and compensation for university students." color="bg-green-500" />
                                <HowItWorksStep number="3" title="Review & Hire" text="Evaluate student applications, communicate with candidates, and find your perfect match." color="bg-green-500" />
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Latest Active Jobs Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center mb-12">Latest Job Openings</h2>
                        {jobs.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {jobs.map(job => <JobCard key={job.id} job={job} setPage={setPage} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No active jobs available right now. Please check back later.</p>
                        )}
                         <div className="text-center mt-12">
                            <button onClick={() => setPage('login')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">View All Jobs</button>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center mb-4">What Our Users Say</h2>
                        <p className="text-lg text-gray-600 text-center mb-12">Success stories from students and employers</p>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <div className="flex items-center mb-4">
                                    <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=AP" alt="Amal Perera" className="w-12 h-12 rounded-full mr-4" />
                                    <div>
                                        <p className="font-bold">Amal Perera</p>
                                        <p className="text-sm text-gray-500">Computer Science Student, University of Colombo</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">"UniWiz helped me find a part-time web development job that perfectly fits around my class schedule. I'm gaining real-world experience while earning money to support my studies. The platform is incredibly easy to use!"</p>
                                <div className="text-yellow-400">★★★★★</div>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                               <div className="flex items-center mb-4">
                                    <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=SJ" alt="Sarah Johnson" className="w-12 h-12 rounded-full mr-4" />
                                    <div>
                                        <p className="font-bold">Sarah Johnson</p>
                                        <p className="text-sm text-gray-500">HR Manager, TechSolutions Lanka</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">"As a growing tech company, we needed access to bright, motivated talent. UniWiz has been instrumental in helping us find qualified student workers who bring fresh perspectives to our projects. The subscription model gives us great flexibility."</p>
                                <div className="text-yellow-400">★★★★★</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white">
                <div className="container mx-auto px-6 py-12">
                    <div className="bg-blue-600 rounded-lg p-8 -mt-24 mb-12 text-center flex flex-col md:flex-row justify-between items-center">
                        <h3 className="text-3xl font-bold mb-4 md:mb-0">Ready to get started? Join UniWiz today.</h3>
                        <div>
                            <button onClick={() => setPage('login')} className="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg mr-4 hover:bg-gray-200">Sign up as Student</button>
                            <button onClick={() => setPage('login')} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600">Sign up as Employer</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                        <div>
                            <h4 className="font-bold uppercase mb-4">Platform</h4>
                            <ul>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">How it Works</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Browse Jobs</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">For Students</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">For Employers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold uppercase mb-4">Support</h4>
                            <ul>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Help Center</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">FAQs</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Contact Us</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold uppercase mb-4">Company</h4>
                            <ul>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">About Us</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Blog</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Partnerships</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold uppercase mb-4">Connect</h4>
                            <ul>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Facebook</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Twitter</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">Instagram</a></li>
                                <li className="mb-2"><a href="#" className="hover:text-blue-400">LinkedIn</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
                        <p>&copy; 2025 UniWiz. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
