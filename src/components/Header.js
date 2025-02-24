import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaUserFriends } from 'react-icons/fa';
import FriendsPopup from '../pages/FriendsPopup';  // We'll define this

const Header = ({ toggleTheme, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSession(data.session);
        const nm = data.session.user.user_metadata?.full_name || 'My Account';
        setUserName(nm);
      }
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      if (updatedSession?.user) {
        setSession(updatedSession);
        const nm = updatedSession.user.user_metadata?.full_name || 'My Account';
        setUserName(nm);
      } else {
        setSession(null);
        setUserName('');
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleEditProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
  };

  // day/night toggle
  const handleThemeSwitch = (e) => {
    toggleTheme(e.target.checked ? 'dark' : 'light');
  };

  return (
    <header className="header">
      {/* Top row with user logic & theme switch */}
      <div className="header-top-row">
        <div className="header-top-left"></div>
        <div className="header-top-center"></div>
        <div className="header-top-right">
          <label className="theme-switch">
            <input
              type="checkbox"
              onChange={handleThemeSwitch}
              checked={theme === 'dark'}
            />
            <span className="slider round"></span>
          </label>

          {/* Friends icon to open popup */}
          <FaUserFriends
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
            onClick={() => setFriendsOpen(true)}
          />

          {userName ? (
            <div className="header-user-menu">
              <div className="header-user-name" onClick={toggleDropdown}>
                {userName}
              </div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-item" onClick={handleEditProfile}>
                    Edit Profile
                  </div>
                  <div className="user-dropdown-item" onClick={handleSignOut}>
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login-register-button"
              onClick={() => navigate('/auth')}
            >
              Login / Register
            </button>
          )}
        </div>
      </div>

      {/* Middle row: big logo */}
      <div className="header-logo-row">
        <img
          src="/bookem-logo.png"
          alt="Book 'Em"
          className="logo-img"
          onClick={() => navigate('/')}
        />
      </div>

      {/* Navigation row below logo */}
      <nav className="header-nav">
        <ul className="nav-list">
          <li>
            <NavLink to="/" end>Home</NavLink>
          </li>
          <li>
            <NavLink to="/mylibrary">My Library</NavLink>
          </li>
          <li>
            <NavLink to="/trades">Trades</NavLink>
          </li>
          <li>
            <NavLink to="/forum">Forum</NavLink>
          </li>
          <li>
            <NavLink to="/profile">My Profile</NavLink>
          </li>
        </ul>

        {/* Optional search form under nav */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </nav>

      {/* Friends popup */}
      {friendsOpen && (
        <FriendsPopup onClose={() => setFriendsOpen(false)} />
      )}
    </header>
  );
};

export default Header;