import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';
import { 
  FaSearch, 
  FaUserPlus, 
  FaCheck, 
  FaTimes, 
  FaTimes as FaClose, 
  FaUserFriends,
  FaBell
} from 'react-icons/fa';

const FriendsPopup = ({ onClose, onRequestsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    fetchFriends();
    fetchIncomingRequests();
  }, []);

  const fetchFriends = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user1,
        user2,
        status,
        profiles!friendships_user2_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('user1', session.user.id)
      .eq('status', 'accepted');

    if (error) {
      showToast(error.message);
    } else {
      setFriends(data || []);
    }
  };

  const fetchIncomingRequests = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user1,
        user2,
        status,
        profiles!friendships_user1_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('user2', session.user.id)
      .eq('status', 'pending');

    if (error) {
      showToast(error.message);
    } else {
      setIncomingRequests(data || []);
      // Let parent know how many requests
      onRequestsUpdate?.(data?.length || 0);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Please log in first');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .ilike('username', `%${searchTerm.trim()}%`)
      .neq('id', session.user.id)
      .limit(5);

    if (error) {
      showToast(error.message);
      setSearchResults([]);
    } else {
      setSearchResults(data || []);
    }
  };

  const sendFriendRequest = async (targetUserId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Please log in first');
      return;
    }

    const { error } = await supabase
      .from('friendships')
      .insert([{ 
        user1: session.user.id, 
        user2: targetUserId, 
        status: 'pending' 
      }]);

    if (error) {
      if (error.code === '23505') {
        showToast('Friend request already sent');
      } else {
        showToast(error.message);
      }
    } else {
      showToast('Friend request sent!');
      setSearchResults([]);
      setSearchTerm('');
    }
  };

  const handleRequestResponse = async (friendshipId, status) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId);

    if (error) {
      showToast(error.message);
    } else {
      showToast(`Friend request ${status}`);
      fetchIncomingRequests();
      if (status === 'accepted') {
        fetchFriends();
      }
    }
  };

  const removeFriend = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      showToast(error.message);
    } else {
      showToast('Friend removed');
      fetchFriends();
    }
  };

  return (
    <div className="friends-popup">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      <div className="friends-header">
        <h2>Friends</h2>
        <button className="close-button" onClick={onClose}>
          <FaClose />
        </button>
      </div>

      <div className="friends-tabs">
        <button
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <FaUserFriends /> Friends
          {incomingRequests.length > 0 && (
            <span className="request-badge">{incomingRequests.length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <FaSearch /> Find Friends
        </button>
      </div>

      <div className="friends-content">
        {activeTab === 'search' ? (
          <div className="search-section">
            <form onSubmit={handleSearch}>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">
                  <FaSearch />
                </button>
              </div>
            </form>

            <div className="search-results">
              {searchResults.map((profile) => (
                <div key={profile.id} className="friend-result">
                  <div className="friend-info">
                    <img
                      src={profile.avatar_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png"}
                      alt={profile.username}
                      className="friend-avatar"
                    />
                    <div className="friend-details">
                      <span className="friend-name">{profile.full_name}</span>
                      <span className="friend-username">@{profile.username}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => sendFriendRequest(profile.id)}
                    className="add-friend-button"
                  >
                    <FaUserPlus />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <div className="friend-requests-section">
                <h3>
                  <FaBell className="request-icon" />
                  Friend Requests ({incomingRequests.length})
                </h3>
                {incomingRequests.map((req) => (
                  <div key={req.id} className="friend-request">
                    <div className="friend-info">
                      <img
                        src={req.profiles?.avatar_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png"}
                        alt={req.profiles?.username}
                        className="friend-avatar"
                      />
                      <div className="friend-details">
                        <span className="friend-name">{req.profiles?.full_name}</span>
                        <span className="friend-username">@{req.profiles?.username}</span>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        onClick={() => handleRequestResponse(req.id, 'accepted')}
                        className="accept-button"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleRequestResponse(req.id, 'declined')}
                        className="decline-button"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="friends-list">
              <h3>My Friends</h3>
              {friends.length === 0 ? (
                <p className="no-friends">No friends yet</p>
              ) : (
                friends.map((friendship) => (
                  <div key={friendship.id} className="friend-item">
                    <div className="friend-info">
                      <img
                        src={friendship.profiles?.avatar_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png"}
                        alt={friendship.profiles?.username}
                        className="friend-avatar"
                      />
                      <div className="friend-details">
                        <span className="friend-name">{friendship.profiles?.full_name}</span>
                        <span className="friend-username">@{friendship.profiles?.username}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(friendship.id)}
                      className="remove-friend-button"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPopup;