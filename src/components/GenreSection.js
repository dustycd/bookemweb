import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Toast from './Toast';
import { FaStar } from 'react-icons/fa';

const API_KEY = 'AIzaSyA_xOd6YcTBBEPpoRUW5wau0QGSF8we314';

function GenreSection({ title, query, orderBy }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [ratingMap, setRatingMap] = useState({});

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
    if (orderBy) {
      url += `&orderBy=${orderBy}`;
    }
    if (API_KEY) {
      url += `&key=${API_KEY}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        setLoading(false);
      });
  }, [query, orderBy]);

  // Fetch average rating for each book
  useEffect(() => {
    if (!books.length) return;
    books.forEach((book) => {
      const bookTitle = book.volumeInfo?.title || 'Untitled';
      fetchAverageRating(bookTitle);
    });
    // eslint-disable-next-line
  }, [books]);

  async function fetchAverageRating(bookTitle) {
    if (!bookTitle) return;
    const { data, error } = await supabase
      .from('library')
      .select('rating')
      .eq('title', bookTitle);

    if (error) {
      console.error('Error fetching ratings:', error);
      return;
    }
    if (!data || !data.length) {
      setRatingMap((prev) => ({ ...prev, [bookTitle]: 0 }));
      return;
    }
    let sum = 0;
    data.forEach((row) => {
      sum += row.rating;
    });
    const avg = sum / data.length;
    setRatingMap((prev) => ({ ...prev, [bookTitle]: avg }));
  }

  function renderStars(ratingValue) {
    const rounded = Math.round(ratingValue);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          style={{ color: i <= rounded ? 'gold' : '#ccc' }}
        />
      );
    }
    return stars;
  }

  // Save the book to 'library' with thumbnail
  const handleSave = async (book) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Please log in first.');
      return;
    }
    const user = session.user;
    const bookTitle = book.volumeInfo?.title || 'Untitled';
    const author = (book.volumeInfo?.authors || []).join(', ');
    const thumbnail = book.volumeInfo?.imageLinks?.thumbnail || '';

    const { error } = await supabase
      .from('library')
      .insert([
        {
          user_id: user.id,
          title: bookTitle,
          author,
          rating: 0,
          thumbnail
        }
      ]);
    if (error) {
      showToast(error.message);
    } else {
      showToast('Book saved to My Library!');
      fetchAverageRating(bookTitle);
    }
  };

  return (
    <section className="genre-section">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <h2>{title}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="genre-books">
          {books.map((book) => {
            const bookTitle = book.volumeInfo?.title || 'Untitled';
            const thumbnail = book.volumeInfo?.imageLinks?.thumbnail;
            const averageRating = ratingMap[bookTitle] || 0;

            return (
              <div key={book.id} className="book-card">
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt={bookTitle}
                    style={{ width: '100%', height: 'auto' }}
                  />
                )}
                <h3>{bookTitle}</h3>
                <div className="genre-rating">
                  {renderStars(averageRating)}
                  <span className="rating-value">
                    {averageRating ? averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <button
                  className="save-button"
                  onClick={() => handleSave(book)}
                >
                  <img
                    src="/save-icon.png"
                    alt="Save"
                    style={{ width: '20px', height: '20px', marginRight: '6px' }}
                  />
                  Save
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default GenreSection;