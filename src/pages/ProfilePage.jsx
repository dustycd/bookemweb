import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    avatar_url: ''
  });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If no record, create one
        if (error.code === 'PGRST116') {
          const { error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                full_name: session?.user?.user_metadata?.full_name || '',
                username: session?.user?.email?.split('@')[0] || ''
              }
            ]);
          
          if (createError) throw createError;
          
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (fetchError) throw fetchError;
          setProfile(newProfile);
          setFormData({
            full_name: newProfile.full_name || '',
            username: newProfile.username || '',
            bio: newProfile.bio || '',
            location: newProfile.location || '',
            avatar_url: newProfile.avatar_url || ''
          });
        } else {
          throw error;
        }
      } else if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      if (!['jpg', 'jpeg', 'png'].includes(fileExt.toLowerCase())) {
        throw new Error('Only jpg and png files are allowed');
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      showToast('Profile picture updated successfully!');
    } catch (error) {
      showToast(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!session) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', session.user.id);

      if (error) throw error;
      
      showToast('Profile updated successfully!');
      setEditing(false);
      setProfile(formData);
    } catch (error) {
      showToast(error.message);
    }
  };

  if (!session) {
    return (
      <div className="simple-profile-page">
        <div className="profile-container">
          <h1>Please Log In</h1>
          <p>You need to be logged in to view and edit your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="simple-profile-page">
        <div className="profile-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-profile-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={profile.avatar_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png"}
              alt="Profile" 
            />
          </div>
          
          {!editing && (
            <div className="profile-info">
              <h1>{profile.full_name || 'Add your name'}</h1>
              <p className="username">@{profile.username || 'username'}</p>
              {profile.location && <p className="location">{profile.location}</p>}
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="profile-picture-upload">
              <h3>Profile Picture</h3>
              <div className="upload-preview">
                <img 
                  src={formData.avatar_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-avatar.png"}
                  alt="Profile Preview" 
                />
              </div>
              <div className="upload-controls">
                <label htmlFor="avatar-upload" className="upload-button">
                  {uploading ? 'Uploading...' : 'Choose New Picture'}
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <p className="upload-help">JPG or PNG, max 2MB</p>
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Your username"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Your location"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <div className="button-group">
              <button type="button" className="cancel-button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-content">
            <div className="bio-section">
              <h2>About Me</h2>
              <p>{profile.bio || 'No bio yet'}</p>
            </div>
            
            <button className="edit-button" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;