import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import "../styles/Chat.css"
const socket = io('http://localhost:3001');

const generateRoomId = (userA, userB) => {
  const [a, b] = [Number(userA), Number(userB)].sort((x, y) => x - y);
  return `${a}-${b}`;
};

const DoctorChat = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  const doctorUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setPatients(data);
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    const roomId = generateRoomId(doctorUserId, selectedPatient.user_id);
    socket.emit("join-room", roomId);

    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("Fetched messages:", data);
      setMessages(data);
    };

    fetchHistory();

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive-message");
  }, [selectedPatient]);

  const sendMessage = () => {
    if (message.trim() && selectedPatient) {
      const patientUserId = selectedPatient.user_id;
      const roomId = generateRoomId(doctorUserId, patientUserId);

      socket.emit("send-message", {
        roomId,
        message,
        senderRole: "doctor",
        senderId: doctorUserId,
        receiverId: patientUserId
      });
      
      setMessage(""); 
      
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <h2>Doctor Chat Interface</h2>

      <div className="chat-select-wrapper">
        <label htmlFor="patientSelect">Select Patient: </label>
        <select
          id="patientSelect"
          onChange={(e) => {
            const selectedId = parseInt(e.target.value);
            const patient = patients.find(p => p.user_id === selectedId);
            setSelectedPatient(patient || null);
          }}
          defaultValue=""
        >
          <option value="" disabled>-- Choose a patient --</option>
          {patients.map((p) => (
            <option key={`patient-${p.user_id}`} value={p.user_id}>
              {p.patient_name}
            </option>
          ))}
        </select>
      </div>

      {selectedPatient && (
        <>
          <div className="chat-box">
          {messages.map((msg, i) => {
  const currentUserId = localStorage.getItem("userId");
  const isSender = String(msg.sender_id) === currentUserId;
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
            <button onClick={sendMessage} className="chat-send-button">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorChat;
