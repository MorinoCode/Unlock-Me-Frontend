import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/useAuth.js";
import { Trash2, Check, X } from "lucide-react";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import HeartBeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";
import { useInboxStore } from "../../store/inboxStore";
import { socket } from "../../socket";
import "./MessagesInboxPage.css";

const EMPTY_ARR = [];

const MessagesInboxPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("active");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const userId = currentUser?._id;
  const [hidingId, setHidingId] = useState(null);
  const [actionId, setActionId] = useState(null);

  const cacheKey = `${userId ?? ""}:${activeTab}`;
  const entry = useInboxStore((state) => state.cache[cacheKey]);
  const conversations = entry?.conversations ?? EMPTY_ARR;
  const loading = useInboxStore((state) => state.loading);
  const getCached = useInboxStore((state) => state.getCached);
  const fetchConversations = useInboxStore((state) => state.fetchConversations);
  const invalidateAll = useInboxStore((state) => state.invalidateAll);
  const removeConversation = useInboxStore((state) => state.removeConversation);

  const loadConversations = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;
      const cached = getCached(userId, activeTab);
      const silent = cached && !forceRefresh;
      await fetchConversations(API_URL, userId, activeTab, silent);
    },
    [API_URL, userId, activeTab, getCached, fetchConversations]
  );

  useEffect(() => {
    if (!userId) return;
    loadConversations();
  }, [userId, activeTab, loadConversations]);

  useEffect(() => {
    const handleRefetch = () => {
      invalidateAll(userId);
      loadConversations(true);
    };
    window.addEventListener("refetch-conversations", handleRefetch);
    return () => window.removeEventListener("refetch-conversations", handleRefetch);
  }, [userId, loadConversations, invalidateAll]);

  useEffect(() => {
    const onNewMessage = () => {
      if (!userId) return;
      invalidateAll(userId);
      loadConversations(true);
    };
    socket.on("receive_message", onNewMessage);
    return () => socket.off("receive_message", onNewMessage);
  }, [userId, loadConversations, invalidateAll]);

  const acceptRequest = async (e, conversationId) => {
    e.stopPropagation();
    if (!conversationId || actionId) return;
    setActionId(conversationId);
    try {
      const res = await fetch(`${API_URL}/api/chat/accept`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (res.ok) {
        removeConversation(userId, "requests", conversationId);
        window.dispatchEvent(new Event("refetch-unread-messages"));
        if (activeTab === "requests") {
          setTimeout(() => {
            setActiveTab("active");
            setTimeout(() => {
              invalidateAll(userId);
              loadConversations(true);
            }, 100);
          }, 300);
        }
      }
    } catch (err) {
      console.error("Accept request error:", err);
    } finally {
      setActionId(null);
    }
  };

  const rejectRequest = async (e, conversationId) => {
    e.stopPropagation();
    if (!conversationId || actionId) return;
    setActionId(conversationId);
    try {
      const res = await fetch(`${API_URL}/api/chat/reject`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (res.ok) {
        removeConversation(userId, "requests", conversationId);
      }
    } catch (err) {
      console.error("Reject request error:", err);
    } finally {
      setActionId(null);
    }
  };

  const hideChat = async (e, conversationId) => {
    e.stopPropagation();
    if (!conversationId || hidingId) return;
    setHidingId(conversationId);
    try {
      const res = await fetch(`${API_URL}/api/chat/conversations/hide`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (res.ok) {
        removeConversation(userId, "active", conversationId);
        window.dispatchEvent(new Event("refetch-unread-messages"));
      }
    } catch (err) {
      console.error("Hide conversation error:", err);
    } finally {
      setHidingId(null);
    }
  };

  const isLoadingFirst = loading && conversations.length === 0;
  if (isLoadingFirst) return <HeartBeatLoader />;

  return (
    <ExploreBackgroundLayout>
      <div className="inbox-page">
        <header className="inbox-page__header">
          <div className="inbox-page__header-content">
            <h1 className="inbox-page__title">Messages</h1>
          </div>

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
            </button>
          </div>
        </header>

        <main className="inbox-page__main">
          <div className="inbox-page__count-badge">
            {conversations.length}{" "}
            {activeTab === "active" ? t("messages.conversations") : t("messages.pendingRequests")}
          </div>

          {conversations.length > 0 ? (
            <div className="inbox-page__list">
              {conversations.map((conv, index) => {
                const otherUser = conv.participants?.find(
                  (p) => String(p?._id) !== String(currentUser?._id)
                );
                if (!otherUser) return null;
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
                          {activeTab === "requests" ? (
                            <span style={{ color: "#ff4b4b" }}>
                              {t("messages.newRequest")}{" "}
                            </span>
                          ) : null}
                          {conv.lastMessage?.text || t("messages.newConnectionStarted")}
                        </p>

                        {hasUnread && (
                          <div className="inbox-page__unread-counter">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="inbox-page__card-actions">
                      {activeTab === "requests" ? (
                        <>
                          <button
                            type="button"
                            className="inbox-page__accept-btn"
                            onClick={(e) => acceptRequest(e, conv._id)}
                            disabled={actionId === conv._id}
                            aria-label={t("messages.accept")}
                            title={t("messages.accept")}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            className="inbox-page__reject-btn"
                            onClick={(e) => rejectRequest(e, conv._id)}
                            disabled={actionId === conv._id}
                            aria-label={t("messages.reject")}
                            title={t("messages.reject")}
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="inbox-page__delete-btn"
                          onClick={(e) => hideChat(e, conv._id)}
                          disabled={hidingId === conv._id}
                          aria-label={t("messages.deleteFromList")}
                          title={t("messages.deleteFromList")}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
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
                  ? t("messages.silenceNotGold")
                  : t("messages.noPendingRequests")}
              </h3>
              <p className="inbox-page__empty-desc">
                {activeTab === "active"
                  ? t("messages.inboxEmpty")
                  : t("messages.noRequestsNow")}
              </p>

              {activeTab === "active" && (
                <button
                  onClick={() => navigate("/explore")}
                  className="inbox-page__explore-btn"
                >
                  {t("messages.discoverPeople")}
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
