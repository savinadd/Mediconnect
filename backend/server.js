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
  
app.use(express.json());
app.use(appRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId, userId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    try {
      await db.query(
        `UPDATE chat_messages
         SET is_read = true
         WHERE room_id = $1 AND receiver_id = $2 AND is_read = false`,
        [roomId, userId]
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  });

  socket.on('send-message', async ({ roomId, message, senderRole, senderId, receiverId }) => {
    console.log("Incoming message:", { roomId, message, senderRole, senderId, receiverId });
   

    const userRes = await db.query("SELECT * FROM users WHERE id = $1", [senderId]);
    console.log("Sender DB info:", userRes.rows[0]);
    try {
      await db.query(
       `INSERT INTO chat_messages (room_id, sender_id, receiver_id, message, sender_role, is_read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [roomId, senderId, receiverId, message, senderRole]
      );

      io.to(roomId).emit('receive-message', {
        roomId,
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
