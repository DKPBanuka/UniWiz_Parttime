// FILE: src/components/CreateJob.js (ENHANCED with all fields)
// ========================================================================

import React, { useState, useEffect } from 'react';

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
        if (!title || !description || !categoryId) {
            setError('Please fill in all required fields: Title, Description, and Category.');
            return;
        }

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
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="title">Job Title</label>
                                <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Part-time Graphic Designer" className="shadow-sm border rounded w-full py-3 px-4" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="description">Job Description</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the responsibilities, requirements, and any other details..." rows="6" className="shadow-sm border rounded w-full py-3 px-4" required></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="category">Category</label>
                                    <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="shadow-sm bg-white border rounded w-full py-3 px-4" required>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="job-type">Job Type</label>
                                    <select id="job-type" value={jobType} onChange={(e) => setJobType(e.target.value)} className="shadow-sm bg-white border rounded w-full py-3 px-4">
                                        <option value="part-time">Part-time</option>
                                        <option value="freelance">Freelance</option>
                                        <option value="task-based">Task-based</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Logistics Section */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Payment Type</label>
                                <div className="flex items-center space-x-4">
                                    <label><input type="radio" name="paymentType" value="range" checked={paymentType === 'range'} onChange={(e) => setPaymentType(e.target.value)} /> Range</label>
                                    <label><input type="radio" name="paymentType" value="fixed" checked={paymentType === 'fixed'} onChange={(e) => setPaymentType(e.target.value)} /> Fixed</label>
                                    <label><input type="radio" name="paymentType" value="negotiable" checked={paymentType === 'negotiable'} onChange={(e) => setPaymentType(e.target.value)} /> Negotiable</label>
                                </div>
                            </div>
                            {paymentType === 'range' && (
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min Price (Rs.)" className="shadow-sm border rounded py-3 px-4" />
                                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max Price (Rs.)" className="shadow-sm border rounded py-3 px-4" />
                                </div>
                            )}
                            {paymentType === 'fixed' && (
                                <div className="md:col-span-2">
                                    <input type="number" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} placeholder="Fixed Price (Rs.)" className="shadow-sm border rounded w-full py-3 px-4" />
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="skills">Required Skills</label>
                                <div className="flex flex-wrap gap-2 items-center p-2 border rounded-lg">
                                    {skills.map((skill, index) => (
                                        <div key={index} className="flex items-center bg-primary-lighter text-primary-dark px-3 py-1 rounded-full text-sm">
                                            <span>{skill}</span>
                                            <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-primary-dark hover:text-red-500">&times;</button>
                                        </div>
                                    ))}
                                    <input id="skills" type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Type a skill and press Enter" className="flex-grow p-1 outline-none" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="vacancies">Number of Vacancies</label>
                                <input id="vacancies" type="number" min="1" value={vacancies} onChange={(e) => setVacancies(e.target.value)} className="shadow-sm border rounded w-full py-3 px-4" />
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="experience">Experience Level</label>
                                <select id="experience" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="shadow-sm bg-white border rounded w-full py-3 px-4">
                                    <option value="any">Any</option>
                                    <option value="entry-level">Entry-level</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2">Job Duration</label>
                                <div className="flex items-center space-x-4">
                                    <input type="date" name="start_date" value={startDate} onChange={e => setStartDate(e.target.value)} className="shadow-sm border rounded py-3 px-4 text-gray-500"/>
                                    {!isSingleDay && <span>to</span>}
                                    {!isSingleDay && <input type="date" name="end_date" value={endDate} onChange={e => setEndDate(e.target.value)} className="shadow-sm border rounded py-3 px-4 text-gray-500"/>}
                                    <label><input type="checkbox" checked={isSingleDay} onChange={(e) => setIsSingleDay(e.target.checked)} className="mr-2"/> Single Day Job</label>
                                </div>
                            </div>
                        </div>
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