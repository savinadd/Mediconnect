const db = require("../db");

const getDoctorChats = async (req, res) => {
  const doctorUserId = req.user.userId;

  try {
    const doctorRes = await db.query("SELECT id FROM doctors WHERE user_id = $1", [doctorUserId]);
    const doctorId = doctorRes.rows[0]?.id;

    const chatRooms = await db.query(`
      SELECT DISTINCT patient_id, p.first_name || ' ' || p.last_name AS patient_name
      FROM chat_messages
      JOIN patients p ON chat_messages.patient_id = p.id
      WHERE chat_messages.doctor_id = $1
    `, [doctorId]);

    res.json(chatRooms.rows);
  } catch (err) {
    console.error("Get Doctor Chats Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getDoctorChatHistory = async (req, res) => {
  const doctorUserId = req.user.userId;
  const { patientId } = req.params;

  try {
    const doctorRes = await db.query("SELECT id FROM doctors WHERE user_id = $1", [doctorUserId]);
    const doctorId = doctorRes.rows[0]?.id;

    const roomId = `${patientId}-${doctorId}`;
    const result = await db.query(
      `SELECT sender_role, message, timestamp FROM chat_messages
       WHERE room_id = $1
       ORDER BY timestamp ASC`,
      [roomId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get Chat History Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllDoctors = async (req, res) => {
    try {
      const result = await db.query("SELECT id, first_name, last_name FROM doctors");
      res.json(result.rows);
    } catch (err) {
      console.error("Fetch Doctors Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  const getChatMessages = async (req, res) => {
    const { roomId } = req.params;
  
    try {
      const result = await db.query(`
        SELECT sender_id, receiver_id, sender_role, message, timestamp
        FROM chat_messages
        WHERE room_id = $1
        ORDER BY timestamp ASC
      `, [roomId]);
  
      res.json(result.rows);
    } catch (err) {
      console.error("Fetch Chat History Error:", err);
      res.status(500).json({ message: "Server error while fetching chat history" });
    }
  };
  
module.exports = {
  getDoctorChats,
  getDoctorChatHistory,
  getChatMessages,
  getAllDoctors
};
