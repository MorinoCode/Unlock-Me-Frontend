import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { socket } from "../../socket";
import "./ChatPage.css";

const ChatPage = () => {
  const { receiverId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUser, setReceiverUser] = useState(null);
  const scrollRef = useRef();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const userRes = await fetch(`${API_URL}/api/users/user/${receiverId}`, { credentials: "include" });
        const userData = await userRes.json();
        setReceiverUser(userData);

        const msgRes = await fetch(`${API_URL}/api/chat/${receiverId}`, { credentials: "include" });
        const msgData = await msgRes.json();
        setMessages(msgData);
      } catch (err) {
        console.error("Error loading chat data:", err);
      }
    };
    if (receiverId) fetchChatData();
  }, [receiverId, API_URL]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (message.sender === receiverId || message.receiver === receiverId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [receiverId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId, text: newMessage }),
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => [...prev, savedMsg]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <img src={receiverUser?.avatar || "/default-avatar.png"} alt="avatar" />
        <h3>{receiverUser?.name || "Loading..."}</h3>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`message-bubble ${msg.sender === currentUser._id ? "sent" : "received"}`}
          >
            <p>{msg.text}</p>
            <span className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPage;