let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join personal room for notifications
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join role-based rooms
    socket.on('join_role', (role) => {
      if (role) {
        socket.join(`role_${role}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  console.log('⚡ Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Emit notification to a specific user
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, data);
};

// Emit to all nagarpalika/admin staff
const emitToRole = (role, event, data) => {
  if (!io) return;
  io.to(`role_${role}`).emit(event, data);
};

// Emit new report to all nagarpalika staff
const emitNewReport = (report) => {
  emitToRole('nagarpalika', 'new_report', report);
  emitToRole('admin', 'new_report', report);
};

// Emit status update to reporter
const emitStatusUpdate = (userId, report) => {
  if (userId) emitToUser(userId, 'status_update', report);
};

module.exports = { initSocket, getIO, emitToUser, emitToRole, emitNewReport, emitStatusUpdate };
