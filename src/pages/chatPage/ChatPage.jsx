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
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);

  const scrollRef = useRef(null);
  const msgRefs = useRef({});
  const mediaRecorder = useRef(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const myId = currentUser?._id || currentUser?.id;

  const formatDividerDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatMsgTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  useEffect(() => {
    setIsSyncing(true);
    const loadChat = async () => {
      try {
        const [uRes, mRes] = await Promise.all([
          fetch(`${API_URL}/api/users/user/${receiverId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/chat/${receiverId}`, { credentials: "include", cache: "no-store" })
        ]);
        if (uRes.ok) setReceiverUser(await uRes.json());
        if (mRes.ok) setMessages(await mRes.json());
        fetch(`${API_URL}/api/chat/read/${receiverId}`, { method: "PUT", credentials: "include" });
      } finally { setTimeout(() => setIsSyncing(false), 500); }
    };
    if (currentUser) loadChat();
  }, [receiverId, currentUser, authLoading, API_URL]);

  useEffect(() => {
    if (!myId) return;
    socket.emit("join_room", myId);
    socket.on("receive_message", (m) => {
      setMessages(prev => [...prev, m]);
      if (String(m.sender) === String(receiverId)) {
        fetch(`${API_URL}/api/chat/read/${receiverId}`, { method: "PUT", credentials: "include" });
      }
    });
    socket.on("messages_seen", ({ seenBy }) => {
      if (String(seenBy) === String(receiverId)) {
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      }
    });
    socket.on("display_typing", ({ senderId }) => {
      if (String(senderId) === String(receiverId)) {
        setIsReceiverTyping(true);
        setTimeout(() => setIsReceiverTyping(false), 3000);
      }
    });
    socket.on("hide_typing", () => setIsReceiverTyping(false));
    socket.on("reaction_updated", (data) => {
      setMessages(prev => prev.map(m => m._id === data.id ? { ...m, reactions: data.reactions } : m));
    });
    return () => { 
      socket.off("receive_message"); 
      socket.off("messages_seen");
      socket.off("display_typing");
      socket.off("hide_typing");
      socket.off("reaction_updated"); 
    };
  }, [myId, receiverId, API_URL]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const scrollToOriginal = (msgId) => {
    const target = msgRefs.current[msgId];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("highlight-msg");
      setTimeout(() => target.classList.remove("highlight-msg"), 1000);
    }
  };

  const handleSend = async (fileData = null, type = "text") => {
    if (!newMessage.trim() && !fileData) return;
    const payload = {
      receiverId,
      text: fileData ? "" : newMessage,
      fileUrl: fileData,
      fileType: type,
      parentMessage: replyingTo ? { 
        text: replyingTo.text, 
        senderName: String(replyingTo.sender) === String(myId) ? "You" : receiverUser?.name, 
        messageId: replyingTo._id 
      } : null
    };
    const res = await fetch(`${API_URL}/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const saved = await res.json();
      setMessages(prev => [...prev, saved]);
      setNewMessage(""); 
      setReplyingTo(null);
      socket.emit("stop_typing", { receiverId });
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.current.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => handleSend(reader.result, "audio");
        };
        mediaRecorder.current.start();
        setIsRecording(true);
      } catch (err) { alert("Mic access denied" , err); }
    } else {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const addReaction = async (id, emoji) => {
    const res = await fetch(`${API_URL}/api/chat/react/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji })
    });
    if (res.ok) {
      const updated = await res.json();
      setMessages(prev => prev.map(m => m._id === id ? { ...m, reactions: updated.reactions } : m));
    }
  };

  if (isSyncing) return <div className="inbox-loading-screen"><div className="spinner" /></div>;

  return (
    <div className="chat-page-v2">
      <header className="chat-header-v2">
        <button className="chat-v2-unique-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-user-info">
          <img src={receiverUser?.avatar || "/default-avatar.png"} alt="avatar" className="header-avatar" />
          <div className="header-text-info">
            <h3>{receiverUser?.name}</h3>
            <p className="status-text">{isReceiverTyping ? "typing..." : "online"}</p>
          </div>
        </div>
      </header>

      <div className="messages-scroll-area" onClick={() => setActiveActionId(null)}>
        {messages.map((m, index) => {
          const isOwn = String(m.sender) === String(myId);
          const currentDate = new Date(m.createdAt).toDateString();
          const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
          const showDivider = currentDate !== prevDate;

          return (
            <React.Fragment key={m._id}>
              {showDivider && (
                <div className="date-divider">
                  <span>{formatDividerDate(m.createdAt)}</span>
                </div>
              )}
              <div ref={el => msgRefs.current[m._id] = el} className={`msg-row ${isOwn ? "own-msg" : "their-msg"}`}>
                <div 
                  className="msg-wrapper-v2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth <= 768) setActiveActionId(activeActionId === m._id ? null : m._id);
                  }}
                >
                  <div className="msg-bubble-v2">
                    {m.parentMessage && (
                      <div className="replied-message-box" onClick={() => scrollToOriginal(m.parentMessage.messageId)}>
                        <small>{m.parentMessage.senderName}</small>
                        <p>{m.parentMessage.text || "Media"}</p>
                      </div>
                    )}
                    {m.fileType === "image" && <img src={m.fileUrl} className="chat-img" alt="sent" onClick={() => setSelectedImg(m.fileUrl)} />}
                    {m.fileType === "audio" && <audio src={m.fileUrl} controls className="chat-audio" />}
                    {m.text && <p className="msg-text-p">{m.text}</p>}
                    
                    <div className="msg-info-footer">
                      <span className="msg-time-v2">{formatMsgTime(m.createdAt)}</span>
                       {m.reactions?.length > 0 && (
                        <div className="reactions-display">
                          {m.reactions.map((r, i) => <span key={i}>{r.emoji}</span>)}
                        </div>
                      )}
                      {isOwn && <span className="read-status">{m.isRead ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>

                  <div className={`msg-actions ${activeActionId === m._id ? "force-show-mobile" : ""}`}>
                    <span onClick={(e) => { e.stopPropagation(); addReaction(m._id, "❤️"); setActiveActionId(null); }}>❤️</span>
                    <span onClick={(e) => { e.stopPropagation(); addReaction(m._id, "👍"); setActiveActionId(null); }}>👍</span>
                    <span onClick={(e) => { e.stopPropagation(); setReplyingTo(m); setActiveActionId(null); }}>Reply</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {selectedImg && (
        <div className="lightbox" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="Enlarged" />
        </div>
      )}

      <footer className="chat-input-container">
        {replyingTo && (
          <div className="reply-preview-bar">
            <div className="reply-content">
              <span>Replying to {String(replyingTo.sender) === String(myId) ? "yourself" : receiverUser?.name}</span>
              <p>{replyingTo.text || "Media"}</p>
            </div>
            <button className="cancel-reply" onClick={() => setReplyingTo(null)}>×</button>
          </div>
        )}
        <form className="input-form-v2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <label htmlFor="file-up" className="attach-btn-modern">📎</label>
          <input type="file" id="file-up" hidden onChange={(e) => {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onloadend = () => handleSend(reader.result, e.target.files[0].type.startsWith("image") ? "image" : "file");
          }} />
          <input 
            className="main-input-v2"
            value={newMessage} 
            onChange={(e) => {
              setNewMessage(e.target.value);
              socket.emit("typing", { receiverId, senderId: myId });
            }} 
            placeholder="Type a message..." 
          />
          <button type="button" onClick={toggleRecording} className={isRecording ? "mic-btn-modern rec-active" : "mic-btn-modern"}>
            {isRecording ? "⏹" : "🎤"}
          </button>
          <button type="submit" className="send-btn-v2">✦</button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;