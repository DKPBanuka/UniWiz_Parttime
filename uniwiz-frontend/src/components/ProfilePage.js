
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
        company_name: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '', key: 0 });
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef();

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                company_name: user.company_name || '',
            });
            setPreview(user.profile_image_url ? `http://uniwiz.test/${user.profile_image_url}` : null);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, key: Date.now() });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2097152) { // 2MB
                showNotification("File is too large. Maximum size is 2MB.", "error");
                return;
            }
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // **FIXED**: Refactored handleSubmit for correct sequential updates
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // --- Step 1: Update text fields first ---
            const textPayload = { user_id: user.id, ...formData };
            if (user.role !== 'publisher') {
                delete textPayload.company_name;
            }

            const textResponse = await fetch('http://uniwiz.test/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(textPayload),
            });
            const textResult = await textResponse.json();
            if (!textResponse.ok) throw new Error(textResult.message);
            
            // Immediately update the user state with text changes
            let latestUserData = textResult.user;
            onProfileUpdate(latestUserData);
            
            // --- Step 2: If a file is selected, upload it now ---
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('user_id', user.id);
                uploadData.append('profile_picture', selectedFile);

                const picResponse = await fetch('http://uniwiz.test/upload_profile_picture.php', {
                    method: 'POST',
                    body: uploadData,
                });
                const picResult = await picResponse.json();
                if (!picResponse.ok) throw new Error(picResult.message);
                
                // This is the final, most up-to-date user object
                latestUserData = picResult.user;
                onProfileUpdate(latestUserData);
            }

            showNotification("Profile updated successfully!", 'success');
            setSelectedFile(null); // Reset file selection after successful submission

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
            <div className="p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-gray-800">My Profile</h2>
                        <p className="text-gray-500 mt-1">Manage your personal and company information.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md">
                        <div className="flex items-center space-x-6 mb-8">
                            <img 
                                src={preview || 'https://placehold.co/100x100/E8EAF6/2D336B?text=P'} 
                                alt="Profile" 
                                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                            />
                            <div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current.click()}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Change Picture
                                </button>
                                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold text-[#2D336B] mb-4 border-b pb-2">Personal Information</h3>
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

                            {user.role === 'publisher' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-[#2D336B] mb-4 border-b pb-2">Company Information</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-8">
                            <button type="submit" disabled={isLoading} className="px-6 py-3 bg-[#7886C7] text-white font-bold rounded-lg hover:bg-[#2D336B] transition duration-300 disabled:bg-gray-400">
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