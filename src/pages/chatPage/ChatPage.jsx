import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { socket } from "../../socket";
import "./ChatPage.css";

const ChatPage = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading } = useAuth();

  const [messages, setMessages] = useState([]);
  const [receiverUser, setReceiverUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);

  const scrollRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const myId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    setIsSyncing(true);
    setMessages([]);
    setReceiverUser(null);
    setReplyingTo(null);

    if (!currentUser && !authLoading) return;

    const loadChat = async () => {
      try {
        const [userRes, msgRes] = await Promise.all([
          fetch(`${API_URL}/api/users/user/${receiverId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/chat/${receiverId}`, { credentials: "include", cache: "no-store" }),
        ]);

        if (userRes.ok) setReceiverUser(await userRes.json());
        if (msgRes.ok) {
          const data = await msgRes.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Chat load error:", err);
      } finally {
        setTimeout(() => setIsSyncing(false), 600);
      }
    };

    if (currentUser) loadChat();
  }, [receiverId, currentUser, authLoading, API_URL]);

  useEffect(() => {
    if (!myId) return;
    
    socket.emit("join_room", myId);

    const onMessage = (m) => {
      if (String(m.sender) === String(receiverId) || String(m.receiver) === String(receiverId)) {
        setMessages((prev) => [...prev, m]);
      }
    };

    socket.on("receive_message", onMessage);
    socket.on("display_typing", (d) => d.senderId === receiverId && setIsTyping(true));
    socket.on("hide_typing", () => setIsTyping(false));

    return () => {
      socket.off("receive_message", onMessage);
      socket.off("display_typing");
      socket.off("hide_typing");
    };
  }, [myId, receiverId]);

  useEffect(() => {
    if (!isSyncing) {
      scrollRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length, isSyncing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !myId) return;

    try {
      const res = await fetch(`${API_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          receiverId, 
          text: newMessage,
          parentMessage: replyingTo ? {
            text: replyingTo.text,
            senderName: String(replyingTo.sender) === String(myId) ? "You" : receiverUser?.name,
            messageId: replyingTo._id
          } : null
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages(prev => [...prev, saved]);
        setNewMessage("");
        setReplyingTo(null);
        socket.emit("stop_typing", { receiverId, senderId: myId });
      }
    } catch (err) { console.error(err); }
  };

  if (isSyncing || authLoading) {
    return (
      <div className="inbox-loading-screen">
        <div className="spinner" />
        <p>Establishing secure connection...</p>
      </div>
    );
  }

  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="chat-page-v2">
      <header className="chat-header-v2">
        <button className="chat-v2-unique-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-user-info">
          <img src={receiverUser?.avatar || "/default-avatar.png"} alt="avatar" className="header-avatar" />
          <div className="header-text-info">
            <h3>{receiverUser?.name}</h3>
            <p className={isTyping ? "typing-text" : "status-text"}>{isTyping ? "typing..." : "online"}</p>
          </div>
        </div>
      </header>

      <div className="messages-scroll-area">
        {messages.map((m, i) => {
          const isOwn = String(m.sender) === String(myId);

          return (
            <div 
              key={m._id || i} 
              className={`msg-row ${isOwn ? "own-msg" : "their-msg"}`}
              onDoubleClick={() => setReplyingTo(m)}
            >
              <div className="msg-bubble-v2">
                {m.parentMessage && (
                  <div className="replied-message-box">
                    <small>{m.parentMessage.senderName}</small>
                    <p>{m.parentMessage.text}</p>
                  </div>
                )}
                <p>{m.text}</p>
                <span className="msg-meta-time">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <footer className="chat-input-container">
        {replyingTo && (
          <div className="reply-preview-bar">
            <div className="reply-content">
              <span>Replying to {String(replyingTo.sender) === String(myId) ? "yourself" : receiverUser?.name}</span>
              <p>{replyingTo.text}</p>
            </div>
            <button className="cancel-reply" onClick={() => setReplyingTo(null)}>×</button>
          </div>
        )}
        <form className="input-form-v2" onSubmit={handleSend}>
          <input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              socket.emit("typing", { senderId: myId, receiverId });
            }}
          />
          <button type="submit" className="send-btn-v2">✦</button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;