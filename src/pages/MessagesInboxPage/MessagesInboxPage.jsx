import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import "./MessagesInboxPage.css";

const MessagesInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

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
      <div className="neon-spinner"></div>
      <p>Unlocking Conversations...</p>
    </div>
  );

  return (
    <ExploreBackgroundLayout>
      <div className="inbox-page-wrapper">
        <header className="inbox-hero-modern">
          <div className="hero-text-content">
            <h1 className="gradient-text-inbox">Messages</h1>
            <p>Deep connections start with a single word.</p>
          </div>
          <div className="chats-count-badge">
            <span className="pulse-dot"></span>
            {conversations.length} Active Chats
          </div>
        </header>

        <main className="inbox-main-content">
          {conversations.length > 0 ? (
            <div className="conversations-list-modern">
              {conversations.map((conv, index) => {
                const otherUser = conv.participants.find(p => p._id !== currentUser?._id);
                const hasUnread = conv.unreadCount > 0;
                
                return (
                  <div
                    key={conv._id}
                    className={`inbox-card-modern ${hasUnread ? "unread-highlight" : ""}`}
                    style={{ "--delay": `${index * 0.1}s` }}
                    onClick={() => navigate(`/chat/${otherUser._id}`)}
                  >
                    <div className="avatar-wrapper-inbox">
                      <img src={otherUser?.avatar || "/default-avatar.png"} alt={otherUser?.name} />
                      {otherUser?.isOnline && <span className="online-indicator-dot"></span>}
                    </div>
                    
                    <div className="message-info-body">
                      <div className="info-header-top">
                        <h3 className="user-name-inbox">{otherUser?.name}</h3>
                        <span className="time-stamp-modern">
                          {conv.lastMessage?.createdAt && new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="info-footer-bottom">
                        <p className={`message-snippet ${hasUnread ? "active-text" : ""}`}>
                          {conv.lastMessage?.text || "New connection started"}
                        </p>
                        
                        {hasUnread && (
                          <div className="unread-counter-glow">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="entry-arrow"><span></span></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-inbox-state">
              <div className="empty-icon-glow">💬</div>
              <h3>Silence is not Gold</h3>
              <p>Your inbox is waiting for its first spark. Start exploring!</p>
              <button onClick={() => navigate("/explore")} className="explore-trigger-btn">
                Discover People
              </button>
            </div>
          )}
        </main>
      </div>
    </ExploreBackgroundLayout>
  );
};

export default MessagesInboxPage;