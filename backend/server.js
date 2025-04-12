const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require("./src/db");
const appRoutes = require("./src/app");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

app.use(cors());
app.use(express.json());
app.use(appRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async ({ roomId, message, senderRole, senderId, receiverId }) => {
    console.log("Incoming message:", { roomId, message, senderRole, senderId, receiverId });

    try {
      await db.query(
        `INSERT INTO chat_messages (room_id, sender_id, receiver_id, message, sender_role)
         VALUES ($1, $2, $3, $4, $5)`,
        [roomId, senderId, receiverId, message, senderRole]
      );

      io.to(roomId).emit('receive-message', {
        message,
        sender_role: senderRole,
        sender_id: senderId,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('DB Insert Error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
