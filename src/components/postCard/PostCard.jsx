import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, User, Send, Loader2, Reply, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './PostCard.css';
import HeartbeatLoader from '../heartbeatLoader/HeartbeatLoader';

// Helper component for "See More" text
const ExpandableText = ({ text, limit = 100, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;
  if (text.length <= limit) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {isExpanded ? text : `${text.substring(0, limit)}... `}
      <button 
        className="see-more-btn" 
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0, marginLeft: '4px' }}
      >
        {isExpanded ? "See less" : "See more"}
      </button>
    </span>
  );
};

const PostCard = ({ post, currentUser, onLike, onDelete }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const currentUserId = currentUser?._id;
  const authorId = post.author?._id || post.author;
  const isOwner = currentUserId && authorId && currentUserId.toString() === authorId.toString();

  // Check if liked using the likes array in the post object
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
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const response = await fetch(`${API_URL}/api/posts/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        toast.success("Comment deleted");
      } else {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
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
      
      // Update comments list and increment count manually for immediate UI feedback
      setComments(prev => [...prev, data]);
      
      // Update local post comment count visually if needed (optional)
      post.commentCount = (post.commentCount || 0) + 1; 

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
        
        <div className="post-stats-row">
           <span className="post-stat-item">{post.likes?.length || 0} likes</span>
           {/* Show comment count if available in post object */}
           <span className="post-stat-item" onClick={toggleComments} style={{cursor: 'pointer'}}>
             {post.commentCount || 0} comments
           </span>
        </div>

        <div className="post-caption">
          <strong onClick={(e) => goToProfile(e, authorId)}>{post.author?.name}</strong>
          <span className="caption-spacer"> </span>
          <ExpandableText text={post.description} limit={90} />
        </div>
      </div>

      {showComments && (
        <div className="post-comments-wrap">
          <div className="post-comments-scroll">
            {loadingComments && <HeartbeatLoader/>}
            {comments.length > 0 ? (
              comments.map(c => {
                const isCommentAuthor = c.author?._id === currentUserId || c.author === currentUserId;
                const isPostOwner = isOwner; 

                return (
                  <div key={c._id} className="post-single-comment">
                    <div className="comment-main-row">
                      <div className="comment-main-body">
                        <strong className="comment-user-link" onClick={(e) => goToProfile(e, c.author?._id)}>
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
                    
                    <button className="comment-reply-link" onClick={() => {
                      setReplyTo(c);
                      setCommentText("");
                    }}>
                      <Reply size={12} /> Reply
                    </button>
                  </div>
                );
              })
            ) : !loadingComments && (
              <p className="no-comments-msg">No comments yet.</p>
            )}
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
                placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
              />
              <button type="submit" disabled={isSubmitting || !commentText.trim()}>
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;