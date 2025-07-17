// FILE: src/components/ChatWindow.js (ENHANCED with New UI/UX)
// =================================================================
// This component displays the messages for a selected conversation,
// with improved styling and role-based theme colors.

import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = 'http://uniwiz.test';

function ChatWindow({ conversation, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/get_messages.php?conversation_id=${conversation.conversation_id}&user_id=${currentUser.id}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch messages.');
            setMessages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [conversation.conversation_id, currentUser.id]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll for new messages every 5 seconds
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const optimisticMessage = {
            id: 'temp-' + Date.now(),
            sender_id: currentUser.id,
            message_text: newMessage,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/send_message.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: currentUser.id,
                    receiver_id: conversation.other_user_id,
                    message_text: newMessage
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            fetchMessages();
        } catch (err) {
            console.error("Send message error:", err);
            setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        }
    };

    // Define theme colors based on user role
    const themeColors = {
        student: {
            bg: 'bg-blue-500',
            hoverBg: 'hover:bg-blue-600',
            text: 'text-blue-200'
        },
        publisher: {
            bg: 'bg-primary-main',
            hoverBg: 'hover:bg-primary-dark',
            text: 'text-primary-lighter'
        },
        admin: {
            bg: 'bg-green-500',
            hoverBg: 'hover:bg-green-600',
            text: 'text-green-200'
        }
    };
    const currentTheme = themeColors[currentUser.role] || themeColors.student;

    return (
        <>
            {/* Header */}
            <div className="p-4 border-b flex items-center space-x-3 bg-white">
                <img 
                    src={conversation.profile_image_url ? `${API_BASE_URL}/${conversation.profile_image_url}` : `https://placehold.co/40x40/E8EAF6/211C84?text=${(conversation.first_name || 'U').charAt(0)}`}
                    alt="profile"
                    className="h-10 w-10 rounded-full object-cover"
                />
                <h3 className="font-bold text-lg text-gray-800">{conversation.company_name || `${conversation.first_name} ${conversation.last_name}`}</h3>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {isLoading ? (
                    <p className="text-center text-gray-500">Loading messages...</p>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex my-2 ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm ${msg.sender_id === currentUser.id ? `${currentTheme.bg} text-white rounded-br-none` : 'bg-white text-gray-800 border rounded-bl-none'}`}>
                                <p className="leading-snug">{msg.message_text}</p>
                                <p className={`text-xs mt-1 text-right ${msg.sender_id === currentUser.id ? currentTheme.text : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button type="submit" className={`${currentTheme.bg} text-white rounded-full p-3 ${currentTheme.hoverBg} transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
}

export default ChatWindow;
