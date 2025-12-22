import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { socket } from "../../socket";
import "./ChatPage.css";

const ChatPage = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUser, setReceiverUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // API call to mark messages as read in the database
  const markMessagesAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/chat/read/${receiverId}`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Fetch initial chat data and receiver profile
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        // Fetch receiver user details
        const userRes = await fetch(`${API_URL}/api/users/user/${receiverId}`, { credentials: "include" });
        const userData = await userRes.json();
        setReceiverUser(userData);

        // Fetch message history
        const msgRes = await fetch(`${API_URL}/api/chat/${receiverId}`, { credentials: "include" });
        const msgData = await msgRes.json();
        setMessages(msgData);
        
        // Mark these messages as read upon opening the chat
        markMessagesAsRead();
      } catch (err) {
        console.error("Error loading chat data:", err);
      }
    };
    if (receiverId) fetchChatData();
  }, [receiverId, API_URL]);

  // Handle Real-time Socket events
  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (message) => {
      if (message.sender === receiverId) {
        setMessages((prev) => [...prev, message]);
        // Automatically mark new incoming message as read if chat is open
        markMessagesAsRead();
      }
    });

    // Listen for typing status from the other user
    socket.on("display_typing", (data) => {
      if (data.senderId === receiverId) setIsTyping(true);
    });

    socket.on("hide_typing", () => {
      setIsTyping(false);
    });

    // Listen for when the other user reads our messages
    socket.on("messages_seen", ({ seenBy }) => {
      if (seenBy === receiverId) {
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, isRead: true }))
        );
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("display_typing");
      socket.off("hide_typing");
      socket.off("messages_seen");
    };
  }, [receiverId]);

  // Auto-scroll to the bottom on new messages or typing status change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  

  // Handle input changes and emit typing signals
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Emit typing signal to the server
    socket.emit("typing", { receiverId, senderId: currentUser._id });

    // Stop typing signal after 2 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { receiverId });
    }, 2000);
  };

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Immediately stop typing signal
    socket.emit("stop_typing", { receiverId });

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
    <div className="chat-page-v2">
      {/* Header Section */}
      <header className="chat-header-v2">
        <button className="chat-v2-unique-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-user-info" onClick={() => navigate(`/user-profile/${receiverId}`)}>
          <div className="header-avatar-wrapper">
            <img src={receiverUser?.avatar || "/default-avatar.png"} alt="avatar" />
            <div className="online-indicator"></div>
          </div>
          <div className="header-text-info">
            <h3>{receiverUser?.name || "Loading..."}</h3>
            <p className={isTyping ? "typing-text" : "status-text"}>
              {isTyping ? "typing..." : "Online"}
            </p>
          </div>
        </div>
      </header>

      {/* Messages List Area */}
      <div className="messages-scroll-area">
        {messages.map((msg, index) => (
          <div key={msg._id || index} className={`msg-row ${msg.sender === currentUser._id ? "own-msg" : "their-msg"}`}>
            <div className="msg-bubble-v2">
              <p>{msg.text}</p>
              <div className="msg-meta-wrapper">
                <span className="msg-meta-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {/* Status Ticks for Sent Messages */}
                {msg.sender === currentUser._id && (
                  <span className={`status-tick ${msg.isRead ? "seen" : ""}`}>
                    ✓{msg.isRead && "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Animation Bubble */}
        {isTyping && (
          <div className="msg-row their-msg">
            <div className="typing-bubble">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Footer */}
      <footer className="chat-input-container">
        <form className="input-form-v2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
          />
          <button type="submit" className="send-btn-v2" disabled={!newMessage.trim()}>
            <span className="send-icon">✦</span>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;