import React, { useEffect, useRef, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import "../styles/Chat.css";
import { AuthContext } from "../context/AuthContext";

const socket = io('http://localhost:3001');

const generateRoomId = (userA, userB) => {
  const [a, b] = [Number(userA), Number(userB)].sort((x, y) => x - y);
  return `${a}-${b}`;
};

const Chat = () => {
  const { userId: patientUserId } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!patientUserId) return;

    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/doctors`, {
          credentials: "include"
        });
        const data = await res.json();
        const filtered = data.filter(d => Number(d.user_id) !== Number(patientUserId));
        setDoctors(filtered);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };

    fetchDoctors();
  }, [patientUserId]);

  useEffect(() => {
    if (!patientUserId) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/unread?userId=${patientUserId}`, {
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

    fetchUnread();
  }, [patientUserId]);

  useEffect(() => {
    if (!selectedDoctor || !patientUserId) return;

    const roomId = generateRoomId(patientUserId, selectedDoctor.user_id);
    socket.emit("join-room", roomId, Number(patientUserId));

    setUnreadCounts(prev => ({
      ...prev,
      [roomId]: 0
    }));

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/room/${roomId}`, {
          credentials: "include"
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchHistory();

    socket.on("receive-message", (data) => {
      if (data.roomId === roomId) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => socket.off("receive-message");
  }, [selectedDoctor, patientUserId]);

  const sendMessage = () => {
    if (!message.trim() || !selectedDoctor || !patientUserId) return;

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
              {unreadCounts[generateRoomId(patientUserId, d.user_id)] > 0 &&
                ` (${unreadCounts[generateRoomId(patientUserId, d.user_id)]})`}
            </option>
          ))}
        </select>
      </div>

      {selectedDoctor && (
        <>
          <div className="chat-box">
            {messages.map((msg, i) => {
              const isSender = String(msg.sender_id) === String(patientUserId);
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
