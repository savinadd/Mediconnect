
// const db = require("../db");

// const generateRoomId = (idA, idB) => {
//   const [a, b] = [Number(idA), Number(idB)].sort((x, y) => x - y);
//   return `${a}-${b}`;
// };

// const getContactsForDoctor = async (req, res) => {
//   const doctorUserId = req.user.userId;
//   try {
//     const result = await db.query(`
//       SELECT DISTINCT 
//         p.id            AS patient_id,
//         u.id            AS user_id,
//         p.first_name || ' ' || p.last_name AS patient_name
//       FROM patients p
//       JOIN users u ON p.user_id = u.id
//       -- include everyone they've ever chatted with or prescribed
//       WHERE p.id IN (
//         SELECT pr.patient_id
//         FROM prescriptions pr
//         JOIN doctors d ON pr.doctor_id = d.id
//         WHERE d.user_id = $1
//         UNION
//         SELECT 
//           CASE 
//             WHEN cm.sender_role = 'doctor' THEN cm.receiver_id 
//             ELSE cm.sender_id 
//           END
//         FROM chat_messages cm
//         WHERE cm.sender_id = $1 OR cm.receiver_id = $1
//       )
//     `, [doctorUserId]);
//     res.json(result.rows);
//   } catch (err) {
//     console.error("getContactsForDoctor:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// const getChattedPatientUserIds = async (req, res) => {
//   const doctorUserId = req.user.userId;
//   try {
//     const result = await db.query(`
//       SELECT DISTINCT
//         CASE 
//           WHEN sender_role = 'doctor' THEN receiver_id 
//           ELSE sender_id 
//         END AS patient_user_id
//       FROM chat_messages
//       WHERE sender_id = $1 OR receiver_id = $1
//     `, [doctorUserId]);
//     res.json(result.rows.map(r => r.patient_user_id));
//   } catch (err) {
//     console.error("getChattedPatientUserIds:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getChatMessages = async (req, res) => {
//   const { roomId } = req.params;
//   try {
//     const result = await db.query(
//       `SELECT sender_id, receiver_id, sender_role, message, timestamp
//        FROM chat_messages
//        WHERE room_id = $1
//        ORDER BY timestamp ASC`,
//       [roomId]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("getChatMessages:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getUnreadMessages = async (req, res) => {
//   const userId = Number(req.query.userId);
//   if (!userId) return res.status(400).json({ message: "Missing userId" });

//   try {
//     const result = await db.query(
//       `SELECT room_id, COUNT(*) AS unread_count
//        FROM chat_messages
//        WHERE receiver_id = $1 AND is_read = false
//        GROUP BY room_id`,
//       [userId]
//     );
//     const map = {};
//     result.rows.forEach(r => map[r.room_id] = Number(r.unread_count));
//     res.json(map);
//   } catch (err) {
//     console.error("getUnreadMessages:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = {
//   getContactsForDoctor,
//   getChattedPatientUserIds,
//   getChatMessages,
//   getUnreadMessages
// };
