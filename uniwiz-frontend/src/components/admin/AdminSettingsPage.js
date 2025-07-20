import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost/UniWiz_Parttime/uniwiz-backend/api';

// Reusable component to manage a list (Skills or Categories)
const ListManager = ({ title, apiEndpoint }) => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/${apiEndpoint}`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error(`Failed to fetch ${title}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint, title]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = async () => {
        if (!newItem.trim()) return;
        await fetch(`${API_BASE_URL}/${apiEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newItem }),
        });
        setNewItem('');
        fetchData(); // Refresh list
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await fetch(`${API_BASE_URL}/${apiEndpoint}?id=${id}`, { method: 'DELETE' });
            fetchData(); // Refresh list
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-primary-dark mb-4">{title}</h3>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder={`New ${title.slice(0, -1)}`}
                />
                <button onClick={handleAdd} className="bg-primary-main text-white px-4 py-2 rounded-md hover:bg-primary-dark">Add</button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {isLoading ? <p>Loading...</p> : items.map(item => (
                    <li key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <span>{item.name}</span>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-bold">
                            &times;
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// NEW: Component to manage Footer Links
const FooterManager = ({ user }) => {
    const [footerLinks, setFooterLinks] = useState({ support: [], company: [], connect: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchFooterLinks = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/get_site_settings.php`);
            const data = await response.json();
            if (response.ok) {
                setFooterLinks(data);
            } else {
                throw new Error("Failed to fetch footer links.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFooterLinks();
    }, [fetchFooterLinks]);

    const handleInputChange = (category, index, field, value) => {
        const updatedLinks = { ...footerLinks };
        updatedLinks[category][index][field] = value;
        setFooterLinks(updatedLinks);
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`${API_BASE_URL}/update_site_settings.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_id: user.id,
                    settings_value: footerLinks
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            setSuccess(result.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="bg-white p-6 rounded-xl shadow-md"><p>Loading Footer Settings...</p></div>;

    return (
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-primary-dark mb-4">Footer Link Management</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(footerLinks).map(category => (
                    <div key={category}>
                        <h4 className="font-semibold capitalize mb-2 text-gray-700">{category}</h4>
                        <div className="space-y-3">
                            {footerLinks[category].map((link, index) => (
                                <div key={index} className="space-y-1 p-2 border rounded-md bg-gray-50">
                                    <input
                                        type="text"
                                        value={link.text}
                                        onChange={(e) => handleInputChange(category, index, 'text', e.target.value)}
                                        placeholder="Link Text"
                                        className="w-full p-1 border rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={link.url}
                                        onChange={(e) => handleInputChange(category, index, 'url', e.target.value)}
                                        placeholder="URL"
                                        className="w-full p-1 border rounded-md text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={handleSave} disabled={isLoading} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                    {isLoading ? 'Saving...' : 'Save Footer Links'}
                </button>
            </div>
        </div>
    );
};


function AdminSettingsPage({ user }) { // Pass user prop
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-primary-dark mb-8">Platform Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ListManager title="Job Categories" apiEndpoint="manage_categories_admin.php" />
                <ListManager title="Skills" apiEndpoint="manage_skills_admin.php" />
                {/* Add the new FooterManager component */}
                <FooterManager user={user} />
            </div>
        </div>
    );
}

export default AdminSettingsPage;
