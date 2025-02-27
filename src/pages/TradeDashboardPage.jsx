import React from 'react';
import { Link } from 'react-router-dom';

const TradeDashboardPage = () => {
  return (
    <div className="trade-dashboard">
      <h1>Trade Dashboard</h1>
      
      <div className="trade-actions">
        <Link to="/trades/offer" className="trade-action-card">
          <h2>Offer Trade</h2>
          <p>List one of your books for trading</p>
        </Link>
        
        <Link to="/trades/pending" className="trade-action-card">
          <h2>Pending Trades</h2>
          <p>View and manage your trade requests</p>
        </Link>
      </div>
    </div>
  );
};

export default TradeDashboardPage;