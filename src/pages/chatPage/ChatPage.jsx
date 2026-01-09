import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/useAuth";
import { Send, Image, Phone, Video } from "lucide-react";
import SubscriptionModal from "../../components/modals/subscriptionModal/SubscriptionModal";
import { getDailyDmLimit } from "../../utils/subscriptionRules";
import "./ChatPage.css";

const ChatPage = () => {
  const { id: receiverId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiver, setReceiver] = useState(null);
  const messagesEndRef = useRef(null);
  
  // ✅ FIX: Use useRef instead of useState for socket
  const socketRef = useRef(null);

  // Limit States
  const [showSubModal, setShowSubModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ FIX: Derive isInputLocked and limitMessage from currentUser
  const userPlan = currentUser?.subscription?.plan || "free";
  const dmLimit = getDailyDmLimit(userPlan);
  const isInputLocked = dmLimit === 0;
  
  // ✅ FIX: Derive limitMessage as well (no useEffect needed)
  // const defaultLimitMessage = dmLimit === 0 
  //   ? "Free users cannot send direct messages. Upgrade to chat!" 
  //   : "";

  // Connect Socket
  useEffect(() => {
    if (!API_URL) return;
    const newSocket = io(API_URL, {
        query: { userId: currentUser?._id }
    });
    // ✅ FIX: Store in ref instead of state
    socketRef.current = newSocket;
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [API_URL, currentUser]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`${API_URL}/api/users/${receiverId}`);
        const userData = await userRes.json();
        setReceiver(userData);

        const chatRes = await fetch(`${API_URL}/api/chat/${receiverId}`, { credentials: "include" });
        const chatData = await chatRes.json();
        setMessages(chatData);
      } catch (err) {
        console.error(err);
      }
    };
    if (currentUser && receiverId) fetchData();
  }, [receiverId, currentUser, API_URL]);

  // Define scrollToBottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Listen for Messages
  useEffect(() => {
    if (!socketRef.current) return;
    
    // ✅ FIX: Use socketRef.current instead of socket
    socketRef.current.on("newMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off("newMessage");
      }
    };
  }, [scrollToBottom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (isInputLocked) {
        setShowSubModal(true);
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/chat/send/${receiverId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: newMessage }),
            credentials: "include"
        });

        if (res.status === 403) {
            const data = await res.json();
            setLimitMessage(data.message || "Message limit reached.");
            setShowSubModal(true);
            return;
        }

        const data = await res.json();
        setMessages([...messages, data]);
        setNewMessage("");
        scrollToBottom();

    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-page__header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        {receiver && (
            <div className="chat-page__user-info" onClick={() => navigate(`/user-profile/${receiver._id}`)}>
                <img src={receiver.avatar || "/default-avatar.png"} alt={receiver.name} className="chat-page__avatar" />
                <div>
                    <h3>{receiver.name}</h3>
                    <span className="status">Online</span>
                </div>
            </div>
        )}
        <div className="chat-page__actions">
            <Phone size={20} />
            <Video size={20} />
        </div>
      </div>

      <div className="chat-page__messages">
        {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.senderId === currentUser._id ? "me" : "them"}`}>
                <div className="message__bubble">{msg.message}</div>
                <span className="message__time">
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-page__input-area">
        {isInputLocked ? (
             <div className="chat-page__locked-overlay" onClick={() => setShowSubModal(true)}>
                 <span className="chat-page__lock-icon">🔒</span>
                 <span className="chat-page__lock-text">Chat is locked for Free users.</span>
                 <button className="chat-page__upgrade-btn">Upgrade</button>
             </div>
        ) : (
            <form onSubmit={handleSendMessage} className="chat-page__form">
                <button type="button" className="icon-btn"><Image size={24} /></button>
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="send-btn"><Send size={24} /></button>
            </form>
        )}
      </div>

      {showSubModal && (
          <SubscriptionModal 
            onClose={() => setShowSubModal(false)}
            message={limitMessage}
          />
      )}
    </div>
  );
};

export default ChatPage;