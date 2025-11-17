import { memo, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Search, Phone, Video, MoreVertical, Loader } from 'lucide-react';
import axios from 'axios';
import useSocket from '@/hooks/useSocket';

const Messages = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const { 
    sendMessage, 
    onMessageReceive, 
    onTypingIndicator,
    onUserOnline,
    onUserOffline,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation
  } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      joinConversation(selectedConversation.id);
    }
    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, joinConversation, leaveConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.io event listeners
  useEffect(() => {
    // Receive messages
    onMessageReceive((data) => {
      if (data.conversationId === selectedConversation?.id) {
        setMessages(prev => [...prev, {
          id: `${data.senderId}-${data.timestamp}`,
          senderId: data.senderId,
          content: data.content,
          createdAt: data.timestamp,
          status: data.status
        }]);
      }
    });

    // Typing indicator
    onTypingIndicator((data) => {
      if (data.conversationId === selectedConversation?.id) {
        if (data.isTyping) {
          setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
        } else {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        }
      }
    });

    // User online/offline
    onUserOnline((data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    onUserOffline((data) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });
  }, [selectedConversation, onMessageReceive, onTypingIndicator, onUserOnline, onUserOffline]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/messages/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `${API_URL}/student/messages/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      // Send via Socket.io for real-time delivery
      sendMessage(
        selectedConversation.id,
        selectedConversation.otherUser?.id,
        messageText.trim()
      );

      // Also save to database via API
      const response = await axios.post(
        `${API_URL}/student/messages/send`,
        {
          conversationId: selectedConversation.id,
          content: messageText.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, response.data.message]);
      setMessageText('');
      stopTyping(selectedConversation.id, selectedConversation.otherUser?.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (!isTyping && selectedConversation) {
      setIsTyping(true);
      startTyping(selectedConversation.id, selectedConversation.otherUser?.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(selectedConversation.id, selectedConversation.otherUser?.id);
    }, 3000);
  };

  const filteredConversations = conversations.filter(conv =>
    `${conv.otherUser?.first_name} ${conv.otherUser?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex`}>
      {/* Conversations Sidebar */}
      <div className={`w-80 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-r ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } flex flex-col`}>
        <div className="p-4 border-b">
          <h1 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <MessageCircle size={24} />
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No conversations</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full text-left p-4 border-b transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? isDark ? 'bg-gray-700' : 'bg-blue-50'
                    : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {conversation.otherUser?.first_name} {conversation.otherUser?.last_name}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className={`p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex items-center justify-between`}>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedConversation.otherUser?.first_name} {selectedConversation.otherUser?.last_name}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active now
                </p>
              </div>
              <div className="flex gap-2">
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <Phone size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <Video size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <MoreVertical size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-blue-500 text-white'
                        : isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id
                        ? 'text-blue-100'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {Object.keys(typingUsers).length > 0 && (
              <div className={`px-4 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {Object.keys(typingUsers).join(', ')} is typing...
              </div>
            )}

            {/* Message Input */}
            <div className={`p-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Messages.displayName = 'Messages';
export default Messages;
