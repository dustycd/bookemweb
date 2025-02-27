import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import FriendsPopup from '../pages/FriendsPopup';
import { 
  FaHome, 
  FaBook, 
  FaExchangeAlt, 
  FaComments, 
  FaUserCircle,
  FaUserFriends,
  FaSignInAlt,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBars
} from 'react-icons/fa';

const Sidebar = ({ theme, toggleTheme, isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [showFriends, setShowFriends] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
      fetchPendingRequests(user.id);
    }
  }, [user]);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  const fetchPendingRequests = async (userId) => {
    const { data, error } = await supabase
      .from('friendships')
      .select('id')
      .eq('user2', userId)
      .eq('status', 'pending');

    if (!error) {
      setPendingRequests(data.length);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsOpen(false);
  };

  // Minimal sidebar for non-authenticated users
  if (!user) {
    return (
      <>
        <div className="sidebar-minimal">
          <button 
            className="sidebar-toggle"
            onClick={() => navigate('/auth')}
          >
            <FaSignInAlt />
            <span>Sign In</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        className="sidebar-trigger"
        onMouseEnter={() => setIsOpen(true)}
      />

      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <aside 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="sidebar-header">
          <img
            src="/Bookem-logo.png"
            alt="Book 'Em"
            className="sidebar-logo"
            onClick={() => {
              navigate('/');
              setIsOpen(false);
            }}
          />
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" onClick={() => setIsOpen(false)}>
            <FaHome /> Home
          </NavLink>
          <NavLink to="/mylibrary" onClick={() => setIsOpen(false)}>
            <FaBook /> My Library
          </NavLink>
          <NavLink to="/trades" onClick={() => setIsOpen(false)}>
            <FaExchangeAlt /> Trades
          </NavLink>
          <NavLink to="/forum" onClick={() => setIsOpen(false)}>
            <FaComments /> Forum
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="theme-toggle"
            onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button 
            className="friends-toggle"
            onClick={() => setShowFriends(true)}
          >
            <div className="friends-icon-container">
              <FaUserFriends />
              {pendingRequests > 0 && (
                <span className="friends-badge">{pendingRequests}</span>
              )}
            </div>
            Friends
          </button>

          <NavLink 
            to="/profile" 
            className="profile-link"
            onClick={() => setIsOpen(false)}
          >
            <FaUserCircle />
            {userProfile?.full_name || 'My Profile'}
          </NavLink>
          
          <button onClick={handleSignOut} className="sign-out-button">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {showFriends && (
        <FriendsPopup 
          onClose={() => setShowFriends(false)} 
          onRequestsUpdate={(count) => setPendingRequests(count)}
        />
      )}
    </>
  );
};

export default Sidebar;