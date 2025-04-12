import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import "../styles/Chat.css"

const socket = io('http://localhost:3001');

const generateRoomId = (userA, userB) => {
  const [a, b] = [Number(userA), Number(userB)].sort((x, y) => x - y);
  return `${a}-${b}`;
};

const Chat = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  const patientUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDoctors(data);
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!selectedDoctor) return;
    const roomId = generateRoomId(patientUserId, selectedDoctor.user_id);
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
  }, [selectedDoctor]);

  const sendMessage = () => {
    if (message.trim() && selectedDoctor) {
      const doctorUserId = selectedDoctor.user_id;
      const roomId = generateRoomId(patientUserId, doctorUserId);

      socket.emit("send-message", {
        roomId,
        message,
        senderRole: "patient",
        senderId: patientUserId,
        receiverId: doctorUserId
      });

     
      setMessage("");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <h2>Patient Chat Interface</h2>

      <div className="chat-select-wrapper">
        <label htmlFor="doctorSelect">Select Doctor: </label>
        <select
          id="doctorSelect"
          onChange={(e) => {
            const selectedId = parseInt(e.target.value);
            const doctor = doctors.find(d => d.user_id === selectedId);
            setSelectedDoctor(doctor || null);
          }}
          defaultValue=""
        >
          <option value="" disabled>-- Choose a doctor --</option>
          {doctors.map((d) => (
            <option key={`doctor-${d.user_id}`} value={d.user_id}>
              {d.doctor_name}
            </option>
          ))}
        </select>
      </div>

      {selectedDoctor && (
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

export default Chat;
