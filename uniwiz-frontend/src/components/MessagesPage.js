// FILE: src/components/MessagesPage.js (ENHANCED with New UI/UX)
// =================================================================
// This component serves as the main layout for the messaging feature,
// now with a more compact and theme-based design.

import React, { useState, useEffect, useCallback } from 'react';
import ChatWindow from './ChatWindow'; // We will create this component next

const API_BASE_URL = 'http://uniwiz.test';

// Enhanced ConversationItem with better styling and theme colors
const ConversationItem = ({ conversation, onSelect, isActive, userRole }) => {
    const activeBgColor = {
        student: 'bg-blue-100',
        publisher: 'bg-primary-lighter',
        admin: 'bg-green-100',
    }[userRole] || 'bg-gray-100';

    const unreadIndicatorColor = {
        student: 'bg-blue-500',
        publisher: 'bg-primary-main',
        admin: 'bg-green-500',
    }[userRole] || 'bg-red-500';

    return (
        <button 
            onClick={() => onSelect(conversation)}
            className={`w-full text-left p-3 flex items-center space-x-4 transition-colors duration-200 border-b border-gray-100 ${isActive ? activeBgColor : 'hover:bg-gray-50'}`}
        >
            <div className="relative flex-shrink-0">
                <img 
                    src={conversation.profile_image_url ? `${API_BASE_URL}/${conversation.profile_image_url}` : `https://placehold.co/48x48/E8EAF6/211C84?text=${(conversation.first_name || 'U').charAt(0)}`}
                    alt="profile"
                    className="h-12 w-12 rounded-full object-cover"
                />
                {/* Online status indicator (optional feature) */}
                {/* <span className="absolute bottom-0 right-0 block h-3 w-3 bg-green-400 rounded-full ring-2 ring-white"></span> */}
            </div>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-800 truncate">{conversation.company_name || `${conversation.first_name} ${conversation.last_name}`}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{new Date(conversation.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate">{conversation.last_message || 'No messages yet.'}</p>
                    {conversation.unread_count > 0 && (
                        <span className={`text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${unreadIndicatorColor}`}>
                            {conversation.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};


function MessagesPage({ user, setPage }) {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        // Don't set loading to true on interval fetches to avoid UI flicker
        // setIsLoading(true); 
        try {
            const response = await fetch(`${API_BASE_URL}/get_conversations.php?user_id=${user.id}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch conversations.');
            setConversations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 15000); // Poll for new conversations/messages every 15 seconds
        return () => clearInterval(interval);
    }, [fetchConversations]);

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setConversations(prev => prev.map(c => 
            c.conversation_id === conversation.conversation_id ? { ...c, unread_count: 0 } : c
        ));
    };
    
    const bgColor = {
        student: 'bg-gray-50',
        publisher: 'bg-bg-publisher-dashboard',
        admin: 'bg-gray-50',
    }[user.role] || 'bg-gray-50';

    return (
        <div className={`p-4 md:p-8 min-h-screen ${bgColor}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">Messages</h1>
                    <button onClick={() => setPage('home')} className="font-semibold text-primary-main hover:underline flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] flex overflow-hidden border">
                    {/* Left Panel: Conversations List */}
                    <div className="w-full md:w-1/3 border-r flex-col md:flex">
                        <div className="p-4 border-b">
                            <input type="text" placeholder="Search chats..." className="w-full p-2 border rounded-lg text-sm" />
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {isLoading && conversations.length === 0 ? (
                                <p className="p-4 text-gray-500">Loading conversations...</p>
                            ) : error ? (
                                <p className="p-4 text-red-500">{error}</p>
                            ) : conversations.length > 0 ? (
                                conversations.map(convo => (
                                    <ConversationItem 
                                        key={convo.conversation_id}
                                        conversation={convo}
                                        onSelect={handleSelectConversation}
                                        isActive={selectedConversation?.conversation_id === convo.conversation_id}
                                        userRole={user.role}
                                    />
                                ))
                            ) : (
                                <p className="p-4 text-center text-gray-500 mt-10">You have no active conversations.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Chat Window */}
                    <div className={`w-2/3 flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                        {selectedConversation ? (
                            <ChatWindow 
                                key={selectedConversation.conversation_id}
                                conversation={selectedConversation}
                                currentUser={user}
                            />
                        ) : (
                            <div className="flex-grow flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-700">Select a conversation</h3>
                                    <p className="text-gray-500">Choose a chat from the left to start messaging.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessagesPage;
