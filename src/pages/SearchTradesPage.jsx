import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';

const SearchTradesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [offers, setOffers] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => setToastMessage(msg);

  const fetchOffers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Please log in first.');
      return;
    }
    const user = session.user;

    let query = supabase
      .from('trade_offers')
      .select('*')
      .eq('status', 'available')
      .neq('user_id', user.id);

    if (searchTerm.trim()) {
      query = query.ilike('title', `%${searchTerm.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      showToast(error.message);
    } else {
      setOffers(data);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOffers();
  };

  const requestTrade = async (offerId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Please log in first.');
      return;
    }
    const user = session.user;

    const { error } = await supabase
      .from('trade_requests')
      .insert([{
        offer_id: offerId,
        requester_id: user.id,
        status: 'pending'
      }]);
    if (error) {
      showToast(error.message);
    } else {
      showToast('Trade request sent!');
    }
  };

  return (
    <div className="search-trades-page dark-form-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <h1>Search Trades</h1>

      <form onSubmit={handleSearch} className="search-trades-form">
        <label>Search by Title:</label>
        <input
          type="text"
          placeholder="e.g. Harry Potter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="trade-offers-list">
        {offers.map((offer) => (
          <div key={offer.id} className="trade-offer-card">
            {offer.image_url && (
              <img
                src={offer.image_url}
                alt={offer.title}
                style={{ width: '100px', height: 'auto' }}
              />
            )}
            <h3>{offer.title}</h3>
            <p>Condition: {offer.condition} / 10</p>
            <p>Edition: {offer.edition || 'N/A'}</p>
            <p>Description: {offer.description || 'N/A'}</p>
            <button onClick={() => requestTrade(offer.id)}>
              Request Trade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchTradesPage;