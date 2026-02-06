import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Heart,
  MessageCircle,
  Trash2,
  User,
  Send,
  Loader2,
  Reply,
  X,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import "./PostCard.css";
import HeartbeatLoader from "../heartbeatLoader/HeartbeatLoader";
import EditPostModal from "../editPostModal/EditPostModal";
import { useCommentsStore } from "../../store/commentsStore";

// Helper component for "See More" text
const ExpandableText = ({ text, limit = 100, className = "" }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;
  if (text.length <= limit) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {isExpanded ? text : `${text.substring(0, limit)}... `}
      <button
        className="see-more-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        style={{
          background: "none",
          border: "none",
          color: "#9ca3af",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: 600,
          padding: 0,
          marginLeft: "4px",
        }}
      >
        {isExpanded ? t("common.seeLess") : t("common.seeMore")}
      </button>
    </span>
  );
};

const PostCard = ({
  post,
  currentUser,
  onLike,
  onDelete,
  onCommentAdded,
  onPostUpdated,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const EMPTY_ARR = [];
  const comments = useCommentsStore((state) => {
    const entry = state.cache[post._id ?? ""];
    return entry?.comments ?? EMPTY_ARR;
  });
  const getCached = useCommentsStore((state) => state.getCached);
  const fetchComments = useCommentsStore((state) => state.fetchComments);
  const appendComment = useCommentsStore((state) => state.appendComment);
  const removeComment = useCommentsStore((state) => state.removeComment);

  const currentUserId = currentUser?._id;
  const authorId = post.author?._id || post.author;
  const isOwner =
    currentUserId &&
    authorId &&
    currentUserId.toString() === authorId.toString();

  // Check if liked using the likes array in the post object
  const isLiked = post.likes?.some(
    (id) => id?.toString() === currentUserId?.toString()
  );

  const goToProfile = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    if (userId) {
      navigate(`/user-profile/${userId}`);
    }
  };

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    const cached = getCached(post._id);
    const silent = !!cached;
    if (cached) setShowComments(true);
    setLoadingComments(true);
    try {
      await fetchComments(API_URL, post._id, silent);
      setShowComments(true);
    } catch (err) {
      toast.error(t("feed.failedToLoadComments"));
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const doDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/posts/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        removeComment(post._id, commentId);
        if (
          data.newPostCommentCount != null &&
          typeof onCommentAdded === "function"
        ) {
          onCommentAdded(post._id, data.newPostCommentCount);
        }
        toast.success(t("feed.commentDeleted"));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteComment = (commentId) => {
    toast(
      (t) => (
        <span className="feed-toast-wrap">
          {t("feed.deleteCommentConfirm")}
          <div className="feed-toast-btns">
            <button
              type="button"
              className="feed-toast-confirm-btn feed-toast-confirm-btn--danger"
              onClick={() => {
                toast.dismiss(t.id);
                doDeleteComment(commentId);
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="feed-toast-cancel-btn"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </span>
      ),
      { duration: 6000 }
    );
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    const content = commentText.trim();
    const body = replyTo
      ? { content, parentCommentId: replyTo._id }
      : { content };
    try {
      const response = await fetch(
        `${API_URL}/api/posts/${post._id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const { newPostCommentCount, ...commentData } = data;
      appendComment(post._id, commentData);
      if (typeof onCommentAdded === "function" && newPostCommentCount != null) {
        onCommentAdded(post._id, newPostCommentCount);
      }

      setCommentText("");
      setReplyTo(null);
      toast.success(replyTo ? t("feed.replyAdded") : t("feed.commentAdded"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-card-box">
      <div className="post-card-top">
        <div
          className="post-user-meta"
          onClick={(e) => goToProfile(e, authorId)}
        >
          <div className="post-avatar-frame">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt="" />
            ) : (
              <User size={18} />
            )}
          </div>
          <span className="post-author-name">
            {post.author?.name || "User"}
          </span>
        </div>
        {isOwner && (
          <div className="post-owner-actions">
            <button
              type="button"
              className="post-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              aria-label="Edit post"
            >
              <Pencil size={18} />
            </button>
            <button
              className="post-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post._id);
              }}
              aria-label="Delete post"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="post-media-frame" onDoubleClick={() => onLike(post._id)}>
        <img src={post.image} className="post-img" alt="" />
      </div>

      <div className="post-interaction-bar">
        <div className="post-btns">
          <button
            className={`post-action-button ${isLiked ? "is-liked" : ""}`}
            onClick={() => onLike(post._id)}
          >
            <Heart
              size={26}
              fill={isLiked ? "#ef4444" : "none"}
              stroke={isLiked ? "#ef4444" : "white"}
              style={{ transition: "all 0.3s ease" }}
            />
          </button>

          <button className="post-action-button" onClick={toggleComments}>
            <MessageCircle size={26} color="white" />
          </button>
        </div>

        <div className="post-stats-row">
          <span className="post-stat-item">
            {post.likes?.length || 0} {t("feed.likes")}
          </span>
          {/* Show comment count if available in post object */}
          <span
            className="post-stat-item"
            onClick={toggleComments}
            style={{ cursor: "pointer" }}
          >
            {post.commentCount || 0} {t("feed.comments")}
          </span>
        </div>

        <div className="post-caption">
          <strong onClick={(e) => goToProfile(e, authorId)}>
            {post.author?.name}
          </strong>
          <span className="caption-spacer"> </span>
          <ExpandableText text={post.description} limit={90} />
        </div>
      </div>

      {showComments && (
        <div className="post-comments-wrap">
          <div className="post-comments-scroll">
            {comments.length > 0
              ? (() => {
                  const topLevel = comments.filter((c) => !c.parentComment);
                  const getReplies = (parentId) =>
                    comments.filter(
                      (c) =>
                        c.parentComment &&
                        (c.parentComment._id || c.parentComment)?.toString() ===
                          parentId?.toString()
                    );
                  return (
                    <>
                      {topLevel.map((c) => {
                        const isCommentAuthor =
                          c.author?._id?.toString() ===
                            currentUserId?.toString() ||
                          c.author?.toString() === currentUserId?.toString();
                        const isPostOwner = isOwner;
                        const replies = getReplies(c._id);

                        return (
                          <div key={c._id} className="post-single-comment">
                            <div className="comment-main-row">
                              <div className="comment-main-body">
                                <strong
                                  className="comment-user-link"
                                  onClick={(e) => goToProfile(e, c.author?._id)}
                                >
                                  {c.author?.name}:
                                </strong>
                                <span className="comment-spacer"> </span>
                                <ExpandableText text={c.content} limit={60} />
                              </div>
                              {(isCommentAuthor || isPostOwner) && (
                                <button
                                  className="comment-delete-small-btn"
                                  onClick={() => handleDeleteComment(c._id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <button
                              className="comment-reply-link"
                              onClick={() => {
                                setReplyTo(c);
                                setCommentText("");
                              }}
                            >
                              <Reply size={12} /> {t("feed.reply")}
                            </button>
                            {replies.length > 0 && (
                              <div className="comment-replies">
                                {replies.map((r) => {
                                  const isReplyAuthor =
                                    r.author?._id?.toString() ===
                                      currentUserId?.toString() ||
                                    r.author?.toString() ===
                                      currentUserId?.toString();
                                  return (
                                    <div
                                      key={r._id}
                                      className="post-single-comment comment-is-reply"
                                    >
                                      <div className="comment-main-row">
                                        <div className="comment-main-body">
                                          <span className="comment-reply-label">
                                            {t("feed.replyingTo")}{" "}
                                            {r.parentComment?.author?.name ||
                                              t("feed.comments")}
                                          </span>
                                          <strong
                                            className="comment-user-link"
                                            onClick={(e) =>
                                              goToProfile(e, r.author?._id)
                                            }
                                          >
                                            {" "}
                                            {r.author?.name}:
                                          </strong>
                                          <span className="comment-spacer">
                                            {" "}
                                          </span>
                                          <ExpandableText
                                            text={r.content}
                                            limit={60}
                                          />
                                        </div>
                                        {(isReplyAuthor || isPostOwner) && (
                                          <button
                                            className="comment-delete-small-btn"
                                            onClick={() =>
                                              handleDeleteComment(r._id)
                                            }
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                })()
              : !loadingComments && (
                  <p className="no-comments-msg">{t("feed.noComments")}</p>
                )}
          </div>

          <form
            onSubmit={handleAddComment}
            className="post-comment-field-container"
          >
            {replyTo && (
              <div className="replying-to-bar">
                <span>{t("feed.replyingTo")} {replyTo.author?.name}</span>
                <X
                  size={14}
                  onClick={() => setReplyTo(null)}
                  className="cancel-reply"
                />
              </div>
            )}
            <div className="comment-input-wrapper">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyTo ? t("feed.writeReply") : t("feed.addComment")}
              />
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditModal && (
        <EditPostModal
          post={post}
          closeModal={() => setShowEditModal(false)}
          onSaved={(updatedPost) => {
            if (typeof onPostUpdated === "function") onPostUpdated(updatedPost);
          }}
        />
      )}
    </div>
  );
};

export default PostCard;
