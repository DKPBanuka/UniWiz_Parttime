// FILE: src/components/admin/AdminSettingsPage.js

import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://uniwiz.test';

// A reusable component to manage a list (Skills or Categories)
const ListManager = ({ title, apiEndpoint }) => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');

    const fetchData = async () => {
        const response = await fetch(`${API_BASE_URL}/${apiEndpoint}`);
        const data = await response.json();
        setItems(data);
    };

    useEffect(() => {
        fetchData();
    }, [apiEndpoint]);

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
                {items.map(item => (
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

function AdminSettingsPage() {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-primary-dark mb-8">Platform Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ListManager title="Job Categories" apiEndpoint="manage_categories_admin.php" />
                <ListManager title="Skills" apiEndpoint="manage_skills_admin.php" />
            </div>
        </div>
    );
}

export default AdminSettingsPage;