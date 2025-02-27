import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Toast from '../components/Toast';
import { FaExchangeAlt, FaCheckCircle, FaTimesCircle, FaTrash } from 'react-icons/fa';

const PendingTradesPage = () => {
  const [myOffers, setMyOffers] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => setToastMessage(msg);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Please log in first.');
        return;
      }

      // First, fetch all my trade offers
      const { data: myListedOffers, error: offersError } = await supabase
        .from('trade_offers')
        .select(`
          id,
          title,
          condition,
          image_url,
          status,
          description,
          created_at,
          trade_requests (
            id,
            requester_id,
            status,
            offered_book_id,
            library:offered_book_id (
              title,
              author,
              thumbnail
            )
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;

      // Fetch trade requests I've made
      const { data: myRequests, error: myRequestsError } = await supabase
        .from('trade_requests')
        .select(`
          id,
          status,
          offered_book_id,
          trade_offers!inner (
            id,
            title,
            condition,
            image_url,
            user_id,
            description
          ),
          library:offered_book_id (
            title,
            author,
            thumbnail
          )
        `)
        .eq('requester_id', session.user.id);

      if (myRequestsError) throw myRequestsError;

      setMyOffers(myListedOffers || []);
      setReceivedRequests(myRequests || []);
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeResponse = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('trade_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      showToast(`Trade ${status === 'accepted' ? 'accepted' : 'declined'}`);
      await fetchTrades();
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleRemoveListing = async (offerId) => {
    try {
      // First, delete any associated trade requests
      const { error: requestsError } = await supabase
        .from('trade_requests')
        .delete()
        .eq('offer_id', offerId);

      if (requestsError) throw requestsError;

      // Then delete the trade offer
      const { error: deleteError } = await supabase
        .from('trade_offers')
        .delete()
        .eq('id', offerId);

      if (deleteError) throw deleteError;

      setMyOffers(prevOffers => prevOffers.filter(o => o.id !== offerId));
      showToast('Trade listing removed successfully');
    } catch (error) {
      showToast(error.message);
      await fetchTrades();
    }
  };

  const TradeCard = ({ offer, request, type }) => {
    const isMyOffer = type === 'myOffer';
    const statusColor = {
      pending: 'text-yellow-500',
      accepted: 'text-green-500',
      declined: 'text-red-500'
    };

    return (
      <div className="pending-trade-card">
        <div className={`pending-trade-status ${statusColor[request.status]}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </div>

        <div className="pending-trade-content">
          <div className="pending-trade-books">
            <div className="pending-trade-book">
              <img
                src={offer.image_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-book.png"}
                alt={offer.title}
              />
              <p className="book-title">{offer.title}</p>
              <p className="book-condition">Condition: {offer.condition}/10</p>
              {offer.description && (
                <p className="book-description">{offer.description}</p>
              )}
            </div>

            <FaExchangeAlt className="exchange-icon" />

            <div className="pending-trade-book">
              <img
                src={request.library?.thumbnail || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-book.png"}
                alt={request.library?.title}
              />
              <p className="book-title">{request.library?.title}</p>
              <p className="book-condition">{request.library?.author}</p>
            </div>
          </div>

          {isMyOffer && request.status === 'pending' && (
            <div className="pending-trade-actions">
              <button
                onClick={() => handleTradeResponse(request.id, 'accepted')}
                className="accept-button"
              >
                <FaCheckCircle /> Accept
              </button>
              <button
                onClick={() => handleTradeResponse(request.id, 'declined')}
                className="decline-button"
              >
                <FaTimesCircle /> Decline
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const OfferCard = ({ offer }) => (
    <div className="pending-trade-card">
      <div className="pending-trade-content">
        <div className="pending-trade-book">
          <img
            src={offer.image_url || "https://raw.githubusercontent.com/stackblitz/stackblitz-icons/main/public/default-book.png"}
            alt={offer.title}
          />
          <p className="book-title">{offer.title}</p>
          <p className="book-condition">Condition: {offer.condition}/10</p>
          {offer.description && (
            <p className="book-description">{offer.description}</p>
          )}
          <button
            onClick={() => handleRemoveListing(offer.id)}
            className="remove-listing-button"
          >
            <FaTrash /> Remove Listing
          </button>
        </div>
        <p className="no-requests">No trade requests yet</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading-spinner">Loading trades...</div>;
  }

  return (
    <div className="pending-trades-page">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <div className="pending-trades-header">
        <h1>Trade Management</h1>
        <p>Manage your book trade offers and requests</p>
      </div>

      <div className="trades-sections">
        <section className="my-offers-section">
          <h2 className="section-title">My Listed Offers</h2>
          <div className="pending-trades-grid">
            {myOffers.map(offer => (
              <div key={offer.id}>
                {offer.trade_requests?.length > 0 ? (
                  offer.trade_requests.map(request => (
                    <TradeCard
                      key={request.id}
                      offer={offer}
                      request={request}
                      type="myOffer"
                    />
                  ))
                ) : (
                  <OfferCard offer={offer} />
                )}
              </div>
            ))}
            {myOffers.length === 0 && (
              <p className="no-trades">You haven't listed any books for trade yet.</p>
            )}
          </div>
        </section>

        <section className="received-requests-section">
          <h2 className="section-title">My Trade Requests</h2>
          <div className="pending-trades-grid">
            {receivedRequests.map(request => (
              <TradeCard
                key={request.id}
                offer={request.trade_offers}
                request={request}
                type="receivedRequest"
              />
            ))}
            {receivedRequests.length === 0 && (
              <p className="no-trades">You haven't made any trade requests yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PendingTradesPage;