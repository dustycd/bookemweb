import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';

const UserProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      showToast(error.message);
    } else if (data) {
      setProfile(data);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      <div className="profile-banner">
        <div className="profile-info">
          <div className="profile-pic">
            <img 
              src="https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png" 
              alt="Profile" 
            />
          </div>
          
          <div className="profile-details">
            <h1>{profile.full_name}</h1>
            <p className="username">@{profile.username}</p>
            <p className="location">{profile.location}</p>
            <p className="bio">{profile.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;