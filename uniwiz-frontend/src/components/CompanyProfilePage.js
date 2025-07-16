// FILE: src/components/CompanyProfilePage.js (Updated to Display All Details & Add Review)
// ===========================================================================

import React, { useState, useEffect, useCallback } from 'react';
import CreateReviewModal from './CreateReviewModal'; // Import the new modal

// --- Reusable Components ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-main"></div>
    </div>
);

const InfoCard = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full">
        <div className="flex items-center mb-4">
            <div className="text-primary-main mr-3">{icon}</div>
            <h3 className="text-lg font-bold text-primary-dark">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const StarRating = ({ rating, reviewCount }) => {
    const totalStars = 5;
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const halfStar = numericRating % 1 >= 0.5;
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <svg key={`full_${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            {[...Array(emptyStars)].map((_, i) => <svg key={`empty_${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            <span className="ml-2 text-sm text-gray-600">({reviewCount} reviews)</span>
        </div>
    );
};

const ReviewCard = ({ review }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center mb-2">
            <img 
                src={review.student_image_url ? `http://uniwiz.test/${review.student_image_url}` : `https://placehold.co/40x40/E8EAF6/211C84?text=${(review.first_name || 'S').charAt(0)}`} 
                alt="student profile"
                className="h-10 w-10 rounded-full object-cover mr-3"
            />
            <div>
                <p className="font-bold">{review.first_name} {review.last_name}</p>
                <StarRating rating={review.rating} reviewCount={0} />
            </div>
        </div>
        <p className="text-gray-700 italic">"{review.review_text}"</p>
    </div>
);

// --- Main Component ---

function CompanyProfilePage({ publisherId, currentUser, handleApply, appliedJobs, applyingStatus, showNotification }) {
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const fetchCompanyData = useCallback(async () => {
        if (!publisherId) {
            setError("No company selected.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`http://uniwiz.test/get_company_profile.php?publisher_id=${publisherId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch company profile.");
            }
            setCompany(data.details);
            setJobs(Array.isArray(data.jobs) ? data.jobs : []);
            setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [publisherId]);

    useEffect(() => {
        fetchCompanyData();
    }, [fetchCompanyData]);
    
    const handleReviewSubmitSuccess = (message) => {
        // This function would be passed from App.js to show a notification
        if(showNotification) {
            showNotification(message, 'success');
        }
        fetchCompanyData(); // Refresh data to show the new review
    };


    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!company) return <div className="p-8 text-center text-gray-500">Company profile not found.</div>;

    // Icons for InfoCards
    const AboutIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const ContactIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    const SocialIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
    const ReviewsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

    return (
        <>
            <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800">
                <div className="max-w-6xl mx-auto">
                    {/* Company Profile Header */}
                    <div className="bg-white p-8 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                        <img 
                            src={company.profile_image_url ? `http://uniwiz.test/${company.profile_image_url}` : `https://placehold.co/128x128/E8EAF6/211C84?text=${(company.company_name || 'C').charAt(0)}`} 
                            alt={`${company.company_name || company.first_name}'s Profile`} 
                            className="h-32 w-32 rounded-full object-cover shadow-md border-4 border-primary-lighter" 
                        />
                        <div>
                            <h1 className="text-4xl font-bold text-primary-dark mb-1">{company.company_name || `${company.first_name} ${company.last_name}`}</h1>
                            <p className="text-gray-600 text-lg font-medium mb-2">{company.industry || 'Industry not specified'}</p>
                            <StarRating rating={company.average_rating} reviewCount={company.review_count} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            <InfoCard title="About Us" icon={AboutIcon}>
                                <p className="text-gray-700 leading-relaxed">{company.about || 'No description provided.'}</p>
                            </InfoCard>
                            
                            <div>
                                <h2 className="text-3xl font-bold text-primary-dark mb-6">Active Jobs</h2>
                                <div className="space-y-6">
                                    {jobs.length > 0 ? jobs.map((job) => {
                                        const hasApplied = appliedJobs && appliedJobs.has(job.id);
                                        const isApplying = applyingStatus && applyingStatus[job.id] === 'applying';
                                        return (
                                            <div key={job.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 border border-gray-100">
                                                <div className="p-6 flex flex-col h-full">
                                                    <div className="flex-grow">
                                                        <span className="inline-block bg-primary-light text-primary-dark text-sm font-semibold px-3 py-1 rounded-full mb-3">{job.category}</span>
                                                        <h3 className="text-2xl font-bold text-primary-dark mb-2">{job.title}</h3>
                                                        <div className="space-y-2 text-gray-700">
                                                            <p><strong>Type:</strong> {job.job_type}</p>
                                                            <p><strong>Payment:</strong> {job.payment_range}</p>
                                                            <p className="text-sm text-gray-500">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6 text-right">
                                                        {currentUser && currentUser.role === 'student' ? (
                                                            <button onClick={() => handleApply(job)} disabled={hasApplied || isApplying} className={`font-bold py-2 px-5 rounded-lg transition duration-300 ${hasApplied ? 'bg-green-500 text-white cursor-not-allowed' : isApplying ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary-main text-white hover:bg-primary-dark'}`}>
                                                                {hasApplied ? 'Applied' : isApplying ? 'Applying...' : 'Apply Now'}
                                                            </button>
                                                        ) : (
                                                            <button className="bg-gray-400 text-white font-bold py-2 px-5 rounded-lg cursor-not-allowed">View Details</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center text-gray-500 py-16 bg-white rounded-xl">No active jobs currently posted by this company.</div> 
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <InfoCard title="Contact Information" icon={ContactIcon}>
                                <div className="space-y-3 text-gray-700">
                                    <p><strong className="font-semibold text-gray-800">Email:</strong><br/>{company.email}</p>
                                    <p><strong className="font-semibold text-gray-800">Phone:</strong><br/>{company.phone_number || 'N/A'}</p>
                                    <p><strong className="font-semibold text-gray-800">Address:</strong><br/>{company.address || 'N/A'}</p>
                                    {company.website_url && <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-primary-main font-bold hover:underline block pt-2">Visit Website</a>}
                                </div>
                            </InfoCard>
                            <InfoCard title="Follow Us" icon={SocialIcon}>
                                <div className="flex space-x-4">
                                    {company.facebook_url && <a href={company.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600"><svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg></a>}
                                    {company.linkedin_url && <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700"><svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.481 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg></a>}
                                    {company.instagram_url && <a href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600"><svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" /></svg></a>}
                                </div>
                            </InfoCard>
                            <InfoCard title="Ratings & Reviews" icon={ReviewsIcon}>
                                {currentUser && currentUser.role === 'student' && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => setIsReviewModalOpen(true)}
                                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300"
                                        >
                                            Leave a Review
                                        </button>
                                    </div>
                                )}
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No reviews yet.</p>
                                )}
                            </InfoCard>
                        </div>
                    </div>
                </div>
            </div>
            <CreateReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                publisherId={publisherId}
                studentId={currentUser?.id}
                companyName={company?.company_name || company?.first_name}
                onSubmitSuccess={handleReviewSubmitSuccess}
            />
        </>
    );
}

export default CompanyProfilePage;
