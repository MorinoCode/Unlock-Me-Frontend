import React, { useState, useEffect } from 'react';
import PostCard from '../../components/postCard/PostCard';
import CreatePostModal from '../../components/createPostModal/CreatePostModal';
import ExploreBackgroundLayout from '../../components/layout/exploreBackgroundLayout/ExploreBackgroundLayout';
import { Plus, Globe, FolderHeart, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import './FeedPage.css';
import HeartbeatLoader from '../../components/heartbeatLoader/HeartbeatLoader';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth()
  

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'global' ? '/api/posts/feed' : '/api/posts/my-posts';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setPosts(activeTab === 'global' ? (data.posts || []) : (data || []));
    } catch (err) {
      toast.error("Failed to load feed");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const handleLike = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      const updatedLikesArray = await response.json();
      
      // ✅ این بخش کلیدی هست: باید لیست پست‌ها رو پیدا کنی و لایک اون پست خاص رو آپدیت کنی
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post._id === postId ? { ...post, likes: updatedLikesArray } : post
        )
      );
    } else {
      const err = await response.json();
      toast.error(err.message || "Failed to like");
    }
  } catch (err) {
    console.error("Like error:", err);
  }
};

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setPosts(prev => prev.filter(p => p._id !== postId));
        toast.success("Post removed");
      }
    } catch (err) {
      toast.error("Delete failed");
      console.log(err);
    }
  };
  

  return (
    <ExploreBackgroundLayout>
      <Toaster position="top-center" />
      <div className="feed-wrapper">
        <div className="feed-header-tabs">
          <button className={`feed-tab ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>
            <Globe size={18} /> <span>Explore</span>
          </button>
          <button className={`feed-tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
            <FolderHeart size={18} /> <span>My Posts</span>
          </button>
        </div>

        <div className="feed-main-content">
          {loading ? (
            <HeartbeatLoader />
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  currentUser={currentUser} 
                  onLike={handleLike} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
          )}
        </div>

        <button className="create-post-fab" onClick={() => setIsModalOpen(true)}>
          <Plus size={32} />
        </button>

        {isModalOpen && <CreatePostModal closeModal={() => setIsModalOpen(false)} refreshFeed={fetchPosts} />}
      </div>
    </ExploreBackgroundLayout>
  );
};

export default FeedPage;