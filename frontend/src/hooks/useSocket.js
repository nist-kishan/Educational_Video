import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
        userId: user.id
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, token]);

  // ===== MESSAGE METHODS =====

  const sendMessage = useCallback((conversationId, recipientId, content) => {
    if (socketRef.current) {
      socketRef.current.emit('message:send', {
        conversationId,
        recipientId,
        content,
        timestamp: new Date()
      });
    }
  }, []);

  const markMessageAsRead = useCallback((conversationId, messageId, senderId) => {
    if (socketRef.current) {
      socketRef.current.emit('message:read', {
        conversationId,
        messageId,
        senderId
      });
    }
  }, []);

  // ===== TYPING INDICATOR METHODS =====

  const startTyping = useCallback((conversationId, recipientId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing:start', {
        conversationId,
        recipientId
      });
    }
  }, []);

  const stopTyping = useCallback((conversationId, recipientId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing:stop', {
        conversationId,
        recipientId
      });
    }
  }, []);

  // ===== NOTIFICATION METHODS =====

  const sendNotification = useCallback((recipientId, type, title, message, data) => {
    if (socketRef.current) {
      socketRef.current.emit('notification:send', {
        recipientId,
        type,
        title,
        message,
        data
      });
    }
  }, []);

  // ===== PRESENCE METHODS =====

  const getActiveUsers = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('presence:get-active');
    }
  }, []);

  const checkUserStatus = useCallback((userId) => {
    if (socketRef.current) {
      socketRef.current.emit('presence:check-user', { userId });
    }
  }, []);

  // ===== CONVERSATION METHODS =====

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('conversation:join', { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('conversation:leave', { conversationId });
    }
  }, []);

  // ===== EVENT LISTENERS =====

  const onMessageReceive = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('message:receive', callback);
    }
  }, []);

  const onMessageSent = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('message:sent', callback);
    }
  }, []);

  const onMessageReadReceipt = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('message:read-receipt', callback);
    }
  }, []);

  const onTypingIndicator = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('typing:indicator', callback);
    }
  }, []);

  const onNotificationReceive = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('notification:receive', callback);
    }
  }, []);

  const onUserOnline = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user:online', callback);
    }
  }, []);

  const onUserOffline = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user:offline', callback);
    }
  }, []);

  const onPresenceActiveUsers = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('presence:active-users', callback);
    }
  }, []);

  const onPresenceUserStatus = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('presence:user-status', callback);
    }
  }, []);

  const onConversationUserJoined = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('conversation:user-joined', callback);
    }
  }, []);

  const onConversationUserLeft = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('conversation:user-left', callback);
    }
  }, []);

  // ===== REMOVE EVENT LISTENERS =====

  const offMessageReceive = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('message:receive');
    }
  }, []);

  const offTypingIndicator = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('typing:indicator');
    }
  }, []);

  return {
    socket: socketRef.current,
    // Message methods
    sendMessage,
    markMessageAsRead,
    // Typing methods
    startTyping,
    stopTyping,
    // Notification methods
    sendNotification,
    // Presence methods
    getActiveUsers,
    checkUserStatus,
    // Conversation methods
    joinConversation,
    leaveConversation,
    // Event listeners
    onMessageReceive,
    onMessageSent,
    onMessageReadReceipt,
    onTypingIndicator,
    onNotificationReceive,
    onUserOnline,
    onUserOffline,
    onPresenceActiveUsers,
    onPresenceUserStatus,
    onConversationUserJoined,
    onConversationUserLeft,
    // Remove listeners
    offMessageReceive,
    offTypingIndicator
  };
};

export default useSocket;
