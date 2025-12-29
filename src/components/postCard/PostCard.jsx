import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, User, Send, Loader2, Reply, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './PostCard.css';
import HeartbeatLoader from '../heartbeatLoader/HeartbeatLoader';

const PostCard = ({ post, currentUser, onLike, onDelete }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

const currentUserId = currentUser._id

  
  // ✅ شناسایی صاحب پست
  const authorId = post.author?._id 
  const isOwner = currentUserId && authorId && currentUserId.toString() === authorId.toString();

  // ✅ چک کردن وضعیت لایک با Optional Chaining برای جلوگیری از کرش
  const isLiked = post.likes?.some(id => id?.toString() === currentUserId?.toString());

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
    setLoadingComments(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/${post._id}/comments`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
      setShowComments(true);
    } catch (err) {
      toast.error("Failed to load comments");
      console.log(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    const content = replyTo ? `@${replyTo.author?.name} ${commentText}` : commentText;
    try {
      const response = await fetch(`${API_URL}/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setComments(prev => [...prev, data]);
      setCommentText('');
      setReplyTo(null);
      toast.success("Comment added");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-card-box">
      <div className="post-card-top">
        <div className="post-user-meta" onClick={(e) => goToProfile(e, authorId)}>
          <div className="post-avatar-frame">
            {post.author?.avatar ? <img src={post.author.avatar} alt="" /> : <User size={18} />}
          </div>
          <span className="post-author-name">{post.author?.name || 'User'}</span>
        </div>
        {isOwner && (
          <button className="post-delete-btn" onClick={(e) => {
            e.stopPropagation();
            onDelete(post._id);
          }}>
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="post-media-frame" onDoubleClick={() => onLike(post._id)}>
        <img src={post.image} className="post-img" alt="" />
      </div>

      <div className="post-interaction-bar">
        <div className="post-btns">
          {/* ✅ دکمه لایک با استایل شرطی */}
          <button 
            className={`post-action-button ${isLiked ? 'is-liked' : ''}`} 
            onClick={() => onLike(post._id)}
          >
            <Heart 
              size={26} 
              fill={isLiked ? "#ef4444" : "none"} 
              stroke={isLiked ? "#ef4444" : "white"} 
              style={{ transition: 'all 0.3s ease' }}
            />
          </button>
          <button className="post-action-button" onClick={toggleComments}>
            <MessageCircle size={26} color="white" />
          </button>
        </div>
        <div className="post-stats">{post.likes?.length || 0} likes</div>
        <div className="post-caption">
          <strong onClick={(e) => goToProfile(e, authorId)}>{post.author?.name}</strong>
          {post.description}
        </div>
      </div>

      {showComments && (
        <div className="post-comments-wrap">
          <div className="post-comments-scroll">
          {loadingComments && <HeartbeatLoader/>}
            {comments.map(c => (
              <div key={c._id} className="post-single-comment">
                <div className="comment-main-body">
                  <strong className="comment-user-link" onClick={(e) => goToProfile(e, c.author?._id)}>
                    {c.author?.name}:
                  </strong>
                  <span>{c.content}</span>
                </div>
                <button className="comment-reply-link" onClick={() => {
                  setReplyTo(c);
                  setCommentText("");
                }}>
                  <Reply size={12} /> Reply
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="post-comment-field-container">
            {replyTo && (
              <div className="replying-to-bar">
                <span>Replying to {replyTo.author?.name}</span>
                <X size={14} onClick={() => setReplyTo(null)} className="cancel-reply" />
              </div>
            )}
            <div className="comment-input-wrapper">
              <input 
                value={commentText} 
                onChange={e => setCommentText(e.target.value)} 
                placeholder="Add a comment..."
              />
              <button type="submit" disabled={isSubmitting}><Send size={18} /></button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;