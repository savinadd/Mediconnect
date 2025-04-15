      const db = require("../db");

      const generateRoomId = (userIdA, userIdB) => {
          const [a, b] = [Number(userIdA), Number(userIdB)].sort((x, y) => x - y);
          return `${a}-${b}`;
        };
        


      const getDoctorChatHistory = async (req, res) => {
      const doctorUserId = req.user.userId;
      const { patientId } = req.params;

      try {
          const doctorRes = await db.query("SELECT id FROM doctors WHERE user_id = $1", [doctorUserId]);
          const doctorId = doctorRes.rows[0]?.id;
          const room = generateRoomId(userId, selectedDoctorId);


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

      const getPatientsForDoctor = async (req, res) => {
          const doctorUserId = req.user.userId;
        
          try {
            const result = await db.query(`
              SELECT DISTINCT 
                p.id AS patient_id,
                u.id AS user_id,
                p.first_name || ' ' || p.last_name AS patient_name
              FROM patients p
              JOIN users u ON p.user_id = u.id
              WHERE p.id IN (
                SELECT pr.patient_id
                FROM prescriptions pr
                JOIN doctors d ON pr.doctor_id = d.id
                WHERE d.user_id = $1
        
                UNION
        
                SELECT cm_patient.id
                FROM chat_messages cm
                JOIN users u_sender ON cm.sender_id = u_sender.id
                JOIN patients cm_patient ON u_sender.id = cm_patient.user_id
                WHERE cm.receiver_id = $1 OR cm.sender_id = $1
              )
            `, [doctorUserId]);
        
            res.json(result.rows);
            console.log(result.rows)
          } catch (err) {
            console.error("Fetch patients for doctor error:", err);
            res.status(500).json({ message: "Server error" });
          }
        };
        
        const getDoctorsForPatient = async (req, res) => {
          try {
            const result = await db.query(`
              SELECT d.id AS doctor_id, u.id AS user_id, d.first_name || ' ' || d.last_name AS doctor_name
              FROM doctors d
              JOIN users u ON d.user_id = u.id
            `);
            console.log("DOCTORS FROM DB:", result.rows);  
            res.json(result.rows);
          } catch (err) {
            console.error("Fetch doctors for patient error:", err);
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
        
        const getUnreadMessages = async (req, res) => {
          const userId = Number(req.query.userId);
        
          if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
          }
        
          try {
            const result = await db.query(
              `
              SELECT room_id, COUNT(*) AS unread_count
              FROM chat_messages
              WHERE receiver_id = $1 AND is_read = false
              GROUP BY room_id
              `,
              [userId]
            );
        
            const unreadMap = {};
            result.rows.forEach(row => {
              unreadMap[row.room_id] = Number(row.unread_count);
            });
        
            res.json(unreadMap);
          } catch (err) {
            console.error("Failed to fetch unread messages:", err);
            res.status(500).json({ message: "Server error" });
          }
        };
        


      module.exports = {
      getDoctorChatHistory,
      getPatientsForDoctor,
      getChatMessages,
      getDoctorsForPatient,
      getUnreadMessages
      };
