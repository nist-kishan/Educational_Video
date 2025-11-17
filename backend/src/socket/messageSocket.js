const socketIO = require('socket.io');

// Store active users
const activeUsers = new Map();

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token || !userId) {
      return next(new Error('Authentication error'));
    }

    socket.userId = userId;
    socket.token = token;
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user as active
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      connectedAt: new Date()
    });

    // Broadcast user online status
    io.emit('user:online', {
      userId: socket.userId,
      status: 'online',
      timestamp: new Date()
    });

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // ===== MESSAGE EVENTS =====

    // Send message
    socket.on('message:send', (data) => {
      const { conversationId, recipientId, content, timestamp } = data;

      // Emit to recipient
      io.to(`user:${recipientId}`).emit('message:receive', {
        conversationId,
        senderId: socket.userId,
        recipientId,
        content,
        timestamp: timestamp || new Date(),
        status: 'delivered'
      });

      // Emit back to sender for confirmation
      socket.emit('message:sent', {
        conversationId,
        messageId: `${socket.userId}-${timestamp}`,
        status: 'sent',
        timestamp: timestamp || new Date()
      });
    });

    // Mark message as read
    socket.on('message:read', (data) => {
      const { conversationId, messageId, senderId } = data;

      io.to(`user:${senderId}`).emit('message:read-receipt', {
        conversationId,
        messageId,
        readBy: socket.userId,
        readAt: new Date()
      });
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { conversationId, recipientId } = data;

      io.to(`user:${recipientId}`).emit('typing:indicator', {
        conversationId,
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId, recipientId } = data;

      io.to(`user:${recipientId}`).emit('typing:indicator', {
        conversationId,
        userId: socket.userId,
        isTyping: false
      });
    });

    // ===== NOTIFICATION EVENTS =====

    // Send notification
    socket.on('notification:send', (data) => {
      const { recipientId, type, title, message, data: notifData } = data;

      io.to(`user:${recipientId}`).emit('notification:receive', {
        type,
        title,
        message,
        data: notifData,
        timestamp: new Date()
      });
    });

    // ===== PRESENCE EVENTS =====

    // Get active users
    socket.on('presence:get-active', () => {
      const activeUsersList = Array.from(activeUsers.values()).map(user => ({
        userId: user.userId,
        status: 'online'
      }));

      socket.emit('presence:active-users', activeUsersList);
    });

    // Request user status
    socket.on('presence:check-user', (data) => {
      const { userId } = data;
      const isOnline = activeUsers.has(userId);

      socket.emit('presence:user-status', {
        userId,
        status: isOnline ? 'online' : 'offline'
      });
    });

    // ===== CONVERSATION EVENTS =====

    // Join conversation room
    socket.on('conversation:join', (data) => {
      const { conversationId } = data;
      socket.join(`conversation:${conversationId}`);

      io.to(`conversation:${conversationId}`).emit('conversation:user-joined', {
        conversationId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Leave conversation room
    socket.on('conversation:leave', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);

      io.to(`conversation:${conversationId}`).emit('conversation:user-left', {
        conversationId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // ===== DISCONNECT HANDLER =====

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);

      // Remove user from active users
      activeUsers.delete(socket.userId);

      // Broadcast user offline status
      io.emit('user:offline', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date()
      });
    });

    // ===== ERROR HANDLER =====

    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

module.exports = { initializeSocket, activeUsers };
