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

  const scrollRef = useRef(null);
  const mediaRecorder = useRef(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const myId = currentUser?._id || currentUser?.id;

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
      } finally { setTimeout(() => setIsSyncing(false), 500); }
    };
    if (currentUser) loadChat();
  }, [receiverId, currentUser, authLoading, API_URL]);

  useEffect(() => {
    if (!myId) return;
    socket.emit("join_room", myId);

    socket.on("receive_message", (m) => setMessages(prev => [...prev, m]));
    
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
      socket.off("display_typing");
      socket.off("hide_typing");
      socket.off("reaction_updated"); 
    };
  }, [myId, receiverId]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

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
      } catch (err) { alert("Mic access denied",err); }
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

      <div className="messages-scroll-area">
        {messages.map((m) => {
          const isOwn = String(m.sender) === String(myId);
          return (
            <div key={m._id} className={`msg-row ${isOwn ? "own-msg" : "their-msg"}`}>
              <div className="msg-bubble-v2">
                <div className="msg-actions">
                  <span onClick={() => addReaction(m._id, "❤️")}>❤️</span>
                  <span onClick={() => addReaction(m._id, "👍")}>👍</span>
                  <span onClick={() => setReplyingTo(m)}>Reply</span>
                </div>
                {m.parentMessage && (
                  <div className="replied-message-box">
                    <small>{m.parentMessage.senderName}</small>
                    <p>{m.parentMessage.text}</p>
                  </div>
                )}
                {m.fileType === "image" && <img src={m.fileUrl} className="chat-img" alt="sent" />}
                {m.fileType === "audio" && <audio src={m.fileUrl} controls className="chat-audio" />}
                {m.text && <p className="msg-text-p">{m.text}</p>}
                {m.reactions?.length > 0 && (
                  <div className="reactions-display">
                    {m.reactions.map((r, i) => <span key={i}>{r.emoji}</span>)}
                  </div>
                )}
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