import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';
import { FaFilter, FaSort } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BookCatalogPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const showToast = (msg) => setToastMessage(msg);

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction',
    'Fantasy', 'Romance', 'Thriller', 'Biography',
    'History', 'Science', 'Technology', 'Arts',
    'Philosophy', 'Poetry', 'Drama', 'Children'
  ];

  const sortOptions = [
    { value: 'date', label: 'Most Recent' },
    { value: 'relevance', label: 'Relevance' },
    { value: 'distance', label: 'Distance' }
  ];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let query = searchTerm.trim();
      if (query) {
        // Convert spaces to & for tsquery
        query = query.replace(/\s+/g, ' & ');
      }

      const { data, error } = await supabase.rpc('search_books', {
        search_query: query || null,
        genre_filter: genre || null,
        sort_by: sortBy,
        distance_limit: null
      });

      if (error) throw error;

      // For each book, ensure we have the correct public URL
      const booksWithImages = data?.map(book => {
        if (book.image_url && !book.image_url.startsWith('http')) {
          // Get the public URL for the image
          const { data: { publicUrl } } = supabase.storage
            .from('book-images')
            .getPublicUrl(book.image_url);
          return { ...book, image_url: publicUrl };
        }
        return book;
      }) || [];

      setBooks(booksWithImages);
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, genre]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleSave = async (book) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Please log in first.');
      return;
    }

    const { error } = await supabase
      .from('library')
      .insert([{
        user_id: session.user.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        synopsis: book.synopsis,
        rating: 0,
        thumbnail: book.image_url
      }]);

    if (error) {
      showToast(error.message);
    } else {
      showToast('Book saved to My Library!');
    }
  };

  return (
    <div className="catalog-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
      <div className="catalog-header">
        <h1>Book Catalog</h1>
        <p>Discover books available for trade in your area</p>
      </div>

      <div className="catalog-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filter-controls">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
          
          <button 
            className="sort-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaSort /> Sort
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-section">
              <h3>Genre</h3>
              <select 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <h3>Sort By</h3>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="no-results">
          <h2>No books found</h2>
          <p>Try adjusting your search criteria or check back later for new offerings.</p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                {book.image_url ? (
                  <img 
                    src={book.image_url} 
                    alt={book.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-book.png";
                    }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              
              <div className="book-details">
                <h3>{book.title}</h3>
                {book.genre && <span className="genre-tag">{book.genre}</span>}
                
                <div className="book-condition">
                  Condition: {book.condition}/10
                  <div className="condition-bar">
                    <div 
                      className="condition-fill"
                      style={{ width: `${(book.condition / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {book.synopsis && (
                  <p className="synopsis">{book.synopsis}</p>
                )}

                <div className="book-actions">
                  <button 
                    className="save-button"
                    onClick={() => handleSave(book)}
                  >
                    Save to Library
                  </button>
                  <button 
                    className="trade-button"
                    onClick={() => navigate(`/trades/offer/${book.id}`)}
                  >
                    Request Trade
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookCatalogPage;