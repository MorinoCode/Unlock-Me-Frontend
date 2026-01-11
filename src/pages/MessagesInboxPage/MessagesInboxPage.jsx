import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import HeartBeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import "./MessagesInboxPage.css";

const MessagesInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  // ✅ State جدید برای تب‌ها (پیش‌فرض: active)
  const [activeTab, setActiveTab] = useState("active");

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        // ✅ ارسال تایپ تب به عنوان کوئری پارامتر
        const res = await fetch(
          `${API_URL}/api/chat/conversations?type=${activeTab}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [API_URL, activeTab]); // ✅ وابسته به activeTab شد

  if (loading) return <HeartBeatLoader />;

  return (
    <ExploreBackgroundLayout>
      <div className="inbox-page">
        <header className="inbox-page__header">
          <div className="inbox-page__header-content">
            <h1 className="inbox-page__title">Messages</h1>
            <p className="inbox-page__subtitle">
              Deep connections start with a single word.
            </p>
          </div>

          {/* ✅ اضافه شدن تب سوییچر */}
          <div className="inbox-tabs">
            <button
              className={`inbox-tab ${
                activeTab === "active" ? "inbox-tab--active" : ""
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active Chats
            </button>
            <button
              className={`inbox-tab ${
                activeTab === "requests" ? "inbox-tab--active" : ""
              }`}
              onClick={() => setActiveTab("requests")}
            >
              Requests
              {/* اگر بخواهید بعداً تعداد ریکوئست‌ها را اینجا نشان دهید، باید از بک‌اند بگیرید */}
            </button>
          </div>
        </header>

        <main className="inbox-page__main">
          <div className="inbox-page__count-badge">
            {conversations.length}{" "}
            {activeTab === "active" ? "Conversations" : "Pending Requests"}
          </div>

          {conversations.length > 0 ? (
            <div className="inbox-page__list">
              {conversations.map((conv, index) => {
                const otherUser = conv.participants.find(
                  (p) => p._id !== currentUser?._id
                );
                const hasUnread = conv.unreadCount > 0;

                return (
                  <div
                    key={conv._id}
                    className={`inbox-page__card ${
                      hasUnread ? "inbox-page__card--unread" : ""
                    }`}
                    style={{ "--delay": `${index * 0.1}s` }}
                    onClick={() => navigate(`/chat/${otherUser._id}`)}
                  >
                    <div className="inbox-page__avatar-wrapper">
                      <img
                        src={otherUser?.avatar || "/default-avatar.png"}
                        alt={otherUser?.name}
                        className="inbox-page__avatar-img"
                      />
                      {otherUser?.isOnline && (
                        <span className="inbox-page__online-dot"></span>
                      )}
                    </div>

                    <div className="inbox-page__card-body">
                      <div className="inbox-page__card-header">
                        <h3 className="inbox-page__user-name">
                          {otherUser?.name}
                        </h3>
                        <span className="inbox-page__timestamp">
                          {conv.lastMessage?.createdAt &&
                            new Date(
                              conv.lastMessage.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>

                      <div className="inbox-page__card-footer">
                        <p
                          className={`inbox-page__snippet ${
                            hasUnread ? "inbox-page__snippet--active" : ""
                          }`}
                        >
                          {/* نمایش متن متفاوت برای ریکوئست */}
                          {activeTab === "requests" ? (
                            <span style={{ color: "#ff4b4b" }}>
                              New Request:{" "}
                            </span>
                          ) : null}
                          {conv.lastMessage?.text || "New connection started"}
                        </p>

                        {hasUnread && (
                          <div className="inbox-page__unread-counter">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="inbox-page__arrow">
                      <span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="inbox-page__empty-state">
              <div className="inbox-page__empty-icon">
                {activeTab === "active" ? "💬" : "📭"}
              </div>
              <h3 className="inbox-page__empty-title">
                {activeTab === "active"
                  ? "Silence is not Gold"
                  : "No Pending Requests"}
              </h3>
              <p className="inbox-page__empty-desc">
                {activeTab === "active"
                  ? "Your inbox is waiting for its first spark. Start exploring!"
                  : "You don't have any message requests right now."}
              </p>

              {activeTab === "active" && (
                <button
                  onClick={() => navigate("/explore")}
                  className="inbox-page__explore-btn"
                >
                  Discover People
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </ExploreBackgroundLayout>
  );
};

export default MessagesInboxPage;
