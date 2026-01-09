import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { socket } from "../../socket.js";
import toast from "react-hot-toast";
import "./ChatPage.css";
import { RiSendPlane2Fill, RiCheckLine, RiCloseLine } from "react-icons/ri"; // آیکون‌های جدید

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

  // ✅ استیت‌های جدید برای مدیریت وضعیت ریکوئست
  const [chatStatus, setChatStatus] = useState("active"); // 'active', 'pending_received', 'pending_sent'
  const [conversationId, setConversationId] = useState(null);

  // --- Spark / AI Wingman State ---
  const [sparkSuggestions, setSparkSuggestions] = useState([]);
  const [isSparkLoading, setIsSparkLoading] = useState(false);
  const [showSpark, setShowSpark] = useState(false);

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
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMsgTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ تابع جدید برای تشخیص وضعیت چت (Active vs Request)
  const checkChatStatus = async () => {
    try {
      // 1. اول چک می‌کنیم آیا جزو ریکوئست‌های دریافتی است؟
      const reqRes = await fetch(`${API_URL}/api/chat/conversations?type=requests`, { credentials: "include" });
      const reqData = await reqRes.json();
      const incomingReq = reqData.find(c => c.participants.some(p => p._id === receiverId));

      if (incomingReq) {
        setChatStatus("pending_received");
        setConversationId(incomingReq._id);
        return;
      }

      // 2. اگر نبود، چک می‌کنیم جزو چت‌های اکتیو (یا ریکوئست‌های ارسالی خودمان) است؟
      const activeRes = await fetch(`${API_URL}/api/chat/conversations?type=active`, { credentials: "include" });
      const activeData = await activeRes.json();
      const activeChat = activeData.find(c => c.participants.some(p => p._id === receiverId));

      if (activeChat) {
        setConversationId(activeChat._id);
        if (activeChat.status === 'pending') {
            // یعنی من فرستادم ولی هنوز اکسپت نشده
            setChatStatus("pending_sent");
        } else {
            setChatStatus("active");
        }
      } else {
        // کلاً چتی وجود ندارد (اولین پیام) -> فرض می‌کنیم اکتیو است تا بتواند تایپ کند (بک‌اند محدودیت را چک می‌کند)
        setChatStatus("active"); 
      }

    } catch (err) {
      console.error("Status Check Error", err);
    }
  };

  useEffect(() => {
    setIsSyncing(true);
    const loadChat = async () => {
      try {
        const [uRes, mRes] = await Promise.all([
          fetch(`${API_URL}/api/user/user/${receiverId}`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/chat/${receiverId}`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);
        
        if (uRes.ok) setReceiverUser(await uRes.json());
        if (mRes.ok) setMessages(await mRes.json());
        
        // ✅ فراخوانی چک وضعیت
        await checkChatStatus();

        fetch(`${API_URL}/api/chat/read/${receiverId}`, {
          method: "PUT",
          credentials: "include",
        });
      } finally {
        setTimeout(() => setIsSyncing(false), 500);
      }
    };
    if (currentUser) loadChat();
  }, [receiverId, currentUser, authLoading, API_URL]);

  useEffect(() => {
    if (!myId) return;
    socket.emit("join_room", myId);
    
    socket.on("receive_message", (m) => {
      setMessages((prev) => [...prev, m]);
      // اگر پیامی آمد یعنی چت فعال است (یا ریکوئست جدید)
      if (String(m.sender) === String(receiverId)) {
        fetch(`${API_URL}/api/chat/read/${receiverId}`, {
          method: "PUT",
          credentials: "include",
        });
      }
    });

    // ✅ لیسنر برای وقتی که درخواستم قبول شد
    socket.on("request_accepted", ({ conversationId: acceptedId }) => {
        if (acceptedId === conversationId || !conversationId) { // اگر ID نداشتیم هم ریلود کن
            setChatStatus("active");
            toast.success("Request Accepted! You can now chat.");
        }
    });

    socket.on("messages_seen", ({ seenBy }) => {
      if (String(seenBy) === String(receiverId)) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
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
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.id ? { ...m, reactions: data.reactions } : m
        )
      );
    });
    return () => {
      socket.off("receive_message");
      socket.off("messages_seen");
      socket.off("display_typing");
      socket.off("hide_typing");
      socket.off("reaction_updated");
      socket.off("request_accepted"); // ✅ پاکسازی
    };
  }, [myId, receiverId, API_URL, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const scrollToOriginal = (msgId) => {
    const target = msgRefs.current[msgId];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("chat-page__row--highlight");
      setTimeout(
        () => target.classList.remove("chat-page__row--highlight"),
        1000
      );
    }
  };

  // ✅ هندلر قبول کردن درخواست
  const handleAccept = async () => {
    try {
        const res = await fetch(`${API_URL}/api/chat/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ conversationId })
        });
        if (res.ok) {
            setChatStatus('active');
            toast.success("Connection established! 🥂");
        } else {
            toast.error("Error accepting request");
        }
    } catch (err) {
        console.error(err);
    }
  };

  // ✅ هندلر رد کردن درخواست
  const handleReject = async () => {
    try {
        const res = await fetch(`${API_URL}/api/chat/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ conversationId })
        });
        if (res.ok) {
            toast('Request rejected', { icon: '👋' });
            navigate('/messages'); // برگشت به اینباکس
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleSend = async (fileData = null, type = "text") => {
    if (!newMessage.trim() && !fileData) return;
    
    // ✅ اگر پندینگ باشم و بخواهم پیام دوم بفرستم (که فرانت باید جلویش را بگیرد ولی محض احتیاط)
    if (chatStatus === 'pending_sent') {
        toast.error("Wait for them to accept first!");
        return;
    }

    const payload = {
      receiverId,
      text: fileData ? "" : newMessage,
      fileUrl: fileData,
      fileType: type,
      parentMessage: replyingTo
        ? {
            text: replyingTo.text,
            senderName:
              String(replyingTo.sender) === String(myId)
                ? "You"
                : receiverUser?.name,
            messageId: replyingTo._id,
          }
        : null,
    };
    const res = await fetch(`${API_URL}/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    
    if (res.ok) {
      const saved = await res.json();
      setMessages((prev) => [...prev, saved]);
      setNewMessage("");
      setReplyingTo(null);
      setShowSpark(false);
      socket.emit("stop_typing", { receiverId });

      // ✅ اگر اولین پیام بود، وضعیت را به pending_sent تغییر بده (اگر مچ نباشند)
      // اینجا فرض می‌کنیم اگر قبلاً active نبوده، الان ریکوئست شده
      if (messages.length === 0 && chatStatus === 'active') {
         // یک چک سریع یا رفرش وضعیت بد نیست، ولی فعلا کاربر را بلاک نمی‌کنیم
         // چون ممکن است مچ باشند. بک‌اند اگر ارور نداد یعنی اوکی است.
         // اما اگر ریکوئست باشد، باید UI آپدیت شود.
         checkChatStatus();
      }
    } else {
        // ✅ هندل کردن ارور 403 بک‌اند (Request Pending)
        const errData = await res.json();
        if (res.status === 403) {
            toast.error(errData.message || "Action not allowed");
            if (errData.error === "Request Pending") setChatStatus('pending_sent');
        }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
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
      } catch (err) {
        toast.error("Mic access denied");
        console.log(err);
      }
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
      body: JSON.stringify({ emoji }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, reactions: updated.reactions } : m
        )
      );
    }
  };

  const handleSpark = async () => {
    if (showSpark) {
      setShowSpark(false);
      return;
    }
    setIsSparkLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/spark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSparkSuggestions(data.suggestions);
        setShowSpark(true);
      } else {
        toast.error("Wingman is currently unavailable 😴");
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection failed");
    } finally {
      setIsSparkLoading(false);
    }
  };

  if (isSyncing)
    return (
      <div className="chat-page__loading">
        <div className="chat-page__spinner" />
      </div>
    );

  return (
    <div className="chat-page">
      <header className="chat-page__header">
        <button className="chat-page__back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="chat-page__header-info">
          <img
            src={receiverUser?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="chat-page__header-avatar"
            onClick={() => navigate(`/user-profile/${receiverUser._id}`)}
          />
          <div className="chat-page__header-text-wrapper">
            <h3 className="chat-page__header-username">{receiverUser?.name}</h3>
            <p className="chat-page__header-status">
              {/* ✅ نمایش وضعیت در هدر */}
              {chatStatus === 'pending_received' ? 'Sent you a request' : 
               chatStatus === 'pending_sent' ? 'Request Sent' : 
               isReceiverTyping ? "typing..." : "online"}
            </p>
          </div>
        </div>
      </header>

      <div
        className="chat-page__messages-area"
        onClick={() => setActiveActionId(null)}
      >
        {messages.map((m, index) => {
          const isOwn = String(m.sender) === String(myId);
          const currentDate = new Date(m.createdAt).toDateString();
          const prevDate =
            index > 0
              ? new Date(messages[index - 1].createdAt).toDateString()
              : null;
          const showDivider = currentDate !== prevDate;

          return (
            <React.Fragment key={m._id}>
              {showDivider && (
                <div className="chat-page__date-divider">
                  <span className="chat-page__date-label">
                    {formatDividerDate(m.createdAt)}
                  </span>
                </div>
              )}
              <div
                ref={(el) => (msgRefs.current[m._id] = el)}
                className={`chat-page__row ${
                  isOwn ? "chat-page__row--own" : "chat-page__row--their"
                }`}
              >
                <div
                  className="chat-page__message-wrapper"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth <= 768)
                      setActiveActionId(
                        activeActionId === m._id ? null : m._id
                      );
                  }}
                >
                  <div className="chat-page__bubble">
                    {m.parentMessage && (
                      <div
                        className="chat-page__reply-quote"
                        onClick={() =>
                          scrollToOriginal(m.parentMessage.messageId)
                        }
                      >
                        <small className="chat-page__reply-sender">
                          {m.parentMessage.senderName}
                        </small>
                        <p className="chat-page__reply-text">
                          {m.parentMessage.text || "Media"}
                        </p>
                      </div>
                    )}
                    {m.fileType === "image" && (
                      <img
                        src={m.fileUrl}
                        className="chat-page__image"
                        alt="sent"
                        onClick={() => setSelectedImg(m.fileUrl)}
                      />
                    )}
                    {m.fileType === "audio" && (
                      <audio
                        src={m.fileUrl}
                        controls
                        className="chat-page__audio"
                      />
                    )}
                    {m.text && <p className="chat-page__text">{m.text}</p>}

                    <div className="chat-page__meta">
                      <span className="chat-page__time">
                        {formatMsgTime(m.createdAt)}
                      </span>
                      {m.reactions?.length > 0 && (
                        <div className="chat-page__reactions">
                          {m.reactions.map((r, i) => (
                            <span key={i} className="chat-page__reaction-emoji">
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                      {isOwn && (
                        <span className="chat-page__read-icon">
                          {m.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ اکشن‌ها فقط اگر چت اکتیو باشد نمایش داده شوند تا کاربر نتواند روی ریکوئست ری‌اکشن برود */}
                  {chatStatus === 'active' && (
                    <div
                        className={`chat-page__actions ${
                        activeActionId === m._id
                            ? "chat-page__actions--mobile-active"
                            : ""
                        }`}
                    >
                        <span
                        className="chat-page__action-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            addReaction(m._id, "❤️");
                            setActiveActionId(null);
                        }}
                        >
                        ❤️
                        </span>
                        <span
                        className="chat-page__action-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            addReaction(m._id, "👍");
                            setActiveActionId(null);
                        }}
                        >
                        👍
                        </span>
                        <span
                        className="chat-page__action-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            setReplyingTo(m);
                            setActiveActionId(null);
                        }}
                        >
                        Reply
                        </span>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div className="chat-page__scroll-anchor" ref={scrollRef} />
      </div>

      {selectedImg && (
        <div
          className="chat-page__lightbox"
          onClick={() => setSelectedImg(null)}
        >
          <img
            src={selectedImg}
            alt="Enlarged"
            className="chat-page__lightbox-img"
          />
        </div>
      )}

      {/* ✅✅ FOOTER: شرطی کردن نمایش بر اساس وضعیت چت */}
      <footer className="chat-page__footer">
        
        {/* حالت ۱: ریکوئست دریافت شده (نمایش دکمه Accept/Reject) */}
        {chatStatus === 'pending_received' && (
            <div className="chat-page__request-bar">
                <p className="chat-page__request-text">
                    {receiverUser?.name} wants to connect with you.
                </p>
                <div className="chat-page__request-buttons">
                    <button className="chat-page__btn-reject" onClick={handleReject}>
                        <RiCloseLine /> Reject
                    </button>
                    <button className="chat-page__btn-accept" onClick={handleAccept}>
                        <RiCheckLine /> Accept
                    </button>
                </div>
            </div>
        )}

        {/* حالت ۲: ریکوئست ارسال شده (پیام انتظار) */}
        {chatStatus === 'pending_sent' && (
            <div className="chat-page__pending-bar">
                <p>🔒 Request sent. You can chat once they accept.</p>
            </div>
        )}

        {/* حالت ۳: چت فعال (فرم ارسال پیام) */}
        {chatStatus === 'active' && (
            <>
                {/* --- SPARK SUGGESTIONS --- */}
                {showSpark && (
                <div className="chat-page__spark-panel">
                    <div className="chat-page__spark-header">
                    <span className="chat-page__spark-title">
                        ✨ Wingman Suggestions
                    </span>
                    <button
                        className="chat-page__spark-close"
                        onClick={() => setShowSpark(false)}
                    >
                        ×
                    </button>
                    </div>
                    <div className="chat-page__spark-list">
                    {sparkSuggestions.map((item, idx) => (
                        <button
                        key={idx}
                        className="chat-page__spark-chip"
                        onClick={() => {
                            setNewMessage(item.text);
                            setShowSpark(false);
                        }}
                        >
                        <span className="chat-page__spark-type">{item.type}</span>
                        <span className="chat-page__spark-text">{item.text}</span>
                        </button>
                    ))}
                    </div>
                </div>
                )}

                {replyingTo && (
                <div className="chat-page__reply-preview">
                    <div className="chat-page__reply-content">
                    <span className="chat-page__reply-label">
                        Replying to{" "}
                        {String(replyingTo.sender) === String(myId)
                        ? "yourself"
                        : receiverUser?.name}
                    </span>
                    <p className="chat-page__reply-preview-text">
                        {replyingTo.text || "Media"}
                    </p>
                    </div>
                    <button
                    className="chat-page__cancel-reply"
                    onClick={() => setReplyingTo(null)}
                    >
                    ×
                    </button>
                </div>
                )}

                <form
                className="chat-page__form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                }}
                >
                <button
                    type="button"
                    className={`chat-page__spark-btn ${
                    isSparkLoading ? "chat-page__spark-btn--loading" : ""
                    }`}
                    onClick={handleSpark}
                    title="Ask AI Wingman"
                >
                    {isSparkLoading ? "..." : "✨"}
                </button>

                <label htmlFor="file-up" className="chat-page__attach-label">
                    📎
                </label>
                <input
                    type="file"
                    id="file-up"
                    className="chat-page__file-input"
                    hidden
                    onChange={(e) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(e.target.files[0]);
                    reader.onloadend = () =>
                        handleSend(
                        reader.result,
                        e.target.files[0].type.startsWith("image") ? "image" : "file"
                        );
                    }}
                />
                <input
                    className="chat-page__input"
                    value={newMessage}
                    onChange={(e) => {
                    setNewMessage(e.target.value);
                    socket.emit("typing", { receiverId, senderId: myId });
                    }}
                    placeholder="Type a message..."
                />
                <button
                    type="button"
                    onClick={toggleRecording}
                    className={`chat-page__mic-btn ${
                    isRecording ? "chat-page__mic-btn--active" : ""
                    }`}
                >
                    {isRecording ? "🎤" : "🎤"}
                </button>
                <button type="submit" className="chat-page__send-btn">
                    <RiSendPlane2Fill />
                </button>
                </form>
            </>
        )}
      </footer>
    </div>
  );
};

export default ChatPage;