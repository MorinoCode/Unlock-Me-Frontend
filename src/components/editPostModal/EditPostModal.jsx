import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import "../createPostModal/CreatePostModal.css";

const EditPostModal = ({ post, closeModal, onSaved }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState(post?.description ?? "");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setDescription(post?.description ?? "");
  }, [post]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [closeModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error(t("post.captionEmpty"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");
      toast.success(t("post.postUpdated"));
      onSaved(data);
      closeModal();
    } catch (err) {
      toast.error(err.message || t("post.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="post-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-post-title"
    >
      <div
        className="post-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="post-modal-top">
          <h2 id="edit-post-title">{t("post.editPost")}</h2>
          <button
            type="button"
            className="post-modal-close"
            onClick={closeModal}
            aria-label="Close"
          >
            <X size={24} aria-hidden />
          </button>
        </div>

        <form className="post-modal-body" onSubmit={handleSubmit}>
          {post?.image && (
            <div
              className="post-modal-upload-zone"
              style={{ pointerEvents: "none" }}
            >
              <img
                src={post.image}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
          <div className="post-modal-input-area">
            <textarea
              placeholder={t("post.writeCaption")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={2200}
            />
          </div>
          <div className="post-modal-footer">
            <button
              type="submit"
              className="post-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{t("post.saving")}</span>
                </>
              ) : (
                t("common.save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
