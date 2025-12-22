import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./MessagesInboxPage.css";

const MessagesInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
//
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/conversations`, {
          credentials: "include",
        });
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [API_URL]);

  if (loading) return (
    <div className="inbox-loading-screen">
      <div className="spinner"></div>
      <p>Unlocking Messages...</p>
    </div>
  );

  return (
    <div className="inbox-page">
      {/* Hero Section Style Header */}
      <header className="inbox-hero">
        <div className="hero-text">
          <h1>Messages</h1>
          <p>Continue your conversations and unlock deep connections.</p>
        </div>
        <div className="plan-pill">
          <span>{conversations.length} Active Chats</span>
        </div>
      </header>

      <main className="inbox-container">
        {conversations.length > 0 ? (
          <div className="conversations-grid">
            {conversations.map((conv) => {
              const otherUser = conv.participants.find(p => p._id !== currentUser._id);
              
              return (
                <div
                  key={conv._id}
                  className="inbox-card"
                  onClick={() => navigate(`/chat/${otherUser._id}`)}
                >
                  <div className="inbox-card-image">
                    <img src={otherUser?.avatar || "/default-avatar.png"} alt={otherUser?.name} />
                  </div>
                  
                  <div className="inbox-card-content">
                    <div className="inbox-card-header">
                      <h3>{otherUser?.name}</h3>
                      <span className="msg-time">
                        {conv.lastMessage?.createdAt && new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="msg-preview">
                      {conv.lastMessage?.text || "Started a new connection"}
                    </p>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="soulmate-locked-card inbox-empty">
            <div className="lock-glow"></div>
            <span className="lock-emoji">💬</span>
            <h3>No Messages Yet</h3>
            <p>Go to explore and find your first match!</p>
            <button onClick={() => navigate("/explore")} className="upgrade-action-btn">
              Explore People
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagesInboxPage;