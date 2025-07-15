// FILE: src/components/CreateJob.js (Final Advanced Version with Date Range)
// ========================================================================

import React, { useState, useEffect } from 'react';

const InputIcon = ({ children }) => (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {children}
    </div>
);

function CreateJob({ user, onJobPosted }) {
    // --- State for Form Fields ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [jobType, setJobType] = useState('freelance');
    const [paymentRange, setPaymentRange] = useState('');
    const [skills, setSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- Other states ---
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

    // --- Form Submission Handler ---
    const handleSubmit = async (status) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const jobData = {
            publisher_id: user.id,
            category_id: categoryId,
            title,
            description,
            job_type: jobType,
            payment_range: paymentRange,
            skills_required: skills.join(','), // **FIX**: Ensure skills are joined to a string
            start_date: startDate,
            end_date: endDate,
            status: status,
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

            setSuccess(result.message + " Redirecting to dashboard...");
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
        <div className="min-h-screen bg-[#F4F7FC] flex justify-center items-start py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-[#2D336B]">Create a New Job Posting</h2>
                    <p className="text-gray-500 mt-2">Fill in the details below to find the perfect student for your job.</p>
                </div>
                
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    {/* --- Section 1: Core Details --- */}
                    <div className="p-6 border rounded-xl">
                        <h3 className="text-xl font-semibold text-[#2D336B] mb-4">Core Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="title">Job Title</label>
                                <div className="relative">
                                    <InputIcon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></InputIcon>
                                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="pl-10 shadow-sm border rounded w-full py-3 px-4" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="category">Category</label>
                                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="shadow-sm bg-white border rounded w-full py-3 px-4" required>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="job-type">Job Type</label>
                                <select id="job-type" value={jobType} onChange={(e) => setJobType(e.target.value)} className="shadow-sm bg-white border rounded w-full py-3 px-4" required>
                                    <option value="freelance">Freelance</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="internship">Internship</option>
                                    <option value="task-based">Task-based</option>
                                    <option value="full-time">Full-time</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="description">Job Description</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="shadow-sm border rounded w-full py-3 px-4 h-36" required />
                            </div>
                        </div>
                    </div>

                    {/* --- Section 2: Specifics --- */}
                    <div className="p-6 border rounded-xl">
                         <h3 className="text-xl font-semibold text-[#2D336B] mb-4">Specifics</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="payment">Payment / Salary</label>
                                <input id="payment" type="text" value={paymentRange} onChange={(e) => setPaymentRange(e.target.value)} placeholder="e.g., Rs. 20,000 per month" className="shadow-sm border rounded w-full py-3 px-4" required />
                            </div>
                            
                            {/* --- NEW: Date Range Pickers --- */}
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2">Job Duration (Optional)</label>
                                <div className="flex items-center space-x-4">
                                    <input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="shadow-sm border rounded w-full py-3 px-4 text-gray-500" />
                                    <span className="text-gray-500 font-semibold">to</span>
                                    <input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="shadow-sm border rounded w-full py-3 px-4 text-gray-500" />
                                </div>
                            </div>

                             <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="skills">Required Skills (Press Enter to add)</label>
                                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg shadow-sm">
                                    {skills.map((skill, index) => (
                                        <div key={index} className="flex items-center bg-[#A9B5DF] text-[#2D336B] text-sm font-semibold px-3 py-1 rounded-full capitalize">
                                            <span>{skill}</span>
                                            <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-red-700 hover:text-red-900 font-bold">×</button>
                                        </div>
                                    ))}
                                    <input id="skills" type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown} className="flex-grow bg-transparent focus:outline-none p-1" placeholder="Type a skill and press Enter" />
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
                        <button type="button" onClick={() => handleSubmit('active')} disabled={isLoading} className="bg-[#7886C7] hover:bg-[#2D336B] text-white font-bold py-3 px-8 rounded-lg transition duration-300 w-full md:w-auto">
                            {isLoading ? 'Posting...' : 'Post Job Live'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateJob;
