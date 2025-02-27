import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { FaArrowRight, FaExchangeAlt, FaSearch, FaBookOpen, FaSignInAlt } from 'react-icons/fa';

const HomePage = () => {
  const { user } = useAuth();
  const [genres, setGenres] = useState([]);
  const [tradesByGenre, setTradesByGenre] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGenresAndTrades();
  }, []);

  const fetchGenresAndTrades = async () => {
    try {
      // Fetch genres
      const { data: genresData, error: genresError } = await supabase
        .from('genres')
        .select('*')
        .order('name');

      if (genresError) throw genresError;

      // Fetch recent trade offers for each genre
      const { data: tradesData, error: tradesError } = await supabase
        .from('trade_offers')
        .select(`
          id,
          title,
          description,
          condition,
          image_url,
          genre_id,
          created_at,
          genres (
            name,
            slug
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (tradesError) throw tradesError;

      // Group trades by genre
      const tradesByGenreMap = {};
      tradesData.forEach(trade => {
        const genreId = trade.genre_id;
        if (!tradesByGenreMap[genreId]) {
          tradesByGenreMap[genreId] = [];
        }
        tradesByGenreMap[genreId].push(trade);
      });

      setGenres(genresData);
      setTradesByGenre(tradesByGenreMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const TradeCard = ({ trade }) => (
    <div className="trade-card">
      <div className="trade-image">
        <img
          src={trade.image_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-book.png"}
          alt={trade.title}
        />
      </div>
      <div className="trade-details">
        <h3>{trade.title}</h3>
        <p className="trade-condition">Condition: {trade.condition}/10</p>
        {trade.description && (
          <p className="trade-description">{trade.description}</p>
        )}
        <button 
          onClick={() => user ? navigate(`/trades/offer/${trade.id}`) : navigate('/auth')}
          className="view-trade-button"
        >
          {user ? 'View Trade' : 'Sign in to Trade'} <FaArrowRight />
        </button>
      </div>
    </div>
  );

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Trade Books, Share Stories</h1>
          <p>Join our community of book lovers and discover your next great read through trading</p>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/trades/offer" className="primary-button">
                  <FaExchangeAlt /> Create Trade Offer
                </Link>
                <Link to="/catalog" className="secondary-button">
                  <FaSearch /> Browse Books
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="primary-button">
                  <FaSignInAlt /> Sign In to Start Trading
                </Link>
                <button onClick={() => navigate('/auth')} className="secondary-button">
                  <FaSearch /> Browse as Guest
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How Book Trading Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-icon">
              <FaBookOpen />
            </div>
            <h3>List Your Books</h3>
            <p>Add books you're willing to trade to your library</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <FaSearch />
            </div>
            <h3>Find Books</h3>
            <p>Browse available books from other traders</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <FaExchangeAlt />
            </div>
            <h3>Make Trades</h3>
            <p>Propose and accept trades with other members</p>
          </div>
        </div>
      </section>

      {/* Genre Tabs and Trade Offers */}
      <section className="trades-section">
        <h2>Recent Trade Offers</h2>
        
        <div className="genre-tabs">
          <button
            className={`genre-tab ${activeGenre === 'all' ? 'active' : ''}`}
            onClick={() => setActiveGenre('all')}
          >
            All Genres
          </button>
          {genres.map(genre => (
            <button
              key={genre.id}
              className={`genre-tab ${activeGenre === genre.slug ? 'active' : ''}`}
              onClick={() => setActiveGenre(genre.slug)}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading trades...</div>
        ) : (
          <div className="trades-grid">
            {Object.entries(tradesByGenre).map(([genreId, trades]) => {
              const genre = genres.find(g => g.id === genreId);
              if (activeGenre !== 'all' && genre?.slug !== activeGenre) return null;
              
              return trades.map(trade => (
                <TradeCard key={trade.id} trade={trade} />
              ));
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;