import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';
import { FaUpload, FaBook, FaArrowLeft } from 'react-icons/fa';

const OfferTradePage = () => {
  const [title, setTitle] = useState('');
  const [condition, setCondition] = useState(5);
  const [edition, setEdition] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setGenres(data);
    }
  };

  const showToast = (msg) => setToastMessage(msg);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('File size must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        showToast('Only JPEG or PNG images are allowed');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Please log in first.');
        return;
      }

      let imageUrl = null;
      if (imageFile) {
        // Create a unique filename with timestamp and user ID
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        // Upload to book-images bucket
        const { error: uploadError } = await supabase.storage
          .from('book-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('book-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('trade_offers')
        .insert([{
          user_id: session.user.id,
          title,
          condition: parseInt(condition, 10),
          edition,
          description,
          image_url: imageUrl,
          genre_id: selectedGenre,
          status: 'available'
        }]);

      if (insertError) throw insertError;

      showToast('Book offer created successfully!');
      navigate('/trades');
    } catch (error) {
      showToast(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="offer-trade-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      <div className="offer-trade-container">
        <button 
          onClick={() => navigate('/trades')} 
          className="back-button"
        >
          <FaArrowLeft /> Back to Trades
        </button>

        <div className="offer-trade-header">
          <FaBook className="header-icon" />
          <h1>List a Book for Trade</h1>
          <p>Share your book with the community and find great trades</p>
        </div>

        <form onSubmit={handleOfferSubmit} className="offer-trade-form">
          <div className="form-grid">
            <div className="form-left">
              <div className="form-group">
                <label htmlFor="title">Book Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the book title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="genre">Genre</label>
                <select
                  id="genre"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  required
                >
                  <option value="">Select a genre</option>
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edition">Edition (Optional)</label>
                <input
                  id="edition"
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  placeholder="e.g., First Edition, Paperback, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="condition">
                  Condition
                  <span className="condition-value">{condition}/10</span>
                </label>
                <input
                  id="condition"
                  type="range"
                  min="1"
                  max="10"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="condition-slider"
                />
                <div className="condition-labels">
                  <span>Poor</span>
                  <span>Like New</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the book's condition, any marks or wear, etc."
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-right">
              <div className="image-upload-section">
                <label className="image-upload-label">
                  Book Image
                  <span className="image-upload-help">JPG or PNG, max 2MB</span>
                </label>
                
                <div className="image-preview-container">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Book preview" 
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <FaUpload />
                      <span>Click or drag to upload</span>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="book-image"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/trades')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={uploading}
            >
              {uploading ? 'Creating Offer...' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferTradePage;