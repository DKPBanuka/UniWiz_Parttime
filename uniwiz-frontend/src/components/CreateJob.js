// FILE: src/components/CreateJob.js (UPDATED with District Selection)
// ========================================================================

import React, { useState, useEffect } from 'react';

const InputIcon = ({ children }) => (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {children}
    </div>
);

// NEW: Array of Sri Lankan districts
const sriLankaDistricts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
    "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
    "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
    "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];


function CreateJob({ user, onJobPosted }) {
    // --- Form Field States ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [jobType, setJobType] = useState('freelance');
    
    const [paymentType, setPaymentType] = useState('range');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [fixedPrice, setFixedPrice] = useState('');

    const [skills, setSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSingleDay, setIsSingleDay] = useState(false);

    const [workMode, setWorkMode] = useState('on-site');
    const [location, setLocation] = useState('');
    const [district, setDistrict] = useState(''); // NEW: State for district
    const [applicationDeadline, setApplicationDeadline] = useState('');
    const [vacancies, setVacancies] = useState(1);
    const [workingHours, setWorkingHours] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('any');

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://uniwiz.test/get_categories.php');
                const data = await response.json();
                if (response.ok) {
                    setCategories(data);
                    if (data.length > 0) setCategoryId(data[0].id);
                }
            } catch (err) { console.error("Failed to fetch categories:", err); }
        };
        fetchCategories();
    }, []);

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
        // Validation for on-site/hybrid jobs
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
        } else {
            payment_range = `Rs. ${Number(fixedPrice).toLocaleString()}`;
        }
        
        // NEW: Combine specific location and district
        const finalLocation = (workMode === 'on-site' || workMode === 'hybrid') 
            ? `${location}, ${district}` 
            : null;

        const jobData = {
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
            const apiUrl = 'http://uniwiz.test/create_job.php';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save job.');

            setSuccess(result.message + " Redirecting...");
            setTimeout(() => {
                if (onJobPosted) onJobPosted();
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
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-primary-dark">Create a New Job Posting</h2>
                    <p className="text-gray-500 mt-2">Fill in the details below to find the perfect student.</p>
                </div>
                
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    {/* Core Details Section */}
                    <div className="p-6 border rounded-xl">
                        <h3 className="text-xl font-semibold text-primary-dark mb-4">Core Details</h3>
                        {/* ... other core fields ... */}
                    </div>

                    {/* Job Logistics Section (UPDATED) */}
                    <div className="p-6 border rounded-xl">
                         <h3 className="text-xl font-semibold text-primary-dark mb-4">Job Logistics</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="work-mode">Work Mode</label>
                                <select id="work-mode" value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="shadow-sm bg-white border rounded w-full py-3 px-4">
                                    <option value="on-site">On-site</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                            {/* NEW: Conditional District and Location fields */}
                            {workMode !== 'remote' && (
                                <>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="district">District</label>
                                        <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} className="shadow-sm bg-white border rounded w-full py-3 px-4" required>
                                            <option value="">Select a District</option>
                                            {sriLankaDistricts.sort().map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="location">Specific Location / Address</label>
                                        <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Town Hall, Colombo 07" className="shadow-sm border rounded w-full py-3 px-4" />
                                    </div>
                                </>
                            )}
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="application-deadline">Application Deadline</label>
                                <input id="application-deadline" type="date" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} className="shadow-sm border rounded w-full py-3 px-4 text-gray-500" />
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="working-hours">Working Hours</label>
                                <input id="working-hours" type="text" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="e.g., 20 hours/week" className="shadow-sm border rounded w-full py-3 px-4" />
                            </div>
                         </div>
                    </div>

                    {/* Specifics Section */}
                    <div className="p-6 border rounded-xl">
                         <h3 className="text-xl font-semibold text-primary-dark mb-4">Specifics</h3>
                         {/* ... all other specifics fields ... */}
                    </div>

                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    {success && <p className="text-green-500 text-center mt-4">{success}</p>}
                    
                    <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-4">
                        <button type="button" onClick={() => handleSubmit('draft')} disabled={isLoading} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition duration-300 w-full md:w-auto">
                            {isLoading ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button type="button" onClick={() => handleSubmit('active')} disabled={isLoading} className="bg-primary-main hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition duration-300 w-full md:w-auto">
                            {isLoading ? 'Posting...' : 'Post Job Live'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateJob;
