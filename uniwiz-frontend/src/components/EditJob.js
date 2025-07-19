// FILE: src/components/EditJob.js (NEW FILE)
// ========================================================================
// This component fetches existing job data and allows a publisher to edit it.

import React, { useState, useEffect, useCallback } from 'react';

// Reusable InputIcon component
const InputIcon = ({ children }) => (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {children}
    </div>
);

// Array of Sri Lankan districts
const sriLankaDistricts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
    "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
    "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

function EditJob({ user, jobData, onJobUpdated, onBackClick }) {
    // --- Form Field States ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [jobType, setJobType] = useState('freelance');
    
    const [paymentType, setPaymentType] = useState('range');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [fixedPrice, setFixedPrice] = useState('');
    const [isNegotiable, setIsNegotiable] = useState(false);

    const [skills, setSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSingleDay, setIsSingleDay] = useState(false);

    const [workMode, setWorkMode] = useState('on-site');
    const [location, setLocation] = useState('');
    const [district, setDistrict] = useState('');
    const [applicationDeadline, setApplicationDeadline] = useState('');
    const [vacancies, setVacancies] = useState(1);
    const [workingHours, setWorkingHours] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('any');

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        // Fetch categories from the API
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://uniwiz.test/get_categories.php');
                const data = await response.json();
                if (response.ok) {
                    setCategories(data);
                }
            } catch (err) { console.error("Failed to fetch categories:", err); }
        };
        fetchCategories();
    }, []);

    // Effect to populate form when jobData is available
    useEffect(() => {
        if (jobData) {
            setTitle(jobData.title || '');
            setDescription(jobData.description || '');
            setCategoryId(jobData.category_id || '');
            setJobType(jobData.job_type || 'freelance');

            // --- Payment parsing logic ---
            const payment = jobData.payment_range || '';
            if (payment.toLowerCase() === 'negotiable') {
                setPaymentType('negotiable');
                setIsNegotiable(true);
            } else if (payment.includes('-')) {
                setPaymentType('range');
                const parts = payment.replace(/Rs.|,/g, '').split('-').map(p => p.trim());
                setPriceMin(parts[0] || '');
                setPriceMax(parts[1] || '');
            } else {
                setPaymentType('fixed');
                setFixedPrice(payment.replace(/Rs.|,/g, '').trim());
            }

            setSkills(jobData.skills_required ? jobData.skills_required.split(',').map(s => s.trim()) : []);
            setStartDate(jobData.start_date ? new Date(jobData.start_date).toISOString().split('T')[0] : '');
            setEndDate(jobData.end_date ? new Date(jobData.end_date).toISOString().split('T')[0] : '');
            setIsSingleDay(jobData.start_date && jobData.start_date === jobData.end_date);
            setWorkMode(jobData.work_mode || 'on-site');

            // --- Location and District parsing ---
            const locationString = jobData.location || '';
            const locationParts = locationString.split(',');
            if (locationParts.length > 1 && sriLankaDistricts.includes(locationParts[locationParts.length - 1].trim())) {
                setDistrict(locationParts.pop().trim());
                setLocation(locationParts.join(',').trim());
            } else {
                setLocation(locationString);
            }
            
            setApplicationDeadline(jobData.application_deadline ? new Date(jobData.application_deadline).toISOString().split('T')[0] : '');
            setVacancies(jobData.vacancies || 1);
            setWorkingHours(jobData.working_hours || '');
            setExperienceLevel(jobData.experience_level || 'any');
        }
    }, [jobData]);

    const handleSkillKeyDown = (event) => {
        if (event.key === 'Enter' && currentSkill.trim() !== '') {
            event.preventDefault();
            if (!skills.includes(currentSkill.trim().toLowerCase())) {
                setSkills([...skills, currentSkill.trim().toLowerCase()]);
            }
            setCurrentSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async (status) => {
        if ((workMode === 'on-site' || workMode === 'hybrid') && !district) {
            setError('Please select a district for on-site or hybrid jobs.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        let payment_range = '';
        if (paymentType === 'range') {
            payment_range = `Rs. ${Number(priceMin).toLocaleString()} - Rs. ${Number(priceMax).toLocaleString()}`;
        } else if (paymentType === 'fixed') {
            payment_range = `Rs. ${Number(fixedPrice).toLocaleString()}`;
        } else {
            payment_range = 'Negotiable';
        }
        
        const finalLocation = (workMode === 'on-site' || workMode === 'hybrid') 
            ? `${location}, ${district}` 
            : null;

        const updatedJobData = {
            id: jobData.id, // Important: include job ID
            publisher_id: user.id,
            category_id: categoryId,
            title,
            description,
            job_type: jobType,
            payment_range: payment_range,
            skills_required: skills.join(','),
            start_date: startDate,
            end_date: isSingleDay ? startDate : endDate,
            status: status,
            work_mode: workMode,
            location: finalLocation,
            application_deadline: applicationDeadline,
            vacancies: vacancies,
            working_hours: workingHours,
            experience_level: experienceLevel
        };

        try {
            const apiUrl = 'http://uniwiz.test/update_job.php'; // Use the update endpoint
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedJobData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update job.');

            setSuccess(result.message + " Redirecting...");
            setTimeout(() => {
                if (onJobUpdated) onJobUpdated();
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-publisher-dashboard flex justify-center items-start py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl">
                <button onClick={onBackClick} className="flex items-center text-primary-main font-semibold mb-6 hover:text-primary-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Manage Jobs
                </button>
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-primary-dark">Edit Job Posting</h2>
                    <p className="text-gray-500 mt-2">Update the details for your job posting below.</p>
                </div>
                
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    {/* All form sections from CreateJob.js should be included here */}
                    {/* ... (Copy all <div className="p-6 border rounded-xl"> sections here) ... */}

                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    {success && <p className="text-green-500 text-center mt-4">{success}</p>}
                    
                    <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-4">
                        <button type="button" onClick={() => handleSubmit('draft')} disabled={isLoading} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition duration-300 w-full md:w-auto">
                            {isLoading ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button type="button" onClick={() => handleSubmit('active')} disabled={isLoading} className="bg-primary-main hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition duration-300 w-full md:w-auto">
                            {isLoading ? 'Updating...' : 'Update Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditJob;