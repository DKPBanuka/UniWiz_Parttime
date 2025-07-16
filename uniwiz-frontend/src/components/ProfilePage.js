// FILE: src/components/ProfilePage.js (ENHANCED with Suggestions)
// =================================================================
// This version adds clickable suggestions for skills and categories for students.

import React, { useState, useEffect, useRef } from 'react';

// Reusable Notification Component
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-all";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-500'}`}>
            {message}
        </div>
    );
};

// **NEW**: Reusable component for showing suggestions
const Suggestions = ({ title, suggestions, onSelect }) => (
    <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
            {suggestions.map((item, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-lighter hover:text-primary-dark transition-colors"
                >
                    + {item}
                </button>
            ))}
        </div>
    </div>
);


function ProfilePage({ user, onProfileUpdate }) {
    const [formData, setFormData] = useState({
        // Common fields
        first_name: '',
        last_name: '',
        // Publisher-specific fields
        company_name: '',
        about: '',
        industry: '',
        website_url: '',
        address: '',
        phone_number: '',
        facebook_url: '',
        linkedin_url: '',
        instagram_url: '',
        // Student-specific fields
        university_name: '',
        field_of_study: '',
        year_of_study: '',
        languages_spoken: '',
        preferred_categories: '',
        skills: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });
    
    const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const profilePictureInputRef = useRef();

    const [selectedCV, setSelectedCV] = useState(null);
    const cvInputRef = useRef();

    // **NEW**: State for suggestions
    const [allCategories, setAllCategories] = useState([]);
    const commonSkills = [
        'Web Development', 'Graphic Design', 'Content Writing', 'Social Media', 'Data Entry',
        'Tutoring', 'Event Management', 'Customer Service', 'Video Editing', 'MS Office'
    ];


    useEffect(() => {
        if (user) {
            setFormData({
                // Common
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                // Publisher
                company_name: user.company_name || '',
                about: user.about || '',
                industry: user.industry || '',
                website_url: user.website_url || '',
                address: user.address || '',
                phone_number: user.phone_number || '',
                facebook_url: user.facebook_url || '',
                linkedin_url: user.linkedin_url || '',
                instagram_url: user.instagram_url || '',
                // Student
                university_name: user.university_name || '',
                field_of_study: user.field_of_study || '',
                year_of_study: user.year_of_study || '',
                languages_spoken: user.languages_spoken || '',
                preferred_categories: user.preferred_categories || '',
                skills: user.skills || '',
            });
            setProfilePicturePreview(user.profile_image_url ? `http://uniwiz.test/${user.profile_image_url}` : null);
        }

        // **NEW**: Fetch categories if user is a student
        if (user && user.role === 'student') {
            const fetchCategories = async () => {
                try {
                    const response = await fetch('http://uniwiz.test/get_categories.php');
                    const data = await response.json();
                    if (response.ok) {
                        setAllCategories(data.map(cat => cat.name));
                    }
                } catch (err) {
                    console.error("Failed to fetch categories:", err);
                }
            };
            fetchCategories();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    const handleProfilePictureChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2097152) { // 2MB
                showNotification("File is too large. Maximum size is 2MB.", "error");
                e.target.value = null; 
                return;
            }
            setSelectedProfilePicture(file);
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const handleCVChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                showNotification("Invalid file type. Only PDF files are allowed.", "error");
                e.target.value = null;
                return;
            }
            if (file.size > 5242880) { // 5MB
                showNotification("CV file is too large. Maximum size is 5MB.", "error");
                e.target.value = null;
                return;
            }
            setSelectedCV(file);
        }
    };
    
    // **NEW**: Function to handle adding suggestions to text fields
    const handleSuggestionSelect = (fieldName, value) => {
        setFormData(prevData => {
            const currentValues = prevData[fieldName] 
                ? prevData[fieldName].split(',').map(s => s.trim()) 
                : [];
            
            // Check for duplicates (case-insensitive)
            if (!currentValues.some(v => v.toLowerCase() === value.toLowerCase())) {
                const newValues = [...currentValues, value];
                return { ...prevData, [fieldName]: newValues.join(', ') };
            }
            return prevData; // Return previous data if value already exists
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const submissionData = new FormData();
        
        submissionData.append('user_id', user.id);
        for (const key in formData) {
            submissionData.append(key, formData[key]);
        }

        if (selectedProfilePicture) {
            submissionData.append('profile_picture', selectedProfilePicture);
        }
        if (user.role === 'student' && selectedCV) {
            submissionData.append('cv_file', selectedCV);
        }

        try {
            const response = await fetch('http://uniwiz.test/update_profile.php', {
                method: 'POST',
                body: submissionData,
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'An unknown error occurred.');
            }

            onProfileUpdate(result.user);
            showNotification("Profile updated successfully!", 'success');
            
            setSelectedProfilePicture(null);
            setSelectedCV(null);
            if(profilePictureInputRef.current) profilePictureInputRef.current.value = "";
            if(cvInputRef.current) cvInputRef.current.value = "";


        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div className="p-8">Loading profile...</div>;
    }

    return (
        <>
            {notification.message && (
                <Notification 
                    key={notification.key}
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification({ message: '', type: '', key: 0 })}
                />
            )}
            <div className={`p-8 min-h-screen text-gray-800 ${user.role === 'publisher' ? 'bg-bg-publisher-dashboard' : 'bg-bg-student-dashboard'}`}>
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-primary-dark">My Profile</h2>
                        <p className="text-gray-600 mt-1">Manage your personal and professional information.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md">
                        <div className="flex items-center space-x-6 mb-8">
                            <img 
                                src={profilePicturePreview || `https://placehold.co/100x100/E8EAF6/211C84?text=${user.first_name.charAt(0)}`} 
                                alt="Profile" 
                                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                            />
                            <div>
                                <input 
                                    type="file" 
                                    ref={profilePictureInputRef} 
                                    onChange={handleProfilePictureChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => profilePictureInputRef.current.click()}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Change Picture
                                </button>
                                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Personal Information Section */}
                            <div className="p-6 border rounded-xl">
                                <h3 className="text-xl font-semibold text-primary-dark mb-4 border-b pb-2">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" value={user.email} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100" disabled />
                                    </div>
                                </div>
                            </div>

                            {/* Company Information Section (Publisher) */}
                            {user.role === 'publisher' && (
                                <div className="p-6 border rounded-xl">
                                    <h3 className="text-xl font-semibold text-primary-dark mb-4 border-b pb-2">Company Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Industry</label>
                                            <input type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g., IT, Hospitality" className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">About Your Company</label>
                                            <textarea name="about" value={formData.about} onChange={handleChange} rows="4" className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                            <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://example.com" className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <h4 className="md:col-span-2 text-lg font-semibold text-gray-700 mt-4">Social Media Links</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
                                            <input type="url" name="facebook_url" value={formData.facebook_url} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                                            <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                                            <input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Educational & Professional Info (Student) */}
                            {user.role === 'student' && (
                                <div className="p-6 border rounded-xl">
                                    <h3 className="text-xl font-semibold text-primary-dark mb-4 border-b pb-2">Educational & Professional Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">University/Institution</label>
                                            <input type="text" name="university_name" value={formData.university_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                                            <input type="text" name="field_of_study" value={formData.field_of_study} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                                            <select name="year_of_study" value={formData.year_of_study} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                                                <option value="">Select Year</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                                <option value="Graduate">Graduate</option>
                                                <option value="Postgraduate">Postgraduate</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Languages Spoken</label>
                                            <input type="text" name="languages_spoken" value={formData.languages_spoken} placeholder="e.g., Sinhala, English" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                        {/* **UPDATED**: Skills with Suggestions */}
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">Skills</label>
                                            <input type="text" name="skills" value={formData.skills} placeholder="e.g., Web Development, Graphic Design" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                            <Suggestions 
                                                title="Suggestions:"
                                                suggestions={commonSkills}
                                                onSelect={(skill) => handleSuggestionSelect('skills', skill)}
                                            />
                                        </div>
                                        {/* **UPDATED**: Categories with Suggestions */}
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">Preferred Job Categories</label>
                                            <input type="text" name="preferred_categories" value={formData.preferred_categories} placeholder="e.g., Event, IT" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                            <Suggestions 
                                                title="Suggestions:"
                                                suggestions={allCategories}
                                                onSelect={(category) => handleSuggestionSelect('preferred_categories', category)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Upload CV (PDF only, max 5MB)</label>
                                            <input 
                                                type="file" 
                                                ref={cvInputRef} 
                                                onChange={handleCVChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-lighter file:text-primary-dark hover:file:bg-primary-light"
                                                accept="application/pdf"
                                            />
                                            {user.cv_url && !selectedCV && (
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Current CV: <a href={`http://uniwiz.test/${user.cv_url}`} target="_blank" rel="noopener noreferrer" className="text-primary-main hover:underline">View Current CV</a>
                                                </p>
                                            )}
                                            {selectedCV && (
                                                 <p className="mt-2 text-sm text-primary-dark">New CV selected: {selectedCV.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-8">
                            <button type="submit" disabled={isLoading} className="px-6 py-3 bg-primary-main text-white font-bold rounded-lg hover:bg-primary-dark transition duration-300 disabled:bg-gray-400">
                                {isLoading ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;
