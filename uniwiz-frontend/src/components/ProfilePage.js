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

function ProfilePage({ user, onProfileUpdate }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        company_name: '', // For publishers
        // Student-specific fields
        university_name: '',
        field_of_study: '',
        year_of_study: '',
        languages_spoken: '', // Will be a comma-separated string
        preferred_categories: '', // Will be a comma-separated string
        skills: '', // Will be a comma-separated string
    });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });
    
    const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const profilePictureInputRef = useRef();

    const [selectedCV, setSelectedCV] = useState(null);
    const cvInputRef = useRef();


    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                company_name: user.company_name || '',
                // Initialize student-specific fields
                university_name: user.university_name || '',
                field_of_study: user.field_of_study || '',
                year_of_study: user.year_of_study || '',
                languages_spoken: user.languages_spoken || '',
                preferred_categories: user.preferred_categories || '',
                skills: user.skills || '',
            });
            setProfilePicturePreview(user.profile_image_url ? `http://uniwiz.test/${user.profile_image_url}` : null);
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
                // Clear the input field to allow re-selection
                e.target.value = null; 
                setSelectedProfilePicture(null);
                setProfilePicturePreview(null);
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
                showNotification("Invalid file type. Only PDF files are allowed for CV.", "error");
                // Clear the input field to allow re-selection
                e.target.value = null; 
                setSelectedCV(null);
                return;
            }
            if (file.size > 5242880) { // 5MB
                showNotification("CV file is too large. Maximum size is 5MB.", "error");
                // Clear the input field to allow re-selection
                e.target.value = null; 
                setSelectedCV(null);
                return;
            }
            setSelectedCV(file);
        }
    };

    // **FIXED**: Refactored handleSubmit for correct sequential updates
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Start with a copy of the current user data from props
            let currentUpdatedUserData = { ...user };

            // --- Step 1: Update text fields (common and role-specific) ---
            const textPayload = { user_id: user.id, ...formData };
            if (user.role !== 'publisher') {
                delete textPayload.company_name;
            }
            if (user.role !== 'student') {
                delete textPayload.university_name;
                delete textPayload.field_of_study;
                delete textPayload.year_of_study;
                delete textPayload.languages_spoken;
                delete textPayload.preferred_categories;
                delete textPayload.skills;
            }

            const textResponse = await fetch('http://uniwiz.test/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(textPayload),
            });
            const textResult = await textResponse.json();
            if (!textResult.ok) {
                // If text update fails, show error and stop
                throw new Error(textResult.message || 'Failed to update text profile data.');
            }
            
            // Merge text updates into currentUpdatedUserData
            currentUpdatedUserData = { ...currentUpdatedUserData, ...textResult.user };


            // --- Step 2: If a profile picture is selected, upload it now ---
            if (selectedProfilePicture) {
                const uploadData = new FormData();
                uploadData.append('user_id', user.id);
                uploadData.append('profile_picture', selectedProfilePicture);

                const picResponse = await fetch('http://uniwiz.test/upload_profile_picture.php', {
                    method: 'POST',
                    body: uploadData,
                });
                const picResult = await picResponse.json();
                if (!picResult.ok) {
                    // If picture upload fails, show error and stop
                    throw new Error(picResult.message || 'Failed to upload profile picture.');
                }
                
                // Merge picture updates
                currentUpdatedUserData = { ...currentUpdatedUserData, ...picResult.user };
            }

            // --- Step 3: If a CV file is selected, upload it now (only for students) ---
            if (user.role === 'student' && selectedCV) {
                const cvUploadData = new FormData();
                cvUploadData.append('user_id', user.id);
                cvUploadData.append('cv_file', selectedCV);

                const cvResponse = await fetch('http://uniwiz.test/upload_cv.php', {
                    method: 'POST',
                    body: cvUploadData,
                });
                const cvResult = await cvResponse.json();
                if (!cvResult.ok) {
                    // If CV upload fails, show error and stop
                    throw new Error(cvResult.message || 'Failed to upload CV.');
                }

                currentUpdatedUserData = { ...currentUpdatedUserData, ...cvResult.user };
            }

            // Call onProfileUpdate ONCE with the final, merged user data
            onProfileUpdate(currentUpdatedUserData);

            showNotification("Profile updated successfully!", 'success');
            setSelectedProfilePicture(null); // Reset file selection after successful submission
            setSelectedCV(null); // Reset CV file selection

        } catch (err) {
            // Catch any error from any step and display it
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
            <div className="p-8 bg-bg-student-dashboard min-h-screen text-gray-800"> {/* Use student dashboard background */}
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-primary-dark">My Profile</h2> {/* Use primary-dark for heading */}
                        <p className="text-gray-600 mt-1">Manage your personal and company information.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md">
                        {/* Profile Picture Section */}
                        <div className="flex items-center space-x-6 mb-8">
                            <img 
                                src={profilePicturePreview || 'https://placehold.co/100x100/B5A8D5/211C84?text=P'} 
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
                            {/* Personal Information Section (Common for both roles) */}
                            <div>
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
                                        <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Company Information Section (Publisher Specific) */}
                            {user.role === 'publisher' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-primary-dark mb-4 border-b pb-2">Company Information</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                    </div>
                                </div>
                            )}

                            {/* Educational & Professional Information Section (Student Specific) */}
                            {user.role === 'student' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-primary-dark mb-4 border-b pb-2">Educational & Professional Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="university_name">University/Institution</label>
                                            <input type="text" name="university_name" id="university_name" value={formData.university_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="field_of_study">Field of Study</label>
                                            <input type="text" name="field_of_study" id="field_of_study" value={formData.field_of_study} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="year_of_study">Year of Study</label>
                                            <select name="year_of_study" id="year_of_study" value={formData.year_of_study} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white">
                                                <option value="">Select Year</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                                <option value="Graduate">Graduate</option>
                                                <option value="Postgraduate">Postgraduate</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="languages_spoken">Languages Spoken (comma-separated)</label>
                                            <input type="text" name="languages_spoken" id="languages_spoken" value={formData.languages_spoken} onChange={handleChange} placeholder="e.g., Sinhala, English, Tamil" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="skills">Skills (comma-separated)</label>
                                            <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., Web Development, Graphic Design, Marketing" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="preferred_categories">Preferred Job Categories (comma-separated IDs)</label>
                                            <input type="text" name="preferred_categories" id="preferred_categories" value={formData.preferred_categories} onChange={handleChange} placeholder="e.g., 1,5,7 (Category IDs)" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                        </div>

                                        {/* CV Upload Section */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Upload CV (PDF only, max 5MB)</label>
                                            <input 
                                                type="file" 
                                                ref={cvInputRef} 
                                                onChange={handleCVChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-lighter file:text-primary-dark hover:file:bg-primary-light"
                                                accept="application/pdf"
                                            />
                                            {user.cv_url && (
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Current CV: <a href={`http://uniwiz.test/${user.cv_url}`} target="_blank" rel="noopener noreferrer" className="text-primary-main hover:underline">View Current CV</a>
                                                    {selectedCV && <span className="ml-2 text-primary-dark"> (New CV selected: {selectedCV.name})</span>} {/* Added selectedCV.name */}
                                                </p>
                                            )}
                                            {!user.cv_url && selectedCV && (
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
