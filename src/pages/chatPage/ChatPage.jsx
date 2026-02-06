import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth.js";
import { useSocket } from "../../context/useSocket.js";
import { useChatMessagesStore } from "../../store/chatMessagesStore";
import { useUserDetailsStore } from "../../store/userDetailsStore";
import toast from "react-hot-toast";
import "./ChatPage.css";
import {
  RiSendPlane2Fill,
  RiMicFill,
  RiMicLine,
  RiAttachment2,
} from "react-icons/ri";
import { HiSparkles, HiArrowLeft } from "react-icons/hi";

const ChatPage = () => {
  const { t } = useTranslation();
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);

  // --- Spark / AI Wingman State ---
  const [sparkSuggestions, setSparkSuggestions] = useState([]);
  const [isSparkLoading, setIsSparkLoading] = useState(false);
  const [showSpark, setShowSpark] = useState(false);

  const scrollRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const msgRefs = useRef({});
  const mediaRecorder = useRef(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const myId = currentUser?._id || currentUser?.id;

  const getCached = useChatMessagesStore((s) => s.getCached);
  const setCached = useChatMessagesStore((s) => s.setCached);
  const fetchMessages = useChatMessagesStore((s) => s.fetchMessages);
  const appendMessage = useChatMessagesStore((s) => s.appendMessage);

  const receiverUser = useUserDetailsStore((s) => {
    const entry = s.cache[receiverId ?? ""];
    return entry?.user ?? null;
  });
  const getUserDetailsCached = useUserDetailsStore((s) => s.getCached);
  const fetchUserDetails = useUserDetailsStore((s) => s.fetchUserDetails);

  // --- Helper Functions ---
  const formatDividerDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t("chat.today");
    if (date.toDateString() === yesterday.toDateString()) return t("chat.yesterday");
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

  // --- Effects ---
  useEffect(() => {
    if (!receiverId || !currentUser) {
      if (!receiverId) setIsSyncing(false);
      return;
    }
    const ac = new AbortController();
    setIsSyncing(true);
    const loadChat = async () => {
      try {
        const cached = getCached(receiverId);
        const userCached = getUserDetailsCached(myId, receiverId);
        const silent = !!userCached;
        if (!userCached) {
          fetchUserDetails(API_URL, myId, receiverId, silent, ac.signal).catch(() => {});
        }
        const mRes = cached
          ? Promise.resolve({ ok: true, json: async () => cached })
          : fetch(`${API_URL}/api/chat/${receiverId}`, {
              credentials: "include",
              cache: "no-store",
              signal: ac.signal,
            });
        const mResData = await mRes;
        if (mResData.ok) {
          const list = await mResData.json();
          const msgs = Array.isArray(list) ? list.reverse() : [];
          setMessages(msgs);
          if (!cached) setCached(receiverId, list);
        }
        if (!cached) {
          fetchMessages(API_URL, receiverId, true, ac.signal).then(() => {
            const fresh = getCached(receiverId);
            if (fresh) setMessages(Array.isArray(fresh) ? fresh.reverse() : []);
          });
        }
        if (!ac.signal.aborted) {
          fetch(`${API_URL}/api/chat/read/${receiverId}`, {
            method: "PUT",
            credentials: "include",
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") setIsSyncing(false);
      } finally {
        if (!ac.signal.aborted) setTimeout(() => setIsSyncing(false), 500);
      }
    };
    loadChat();
    return () => ac.abort();
  }, [receiverId, currentUser, authLoading, API_URL, getCached, setCached, fetchMessages]);

  useEffect(() => {
    if (!myId || !socket) return;
    socket.emit("join_room", myId);

    const handleReceive = (m) => {
      if (
        String(m.sender) === String(receiverId) ||
        String(m.receiver) === String(receiverId)
      ) {
        setMessages((prev) => [...prev, m]);
        appendMessage(receiverId, m);
      }
      if (String(m.sender) === String(receiverId)) {
        fetch(`${API_URL}/api/chat/read/${receiverId}`, {
          method: "PUT",
          credentials: "include",
        });
      }
    };

    socket.on("receive_message", handleReceive);

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
      socket.off("receive_message", handleReceive);
      socket.off("messages_seen");
      socket.off("display_typing");
      socket.off("hide_typing");
      socket.off("reaction_updated");
    };
  }, [myId, receiverId, API_URL, socket]);

  // اسکرول مستقیم به انتهای ناحیهٔ پیام‌ها تا آخرین پیام دیده شود
  const scrollToBottom = useCallback(() => {
    const el = messagesAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom();
    const t = setTimeout(scrollToBottom, 200);
    return () => clearTimeout(t);
  }, [messages.length, isReceiverTyping, receiverId, scrollToBottom]);

  // --- Handlers ---
  const handleSend = async (fileData = null, type = "text") => {
    if (!newMessage.trim() && !fileData) return;
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
                ? t("chat.you")
                : receiverUser?.name,
            messageId: replyingTo._id,
          }
        : null,
    };

    try {
      const res = await fetch(`${API_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => [...prev, saved]);
        appendMessage(receiverId, saved);
        setNewMessage("");
        setReplyingTo(null);
        setShowSpark(false);
        socket?.emit("stop_typing", { receiverId });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || data.error || t("chat.failedToSend"));
      }
    } catch (error) {
      console.error("Send error", error);
      toast.error(t("chat.failedToSend"));
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const chunks = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = { recorder, stream };
        recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => handleSend(reader.result, "audio");
        };
        recorder.start();
        setIsRecording(true);
      } catch (err) {
        toast.error(t("chat.micDenied"));
      }
    } else {
      const ref = mediaRecorder.current;
      if (ref?.recorder) {
        ref.recorder.stop();
        ref.stream?.getTracks().forEach((t) => t.stop());
      }
      mediaRecorder.current = null;
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
        toast.error(t("chat.wingmanUnavailable"));
      }
    } catch (err) {
      toast.error(t("chat.connectionFailed"));
    } finally {
      setIsSparkLoading(false);
    }
  };

  useEffect(() => {
    if (!receiverId && !authLoading) navigate("/messages", { replace: true });
  }, [receiverId, authLoading, navigate]);

  if (!receiverId)
    return (
      <div className="chat-page__loading">
        <div className="chat-page__spinner" />
      </div>
    );

  if (isSyncing)
    return (
      <div className="chat-page__loading">
        <div className="chat-page__spinner" />
      </div>
    );

  return (
    <div className="chat-page">
      {/* HEADER */}
      <header className="chat-page__header">
        <button className="chat-page__back-btn" onClick={() => navigate(-1)}>
          <HiArrowLeft size={20} />
        </button>
        <div className="chat-page__header-info">
          <img
            src={receiverUser?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="chat-page__header-avatar"
            onClick={() => navigate(`/user-profile/${receiverId}`)}
          />
          <div>
            <h3 className="chat-page__header-username">{receiverUser?.name}</h3>
            <p className="chat-page__header-status">
              {isReceiverTyping ? (
                <span style={{ color: "#6366f1" }}>typing...</span>
              ) : (
                "online"
              )}
            </p>
          </div>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <div
        ref={messagesAreaRef}
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
                    // For mobile: toggle actions on click
                    if (window.innerWidth <= 768)
                      setActiveActionId(
                        activeActionId === m._id ? null : m._id
                      );
                  }}
                >
                  <div className="chat-page__bubble">
                    {/* Parent Message (Reply) */}
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
                          {m.parentMessage.text || t("chat.mediaAttachment")}
                        </p>
                      </div>
                    )}

                    {/* Content: Image */}
                    {m.fileType === "image" && (
                      <img
                        src={m.fileUrl}
                        className="chat-page__image"
                        alt="sent"
                        onClick={() => setSelectedImg(m.fileUrl)}
                      />
                    )}

                    {/* Content: Audio */}
                    {m.fileType === "audio" && (
                      <audio
                        src={m.fileUrl}
                        controls
                        className="chat-page__audio"
                      />
                    )}

                    {/* Content: Text */}
                    {m.text && <p className="chat-page__text">{m.text}</p>}

                    {/* Metadata: Time & Checks */}
                    <div className="chat-page__meta">
                      <span className="chat-page__time">
                        {formatMsgTime(m.createdAt)}
                      </span>

                      {/* Reactions Display */}
                      {m.reactions?.length > 0 && (
                        <div className="chat-page__reactions">
                          {m.reactions.map((r, i) => (
                            <span key={i}>{r.emoji}</span>
                          ))}
                        </div>
                      )}

                      {/* Read Status (Only for own messages) */}
                      {isOwn && (
                        <span className="chat-page__read-icon">
                          {m.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu (Hover/Click) */}
                  <div
                    className={`chat-page__actions ${
                      activeActionId === m._id
                        ? "chat-page__actions--mobile-active"
                        : ""
                    }`}
                  >
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        addReaction(m._id, "❤️");
                        setActiveActionId(null);
                      }}
                    >
                      ❤️
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        addReaction(m._id, "😂");
                        setActiveActionId(null);
                      }}
                    >
                      😂
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        addReaction(m._id, "👍");
                        setActiveActionId(null);
                      }}
                    >
                      👍
                    </span>
                    <span
                      style={{ fontSize: "0.8rem", marginLeft: "5px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyingTo(m);
                        setActiveActionId(null);
                      }}
                    >
                      Reply
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={scrollRef} className="chat-page__scroll-anchor" />
      </div>

      {/* Lightbox for Images */}
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

      {/* FOOTER AREA */}
      <footer className="chat-page__footer">
        {/* Spark Suggestions Panel */}
        {showSpark && (
          <div className="chat-page__spark-panel">
            <div className="chat-page__spark-header">
              <span className="chat-page__spark-title">
                <HiSparkles /> {t("chat.aiWingmanSuggestions")}
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

        {/* Reply Preview Panel */}
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

        {/* Input Form */}
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
            title={t("chat.askWingman")}
          >
            <HiSparkles />
          </button>

          <label htmlFor="file-up" className="chat-page__attach-label">
            <RiAttachment2 />
          </label>
          <input
            type="file"
            id="file-up"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onloadend = () =>
                handleSend(
                  reader.result,
                  file.type.startsWith("image") ? "image" : "file"
                );
              e.target.value = "";
            }}
          />

          <input
            className="chat-page__input"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              socket?.emit("typing", { receiverId, senderId: myId });
            }}
            placeholder={t("chat.typeMessage")}
          />

          <button
            type="button"
            onClick={toggleRecording}
            className={`chat-page__mic-btn ${
              isRecording ? "chat-page__mic-btn--active" : ""
            }`}
          >
            {isRecording ? <RiMicFill /> : <RiMicLine />}
          </button>

          <button type="submit" className="chat-page__send-btn">
            <RiSendPlane2Fill />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
