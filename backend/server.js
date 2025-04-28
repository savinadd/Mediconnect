require('dotenv').config({ path: '.env.local' });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./src/db');
const appRoutes = require('./src/app');
const logger = require('./src/utils/logger');

const FRONTEND_URL = process.env.FRONTEND_URL;
const PORT = process.env.PORT || 3001;

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use(appRoutes);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});
logger.info(FRONTEND_URL);
io.on('connection', socket => {
  logger.info('User connected: ' + socket.id);

  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room ${roomId}`);
    try {
      await db.query(
        `UPDATE chat_messages
           SET is_read = true
         WHERE room_id = $1
           AND receiver_id = $2
           AND is_read = false`,
        [roomId, userId]
      );
    } catch (err) {
      logger.error('Failed to mark messages as read:', err);
    }
  });

  socket.on('send-message', async ({ roomId, message, senderRole, senderId, receiverId }) => {
    logger.info('Incoming message:', { roomId, message, senderRole, senderId, receiverId });
    try {
      await db.query(
        `INSERT INTO chat_messages
           (room_id, sender_id, receiver_id, message, sender_role, is_read)
         VALUES ($1,$2,$3,$4,$5,false)`,
        [roomId, senderId, receiverId, message, senderRole]
      );
      io.to(roomId).emit('receive-message', {
        roomId,
        message,
        sender_role: senderRole,
        sender_id: senderId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('DB Insert Error:', err);
    }
  });

  socket.on('typing', data => {
    io.to(data.roomId).emit('typing', data);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:' + socket.id);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;
