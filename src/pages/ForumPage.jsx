import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa';

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, []);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarPath);
    return publicUrl;
  };

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        data.avatar_url = getAvatarUrl(data.avatar_url);
        setUserProfile(data);
      }
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles!forum_posts_user_id_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      showToast(error.message);
    } else if (data) {
      // Process avatar URLs
      const processedData = data.map(post => ({
        ...post,
        profiles: post.profiles ? {
          ...post.profiles,
          avatar_url: getAvatarUrl(post.profiles.avatar_url)
        } : null
      }));
      setPosts(processedData);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Please log in to post');
      return;
    }

    if (!newPost.trim()) {
      showToast('Post cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert([{
        user_id: session.user.id,
        content: newPost.trim()
      }]);

    if (error) {
      showToast(error.message);
    } else {
      setNewPost('');
      showToast('Post created successfully!');
      fetchPosts();
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="forum-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <div className="forum-container">
        <div className="create-post-card">
          <form onSubmit={handleSubmitPost} className="post-form">
            <div className="post-form-header">
              <img
                src={userProfile?.avatar_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png"}
                alt="Profile"
                className="user-avatar"
              />
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
              />
            </div>
            <div className="post-form-footer">
              <button type="submit" className="post-button">
                Post
              </button>
            </div>
          </form>
        </div>

        <div className="posts-container">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div 
                  className="post-user-info"
                  onClick={() => navigate(`/user/${post.profiles.id}`)}
                >
                  <img
                    src={post.profiles?.avatar_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png"}
                    alt={post.profiles?.username}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <span className="user-name">
                      {post.profiles?.full_name || 'Unknown User'}
                    </span>
                    <span className="post-time">
                      {formatTimeAgo(post.created_at)}
                    </span>
                  </div>
                </div>
                <button className="post-menu-button">
                  <FaEllipsisH />
                </button>
              </div>

              <div className="post-content">
                <p>{post.content}</p>
              </div>

              <div className="post-actions">
                <button className="action-button">
                  <FaRegHeart /> Like
                </button>
                <button className="action-button">
                  <FaComment /> Comment
                </button>
                <button className="action-button">
                  <FaShare /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;