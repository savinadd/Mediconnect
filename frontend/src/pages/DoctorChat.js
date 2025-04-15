import React, { useEffect, useRef, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import "../styles/Chat.css";
import { AuthContext } from "../context/AuthContext";

const socket = io('http://localhost:3001');

const generateRoomId = (userA, userB) => {
  const [a, b] = [Number(userA), Number(userB)].sort((x, y) => x - y);
  return `${a}-${b}`;
};

const DoctorChat = () => {
  const { userId: doctorUserId, loading } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const bottomRef = useRef(null);

  console.log("DoctorChat rendered");
console.log("AuthContext doctorUserId:", doctorUserId);
console.log("AuthContext loading:", loading);

  useEffect(() => {
    if (!doctorUserId) return;
    console.log(doctorUserId)
    const fetchPatients = async () => {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/patients`, {
        credentials: "include"
      });
      const data = await res.json();
      if (Array.isArray(data)) setPatients(data);
    };
    fetchPatients();
  }, [doctorUserId]);

  useEffect(() => {
    if (!doctorUserId) return;
    fetchUnread();
  }, [doctorUserId]);

  const fetchUnread = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/unread?userId=${doctorUserId}`, {
        credentials: "include"
      });
      const data = await res.json();

      if (data && typeof data === "object") {
        setUnreadCounts(data);
      }
    } catch (err) {
      console.error("Failed to fetch unread counts:", err);
    }
  };

  useEffect(() => {
    if (!selectedPatient || !doctorUserId) return;
    const roomId = generateRoomId(doctorUserId, selectedPatient.user_id);
    socket.emit("join-room", roomId, Number(doctorUserId));

    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: 0
    }));

    const fetchHistory = async () => {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/room/${roomId}`, {
        credentials: "include"
      });
      const data = await res.json();
      setMessages(data);
    };

    fetchHistory();

    socket.on("receive-message", (data) => {
      const currentRoomId = generateRoomId(doctorUserId, selectedPatient.user_id);
      if (data.roomId === currentRoomId) {
        setMessages((prev) => [...prev, data]);
      }
      fetchUnread();
    });

    return () => socket.off("receive-message");
  }, [selectedPatient, doctorUserId]);

  const sendMessage = () => {
    if (!doctorUserId || !selectedPatient) {
      console.warn("Missing user ID or selected patient");
      return;
    }

    const patientUserId = Number(selectedPatient.user_id);
    const roomId = generateRoomId(doctorUserId, patientUserId);

    socket.emit("send-message", {
      roomId,
      message,
      senderRole: "doctor",
      senderId: doctorUserId,
      receiverId: patientUserId
    });
    setMessage("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-container">
      <h2>Doctor Chat Interface</h2>
      <div className="chat-select-wrapper">
        <label htmlFor="patientSelect">Select Patient: </label>
        <select
          id="patientSelect"
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            if (selectedId === Number(doctorUserId)) {
              console.warn("You cannot chat with yourself");
              setSelectedPatient(null);
              return;
            }
            const patient = patients.find(p => Number(p.user_id) === selectedId);
            setSelectedPatient(patient || null);
          }}
          defaultValue=""
        >
          <option value="" disabled>-- Choose a patient --</option>
          {patients.map((p) => (
            <option key={`patient-${p.user_id}`} value={p.user_id}>
              {p.patient_name}
              {unreadCounts[generateRoomId(doctorUserId, p.user_id)] > 0 &&
                ` (${unreadCounts[generateRoomId(doctorUserId, p.user_id)]})`}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <>
          <div className="chat-box">
            {messages.map((msg, i) => {
              const isSender = String(msg.sender_id) === String(doctorUserId);
              const roleClass = isSender ? "sent" : "received";

              return (
                <div key={`msg-${msg.timestamp || i}-${i}`} className={`chat-message-wrapper ${roleClass}`}>
                  <div className={`chat-bubble ${roleClass}`}>
                    <div className="chat-sender">{msg.sender_role}</div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-wrapper">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button onClick={sendMessage} className="chat-send-button">Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorChat;
