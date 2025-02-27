import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';
import { FaStar, FaTrash, FaBook } from 'react-icons/fa';

const MyLibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('library')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showToast(error.message);
    } else {
      setBooks(data || []);
    }
  };

  const handleRemove = async (bookId) => {
    const { error } = await supabase
      .from('library')
      .delete()
      .eq('id', bookId);

    if (error) {
      showToast(error.message);
    } else {
      showToast('Book removed from library');
      fetchBooks();
    }
  };

  const handleRating = async (bookId, newRating) => {
    const { error } = await supabase
      .from('library')
      .update({ rating: newRating })
      .eq('id', bookId);

    if (error) {
      showToast(error.message);
    } else {
      showToast('Rating updated');
      fetchBooks();
    }
  };

  const StarRating = ({ rating, onRating }) => {
    const [hover, setHover] = useState(null);

    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <FaStar
              key={index}
              className="star"
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              size={20}
              onClick={() => onRating(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </div>
    );
  };

  if (books.length === 0) {
    return (
      <div className="library-page">
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        <div className="empty-library">
          <h2>Your Library is Empty</h2>
          <p>Start building your collection by adding books from the catalog</p>
          <button 
            className="add-books-button"
            onClick={() => navigate('/catalog')}
          >
            <FaBook /> Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      <div className="library-header">
        <h1>My Library</h1>
      </div>

      <div className="library-grid">
        {books.map((book) => (
          <div key={book.id} className="library-card">
            <div className="library-card-image">
              <img 
                src={book.thumbnail || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-book.png"}
                alt={book.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-book.png";
                }}
              />
            </div>
            
            <div className="library-card-content">
              <h3 className="library-card-title">{book.title}</h3>
              <p className="library-card-author">{book.author}</p>
              
              <div className="library-card-rating">
                <span className="rating-label">Your Rating:</span>
                <StarRating 
                  rating={book.rating} 
                  onRating={(newRating) => handleRating(book.id, newRating)} 
                />
              </div>

              <div className="library-card-actions">
                <button 
                  className="remove-button"
                  onClick={() => handleRemove(book.id)}
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyLibraryPage;