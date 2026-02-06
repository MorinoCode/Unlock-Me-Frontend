import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import PostCard from "../../components/postCard/PostCard";
import CreatePostModal from "../../components/createPostModal/CreatePostModal";
import ExploreBackgroundLayout from "../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout";
import { Plus, Globe, FolderHeart } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { useFeedStore } from "../../store/feedStore";
import "./FeedPage.css";
import HeartbeatLoader from "../../components/heartbeatLoader/HeartbeatLoader";

const feedCacheKey = (userId, tab) => `${userId ?? ""}:${tab ?? "global"}`;
const EMPTY_POSTS = [];

const FeedPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("global");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const userId = currentUser?._id;

  const posts = useFeedStore((state) => {
    const entry = state.cache[feedCacheKey(userId, activeTab)];
    return entry?.posts ?? EMPTY_POSTS;
  });
  const loading = useFeedStore((state) => state.loading);
  const getCached = useFeedStore((state) => state.getCached);
  const fetchFeed = useFeedStore((state) => state.fetchFeed);
  const invalidate = useFeedStore((state) => state.invalidate);
  const updatePostInCache = useFeedStore((state) => state.updatePostInCache);
  const removePostFromCache = useFeedStore((state) => state.removePostFromCache);

  const loadFeed = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;
      const cached = getCached(userId, activeTab);
      const silent = cached && !forceRefresh;
      await fetchFeed(API_URL, userId, activeTab, silent);
    },
    [API_URL, userId, activeTab, getCached, fetchFeed]
  );

  useEffect(() => {
    if (!userId) return;
    loadFeed();
  }, [userId, activeTab, loadFeed]);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const updatedLikesArray = await response.json();
        updatePostInCache(userId, activeTab, postId, { likes: updatedLikesArray });
      } else {
        const err = await response.json();
        toast.error(err.message || t("feed.failedToLike"));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const doDeletePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        removePostFromCache(userId, activeTab, postId);
        toast.success(t("feed.postRemoved"));
      } else {
        toast.error(t("feed.deleteFailed"));
      }
    } catch (err) {
      toast.error(t("feed.deleteFailed"));
      console.log(err);
    }
  };

  const handleDelete = (postId) => {
    toast(
      (toastId) => (
        <span className="feed-toast-wrap">
          {t("feed.deletePostConfirm")}
          <div className="feed-toast-btns">
            <button
              type="button"
              className="feed-toast-confirm-btn feed-toast-confirm-btn--danger"
              onClick={() => {
                toast.dismiss(toastId.id);
                doDeletePost(postId);
              }}
            >
              {t("common.delete")}
            </button>
            <button
              type="button"
              className="feed-toast-cancel-btn"
              onClick={() => toast.dismiss(toastId.id)}
            >
              {t("common.cancel")}
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  const refreshFeed = useCallback(() => {
    invalidate(userId, "personal");
    loadFeed(true);
  }, [userId, invalidate, loadFeed]);

  return (
    <ExploreBackgroundLayout>
      <div className="feed-wrapper">
        <div className="feed-header-tabs">
          <button
            className={`feed-tab ${activeTab === "global" ? "active" : ""}`}
            onClick={() => setActiveTab("global")}
            aria-pressed={activeTab === "global"}
            aria-label={t("feed.explore")}
          >
            <Globe size={18} aria-hidden /> <span>{t("feed.explore")}</span>
          </button>
          <button
            className={`feed-tab ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
            aria-pressed={activeTab === "personal"}
            aria-label={t("feed.myPosts")}
          >
            <FolderHeart size={18} aria-hidden /> <span>{t("feed.myPosts")}</span>
          </button>
        </div>

        <div className="feed-main-content">
          {loading && posts.length === 0 ? (
            <HeartbeatLoader />
          ) : posts.length === 0 ? (
            <div className="feed-empty-state" role="status">
              <div className="feed-empty-icon">
                {activeTab === "global" ? "🌍" : "📝"}
              </div>
              <h3 className="feed-empty-title">
                {activeTab === "global"
                  ? t("feed.noPostsYet")
                  : t("feed.haventPosted")}
              </h3>
              <p className="feed-empty-desc">
                {activeTab === "global"
                  ? t("feed.noPostsDesc")
                  : t("feed.createPostDesc")}
              </p>
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    onCommentAdded={(postId, newCommentCount) =>
                      updatePostInCache(userId, activeTab, postId, {
                        commentCount: newCommentCount,
                      })
                    }
                    onPostUpdated={(updatedPost) =>
                      updatePostInCache(userId, activeTab, updatedPost._id, updatedPost)
                    }
                  />
                ))}
              </div>
              {loading && posts.length > 0 && (
                <div className="feed-refreshing-indicator" aria-hidden>
                  <HeartbeatLoader />
                </div>
              )}
            </>
          )}
        </div>

        <button
          className="create-post-fab"
          onClick={() => setIsModalOpen(true)}
          aria-label={t("feed.createPost")}
        >
          <Plus size={28} aria-hidden />
        </button>

        {isModalOpen && (
          <CreatePostModal
            closeModal={() => setIsModalOpen(false)}
            refreshFeed={refreshFeed}
          />
        )}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default FeedPage;
